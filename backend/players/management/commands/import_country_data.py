import csv
from django.core.management.base import BaseCommand
from players.models import Player


class Command(BaseCommand):
    help = "Import country field from CSV to database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--input",
            type=str,
            default="country_export.csv",
            help="Input CSV file path (default: country_export.csv)",
        )

    def handle(self, *args, **options):
        input_file = options["input"]

        with open(input_file, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        self.stdout.write(f"Importing {len(rows)} records...")

        updated = skipped = errors = 0

        for row in rows:
            try:
                count = Player.objects.filter(
                    player_id=row["player_id"]
                ).update(country=row["country"])
                if count:
                    updated += 1
                else:
                    self.stdout.write(
                        f"  No player found: {row['player_id']}"
                    )
                    skipped += 1
            except Exception as e:
                self.stdout.write(f"  Error on {row['player_id']}: {e}")
                errors += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. Updated: {updated} | Skipped: {skipped} | Errors: {errors}"
        ))