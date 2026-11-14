from typing import Dict, Any, List
from skills.models import Skill, UserSkill, SkillCategory
from careers.models import CareerRole, CareerRequiredSkill
from learning_paths.models import LearningPath
from analytics.models import UserActivity
from graph_engine.gap_analyzer import SkillGapAnalyzer
from graph_engine.services import SkillGraphEngine

class DashboardAnalyticsService:
    """
    Aggregates real-time, personalized skill intelligence metrics,
    career readiness scores, category distributions, and activity audit trails.
    """

    def __init__(self, user):
        self.user = user

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        user_skills = UserSkill.objects.filter(user=self.user).select_related('skill', 'skill__category')
        total_skills_count = user_skills.count()
        demonstrated_count = user_skills.filter(status='DEMONSTRATED').count()
        learning_count = user_skills.filter(status='LEARNING').count()
        practiced_count = user_skills.filter(status='PRACTICED').count()

        # Target Career
        target_career = None
        if hasattr(self.user, 'profile') and self.user.profile.target_career:
            target_career = self.user.profile.target_career
        else:
            target_career = CareerRole.objects.first()

        gap_analysis = None
        readiness_score = 0.0
        remaining_skills_count = 0
        recommended_next_skill = None

        if target_career:
            analyzer = SkillGapAnalyzer(self.user, target_career)
            gap_analysis = analyzer.analyze()
            readiness_score = gap_analysis['summary']['core_coverage_pct']
            remaining_skills_count = gap_analysis['summary']['missing_count']
            if gap_analysis['priority_recommendations']:
                recommended_next_skill = gap_analysis['priority_recommendations'][0]

        # Active Learning Path progress
        active_path = LearningPath.objects.filter(user=self.user, is_active=True).first()
        learning_progress_pct = 0.0
        if active_path and active_path.total_steps > 0:
            learning_progress_pct = round((active_path.completed_steps / active_path.total_steps * 100), 1)

        # Career Readiness across all 11 careers
        all_careers = CareerRole.objects.all()
        career_readiness_list = []
        unlocked_career_count = 0

        user_demonstrated_skill_ids = set(
            user_skills.filter(proficiency_level__gte=2).values_list('skill_id', flat=True)
        )

        for career in all_careers:
            reqs = career.required_skills.filter(is_core=True)
            total_reqs = reqs.count()
            if total_reqs == 0:
                continue
            met_reqs = reqs.filter(skill_id__in=user_demonstrated_skill_ids).count()
            cov_pct = round((met_reqs / total_reqs * 100), 1)
            if cov_pct >= 60.0:
                unlocked_career_count += 1

            career_readiness_list.append({
                'id': career.id,
                'title': career.title,
                'slug': career.slug,
                'category': career.category,
                'coverage_pct': cov_pct,
                'salary_range': career.salary_range_usd,
                'market_demand': career.market_demand,
                'is_target': target_career and target_career.id == career.id
            })

        career_readiness_list.sort(key=lambda x: x['coverage_pct'], reverse=True)

        # Skill distribution by category
        categories = SkillCategory.objects.all()
        distribution_data = []
        for cat in categories:
            cat_skills_count = user_skills.filter(skill__category=cat).count()
            if cat_skills_count > 0:
                distribution_data.append({
                    'category': cat.name,
                    'count': cat_skills_count,
                    'color': cat.color_hex
                })

        # Recent Activity (last 10)
        recent_activities = []
        for act in UserActivity.objects.filter(user=self.user)[:10]:
            recent_activities.append({
                'id': act.id,
                'action_type': act.action_type,
                'description': act.description,
                'timestamp': act.created_at.isoformat(),
            })

        return {
            'overview': {
                'total_skills_count': total_skills_count,
                'demonstrated_count': demonstrated_count,
                'practiced_count': practiced_count,
                'learning_count': learning_count,
                'remaining_target_skills': remaining_skills_count,
                'career_readiness_score': readiness_score,
                'learning_path_progress_pct': learning_progress_pct,
                'unlocked_career_count': unlocked_career_count,
                'target_career_title': target_career.title if target_career else 'None Selected',
                'target_career_slug': target_career.slug if target_career else '',
            },
            'recommended_next_skill': recommended_next_skill,
            'career_readiness_ranking': career_readiness_list,
            'skill_distribution': distribution_data,
            'recent_activities': recent_activities,
            'active_learning_path': {
                'id': active_path.id,
                'title': active_path.title,
                'completed_steps': active_path.completed_steps,
                'total_steps': active_path.total_steps,
                'estimated_total_hours': active_path.estimated_total_hours,
            } if active_path else None
        }
