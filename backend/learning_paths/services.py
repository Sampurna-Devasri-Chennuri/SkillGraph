from typing import List, Dict, Any, Set
from django.utils import timezone
from skills.models import Skill, UserSkill, SkillDependency
from careers.models import CareerRole, CareerRequiredSkill
from learning_paths.models import LearningPath, LearningPathStep
from graph_engine.services import SkillGraphEngine
from analytics.models import UserActivity

class LearningPathGenerator:
    """
    Intelligent learning path generator using topological sorting
    over the induced dependency graph of missing skills and their ancestral prerequisites.
    Guarantees strict prerequisite ordering (prerequisites strictly appear before dependents).
    """

    def __init__(self, user, target_career: CareerRole):
        self.user = user
        self.target_career = target_career
        self.engine = SkillGraphEngine()

    def generate_roadmap(self, recalculate: bool = False) -> LearningPath:
        # Check if an existing path exists
        existing_path = LearningPath.objects.filter(user=self.user, target_career=self.target_career).first()
        if existing_path and not recalculate:
            return existing_path

        if existing_path and recalculate:
            # Delete old steps to rebuild
            existing_path.steps.all().delete()
            learning_path = existing_path
        else:
            learning_path = LearningPath.objects.create(
                user=self.user,
                target_career=self.target_career,
                title=f"Roadmap to {self.target_career.title}"
            )

        user_skills_demonstrated = set(
            UserSkill.objects.filter(
                user=self.user,
                proficiency_level__gte=2
            ).values_list('skill_id', flat=True)
        )

        # Get all skills required for the career
        career_reqs = CareerRequiredSkill.objects.filter(career_role=self.target_career).select_related('skill')
        required_skill_ids = set(r.skill_id for r in career_reqs)
        core_skill_ids = set(r.skill_id for r in career_reqs if r.is_core)

        # Identify missing required skills
        missing_target_skills = required_skill_ids - user_skills_demonstrated

        # Find all ancestral prerequisites of missing target skills
        full_needed_skills: Set[int] = set()
        for s_id in missing_target_skills:
            full_needed_skills.add(s_id)
            prereqs = self.engine.get_all_prerequisites(s_id)
            # Add prerequisites that user hasn't yet demonstrated
            for p_id in prereqs:
                if p_id not in user_skills_demonstrated:
                    full_needed_skills.add(p_id)

        # Induce subgraph on full_needed_skills
        subgraph = self.engine.graph.subgraph(full_needed_skills)

        # Generate topological sort
        import networkx as nx
        try:
            sorted_skill_ids = list(nx.topological_sort(subgraph))
        except Exception:
            sorted_skill_ids = list(full_needed_skills)

        # Build step records
        steps_to_create = []
        total_estimated_hours = 0

        skills_dict = {s.id: s for s in Skill.objects.filter(id__in=sorted_skill_ids).select_related('category')}

        for idx, s_id in enumerate(sorted_skill_ids, start=1):
            skill_obj = skills_dict.get(s_id)
            if not skill_obj:
                continue

            # Estimate hours based on difficulty
            hrs_map = {'Beginner': 15, 'Intermediate': 30, 'Advanced': 50}
            hrs = hrs_map.get(skill_obj.difficulty_level, 25)
            total_estimated_hours += hrs

            # Generate practical hands-on activities
            activities = [
                f"Study core concepts and architectural conventions of {skill_obj.name}.",
                f"Build a mini-exercise applying {skill_obj.name} in a practical scenario.",
                f"Implement a verified integration test or portfolio feature demonstrating {skill_obj.name} proficiency.",
            ]

            # Direct prerequisites within this roadmap
            direct_predecessors = set(self.engine.get_direct_prerequisites(s_id))
            unmet_preds = direct_predecessors.intersection(full_needed_skills)

            # If it has no unmet prerequisites, it's immediately AVAILABLE, otherwise LOCKED
            initial_status = 'AVAILABLE' if len(unmet_preds) == 0 else 'LOCKED'

            step = LearningPathStep(
                learning_path=learning_path,
                skill=skill_obj,
                sequence_order=idx,
                status=initial_status,
                estimated_hours=hrs,
                is_core=s_id in core_skill_ids,
                suggested_activities=activities
            )
            steps_to_create.append(step)

        LearningPathStep.objects.bulk_create(steps_to_create)

        learning_path.total_steps = len(steps_to_create)
        learning_path.completed_steps = 0
        learning_path.estimated_total_hours = total_estimated_hours
        learning_path.save()

        # Log activity
        UserActivity.objects.create(
            user=self.user,
            action_type='PATH_GENERATED',
            description=f"Generated custom learning path for {self.target_career.title} ({len(steps_to_create)} milestones).",
            metadata={'path_id': learning_path.id, 'career': self.target_career.title, 'total_steps': len(steps_to_create)}
        )

        return learning_path

    @staticmethod
    def update_step_status(user, step_id: int, new_status: str) -> Dict[str, Any]:
        """
        Updates a step's status. When a step is marked COMPLETED,
        it automatically promotes the corresponding UserSkill and unlocks downstream steps
        whose prerequisites are now satisfied!
        """
        step = LearningPathStep.objects.select_related('learning_path', 'skill').get(
            id=step_id,
            learning_path__user=user
        )

        step.status = new_status
        if new_status == 'COMPLETED':
            step.completed_at = timezone.now()
            # Update or create user skill to DEMONSTRATED
            UserSkill.objects.update_or_create(
                user=user,
                skill=step.skill,
                defaults={
                    'proficiency_level': 3,
                    'status': 'DEMONSTRATED',
                    'verification_source': 'SELF_ASSESSED',
                    'notes': f"Completed via learning path step #{step.sequence_order}"
                }
            )

            # Check downstream locked steps in this path
            engine = SkillGraphEngine()
            path_steps = step.learning_path.steps.select_related('skill').all()
            completed_skill_ids = set(
                path_steps.filter(status='COMPLETED').values_list('skill_id', flat=True)
            )

            for other_step in path_steps.filter(status='LOCKED'):
                preds = set(engine.get_direct_prerequisites(other_step.skill_id))
                # Check if all preds in the path are completed
                path_preds = preds.intersection(set(path_steps.values_list('skill_id', flat=True)))
                if path_preds.issubset(completed_skill_ids):
                    other_step.status = 'AVAILABLE'
                    other_step.save(update_fields=['status'])

            UserActivity.objects.create(
                user=user,
                action_type='PATH_STEP_COMPLETED',
                description=f"Completed milestone: {step.skill.name}",
                metadata={'step_id': step.id, 'skill': step.skill.name}
            )

        step.save()
        step.learning_path.update_progress()

        return {
            'step_id': step.id,
            'status': step.status,
            'completed_steps': step.learning_path.completed_steps,
            'total_steps': step.learning_path.total_steps
        }
