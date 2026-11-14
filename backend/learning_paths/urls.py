from django.urls import path
from learning_paths.views import (
    LearningPathListView,
    LearningPathDetailView,
    GenerateLearningPathView,
    UpdateStepStatusView
)

urlpatterns = [
    path('learning-paths/', LearningPathListView.as_view(), name='learning_path_list'),
    path('learning-paths/generate/', GenerateLearningPathView.as_view(), name='learning_path_generate'),
    path('learning-paths/<int:pk>/', LearningPathDetailView.as_view(), name='learning_path_detail'),
    path('learning-paths/steps/<int:pk>/status/', UpdateStepStatusView.as_view(), name='learning_path_step_status'),
]
