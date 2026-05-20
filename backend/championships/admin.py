from django.contrib import admin
from .models import Championship, PlayerChampionship

@admin.register(Championship)
class ChampionshipAdmin(admin.ModelAdmin):
    list_display = ["season_year", "league", "team"]
    list_filter = ["season_year", "league", "team"]
    search_fields = ["season_year", "team__name", "team__city"]
    ordering = ["season_year"]

@admin.register(PlayerChampionship)
class PlayerChampionshipAdmin(admin.ModelAdmin):
    list_display = ["player", "championship"]
    list_filter = ["player", "championship"]
    search_fields = [
        "championship__season_year",
        "player__first_name",
        "player__last_name",
        "championship__team__name",
        "championship__team__city"
    ]
    ordering = ["championship__season_year"]