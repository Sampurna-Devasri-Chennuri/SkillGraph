from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from skills.models import SkillCategory, Skill, UserSkill
from skills.serializers import (
    SkillCategorySerializer,
    SkillListSerializer,
    SkillDetailSerializer,
    UserSkillSerializer
)
from analytics.models import UserActivity

class SkillCategoryListView(generics.ListAPIView):
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    permission_classes = [permissions.AllowAny]

class SkillListView(generics.ListAPIView):
    serializer_class = SkillListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'tags', 'description', 'category__name']

    def get_queryset(self):
        qs = Skill.objects.select_related('category').prefetch_related('prerequisite_edges', 'dependent_edges').all()
        category = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')

        if category and category != 'all':
            qs = qs.filter(category__slug=category)
        if difficulty and difficulty != 'all':
            qs = qs.filter(difficulty_level=difficulty)

        return qs

class SkillDetailView(generics.RetrieveAPIView):
    serializer_class = SkillDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Skill.objects.select_related('category').prefetch_related(
            'resources',
            'prerequisite_edges__source_skill__category',
            'dependent_edges__target_skill__category',
            'career_requirements__career_role'
        ).all()

    def get_object(self):
        lookup = self.kwargs.get('slug')
        if lookup.isdigit():
            return get_object_or_404(self.get_queryset(), id=int(lookup))
        return get_object_or_404(self.get_queryset(), slug=lookup)

class UserSkillListCreateView(generics.ListCreateAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user).select_related('skill', 'skill__category')

    def perform_create(self, serializer):
        user_skill = serializer.save(user=self.request.user)
        UserActivity.objects.create(
            user=self.request.user,
            action_type='SKILL_ADDED',
            description=f"Added skill {user_skill.skill.name} ({user_skill.get_status_display()}).",
            metadata={'skill_id': user_skill.skill.id, 'status': user_skill.status}
        )

class UserSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        user_skill = serializer.save()
        UserActivity.objects.create(
            user=self.request.user,
            action_type='SKILL_UPDATED',
            description=f"Updated competency for {user_skill.skill.name} to level {user_skill.proficiency_level} ({user_skill.get_status_display()}).",
            metadata={'skill_id': user_skill.skill.id, 'proficiency': user_skill.proficiency_level}
        )
