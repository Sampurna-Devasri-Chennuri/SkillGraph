from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from careers.models import CareerRole
from graph_engine.services import SkillGraphEngine
from graph_engine.gap_analyzer import SkillGapAnalyzer

class SkillGraphView(APIView):
    """
    Returns the serialized knowledge graph (nodes, edges, positions, status)
    filtered by career, category, or search query.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        career_slug = request.query_params.get('career')
        category_slug = request.query_params.get('category')
        search_query = request.query_params.get('search')

        engine = SkillGraphEngine()
        user = request.user if request.user.is_authenticated else None

        graph_data = engine.serialize_graph_for_visualization(
            user=user,
            career_slug=career_slug,
            category_slug=category_slug,
            search_query=search_query
        )

        return Response(graph_data, status=status.HTTP_200_OK)

class SkillGapAnalysisView(APIView):
    """
    Analyzes the authenticated user's competency against a target career.
    Calculates weighted coverage, missing skills, unmet prerequisites, and priority recommendations.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        career_slug = request.query_params.get('career')
        career_id = request.query_params.get('career_id')

        career = None
        if career_id:
            career = get_object_or_404(CareerRole, id=career_id)
        elif career_slug:
            career = get_object_or_404(CareerRole, slug=career_slug)
        elif hasattr(request.user, 'profile') and request.user.profile.target_career:
            career = request.user.profile.target_career
        else:
            career = CareerRole.objects.first()

        if not career:
            return Response({'error': 'No career role found.'}, status=status.HTTP_404_NOT_FOUND)

        analyzer = SkillGapAnalyzer(request.user, career)
        result = analyzer.analyze()

        return Response(result, status=status.HTTP_200_OK)
