from rest_framework import serializers
from projects.models import Project, ProjectSkillEvidence
from skills.serializers import SkillSimpleSerializer

class ProjectSkillEvidenceSerializer(serializers.ModelSerializer):
    skill = SkillSimpleSerializer(read_only=True)

    class Meta:
        model = ProjectSkillEvidence
        fields = ['id', 'skill', 'evidence_snippet', 'strength_rating', 'verified_by_nlp', 'created_at']

class ProjectSerializer(serializers.ModelSerializer):
    skill_evidences = ProjectSkillEvidenceSerializer(many=True, read_only=True)
    evidences_count = serializers.IntegerField(source='skill_evidences.count', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'technologies',
            'github_url', 'live_demo_url', 'status',
            'skill_evidences', 'evidences_count', 'created_at', 'updated_at'
        ]
