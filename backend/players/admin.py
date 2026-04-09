from django.contrib import admin
from .models import Player, Award


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = [
        "last_name",
        "first_name",
        "position",
        "country",
        "college",
        "is_active"
    ]
    list_filter = ["position", "country", "is_active"]
    search_fields = ["first_name", "last_name", "college", "country"]
    ordering = ["last_name", "first_name"]


@admin.register(Award)
class AwardAdmin(admin.ModelAdmin):
    list_display = [
        "player",
        "award_type",
        "season_year",
        "league"
    ]
    list_filter = ["award_type", "league", "season_year"]
    search_fields = ["player__first_name", "player__last_name"]
    ordering = ["season_year", "award_type"]