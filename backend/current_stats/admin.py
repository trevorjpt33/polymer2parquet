from django.contrib import admin
from .models import PlayerIdentityMapping, CurrentSeasonStats

@admin.register(PlayerIdentityMapping)
class PlayerIdentityMappingAdmin(admin.ModelAdmin):
    list_display = ["player", "source", "external_id"]
    list_filter = ["source"]
    search_fields = ["player__first_name", "player__last_name"]
    ordering = ["player"]

@admin.register(CurrentSeasonStats)
class CurrentSeasonStatsAdmin(admin.ModelAdmin):
    list_display = [
        "player",
        "team",
        "season_year",
        "games_played",
        "points_per_game",
        "rebounds_per_game",
        "assists_per_game",
        "plays_today",
        "in_progress",
        "last_updated"
    ]
    list_filter = ["team", "plays_today", "in_progress"]
    search_fields = [
        "player__first_name",
        "player__last_name",
        "team__name",
        "team__city"
    ]
    ordering = ["player"]

