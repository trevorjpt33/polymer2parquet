from django.db import models
from players.models import Player
from teams.models import Team


class PlayerSeason(models.Model):
    LEAGUE_CHOICES = [
        ("NBA", "NBA"),
        ("ABA", "ABA"),
    ]

    # Relationships
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="seasons"
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="seasons"
    )

    # Season info
    season_year = models.IntegerField()
    league = models.CharField(max_length=3, choices=LEAGUE_CHOICES, default="NBA")
    age = models.IntegerField(null=True, blank=True)

    # Per game stats
    games_played = models.IntegerField(default=0)
    games_started = models.IntegerField(default=0)
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

    # Advanced stats
    player_efficiency_rating = models.FloatField(null=True, blank=True)
    true_shooting_percentage = models.FloatField(null=True, blank=True)
    win_shares = models.FloatField(null=True, blank=True)
    box_plus_minus = models.FloatField(null=True, blank=True)
    value_over_replacement = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ["player", "season_year"]
        # Prevent duplicate entries for same player/team/season/league
        unique_together = ["player", "team", "season_year", "league"]

    def __str__(self):
        return f"{self.player} - {self.team.abbreviation} {self.season_year} ({self.league})"