from django.contrib import admin
from .models import PlayerSeason


@admin.register(PlayerSeason)
class PlayerSeasonAdmin(admin.ModelAdmin):
    list_display = [
        "player",
        "team",
        "season_year",
        "league",
        "games_played",
        "points_per_game",
        "rebounds_per_game",
        "assists_per_game"
    ]
    list_filter = ["league", "season_year", "team"]
    search_fields = [
        "player__first_name",
        "player__last_name",
        "team__name",
        "team__city"
    ]
    ordering = ["player", "season_year"]