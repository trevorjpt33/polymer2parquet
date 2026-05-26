import time
import cloudscraper
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from players.models import Player

RATE_LIMITED = "RATE_LIMITED"


def get_country(player_id, scraper):
    first_letter = player_id[0]
    url = f"https://www.basketball-reference.com/players/{first_letter}/{player_id}.html"
    try:
        r = scraper.get(url, timeout=15)
        if r.status_code == 429:
            return RATE_LIMITED
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, "html.parser")
        info = soup.find("div", {"id": "info"})
        if not info:
            return None
        for p in info.find_all("p"):
            if "Born" in p.text:
                flag_span = p.find("span", class_="f-i")
                if flag_span:
                    classes = flag_span.get("class", [])
                    code = next(
                        (c.replace("f-", "") for c in classes
                         if c.startswith("f-") and c != "f-i"),
                        None
                    )
                    if code == "us":
                        return "United States"
                    spans = p.find_all("span")
                    place_span = spans[1] if len(spans) > 1 else None
                    if place_span:
                        links = place_span.find_all("a")
                        return links[-1].text if links else None
    except Exception:
        return None
    return None


class Command(BaseCommand):
    help = "Scrape player country field from Basketball Reference"

    def add_arguments(self, parser):
        parser.add_argument(
            "--batch-size",
            type=int,
            default=15,
            help="Number of players to scrape per batch (default: 15)",
        )
        parser.add_argument(
            "--cooldown",
            type=int,
            default=120,
            help="Seconds to wait between batches (default: 120)",
        )
        parser.add_argument(
            "--backoff",
            type=int,
            default=300,
            help="Seconds to wait after a 429 response (default: 300)",
        )

    def handle(self, *args, **options):
        batch_size = options["batch_size"]
        cooldown = options["cooldown"]
        backoff = options["backoff"]

        total_remaining = Player.objects.filter(country="").count()
        self.stdout.write(f"Total players remaining: {total_remaining}")

        batch_num = 0
        updated = skipped = 0

        while True:
            players = list(
                Player.objects.filter(country="").order_by("player_id")[:batch_size]
            )
            if not players:
                break

            batch_num += 1
            self.stdout.write(f"\nBatch {batch_num} — {len(players)} players...")
            scraper = cloudscraper.create_scraper()
            batch_hit_429 = False

            for player in players:
                country = get_country(player.player_id, scraper)

                if country == RATE_LIMITED:
                    self.stdout.write(
                        f"  429 on {player.first_name} {player.last_name} — backing off for {backoff}s..."
                    )
                    time.sleep(backoff)
                    batch_hit_429 = True
                    break

                if country:
                    player.country = country
                    player.save(update_fields=["country"])
                    updated += 1
                else:
                    self.stdout.write(
                        f"  No country found: {player.first_name} {player.last_name} ({player.player_id})"
                    )
                    skipped += 1

                time.sleep(4)

            remaining = Player.objects.filter(country="").count()
            self.stdout.write(f"Batch {batch_num} complete. Remaining: {remaining}")

            if remaining == 0:
                break

            if batch_hit_429:
                self.stdout.write(f"Cooling down extra {backoff}s after rate limited batch...")
                time.sleep(backoff)
            else:
                self.stdout.write(f"Cooling down for {cooldown}s...")
                time.sleep(cooldown)

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. Updated: {updated} | Skipped: {skipped}"
        ))