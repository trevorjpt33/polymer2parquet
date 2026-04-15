import csv
import os
from django.core.management.base import BaseCommand
from players.models import Player, Award


class Command(BaseCommand):
    help = "Load awards from All-Star Selections, End of Season Teams, and Player Award Shares CSVs"

    def add_arguments(self, parser):
        parser.add_argument(
            "--allstar-file",
            type=str,
            default="data/All-Star Selections.csv",
            help="Path to All-Star Selections CSV file"
        )
        parser.add_argument(
            "--eos-file",
            type=str,
            default="data/End of Season Teams.csv",
            help="Path to End of Season Teams CSV file"
        )
        parser.add_argument(
            "--shares-file",
            type=str,
            default="data/Player Award Shares.csv",
            help="Path to Player Award Shares CSV file"
        )

    def handle(self, *args, **options):
        allstar_path = options["allstar_file"]
        eos_path     = options["eos_file"]
        shares_path  = options["shares_file"]

        for path in [allstar_path, eos_path, shares_path]:
            if not os.path.exists(path):
                self.stderr.write(f"File not found: {path}")
                return

        Award.objects.all().delete()
        self.stdout.write("Cleared existing awards.")

        created = skipped = 0

        # --- All-Star Selections ---
        self.stdout.write("Loading All-Star selections...")
        with open(allstar_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                player_id = row.get("player_id", "").strip()
                league    = row.get("lg", "").strip()
                try:
                    season_year = int(row.get("season", "").strip())
                except ValueError:
                    skipped += 1
                    continue

                try:
                    player = Player.objects.get(player_id=player_id)
                except Player.DoesNotExist:
                    skipped += 1
                    continue

                _, was_created = Award.objects.get_or_create(
                    player=player,
                    award_type="ALL_STAR",
                    season_year=season_year,
                    league=league,
                )
                if was_created:
                    created += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(f"Skipped {player_id} | {season_year} | {league} {award_type}.")
                    )
                    skipped += 1

        # --- End of Season Teams ---
        self.stdout.write("Loading End of Season Teams...")

        TYPE_MAP = {
            ("All-NBA", "NBA", "1st")     :  "ALL_NBA_1",
            ("All-NBA", "NBA", "2nd")     :  "ALL_NBA_2",
            ("All-NBA", "NBA", "3rd")     :  "ALL_NBA_3",
            ("All-Defense", "NBA", "1st") :  "ALL_DEF_NBA_1",
            ("All-Defense", "NBA", "2nd") :  "ALL_DEF_NBA_2",
            ("All-ABA", "ABA", "1st")     :  "ALL_ABA_1",
            ("All-ABA", "ABA", "2nd")     :  "ALL_ABA_2",
            ("All-Defense", "ABA", "1st") :  "ALL_DEF_ABA_1",
        }

        with open(eos_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                player_id = row.get("player_id", "").strip()
                league    = row.get("lg", "").strip()
                team_type = row.get("type", "").strip()

                if league == "BAA":
                    league = "NBA"
                
                if team_type == "All-BAA":
                    team_type = "All-NBA"

                try:
                    season_year = int(row.get("season", "").strip())
                    number_tm   = row.get("number_tm", "").strip()
                except ValueError:
                    skipped += 1
                    continue

                award_type = TYPE_MAP.get((team_type, league, number_tm))
                if not award_type:
                    self.stdout.write(
                        self.style.WARNING(f"Skipped {player_id} | {season_year} | {team_type} {number_tm}.")
                    )
                    skipped += 1
                    continue

                try:
                    player = Player.objects.get(player_id=player_id)
                except Player.DoesNotExist:
                    skipped += 1
                    continue

                _, was_created = Award.objects.get_or_create(
                    player=player,
                    award_type=award_type,
                    season_year=season_year,
                    league=league,
                )
                if was_created:
                    created += 1
                else:
                    skipped += 1

        # --- Player Award Shares (winners only) ---
        self.stdout.write("Loading Player Award Shares...")

        AWARD_MAP = {
            "nba mvp" : "MVP",
            "nba dpoy": "DPOY",
            "nba roy" : "ROY",
            "nba mip" : "MIP",
            "nba smoy": "6MOY",
            "aba mvp" : "ABA_MVP",
            "aba roy" : "ABA_ROY",
        }

        with open(shares_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                winner = row.get("winner", "").strip().upper()
                if winner != "TRUE":
                    continue

                player_id  = row.get("player_id", "").strip()
                league     = (row.get("award", "").strip()).split()[0].upper()
                award_raw  = row.get("award", "").strip().lower()

                if league == "BAA":
                    award_raw = award_raw.replace("baa", "nba")
                    league = "NBA"
                
                try:
                    season_year = int(row.get("season", "").strip())
                except ValueError:
                    skipped += 1
                    continue

                award_type = AWARD_MAP.get(award_raw)
                if not award_type:
                    self.stdout.write(
                        self.style.WARNING(f"Skipped {player_id} | {season_year} | {league} | {award_raw}.")
                    )
                    skipped += 1
                    continue

                try:
                    player = Player.objects.get(player_id=player_id)
                except Player.DoesNotExist:
                    skipped += 1
                    continue

                _, was_created = Award.objects.get_or_create(
                    player=player,
                    award_type=award_type,
                    season_year=season_year,
                    league=league,
                )
                if was_created:
                    created += 1
                else:
                    skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. Created: {created} | Skipped: {skipped}"
        ))