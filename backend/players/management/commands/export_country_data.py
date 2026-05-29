import csv
from django.core.management.base import BaseCommand
from players.models import Player


class Command(BaseCommand):
    help = "Export player_id and country to CSV for GKE sync"

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            type=str,
            default="country_export.csv",
            help="Output CSV file path (default: country_export.csv)",
        )

    def handle(self, *args, **options):
        output = options["output"]
        players = Player.objects.exclude(country="").values_list("player_id", "country")

        with open(output, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["player_id", "country"])
            writer.writerows(players)

        self.stdout.write(self.style.SUCCESS(
            f"Exported {players.count()} records to {output}"
        ))