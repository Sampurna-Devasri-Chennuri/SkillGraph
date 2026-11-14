from django.urls import path
from projects.views import (
    ProjectListCreateView,
    ProjectDetailView,
    ProjectExtractSkillsView
)

urlpatterns = [
    path('projects/', ProjectListCreateView.as_view(), name='project_list_create'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:pk>/extract-skills/', ProjectExtractSkillsView.as_view(), name='project_extract_skills'),
]
