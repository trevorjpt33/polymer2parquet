from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PlayerSeason
from .serializers import PlayerSeasonSerializer, PlayerSeasonListSerializer


class PlayerSeasonViewSet(viewsets.ModelViewSet):
    queryset = PlayerSeason.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "player__first_name",
        "player__last_name",
        "team__name",
        "team__city"
    ]
    ordering_fields = [
        "season_year",
        "points_per_game",
        "rebounds_per_game",
        "assists_per_game",
        "player_efficiency_rating"
    ]
    ordering = ["player", "season_year"]

    def get_serializer_class(self):
        """Use lightweight serializer for list view, full serializer for detail view"""
        if self.action == "list":
            return PlayerSeasonListSerializer
        return PlayerSeasonSerializer

    def get_queryset(self):
        """Allow filtering via query parameters"""
        queryset = PlayerSeason.objects.select_related("player", "team")
        league = self.request.query_params.get("league")
        season_year = self.request.query_params.get("season_year")
        position = self.request.query_params.get("position")
        min_ppg = self.request.query_params.get("min_ppg")

        if league:
            queryset = queryset.filter(league=league)
        if season_year:
            queryset = queryset.filter(season_year=season_year)
        if position:
            queryset = queryset.filter(player__position=position)
        if min_ppg:
            queryset = queryset.filter(points_per_game__gte=float(min_ppg))
        return queryset

    @action(detail=False, methods=["get"])
    def leaders(self, request):
        """Custom endpoint: GET /api/stats/leaders/?stat=points_per_game&league=NBA"""
        stat = request.query_params.get("stat", "points_per_game")
        league = request.query_params.get("league", "NBA")
        season_year = request.query_params.get("season_year")

        valid_stats = [
            "points_per_game", "rebounds_per_game", "assists_per_game",
            "steals_per_game", "blocks_per_game", "player_efficiency_rating"
        ]

        if stat not in valid_stats:
            return Response(
                {"error": f"Invalid stat. Choose from: {valid_stats}"},
                status=400
            )

        queryset = PlayerSeason.objects.select_related(
            "player", "team"
        ).filter(
            league=league,
            games_played__gte=20
        )

        if season_year:
            queryset = queryset.filter(season_year=season_year)

        queryset = queryset.order_by(f"-{stat}")[:10]
        serializer = PlayerSeasonListSerializer(queryset, many=True)
        return Response(serializer.data)