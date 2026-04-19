from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Player, Award
from .serializers import PlayerSerializer, PlayerListSerializer, AwardSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "country", "college"]
    ordering_fields = ["last_name", "first_name", "position", "country"]
    ordering = ["last_name"]

    def get_queryset(self):
        queryset = Player.objects.all()
        position = self.request.query_params.get("position")
        is_active = self.request.query_params.get("is_active")
        league = self.request.query_params.get("league")
        era = self.request.query_params.get("era")

        if position:
            positions = position.split(",")
            q = Q()
            for p in positions:
                q |= Q(position__contains=p)
                if p in ("PG", "SG"):
                    q |= Q(position="G")
                if p in ("SG", "SF"):
                    q |= Q(position="G-F")
                    q |= Q(position="F-G")
                if p in ("SF", "PF"):
                    q |= Q(position="F")
                if p in ("PF", "C"):
                    q |= Q(position="F-C")
                    q |= Q(position="C-F")
            queryset = queryset.filter(q)

        if is_active:
            statuses = is_active.split(",")
            if len(statuses) == 1:
                queryset = queryset.filter(is_active=statuses[0].lower() == "true")

        if league:
            leagues = league.split(",")
            queryset = queryset.filter(
                seasons__league__in=leagues
            ).distinct()

        if era:
            eras = era.split(",")
            q = Q()
            for e in eras:
                try:
                    decade_start = int(e)
                    decade_end = decade_start + 9
                    q |= Q(
                        seasons__season_year__gte=decade_start,
                        seasons__season_year__lte=decade_end
                    )
                except ValueError:
                    pass
            if q:
                queryset = queryset.filter(q).distinct()

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return PlayerListSerializer
        return PlayerSerializer

    @action(detail=True, methods=["get"])
    def awards(self, request, pk=None):
        player = self.get_object()
        awards = player.awards.all()
        serializer = AwardSerializer(awards, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def seasons(self, request, pk=None):
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