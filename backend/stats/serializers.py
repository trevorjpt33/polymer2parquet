from rest_framework import serializers
from .models import PlayerSeason
from players.serializers import PlayerListSerializer
from teams.serializers import TeamListSerializer


class PlayerSeasonSerializer(serializers.ModelSerializer):
    player = PlayerListSerializer(read_only=True)
    team = TeamListSerializer(read_only=True)
    player_id = serializers.PrimaryKeyRelatedField(
        queryset=PlayerSeason.player.field.related_model.objects.all(),
        source="player",
        write_only=True
    )
    team_id = serializers.PrimaryKeyRelatedField(
        queryset=PlayerSeason.team.field.related_model.objects.all(),
        source="team",
        write_only=True
    )

    class Meta:
        model = PlayerSeason
        fields = [
            "id",
            "player",
            "player_id",
            "team",
            "team_id",
            "season_year",
            "league",
            "age",
            "games_played",
            "games_started",
            "minutes_per_game",
            "points_per_game",
            "rebounds_per_game",
            "assists_per_game",
            "steals_per_game",
            "blocks_per_game",
            "turnovers_per_game",
            "field_goal_percentage",
            "three_point_percentage",
            "free_throw_percentage",
            "player_efficiency_rating",
            "true_shooting_percentage",
            "win_shares",
            "box_plus_minus",
            "value_over_replacement"
        ]


class PlayerSeasonListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    player = PlayerListSerializer(read_only=True)
    team = TeamListSerializer(read_only=True)
    class Meta:
        model = PlayerSeason
        fields = [
            "id",
            "player",
            "team",
            "season_year",
            "league",
            "games_played",
            "points_per_game",
            "rebounds_per_game",
            "assists_per_game",
            "steals_per_game",
            "blocks_per_game",
            "turnovers_per_game",
            "field_goal_percentage",
            "three_point_percentage",
            "free_throw_percentage",
            "player_efficiency_rating",
            "true_shooting_percentage",
            "win_shares",
            "box_plus_minus",
            "value_over_replacement",
        ]