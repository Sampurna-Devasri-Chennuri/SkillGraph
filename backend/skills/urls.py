from django.urls import path
from skills.views import (
    SkillCategoryListView,
    SkillListView,
    SkillDetailView,
    UserSkillListCreateView,
    UserSkillDetailView
)

urlpatterns = [
    path('categories/', SkillCategoryListView.as_view(), name='skill_categories'),
    path('skills/', SkillListView.as_view(), name='skill_list'),
    path('skills/<str:slug>/', SkillDetailView.as_view(), name='skill_detail'),
    path('user-skills/', UserSkillListCreateView.as_view(), name='user_skills_list_create'),
    path('user-skills/<int:pk>/', UserSkillDetailView.as_view(), name='user_skill_detail'),
]
