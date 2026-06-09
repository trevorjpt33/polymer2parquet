from django.db import models
from teams.models import Team
from players.models import Player

class PlayerIdentityMapping(models.Model):
    source = models.CharField(max_length=20)
    external_id = models.IntegerField()
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="identity_mappings") # Relationship

    class Meta:
        ordering = ["source", "player__last_name", "player__first_name"]

    def __str__(self):
        return f"{self.player} #{self.external_id} - mapped via {self.source}"

class CurrentSeasonStats(models.Model):
    # Relationships
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="current_season")
    team = models.ForeignKey(Team, null=True, blank=True, on_delete=models.CASCADE, related_name="current_season")

    # Season info
    season_year = models.IntegerField(default=2026)
    league = models.CharField(max_length=3, default="NBA")

    # Per game stats
    games_played = models.IntegerField(default=0)
    minutes_per_game = models.FloatField(null=True, blank=True)
    points_per_game = models.FloatField(null=True, blank=True)
    rebounds_per_game = models.FloatField(null=True, blank=True)
    assists_per_game = models.FloatField(null=True, blank=True)
    steals_per_game = models.FloatField(null=True, blank=True)
    blocks_per_game = models.FloatField(null=True, blank=True)
    turnovers_per_game = models.FloatField(null=True, blank=True)

    # Shooting
    field_goal_percentage = models.FloatField(null=True, blank=True)
    three_point_percentage = models.FloatField(null=True, blank=True)
    free_throw_percentage = models.FloatField(null=True, blank=True)

    # Metadata
    plays_today = models.BooleanField(default=False)
    in_progress = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["player", "team"]
        unique_together = ["player", "season_year"]
        verbose_name_plural = "Current season stats"

    def __str__(self):
        return f"{self.player} - {self.team.abbreviation if self.team else 'No Team'} {self.season_year}"
