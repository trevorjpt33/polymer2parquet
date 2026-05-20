from django.db import models
from teams.models import Team
from players.models import Player

LEAGUE_CHOICES = [
    ("NBA", "NBA"),
    ("ABA", "ABA"),
]

class Championship(models.Model):
    season_year = models.IntegerField()
    league = models.CharField(max_length=3, choices=LEAGUE_CHOICES, default="NBA")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="championships") # Relationship

    class Meta:
        ordering = ["season_year"]
        unique_together = ["season_year", "league"]

    def __str__(self):
        return f"{self.season_year} {self.league} Champion - {self.team}"
    
class PlayerChampionship(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="championships")
    championship = models.ForeignKey(Championship, on_delete=models.CASCADE, related_name="player_championships")

    class Meta:
        unique_together = ["player", "championship"]
    
    def __str__(self):
        return f"{self.player} - {self.championship.season_year} {self.championship.league} Champion ({self.championship.team.abbreviation})"