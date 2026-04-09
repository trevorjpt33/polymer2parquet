from rest_framework import serializers
from .models import Player, Award


class AwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Award
        fields = [
            "id",
            "award_type",
            "season_year",
            "league",
            "notes"
        ]


class PlayerSerializer(serializers.ModelSerializer):
    awards = AwardSerializer(many=True, read_only=True)

    class Meta:
        model = Player
        fields = [
            "id",
            "first_name",
            "last_name",
            "position",
            "birth_date",
            "country",
            "college",
            "height_inches",
            "weight_lbs",
            "is_active",
            "awards"
        ]


class PlayerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views - excludes awards for performance"""
    class Meta:
        model = Player
        fields = [
            "id",
            "first_name",
            "last_name",
            "position",
            "country",
            "is_active"
        ]