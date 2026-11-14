from django.urls import path
from graph_engine.views import SkillGraphView, SkillGapAnalysisView

urlpatterns = [
    path('graph/', SkillGraphView.as_view(), name='skill_graph'),
    path('gap-analysis/', SkillGapAnalysisView.as_view(), name='skill_gap_analysis'),
]
