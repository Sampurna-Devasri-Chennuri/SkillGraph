from django.urls import path
from careers.views import (
    CareerRoleListView,
    CareerRoleDetailView,
    CareerSimulatorView
)

urlpatterns = [
    path('careers/', CareerRoleListView.as_view(), name='career_list'),
    path('careers/<str:slug>/', CareerRoleDetailView.as_view(), name='career_detail'),
    path('simulator/compare/', CareerSimulatorView.as_view(), name='career_simulator_compare'),
]
