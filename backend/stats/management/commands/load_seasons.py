import csv
import os
from django.core.management.base import BaseCommand
from players.models import Player
from teams.models import Team
from stats.models import PlayerSeason


class Command(BaseCommand):
    help = "Load PlayerSeason data from Player Per Game.csv and Advanced.csv"

    def add_arguments(self, parser):
        parser.add_argument(
            "--ppg-file",
            type=str,
            default="data/Player Per Game.csv",
            help="Path to Player Per Game CSV file"
        )
        parser.add_argument(
            "--adv-file",
            type=str,
            default="data/Advanced.csv",
            help="Path to Advanced CSV file"
        )

    def handle(self, *args, **options):
        ppg_path = options["ppg_file"]
        adv_path = options["adv_file"]

        if not os.path.exists(ppg_path):
            self.stderr.write(f"File not found: {ppg_path}")
            return
        if not os.path.exists(adv_path):
            self.stderr.write(f"File not found: {adv_path}")
            return

        self.stdout.write("Building advanced stats lookup...")
        advanced = {}
        with open(adv_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["team"] == "TOT":
                    continue
                key = (row["player_id"], row["season"], row["team"])
                advanced[key] = {
                    "per":        self._float(row.get("per")),
                    "ts_percent": self._float(row.get("ts_percent")),
                    "ws":         self._float(row.get("ws")),
                    "bpm":        self._float(row.get("bpm")),
                    "vorp":       self._float(row.get("vorp")),
                }

        self.stdout.write("Loading player seasons...")
        created = skipped = missing_player = missing_team = 0

        # Clear existing player seasons
        PlayerSeason.objects.all().delete()
        self.stdout.write("Cleared existing player seasons.")

        
        with open(ppg_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["team"] in ("TOT", "2TM", "3TM", "4TM", "5TM"):
                    skipped += 1
                    continue

                player_id = row.get("player_id", "").strip()
                season    = row.get("season", "").strip()
                team_abbr = row.get("team", "").strip()
                league    = row.get("lg", "NBA").strip()

                if league == "BAA":
                    league = "NBA"

                try:
                    player = Player.objects.get(player_id=player_id)
                except Player.DoesNotExist:
                    missing_player += 1
                    continue

                try:
                    team = Team.objects.get(abbreviation=team_abbr, league=league)
                except Team.DoesNotExist:
                    missing_team += 1
                    self.stdout.write(
                        self.style.WARNING(f"Team not found: {team_abbr} ({league}) — skipping")
                    )
                    continue

                adv = advanced.get((player_id, season, team_abbr), {})

                try:
                    season_year = int(season)
                except ValueError:
                    skipped += 1
                    continue

                _, was_created = PlayerSeason.objects.get_or_create(
                    player=player,
                    team=team,
                    season_year=season_year,
                    league=league,
                    defaults={
                        "age":                      self._int(row.get("age")),
                        "games_played":             self._int(row.get("g")) or 0,
                        "games_started":            self._int(row.get("gs")) or 0,
                        "minutes_per_game":         self._float(row.get("mp_per_game")),
                        "points_per_game":          self._float(row.get("pts_per_game")),
                        "rebounds_per_game":        self._float(row.get("trb_per_game")),
                        "assists_per_game":         self._float(row.get("ast_per_game")),
                        "steals_per_game":          self._float(row.get("stl_per_game")),
                        "blocks_per_game":          self._float(row.get("blk_per_game")),
                        "turnovers_per_game":       self._float(row.get("tov_per_game")),
                        "field_goal_percentage":    self._float(row.get("fg_percent")),
                        "three_point_percentage":   self._float(row.get("x3p_percent")),
                        "free_throw_percentage":    self._float(row.get("ft_percent")),
                        "player_efficiency_rating": adv.get("per"),
                        "true_shooting_percentage": adv.get("ts_percent"),
                        "win_shares":               adv.get("ws"),
                        "box_plus_minus":           adv.get("bpm"),
                        "value_over_replacement":   adv.get("vorp"),
                    }
                )
                if was_created:
                    created += 1
                else:
                    skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. Created: {created} | Skipped/duplicate: {skipped} | "
            f"Missing player: {missing_player} | Missing team: {missing_team}"
        ))

    def _float(self, val):
        try:
            return float(val)
        except (TypeError, ValueError):
            return None

    def _int(self, val):
        try:
            return int(val)
        except (TypeError, ValueError):
            return None