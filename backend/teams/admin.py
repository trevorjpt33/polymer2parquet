from django.contrib import admin
from .models import Team


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = [
        "city",
        "name",
        "abbreviation",
        "league",
        "founded",
        "disbanded",
        "is_active"
    ]
    list_filter = ["league", "is_active"]
    search_fields = ["name", "city", "abbreviation"]
    ordering = ["league", "city"]