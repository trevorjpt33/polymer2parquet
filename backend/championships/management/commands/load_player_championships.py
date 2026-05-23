from django.core.management.base import BaseCommand
from championships.models import Championship, PlayerChampionship
from players.models import Player
from stats.models import PlayerSeason

class Command(BaseCommand):
    help = "Load Championship records and cross-check with PlayerSeason records to create PlayerChampionship records in the database"

    def handle(self, *args, **options):
        created = updated = 0
        champs = Championship.objects.all()
        
        for champ in champs:
            matches = PlayerSeason.objects.filter(team=champ.team, season_year=champ.season_year)
            
            for match in matches:
                player = match.player
                _, was_created = PlayerChampionship.objects.update_or_create(
                    player=player,
                    championship=champ,
                    defaults={}
                )

                if was_created:
                    created += 1
                else:
                    updated += 1

        self.stdout.write(self.style.SUCCESS(
                f"Done. Created: {created} | Updated: {updated}"
            )
        )
