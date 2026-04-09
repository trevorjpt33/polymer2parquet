from django.db import models


class Team(models.Model):
    LEAGUE_CHOICES = [
        ("NBA", "NBA"),
        ("ABA", "ABA"),
    ]

    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    abbreviation = models.CharField(max_length=5)
    league = models.CharField(max_length=3, choices=LEAGUE_CHOICES, default="NBA")
    founded = models.IntegerField(null=True, blank=True)
    disbanded = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    # For franchises that moved or were renamed
    previous_name = models.CharField(max_length=100, blank=True)
    previous_city = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["league", "city", "name"]

    def __str__(self):
        return f"{self.city} {self.name} ({self.league})"