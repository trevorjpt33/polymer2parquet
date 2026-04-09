from django.db import models


class Player(models.Model):
    POSITION_CHOICES = [
        ("PG", "Point Guard"),
        ("SG", "Shooting Guard"),
        ("SF", "Small Forward"),
        ("PF", "Power Forward"),
        ("C", "Center"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    position = models.CharField(max_length=2, choices=POSITION_CHOICES, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    college = models.CharField(max_length=100, blank=True)
    height_inches = models.IntegerField(null=True, blank=True)
    weight_lbs = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Award(models.Model):
    AWARD_CHOICES = [
        ("MVP", "Most Valuable Player"),
        ("DPOY", "Defensive Player of the Year"),
        ("ROY", "Rookie of the Year"),
        ("MIP", "Most Improved Player"),
        ("6MOY", "Sixth Man of the Year"),
        ("ALL_NBA_1", "All-NBA First Team"),
        ("ALL_NBA_2", "All-NBA Second Team"),
        ("ALL_NBA_3", "All-NBA Third Team"),
        ("ALL_STAR", "All-Star Selection"),
        ("CHAMP", "Championship"),
        ("ALL_ABA_1", "All-ABA First Team"),
        ("ALL_ABA_2", "All-ABA Second Team"),
        ("ABA_MVP", "ABA Most Valuable Player"),
        ("ABA_ROY", "ABA Rookie of the Year"),
    ]

    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="awards"
    )
    award_type = models.CharField(max_length=20, choices=AWARD_CHOICES)
    season_year = models.IntegerField()
    league = models.CharField(
        max_length=3,
        choices=[("NBA", "NBA"), ("ABA", "ABA")],
        default="NBA"
    )
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["season_year", "award_type"]

    def __str__(self):
        return f"{self.player} - {self.award_type} ({self.season_year})"