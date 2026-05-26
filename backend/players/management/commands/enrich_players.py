import time
import unicodedata
from datetime import datetime
from collections import defaultdict
from django.core.management.base import BaseCommand
from players.models import Player
from stats.models import PlayerSeason
from nba_api.stats.static import players as static_players
from nba_api.stats.endpoints import commonplayerinfo


def normalize(s):
    """Strip accents and lowercase for fuzzy name matching."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', s)
        if unicodedata.category(c) != 'Mn'
    ).lower()


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

        # Build normalized name → list of IDs (to detect collisions)
        name_to_ids = defaultdict(list)
        for p in all_nba_players:
            key = (normalize(p["first_name"]), normalize(p["last_name"]))
            name_to_ids[key].append(p["id"])

        # Split into clean lookups and collisions
        nba_lookup = {k: v[0] for k, v in name_to_ids.items() if len(v) == 1}
        nba_collisions = {k: v for k, v in name_to_ids.items() if len(v) > 1}

        # Manual overrides for known name mismatches (nicknames, aliases, etc.)
        nba_lookup[(normalize("Nenê"), "")] = 2403

        self.stdout.write(f"Collisions to disambiguate by birthdate: {len(nba_collisions)}")

        self.stdout.write("Fetching NBA players from DB...")
        nba_player_ids = PlayerSeason.objects.filter(
            league="NBA"
        ).values_list("player_id", flat=True).distinct()

        limit = options["limit"]
        players_to_enrich = Player.objects.filter(
            id__in=nba_player_ids
        )
        if limit:
            players_to_enrich = players_to_enrich[:limit]

        self.stdout.write(f"Players to enrich: {players_to_enrich.count()}")

        updated = skipped = unmatched = 0

        for player in players_to_enrich:
            key = (normalize(player.first_name), normalize(player.last_name))

            # Resolve nba_api ID
            if key in nba_lookup:
                nba_id = nba_lookup[key]
            elif key in nba_collisions:
                nba_id = self._resolve_collision(
                    nba_collisions[key], player.birth_date
                )
                if not nba_id:
                    self.stdout.write(
                        f"  Could not disambiguate: {player.first_name} {player.last_name}"
                    )
                    unmatched += 1
                    continue
            else:
                self.stdout.write(
                    f"  No match: {player.first_name} {player.last_name}"
                )
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
                self.stdout.write(
                    f"  Error for {player.first_name} {player.last_name}: {e}"
                )
                skipped += 1

            time.sleep(0.6)

        self.stdout.write(self.style.SUCCESS(
            f"Done. Updated: {updated} | Skipped: {skipped} | Unmatched: {unmatched}"
        ))

    def _resolve_collision(self, candidate_ids, birth_date):
        """Disambiguate multiple nba_api candidates by comparing birthdate."""
        if not birth_date:
            return None

        for nba_id in candidate_ids:
            try:
                info = commonplayerinfo.CommonPlayerInfo(player_id=nba_id)
                row = info.get_dict()["resultSets"][0]["rowSet"][0]
                raw_birthdate = row[7]
                if raw_birthdate:
                    nba_birth_date = datetime.strptime(
                        raw_birthdate, "%Y-%m-%dT%H:%M:%S"
                    ).date()
                    if nba_birth_date == birth_date:
                        return nba_id
                time.sleep(0.6)
            except Exception:
                continue

        return None