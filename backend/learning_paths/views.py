from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from learning_paths.models import LearningPath, LearningPathStep
from learning_paths.serializers import LearningPathSerializer, LearningPathStepSerializer
from learning_paths.services import LearningPathGenerator
from careers.models import CareerRole

class LearningPathListView(generics.ListAPIView):
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningPath.objects.filter(user=self.request.user).select_related('target_career').prefetch_related('steps__skill__category')

class LearningPathDetailView(generics.RetrieveAPIView):
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningPath.objects.filter(user=self.request.user).select_related('target_career').prefetch_related('steps__skill__category')

class GenerateLearningPathView(APIView):
    """
    Generates or recalculates a personalized, prerequisite-respecting learning roadmap.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        career_id = request.data.get('career_id')
        recalculate = request.data.get('recalculate', False)

        if not career_id:
            # Fall back to target career on profile
            if hasattr(request.user, 'profile') and request.user.profile.target_career:
                career = request.user.profile.target_career
            else:
                career = CareerRole.objects.first()
        else:
            career = get_object_or_404(CareerRole, id=career_id)

        generator = LearningPathGenerator(request.user, career)
        path = generator.generate_roadmap(recalculate=recalculate)

        serializer = LearningPathSerializer(path)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateStepStatusView(APIView):
    """
    Updates a step status (AVAILABLE, IN_PROGRESS, COMPLETED).
    When COMPLETED, downstream steps with satisfied prerequisites unlock automatically.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        new_status = request.data.get('status')
        if new_status not in ['AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'LOCKED']:
            return Response({'error': 'Invalid status choice.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = LearningPathGenerator.update_step_status(request.user, pk, new_status)
            return Response(result, status=status.HTTP_200_OK)
        except LearningPathStep.DoesNotExist:
            return Response({'error': 'Learning path step not found.'}, status=status.HTTP_404_NOT_FOUND)
