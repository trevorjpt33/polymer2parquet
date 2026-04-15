import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from players.models import Player


class Command(BaseCommand):
    help = "Load players from Kaggle Player Career Info CSV"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            default="data/Player Career Info.csv",
            help="Path to Player Career Info CSV file"
        )

    def handle(self, *args, **options):
        file_path = options["file"]

        if not os.path.exists(file_path):
            self.stderr.write(f"File not found: {file_path}")
            return

        self.stdout.write(f"Loading players from {file_path}...")

        # Determine the most recent season to identify active players
        most_recent_season = 0
        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
                    to_season = int(row["to"].strip())
                    if to_season > most_recent_season:
                        most_recent_season = to_season
                except (ValueError, KeyError):
                    continue

        self.stdout.write(f"Most recent season: {most_recent_season}")

        players_created = 0
        players_skipped = 0

        # Clear existing players
        Player.objects.all().delete()
        self.stdout.write("Cleared existing players.")

        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                full_name = row["player"].strip()

                # Split full name into first and last
                name_parts = full_name.split(" ", 1)
                if len(name_parts) == 2:
                    first_name = name_parts[0]
                    last_name = name_parts[1]
                else:
                    first_name = full_name
                    last_name = ""

                # Use raw position value, treat NA as empty
                position = row["pos"].strip() if row["pos"].strip() != "NA" else ""

                # Parse height
                try:
                    height_inches = int(row["ht_in_in"].strip())
                except (ValueError, KeyError):
                    height_inches = None

                # Parse weight
                try:
                    weight_lbs = int(float(row["wt"].strip()))
                except (ValueError, KeyError):
                    weight_lbs = None

                # Parse birth date
                birth_date = None
                raw_date = row["birth_date"].strip()
                if raw_date:
                    for fmt in ["%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ"]:
                        try:
                            birth_date = datetime.strptime(raw_date, fmt).date()
                            break
                        except ValueError:
                            continue

                # Parse college
                college = row["colleges"].strip() if row["colleges"].strip() else ""

                # Determine if active
                try:
                    to_season = int(row["to"].strip())
                    is_active = to_season >= (most_recent_season - 1)
                except (ValueError, KeyError):
                    is_active = False

                Player.objects.create(
                    player_id=row["player_id"].strip(),
                    first_name=first_name,
                    last_name=last_name,
                    position=position,
                    birth_date=birth_date,
                    country="",
                    college=college,
                    height_inches=height_inches,
                    weight_lbs=weight_lbs,
                    is_active=is_active,
                )
                players_created += 1

        active_count = Player.objects.filter(is_active=True).count()
        inactive_count = Player.objects.filter(is_active=False).count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {players_created} players created, "
                f"{players_skipped} skipped.\n"
                f"Active: {active_count} | Inactive: {inactive_count}"
            )
        )