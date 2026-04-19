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

        self.stdout.write("Building position lookup...")
        position_map = {}
        with open(ppg_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["team"] in ("TOT", "2TM", "3TM", "4TM", "5TM"):
                    continue
                player_id = row.get("player_id", "").strip()
                pos = row.get("pos", "").strip()
                if player_id and pos and pos != "NA":
                    if player_id not in position_map:
                        position_map[player_id] = {}
                    position_map[player_id][pos] = position_map[player_id].get(pos, 0) + 1

        self.stdout.write("Loading player seasons...")
        created = skipped = missing_player = missing_team = 0

        PlayerSeason.objects.all().delete()
        self.stdout.write("Cleared existing player seasons.")

        self.stdout.write("Pre-caching players and teams...")
        player_cache = {p.player_id: p.id for p in Player.objects.only("id", "player_id")}
        team_cache = {(t.abbreviation, t.league): t.id for t in Team.objects.only("id", "abbreviation", "league")}

        batch = []
        BATCH_SIZE = 500

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

                player_pk = player_cache.get(player_id)
                if not player_pk:
                    missing_player += 1
                    continue

                team_pk = team_cache.get((team_abbr, league))
                if not team_pk:
                    missing_team += 1
                    continue

                adv = advanced.get((player_id, season, team_abbr), {})

                try:
                    season_year = int(season)
                except ValueError:
                    skipped += 1
                    continue

                batch.append(PlayerSeason(
                    player_id=player_pk,
                    team_id=team_pk,
                    season_year=season_year,
                    league=league,
                    age=self._int(row.get("age")),
                    games_played=self._int(row.get("g")) or 0,
                    games_started=self._int(row.get("gs")) or 0,
                    minutes_per_game=self._float(row.get("mp_per_game")),
                    points_per_game=self._float(row.get("pts_per_game")),
                    rebounds_per_game=self._float(row.get("trb_per_game")),
                    assists_per_game=self._float(row.get("ast_per_game")),
                    steals_per_game=self._float(row.get("stl_per_game")),
                    blocks_per_game=self._float(row.get("blk_per_game")),
                    turnovers_per_game=self._float(row.get("tov_per_game")),
                    field_goal_percentage=self._float(row.get("fg_percent")),
                    three_point_percentage=self._float(row.get("x3p_percent")),
                    free_throw_percentage=self._float(row.get("ft_percent")),
                    player_efficiency_rating=adv.get("per"),
                    true_shooting_percentage=adv.get("ts_percent"),
                    win_shares=adv.get("ws"),
                    box_plus_minus=adv.get("bpm"),
                    value_over_replacement=adv.get("vorp"),
                ))
                created += 1

                if len(batch) >= BATCH_SIZE:
                    PlayerSeason.objects.bulk_create(batch)
                    self.stdout.write(f"Inserted {created} seasons so far...")
                    batch.clear()

        if batch:
            PlayerSeason.objects.bulk_create(batch)

        # Enrich player positions from per-game CSV
        self.stdout.write("Enriching player positions...")
        position_updates = 0
        players_to_update = Player.objects.filter(
            player_id__in=position_map.keys()
        ).only("id", "player_id", "position")

        update_batch = []
        for player in players_to_update:
            pos_counts = position_map.get(player.player_id, {})
            if pos_counts:
                positions = sorted(pos_counts.keys(), key=lambda p: pos_counts[p], reverse=True)
                player.position = ",".join(positions)
                update_batch.append(player)
                position_updates += 1

        Player.objects.bulk_update(update_batch, ["position"])
        self.stdout.write(f"Updated positions for {position_updates} players.")

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