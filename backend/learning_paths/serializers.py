from rest_framework import serializers
from learning_paths.models import LearningPath, LearningPathStep
from skills.serializers import SkillListSerializer
from careers.serializers import CareerRoleListSerializer

class LearningPathStepSerializer(serializers.ModelSerializer):
    skill = SkillListSerializer(read_only=True)

    class Meta:
        model = LearningPathStep
        fields = [
            'id', 'skill', 'sequence_order', 'status', 'is_core',
            'estimated_hours', 'suggested_activities', 'completed_at'
        ]

class LearningPathSerializer(serializers.ModelSerializer):
    target_career = CareerRoleListSerializer(read_only=True)
    steps = LearningPathStepSerializer(many=True, read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = LearningPath
        fields = [
            'id', 'title', 'target_career', 'is_active', 'total_steps',
            'completed_steps', 'estimated_total_hours', 'progress_percentage',
            'steps', 'created_at', 'updated_at'
        ]

    def get_progress_percentage(self, obj):
        if obj.total_steps == 0:
            return 0.0
        return round((obj.completed_steps / obj.total_steps * 100), 1)
