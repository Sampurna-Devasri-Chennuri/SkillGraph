import networkx as nx
from typing import Dict, Any, List
from careers.models import CareerRole, CareerRequiredSkill
from skills.models import Skill, UserSkill
from graph_engine.services import SkillGraphEngine
from analytics.models import UserActivity

class CareerSimulator:
    """
    Simulates transitions between career paths and calculates
    skill transferability, shared graph overlap, and delta learning roadmaps.
    """

    def __init__(self, source_career: CareerRole, target_career: CareerRole, user=None):
        self.source_career = source_career
        self.target_career = target_career
        self.user = user
        self.engine = SkillGraphEngine()

    def simulate(self) -> Dict[str, Any]:
        source_reqs = CareerRequiredSkill.objects.filter(career_role=self.source_career).select_related('skill', 'skill__category')
        target_reqs = CareerRequiredSkill.objects.filter(career_role=self.target_career).select_related('skill', 'skill__category')

        source_skills_dict = {r.skill_id: r for r in source_reqs}
        target_skills_dict = {r.skill_id: r for r in target_reqs}

        source_skill_ids = set(source_skills_dict.keys())
        target_skill_ids = set(target_skills_dict.keys())

        # Intersect skill sets
        shared_skill_ids = source_skill_ids.intersection(target_skill_ids)
        additional_skill_ids = target_skill_ids - source_skill_ids
        source_unique_skill_ids = source_skill_ids - target_skill_ids

        # If user is provided, check user's actual demonstrated skills
        user_skills_map = {}
        if self.user and self.user.is_authenticated:
            user_skills_map = {
                us.skill_id: us
                for us in UserSkill.objects.filter(user=self.user).select_related('skill')
            }

        # Calculate transferability
        target_total_weight = sum(r.weight * r.skill.importance_weight for r in target_reqs)
        transferred_weight = 0.0

        shared_skills_list = []
        for sid in shared_skill_ids:
            s_req = source_skills_dict[sid]
            t_req = target_skills_dict[sid]
            w = t_req.weight * t_req.skill.importance_weight

            # Credit full or partial based on proficiency expectation
            prof_ratio = min(1.0, s_req.minimum_proficiency / float(t_req.minimum_proficiency))
            credit = w * prof_ratio
            transferred_weight += credit

            shared_skills_list.append({
                'skill_id': sid,
                'name': t_req.skill.name,
                'category': t_req.skill.category.name,
                'source_min_prof': s_req.minimum_proficiency,
                'target_min_prof': t_req.minimum_proficiency,
                'is_core_in_target': t_req.is_core,
                'is_user_demonstrated': sid in user_skills_map and user_skills_map[sid].proficiency_level >= t_req.minimum_proficiency
            })

        transferable_coverage_pct = round((transferred_weight / target_total_weight * 100), 1) if target_total_weight > 0 else 0.0

        # Additional skills needed for target
        additional_skills_list = []
        for sid in additional_skill_ids:
            t_req = target_skills_dict[sid]
            additional_skills_list.append({
                'skill_id': sid,
                'name': t_req.skill.name,
                'category': t_req.skill.category.name,
                'difficulty': t_req.skill.difficulty_level,
                'is_core': t_req.is_core,
                'target_min_prof': t_req.minimum_proficiency,
                'weight': t_req.weight,
                'is_user_demonstrated': sid in user_skills_map and user_skills_map[sid].proficiency_level >= t_req.minimum_proficiency
            })

        # Calculate delta learning roadmap (topologically sorted)
        # Find all prerequisites of additional skills
        delta_needed: set = set(additional_skill_ids)
        for sid in additional_skill_ids:
            prereqs = self.engine.get_all_prerequisites(sid)
            for pid in prereqs:
                # If prerequisite is neither in source career nor user skills, add it to delta
                if pid not in source_skill_ids and pid not in user_skills_map:
                    delta_needed.add(pid)

        delta_subgraph = self.engine.graph.subgraph(delta_needed)
        try:
            sorted_delta_ids = list(nx.topological_sort(delta_subgraph))
        except Exception:
            sorted_delta_ids = list(delta_needed)

        delta_roadmap = []
        est_hours = 0
        difficulty_count = {'Beginner': 0, 'Intermediate': 0, 'Advanced': 0}

        skills_lookup = {s.id: s for s in Skill.objects.filter(id__in=sorted_delta_ids).select_related('category')}

        for idx, sid in enumerate(sorted_delta_ids, start=1):
            s_obj = skills_lookup.get(sid)
            if not s_obj:
                continue

            hrs_map = {'Beginner': 15, 'Intermediate': 30, 'Advanced': 50}
            hrs = hrs_map.get(s_obj.difficulty_level, 25)
            est_hours += hrs
            difficulty_count[s_obj.difficulty_level] = difficulty_count.get(s_obj.difficulty_level, 0) + 1

            delta_roadmap.append({
                'order': idx,
                'skill_id': sid,
                'name': s_obj.name,
                'category': s_obj.category.name,
                'difficulty': s_obj.difficulty_level,
                'estimated_hours': hrs,
                'is_target_core': sid in target_skills_dict and target_skills_dict[sid].is_core,
                'is_foundational_bridge': sid not in target_skill_ids
            })

        if self.user and self.user.is_authenticated:
            UserActivity.objects.create(
                user=self.user,
                action_type='SIMULATION_RUN',
                description=f"Simulated transition from {self.source_career.title} to {self.target_career.title}.",
                metadata={
                    'source': self.source_career.title,
                    'target': self.target_career.title,
                    'transferable_pct': transferable_coverage_pct
                }
            )

        return {
            'source_career': {
                'id': self.source_career.id,
                'title': self.source_career.title,
                'slug': self.source_career.slug,
                'salary_range': self.source_career.salary_range_usd,
                'market_demand': self.source_career.market_demand,
            },
            'target_career': {
                'id': self.target_career.id,
                'title': self.target_career.title,
                'slug': self.target_career.slug,
                'salary_range': self.target_career.salary_range_usd,
                'market_demand': self.target_career.market_demand,
            },
            'metrics': {
                'transferable_skill_coverage_pct': transferable_coverage_pct,
                'shared_skills_count': len(shared_skills_list),
                'additional_skills_count': len(additional_skills_list),
                'total_delta_milestones': len(delta_roadmap),
                'estimated_learning_hours': est_hours,
                'estimated_months_part_time': round(est_hours / 40.0, 1),
                'disclaimer': 'All learning times and effort estimates are algorithmic estimates based on historical syllabus benchmarks, not guarantees.'
            },
            'shared_skills': shared_skills_list,
            'additional_skills': additional_skills_list,
            'delta_roadmap': delta_roadmap,
            'difficulty_distribution': difficulty_count
        }
