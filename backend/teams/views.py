from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Team
from .serializers import TeamSerializer, TeamListSerializer


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "city", "abbreviation"]
    ordering_fields = ["city", "name", "league", "founded"]
    ordering = ["league", "city"]

    def get_serializer_class(self):
        """Use lightweight serializer for list view, full serializer for detail view"""
        if self.action == "list":
            return TeamListSerializer
        return TeamSerializer

    def get_queryset(self):
        """Allow filtering by league via query parameter: /api/teams/?league=ABA"""
        queryset = Team.objects.all()
        league = self.request.query_params.get("league")
        is_active = self.request.query_params.get("is_active")
        if league:
            queryset = queryset.filter(league=league)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        return queryset

    @action(detail=True, methods=["get"])
    def roster(self, request, pk=None):
        """Custom endpoint: GET /api/teams/1/roster/?season_year=1996"""
        from stats.serializers import PlayerSeasonListSerializer
        team = self.get_object()
        season_year = request.query_params.get("season_year")
        seasons = team.seasons.all()
        if season_year:
            seasons = seasons.filter(season_year=season_year)
        serializer = PlayerSeasonListSerializer(seasons, many=True)
        return Response(serializer.data)