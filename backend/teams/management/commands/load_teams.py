import csv
import os
from django.core.management.base import BaseCommand
from teams.models import Team


# Known full name → (city, team_name) mappings for tricky cases
TEAM_NAME_MAP = {
    "Portland Trail Blazers": ("Portland", "Trail Blazers"),
    "Golden State Warriors": ("Golden State", "Warriors"),
    "Oklahoma City Thunder": ("Oklahoma City", "Thunder"),
    "New York Knicks": ("New York", "Knicks"),
    "New York Nets": ("New York", "Nets"),
    "New Jersey Nets": ("New Jersey", "Nets"),
    "New Jersey Americans": ("New Jersey", "Americans"),
    "New Orleans Jazz": ("New Orleans", "Jazz"),
    "New Orleans Hornets": ("New Orleans", "Hornets"),
    "New Orleans Buccaneers": ("New Orleans", "Buccaneers"),
    "New Orleans Pelicans": ("New Orleans", "Pelicans"),
    "Los Angeles Lakers": ("Los Angeles", "Lakers"),
    "Los Angeles Clippers": ("Los Angeles", "Clippers"),
    "Los Angeles Stars": ("Los Angeles", "Stars"),
    "San Antonio Spurs": ("San Antonio", "Spurs"),
    "San Diego Rockets": ("San Diego", "Rockets"),
    "San Diego Clippers": ("San Diego", "Clippers"),
    "San Diego Conquistadors": ("San Diego", "Conquistadors"),
    "San Diego Sails": ("San Diego", "Sails"),
    "San Francisco Warriors": ("San Francisco", "Warriors"),
    "Sheboygan Red Skins": ("Sheboygan", "Red Skins"),
    "Spirits of St. Louis": ("St. Louis", "Spirits"),
    "St. Louis Hawks": ("St. Louis", "Hawks"),
    "St. Louis Spirits": ("St. Louis", "Spirits"),
    "Salt Lake City Stars": ("Salt Lake City", "Stars"),
    "Kansas City Kings": ("Kansas City", "Kings"),
    "Kansas City-Omaha Kings": ("Kansas City-Omaha", "Kings"),
    "Fort Wayne Pistons": ("Fort Wayne", "Pistons"),
    "Capital Bullets": ("Capital", "Bullets"),
    "New York Americans": ("New York", "Americans"),
}


class Command(BaseCommand):
    help = "Load teams from Kaggle Team Abbrev CSV"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            default="data/Team Abbrev.csv",
            help="Path to Team Abbrev CSV file"
        )

    def handle(self, *args, **options):
        file_path = options["file"]

        if not os.path.exists(file_path):
            self.stderr.write(f"File not found: {file_path}")
            return

        self.stdout.write(f"Loading teams from {file_path}...")

        # First pass — build team metadata using ALL rows (including playoffs)
        # for accurate founded/disbanded season ranges
        team_data = {}
        most_recent_season = 0

        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                league = row["lg"].strip()
                if league not in ["NBA", "ABA", "BAA"]:
                    continue
                if league == "BAA":
                    league = "NBA"

                abbreviation = row["abbreviation"].strip()
                full_name = row["team"].strip()
                season = int(row["season"].strip())
                is_playoff = row["playoffs"].strip().upper() == "TRUE"

                # Track most recent season from non-playoff rows only
                if not is_playoff and season > most_recent_season:
                    most_recent_season = season

                # Use lookup first, fall back to rsplit
                if full_name in TEAM_NAME_MAP:
                    city, name = TEAM_NAME_MAP[full_name]
                else:
                    parts = full_name.rsplit(" ", 1)
                    if len(parts) == 2:
                        city = parts[0]
                        name = parts[1]
                    else:
                        city = ""
                        name = full_name

                key = (abbreviation, league)

                if key not in team_data:
                    team_data[key] = {
                        "name": name,
                        "city": city,
                        "abbreviation": abbreviation,
                        "league": league,
                        "founded": season,
                        "disbanded": season,
                    }
                else:
                    if season < team_data[key]["founded"]:
                        team_data[key]["founded"] = season
                    if season > team_data[key]["disbanded"]:
                        team_data[key]["disbanded"] = season

        self.stdout.write(
            f"Found {len(team_data)} unique teams. "
            f"Most recent season: {most_recent_season}"
        )

        # Second pass — identify previous name/city relationships
        teams_by_league = {}
        for key, data in team_data.items():
            league = data["league"]
            if league not in teams_by_league:
                teams_by_league[league] = []
            teams_by_league[league].append(data)

        for key, data in team_data.items():
            league = data["league"]
            same_league_teams = teams_by_league[league]

            previous_names = []
            previous_cities = []

            for other in same_league_teams:
                if other["abbreviation"] == data["abbreviation"]:
                    continue

                if other["disbanded"] >= data["founded"]:
                    continue

                shared_city = other["city"] == data["city"]
                shared_name = other["name"] == data["name"]

                if shared_city or shared_name:
                    if other["city"] != data["city"]:
                        previous_cities.append(other["city"])
                    if other["name"] != data["name"]:
                        previous_names.append(other["name"])

            data["previous_name"] = previous_names[-1] if previous_names else ""
            data["previous_city"] = previous_cities[-1] if previous_cities else ""

        # Third pass — create teams
        Team.objects.all().delete()
        self.stdout.write("Cleared existing teams.")

        teams_created = 0

        for key, data in team_data.items():
            is_active = data["disbanded"] >= (most_recent_season - 1)
            disbanded = None if is_active else data["disbanded"]

            Team.objects.create(
                name=data["name"],
                city=data["city"],
                abbreviation=data["abbreviation"],
                league=data["league"],
                founded=data["founded"] - 1,
                disbanded=disbanded,
                is_active=is_active,
                previous_name=data.get("previous_name", ""),
                previous_city=data.get("previous_city", ""),
            )
            teams_created += 1

        active_count = Team.objects.filter(is_active=True).count()
        inactive_count = Team.objects.filter(is_active=False).count()
        with_history = Team.objects.exclude(
            previous_name="", previous_city=""
        ).count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {teams_created} teams created.\n"
                f"Active: {active_count} | "
                f"Inactive: {inactive_count} | "
                f"With relocation history: {with_history}"
            )
        )