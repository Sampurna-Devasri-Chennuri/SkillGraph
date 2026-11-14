from rest_framework import serializers
from skills.models import SkillCategory, Skill, SkillDependency, LearningResource, UserSkill

class SkillCategorySerializer(serializers.ModelSerializer):
    skill_count = serializers.IntegerField(source='skills.count', read_only=True)

    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color_hex', 'skill_count']

class LearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningResource
        fields = ['id', 'title', 'url', 'resource_type', 'provider', 'is_free', 'estimated_hours']

class SkillSimpleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color_hex', read_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'name', 'slug', 'category_name', 'category_color', 'difficulty_level', 'icon_name']

class SkillListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_color = serializers.CharField(source='category.color_hex', read_only=True)
    prereq_count = serializers.IntegerField(source='prerequisite_edges.count', read_only=True)
    dependent_count = serializers.IntegerField(source='dependent_edges.count', read_only=True)

    class Meta:
        model = Skill
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'category_slug',
            'category_color', 'difficulty_level', 'importance_weight',
            'icon_name', 'tags', 'description', 'prereq_count', 'dependent_count'
        ]

class SkillDetailSerializer(serializers.ModelSerializer):
    category = SkillCategorySerializer(read_only=True)
    resources = LearningResourceSerializer(many=True, read_only=True)
    prerequisites = serializers.SerializerMethodField()
    dependents = serializers.SerializerMethodField()
    career_roles = serializers.SerializerMethodField()
    user_competency = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = [
            'id', 'name', 'slug', 'category', 'difficulty_level', 'importance_weight',
            'icon_name', 'tags', 'description', 'resources', 'prerequisites',
            'dependents', 'career_roles', 'user_competency'
        ]

    def get_prerequisites(self, obj):
        edges = obj.prerequisite_edges.select_related('source_skill', 'source_skill__category').all()
        return [
            {
                'id': edge.source_skill.id,
                'name': edge.source_skill.name,
                'slug': edge.source_skill.slug,
                'category': edge.source_skill.category.name,
                'difficulty': edge.source_skill.difficulty_level,
                'dependency_type': edge.dependency_type,
                'strength': edge.strength,
                'reason': edge.reason
            }
            for edge in edges
        ]

    def get_dependents(self, obj):
        edges = obj.dependent_edges.select_related('target_skill', 'target_skill__category').all()
        return [
            {
                'id': edge.target_skill.id,
                'name': edge.target_skill.name,
                'slug': edge.target_skill.slug,
                'category': edge.target_skill.category.name,
                'difficulty': edge.target_skill.difficulty_level,
                'dependency_type': edge.dependency_type,
                'strength': edge.strength,
                'reason': edge.reason
            }
            for edge in edges
        ]

    def get_career_roles(self, obj):
        reqs = obj.career_requirements.select_related('career_role').all()
        return [
            {
                'id': req.career_role.id,
                'title': req.career_role.title,
                'slug': req.career_role.slug,
                'is_core': req.is_core,
                'min_proficiency': req.minimum_proficiency,
                'salary_range': req.career_role.salary_range_usd,
            }
            for req in reqs
        ]

    def get_user_competency(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_skill = UserSkill.objects.filter(user=request.user, skill=obj).first()
            if user_skill:
                return {
                    'id': user_skill.id,
                    'proficiency_level': user_skill.proficiency_level,
                    'status': user_skill.status,
                    'verification_source': user_skill.verification_source,
                    'notes': user_skill.notes
                }
        return None

class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillListSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source='skill',
        write_only=True
    )

    class Meta:
        model = UserSkill
        fields = [
            'id', 'skill', 'skill_id', 'proficiency_level',
            'status', 'verification_source', 'notes', 'updated_at'
        ]
