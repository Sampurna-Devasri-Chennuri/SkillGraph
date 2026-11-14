from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from projects.models import Project
from projects.serializers import ProjectSerializer
from projects.services import ProjectSkillExtractor

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).prefetch_related('skill_evidences__skill__category')

    def perform_create(self, serializer):
        project = serializer.save(user=self.request.user)
        # Automatically run NLP extraction to identify demonstrated skills
        extractor = ProjectSkillExtractor(project)
        extractor.extract_and_map_skills()

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).prefetch_related('skill_evidences__skill__category')

    def perform_update(self, serializer):
        project = serializer.save()
        # Re-run extraction on update
        extractor = ProjectSkillExtractor(project)
        extractor.extract_and_map_skills()

class ProjectExtractSkillsView(APIView):
    """
    Explicitly re-runs NLP skill extraction on an existing project.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        project = get_object_or_404(Project, id=pk, user=request.user)
        extractor = ProjectSkillExtractor(project)
        mapped = extractor.extract_and_map_skills()
        return Response({
            'message': f"Extracted {len(mapped)} skills.",
            'skills': mapped
        }, status=status.HTTP_200_OK)
