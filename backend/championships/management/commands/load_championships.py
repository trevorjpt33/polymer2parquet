from django.core.management.base import BaseCommand
from championships.models import Championship
from teams.models import Team

NBA_CHAMPIONS = {
    1947: "PHW", 1948: "BLB", 1949: "MNL", 1950: "MNL",
    1951: "ROC", 1952: "MNL", 1953: "MNL", 1954: "MNL",
    1955: "SYR", 1956: "PHW", 1957: "BOS", 1958: "STL",
    1959: "BOS", 1960: "BOS", 1961: "BOS", 1962: "BOS",
    1963: "BOS", 1964: "BOS", 1965: "BOS", 1966: "BOS",
    1967: "PHI", 1968: "BOS", 1969: "BOS", 1970: "NYK",
    1971: "MIL", 1972: "LAL", 1973: "NYK", 1974: "BOS",
    1975: "GSW", 1976: "BOS", 1977: "POR", 1978: "WSB",
    1979: "SEA", 1980: "LAL", 1981: "BOS", 1982: "LAL",
    1983: "PHI", 1984: "BOS", 1985: "LAL", 1986: "BOS",
    1987: "LAL", 1988: "LAL", 1989: "DET", 1990: "DET",
    1991: "CHI", 1992: "CHI", 1993: "CHI", 1994: "HOU",
    1995: "HOU", 1996: "CHI", 1997: "CHI", 1998: "CHI",
    1999: "SAS", 2000: "LAL", 2001: "LAL", 2002: "LAL",
    2003: "SAS", 2004: "DET", 2005: "SAS", 2006: "MIA",
    2007: "SAS", 2008: "BOS", 2009: "LAL", 2010: "LAL",
    2011: "DAL", 2012: "MIA", 2013: "MIA", 2014: "SAS",
    2015: "GSW", 2016: "CLE", 2017: "GSW", 2018: "GSW",
    2019: "TOR", 2020: "LAL", 2021: "MIL", 2022: "GSW",
    2023: "DEN", 2024: "BOS", 2025: "OKC",
}

ABA_CHAMPIONS = {
    1968: "PTP",
    1969: "OAK",
    1970: "INA",
    1971: "UTS",
    1972: "INA",
    1973: "INA",
    1974: "NYA",
    1975: "KEN",
    1976: "NYA",
}

class Command(BaseCommand):
    help = "Go through NBA_CHAMPIONS, ABA_CHAMPIONS dicts to create Championship records in the database"

    def handle(self, *args, **options):
        created = skipped = 0

        for season_year, abbreviation in NBA_CHAMPIONS.items():
            team = None
            league = "NBA"
            try:
                team = Team.objects.get(
                    abbreviation=abbreviation,
                    league=league
                )

            except Team.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"{season_year} {league} champion {abbreviation} team record not found. Skipping."
                    )
                )
                skipped += 1
                
            if team is not None:
                _, was_created = Championship.objects.update_or_create(
                    season_year=season_year,
                    league=league,
                    defaults={"team": team}
                )

                if was_created:
                    created += 1

        for season_year, abbreviation in ABA_CHAMPIONS.items():
            team = None
            league = "ABA"
            try:
                team = Team.objects.get(
                    abbreviation=abbreviation,
                    league=league
                )

            except Team.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"{season_year} {league} champion {abbreviation} team record not found. Skipping."
                    )
                )
                skipped += 1
                
            if team is not None:
                _, was_created = Championship.objects.update_or_create(
                    season_year=season_year,
                    league=league,
                    defaults={"team": team}
                )

                if was_created:
                    created += 1

        self.stdout.write(self.style.SUCCESS(
                f"Done. Upserted: {created} | Skipped: {skipped}"
            )
        )