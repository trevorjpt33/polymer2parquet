from rest_framework import serializers
from .models import Championship, PlayerChampionship

class ChampionshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Championship
        fields = ["season_year", "league", "team"]

class PlayerChampionshipSerializer(serializers.ModelSerializer):
    championship = ChampionshipSerializer(read_only=True)

    class Meta:
        model = PlayerChampionship
        fields = ["championship"]