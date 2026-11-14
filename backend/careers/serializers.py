from rest_framework import serializers
from careers.models import CareerRole, CareerRequiredSkill
from skills.serializers import SkillSimpleSerializer

class CareerRequiredSkillSerializer(serializers.ModelSerializer):
    skill = SkillSimpleSerializer(read_only=True)

    class Meta:
        model = CareerRequiredSkill
        fields = ['id', 'skill', 'is_core', 'minimum_proficiency', 'weight', 'importance_reason']

class CareerRoleListSerializer(serializers.ModelSerializer):
    core_skill_count = serializers.SerializerMethodField()
    total_skill_count = serializers.SerializerMethodField()

    class Meta:
        model = CareerRole
        fields = [
            'id', 'title', 'slug', 'category', 'short_description',
            'salary_range_usd', 'market_demand', 'icon_name',
            'core_skill_count', 'total_skill_count'
        ]

    def get_core_skill_count(self, obj):
        return obj.required_skills.filter(is_core=True).count()

    def get_total_skill_count(self, obj):
        return obj.required_skills.count()

class CareerRoleDetailSerializer(serializers.ModelSerializer):
    required_skills = CareerRequiredSkillSerializer(many=True, read_only=True)

    class Meta:
        model = CareerRole
        fields = [
            'id', 'title', 'slug', 'category', 'short_description',
            'detailed_description', 'salary_range_usd', 'market_demand',
            'icon_name', 'progression_opportunities', 'example_projects',
            'required_skills', 'created_at'
        ]
