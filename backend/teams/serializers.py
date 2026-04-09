from rest_framework import serializers
from .models import Team


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "city",
            "abbreviation",
            "league",
            "founded",
            "disbanded",
            "is_active",
            "previous_name",
            "previous_city"
        ]


class TeamListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "city",
            "abbreviation",
            "league",
            "is_active"
        ]