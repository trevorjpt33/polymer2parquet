from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Player, Award
from .serializers import PlayerSerializer, PlayerListSerializer, AwardSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "country", "college"]
    ordering_fields = ["last_name", "first_name", "position", "country"]
    ordering = ["last_name"]

    def get_serializer_class(self):
        """Use lightweight serializer for list view, full serializer for detail view"""
        if self.action == "list":
            return PlayerListSerializer
        return PlayerSerializer

    @action(detail=True, methods=["get"])
    def awards(self, request, pk=None):
        """Custom endpoint: GET /api/players/1/awards/"""
        player = self.get_object()
        awards = player.awards.all()
        serializer = AwardSerializer(awards, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def seasons(self, request, pk=None):
        """Custom endpoint: GET /api/players/1/seasons/"""
        from stats.serializers import PlayerSeasonListSerializer
        player = self.get_object()
        seasons = player.seasons.all().order_by("season_year")
        serializer = PlayerSeasonListSerializer(seasons, many=True)
        return Response(serializer.data)


class AwardViewSet(viewsets.ModelViewSet):
    queryset = Award.objects.all()
    serializer_class = AwardSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["player__first_name", "player__last_name", "award_type"]
    ordering_fields = ["season_year", "award_type", "league"]
    ordering = ["season_year"]