from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from analytics.services import DashboardAnalyticsService

class DashboardAnalyticsView(APIView):
    """
    Returns real-time aggregated metrics for the user's dashboard:
    total skills, demonstrated skills, career readiness score,
    unlocked careers, active roadmap progress, and recent activities.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        service = DashboardAnalyticsService(request.user)
        metrics = service.get_dashboard_metrics()
        return Response(metrics, status=status.HTTP_200_OK)
