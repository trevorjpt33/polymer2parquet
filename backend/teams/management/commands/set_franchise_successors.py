from django.core.management.base import BaseCommand
from teams.models import Team

SUCCESSORS = {
    # NBA chains: Predecessor -> Successor
    # (Abbreviation, League): (Abbreviation, League)
    ("PHW", "NBA"): ("SFW", "NBA"),
    ("SFW", "NBA"): ("GSW", "NBA"),
    ("BLB", "NBA"): ("BAL", "NBA"),
    ("BAL", "NBA"): ("CAP", "NBA"),
    ("CAP", "NBA"): ("WSB", "NBA"),
    ("WSB", "NBA"): ("WAS", "NBA"),
    ("MNL", "NBA"): ("LAL", "NBA"),
    ("SYR", "NBA"): ("PHI", "NBA"),
    ("ROC", "NBA"): ("CIN", "NBA"),
    ("CIN", "NBA"): ("KCO", "NBA"),
    ("KCO", "NBA"): ("KCK", "NBA"),
    ("KCK", "NBA"): ("SAC", "NBA"),
    ("FTW", "NBA"): ("DET", "NBA"),
    ("TRI", "NBA"): ("MLH", "NBA"),
    ("MLH", "NBA"): ("STL", "NBA"),
    ("STL", "NBA"): ("ATL", "NBA"),
    ("SDR", "NBA"): ("HOU", "NBA"),
    ("SDC", "NBA"): ("LAC", "NBA"),
    ("NYN", "NBA"): ("NJN", "NBA"),
    ("NJN", "NBA"): ("BRK", "NBA"),
    ("SEA", "NBA"): ("OKC", "NBA"),
    ("NOJ", "NBA"): ("UTA", "NBA"),
    ("CHH", "NBA"): ("CHO", "NBA"),       # Charlotte retains 1988-2002 history
    ("NOK", "NBA"): ("NOH", "NBA"),       # Katrina split-city feeds back to NOH
    ("NOH", "NBA"): ("NOP", "NBA"),       # New Orleans history 2002-present
    ("CHA", "NBA"): ("CHO", "NBA"),       # Bobcats → Hornets
    ("VAN", "NBA"): ("MEM", "NBA"),
    # ABA internal chains
    ("NJA", "ABA"): ("NYA", "ABA"),
    ("ANA", "ABA"): ("HSM", "ABA"),
    ("HSM", "ABA"): ("NOB", "ABA"),
    ("NOB", "ABA"): ("MMF", "ABA"),
    ("MMF", "ABA"): ("FLO", "ABA"),
    ("FLO", "ABA"): ("MMP", "ABA"),
    ("MMP", "ABA"): ("MMT", "ABA"),
    ("MMT", "ABA"): ("MMS", "ABA"),
    ("OAK", "ABA"): ("WSA", "ABA"),
    ("WSA", "ABA"): ("VIR", "ABA"),
    ("LAS", "ABA"): ("UTS", "ABA"),
    ("DLC", "ABA"): ("TEX", "ABA"),
    ("TEX", "ABA"): ("SAA", "ABA"),
    ("PTP", "ABA"): ("MNP", "ABA"),
    ("MNP", "ABA"): ("PTC", "ABA"),
    ("SDA", "ABA"): ("SDS", "ABA"),
    ("MNM", "ABA"): ("MMF", "ABA"),
    # ABA → NBA transitions
    ("NYA", "ABA"): ("NYN", "NBA"),
    ("INA", "ABA"): ("IND", "NBA"),
    ("SAA", "ABA"): ("SAS", "NBA"),
    ("DNA", "ABA"): ("DEN", "NBA"),
}

class Command(BaseCommand):
    help = "Go through each chain of NBA/ABA franchise lineage, updating the database to include successor"

    def handle(self, *args, **options):
        succ_updated = 0
        succ_skipped = 0
        
        for (pred_abbr, pred_league), (succ_abbr, succ_league) in SUCCESSORS.items():
            pred_team = None
            succ_team = None
            try:
                pred_team = Team.objects.get(
                    abbreviation=pred_abbr,
                    league=pred_league
                )
            except Team.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"The predecessor {pred_league} team {pred_abbr} was not found in the database."
                    )
                )
            try:
                succ_team = Team.objects.get(
                    abbreviation=succ_abbr,
                    league=succ_league
                )
            except Team.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"The successor {succ_league} team {succ_abbr} was not found in the database."
                    )
                )
            
            if pred_team is None or succ_team is None:
                self.stdout.write(self.style.WARNING(
                    f"The mapping of the predecessor ({pred_abbr}, {pred_league}): ({succ_abbr}, {succ_league}) failed - match not found for both teams."
                    )
                )
                succ_skipped += 1
            else:
                pred_team.successor = succ_team
                pred_team.save()
                succ_updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. Successors Updated: {succ_updated} | Successors Skipped: {succ_skipped}"
            )
        )