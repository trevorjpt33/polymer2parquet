import time
from django.core.management.base import BaseCommand
from players.models import Player
from stats.models import PlayerSeason
from nba_api.stats.static import players as static_players
from nba_api.stats.endpoints import commonplayerinfo


class Command(BaseCommand):
    help = "Enrich NBA player country field via nba_api"

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=None,
            help="Limit the number of players to enrich (for testing)",
        )

    def handle(self, *args, **options):
        self.stdout.write("Building nba_api player lookup...")
        all_nba_players = static_players.get_players()
        nba_lookup = {
            (p["first_name"].lower(), p["last_name"].lower()): p["id"]
            for p in all_nba_players
        }

        # Manual overrides for known name mismatches
        nba_lookup[("nenê", "")] = 2403

        self.stdout.write("Fetching NBA players from DB...")
        nba_player_ids = PlayerSeason.objects.filter(
            league="NBA"
        ).values_list("player_id", flat=True).distinct()

        limit = options["limit"]
        players_to_enrich = Player.objects.filter(
            id__in=nba_player_ids,
            country=""
        )
        if limit:
            players_to_enrich = players_to_enrich[:limit]

        self.stdout.write(f"Players to enrich: {players_to_enrich.count()}")

        updated = skipped = unmatched = 0

        for player in players_to_enrich:
            key = (player.first_name.lower(), player.last_name.lower())
            nba_id = nba_lookup.get(key)

            if not nba_id:
                self.stdout.write(f"  No match: {player.first_name} {player.last_name}")
                unmatched += 1
                continue

            try:
                info = commonplayerinfo.CommonPlayerInfo(player_id=nba_id)
                row = info.get_dict()["resultSets"][0]["rowSet"][0]
                country = row[9]

                if country:
                    player.country = country
                    player.save(update_fields=["country"])
                    updated += 1
                else:
                    skipped += 1

            except Exception as e:
                self.stdout.write(f"  Error for {player.first_name} {player.last_name}: {e}")
                skipped += 1

            time.sleep(0.6)

        self.stdout.write(self.style.SUCCESS(
            f"Done. Updated: {updated} | Skipped: {skipped} | Unmatched: {unmatched}"
        ))