from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from careers.models import CareerRole
from careers.serializers import CareerRoleListSerializer, CareerRoleDetailSerializer
from careers.simulator import CareerSimulator

class CareerRoleListView(generics.ListAPIView):
    serializer_class = CareerRoleListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category', 'short_description', 'required_skills__skill__name']

    def get_queryset(self):
        qs = CareerRole.objects.prefetch_related('required_skills').all()
        category = self.request.query_params.get('category')
        if category and category != 'all':
            qs = qs.filter(category__iexact=category)
        return qs

class CareerRoleDetailView(generics.RetrieveAPIView):
    serializer_class = CareerRoleDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return CareerRole.objects.prefetch_related('required_skills__skill__category').all()

    def get_object(self):
        lookup = self.kwargs.get('slug')
        if lookup.isdigit():
            return get_object_or_404(self.get_queryset(), id=int(lookup))
        return get_object_or_404(self.get_queryset(), slug=lookup)

class CareerSimulatorView(APIView):
    """
    Simulates a career transition from source_career to target_career.
    Returns shared skills, additional required skills, delta roadmap, and effort metrics.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        source_id = request.data.get('source_career_id')
        target_id = request.data.get('target_career_id')

        if not source_id or not target_id:
            return Response(
                {'error': 'Both source_career_id and target_career_id are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        source_career = get_object_or_404(CareerRole, id=source_id)
        target_career = get_object_or_404(CareerRole, id=target_id)

        user = request.user if request.user.is_authenticated else None
        simulator = CareerSimulator(source_career, target_career, user=user)
        result = simulator.simulate()

        return Response(result, status=status.HTTP_200_OK)
