from typing import Dict, Any, List
from skills.models import Skill, UserSkill
from careers.models import CareerRole, CareerRequiredSkill
from graph_engine.services import SkillGraphEngine

class SkillGapAnalyzer:
    """
    Evaluates a user's demonstrated and practiced competencies against
    the explicit requirements of a target career role.
    Calculates weighted coverage, identifies unmet prerequisites, and computes priority rankings.
    """

    def __init__(self, user, career_role: CareerRole):
        self.user = user
        self.career_role = career_role
        self.graph_engine = SkillGraphEngine()

    def analyze(self) -> Dict[str, Any]:
        user_skills = {
            us.skill_id: us
            for us in UserSkill.objects.filter(user=self.user).select_related('skill', 'skill__category')
        }

        requirements = (
            CareerRequiredSkill.objects
            .filter(career_role=self.career_role)
            .select_related('skill', 'skill__category')
        )

        total_core_weight = 0.0
        acquired_core_weight = 0.0
        total_all_weight = 0.0
        acquired_all_weight = 0.0

        demonstrated_skills = []
        partially_developed_skills = []
        missing_skills = []
        missing_prerequisite_ids = set()

        category_stats: Dict[str, Dict[str, float]] = {}

        for req in requirements:
            skill = req.skill
            cat_name = skill.category.name
            req_prof = req.minimum_proficiency
            weight = req.weight * skill.importance_weight

            total_all_weight += weight
            if req.is_core:
                total_core_weight += weight

            if cat_name not in category_stats:
                category_stats[cat_name] = {'required_weight': 0.0, 'earned_weight': 0.0, 'total_skills': 0, 'met_skills': 0}
            category_stats[cat_name]['required_weight'] += weight
            category_stats[cat_name]['total_skills'] += 1

            u_skill = user_skills.get(skill.id)

            if u_skill:
                user_prof = u_skill.proficiency_level
                status = u_skill.status
                fraction = min(1.0, user_prof / float(req_prof))
                earned = weight * fraction

                acquired_all_weight += earned
                if req.is_core:
                    acquired_core_weight += earned

                category_stats[cat_name]['earned_weight'] += earned

                item = {
                    'skill_id': skill.id,
                    'name': skill.name,
                    'category': cat_name,
                    'is_core': req.is_core,
                    'required_proficiency': req_prof,
                    'user_proficiency': user_prof,
                    'user_status': status,
                    'weight': weight,
                    'is_met': user_prof >= req_prof
                }

                if user_prof >= req_prof:
                    category_stats[cat_name]['met_skills'] += 1
                    demonstrated_skills.append(item)
                else:
                    partially_developed_skills.append(item)
            else:
                # Skill is completely missing
                item = {
                    'skill_id': skill.id,
                    'name': skill.name,
                    'category': cat_name,
                    'is_core': req.is_core,
                    'required_proficiency': req_prof,
                    'user_proficiency': 0,
                    'user_status': 'UNACQUIRED',
                    'weight': weight,
                    'is_met': False
                }
                missing_skills.append(item)

                # Find any missing prerequisites for this required skill
                prereqs = self.graph_engine.get_all_prerequisites(skill.id)
                for p_id in prereqs:
                    if p_id not in user_skills:
                        missing_prerequisite_ids.add(p_id)

        # Retrieve missing foundational prerequisite objects
        missing_foundational_prereqs = []
        if missing_prerequisite_ids:
            foundational_skills = Skill.objects.filter(id__in=missing_prerequisite_ids).select_related('category')
            for fs in foundational_skills:
                # Only include if not already in missing_skills list
                if not any(ms['skill_id'] == fs.id for ms in missing_skills):
                    missing_foundational_prereqs.append({
                        'skill_id': fs.id,
                        'name': fs.name,
                        'category': fs.category.name,
                        'difficulty': fs.difficulty_level,
                        'description': fs.description,
                        'is_foundational_dependency': True
                    })

        # Calculate coverage scores
        core_coverage_pct = round((acquired_core_weight / total_core_weight * 100), 1) if total_core_weight > 0 else 0.0
        overall_coverage_pct = round((acquired_all_weight / total_all_weight * 100), 1) if total_all_weight > 0 else 0.0

        # Prioritize recommendations:
        # Prioritize missing foundational prerequisites first, then high-weight core missing skills whose prereqs are met!
        priority_recommendations = []
        user_acquired_ids = set(user_skills.keys())

        all_target_skills = [ms for ms in missing_skills if ms['is_core']] + partially_developed_skills
        for s_data in all_target_skills:
            sid = s_data['skill_id']
            direct_prereqs = set(self.graph_engine.get_direct_prerequisites(sid))
            unmet_prereqs = direct_prereqs - user_acquired_ids
            readiness = 'READY_TO_LEARN' if len(unmet_prereqs) == 0 else 'PREREQUISITES_BLOCKED'

            priority_recommendations.append({
                'skill_id': sid,
                'name': s_data['name'],
                'category': s_data['category'],
                'is_core': s_data['is_core'],
                'weight': s_data['weight'],
                'readiness': readiness,
                'unmet_prerequisite_count': len(unmet_prereqs),
                'reason': (
                    'All prerequisites satisfied! Highest impact skill to learn next.'
                    if readiness == 'READY_TO_LEARN'
                    else f'Requires {len(unmet_prereqs)} foundational prerequisite(s) first.'
                )
            })

        # Sort priority: READY_TO_LEARN first, then highest weight
        priority_recommendations.sort(key=lambda x: (x['readiness'] == 'READY_TO_LEARN', x['weight']), reverse=True)

        # Radar & Category Chart dataset
        category_breakdown = []
        for cname, cdata in category_stats.items():
            pct = round((cdata['earned_weight'] / cdata['required_weight'] * 100), 1) if cdata['required_weight'] > 0 else 0
            category_breakdown.append({
                'category': cname,
                'coverage_pct': pct,
                'met_count': cdata['met_skills'],
                'total_count': cdata['total_skills']
            })

        return {
            'career': {
                'id': self.career_role.id,
                'title': self.career_role.title,
                'slug': self.career_role.slug,
                'category': self.career_role.category,
                'salary_range': self.career_role.salary_range_usd,
                'market_demand': self.career_role.market_demand,
            },
            'summary': {
                'core_coverage_pct': core_coverage_pct,
                'overall_coverage_pct': overall_coverage_pct,
                'total_required_skills': len(requirements),
                'demonstrated_count': len(demonstrated_skills),
                'partially_developed_count': len(partially_developed_skills),
                'missing_count': len(missing_skills),
                'missing_foundational_prereqs_count': len(missing_foundational_prereqs),
            },
            'demonstrated_skills': demonstrated_skills,
            'partially_developed_skills': partially_developed_skills,
            'missing_skills': missing_skills,
            'missing_foundational_prereqs': missing_foundational_prereqs,
            'priority_recommendations': priority_recommendations[:6],
            'category_breakdown': category_breakdown
        }
