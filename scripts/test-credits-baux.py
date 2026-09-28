#!/usr/bin/env python3
"""Test automatisé de la page Crédits-baux (FleetManager AI).

Vérifie, sur desktop (1416x1800) et mobile (390x1200) :
  1. Absence d'avertissement d'hydratation et d'erreur console au chargement.
  2. Fonctionnement de la recherche (filtrage + vidage du champ).
  3. Bouton Réinitialiser : compteur-badge, remise à zéro, toast de confirmation.

Usage : python3 scripts/test-credits-baux.py [--url http://localhost:8080]
Code de sortie : 0 si tout passe, 1 sinon.
"""

import asyncio
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = sys.argv[sys.argv.index("--url") + 1] if "--url" in sys.argv else "http://localhost:8080"
PAGE_URL = f"{BASE_URL}/credits-baux"
SCREENSHOTS = Path(__file__).parent.parent / "test-artifacts" / "credits-baux"

FAILURES: list[str] = []


def check(condition: bool, label: str) -> None:
    print(f"  {'PASS' if condition else 'FAIL'} — {label}")
    if not condition:
        FAILURES.append(label)


async def run_format(playwright, name: str, viewport: dict) -> None:
    print(f"\n=== {name} ({viewport['width']}x{viewport['height']}) ===")
    browser = await playwright.chromium.launch(headless=True)
    context = await browser.new_context(viewport=viewport)
    page = await context.new_page()

    console_messages: list[str] = []
    page_errors: list[str] = []
    page.on("console", lambda m: console_messages.append(f"{m.type}: {m.text}"))
    page.on("pageerror", lambda e: page_errors.append(str(e)))

    # 1. Chargement : aucun avertissement d'hydratation ni erreur
    await page.goto(PAGE_URL, wait_until="domcontentloaded")
    await page.wait_for_timeout(2500)
    await page.screenshot(path=str(SCREENSHOTS / f"{name}_1_chargement.png"))

    hydration_warnings = [
        m for m in console_messages
        if "hydrat" in m.lower() or "did not match" in m.lower() or "server-rendered" in m.lower()
    ]
    errors = [m for m in console_messages if m.startswith("error")] + page_errors
    check(not hydration_warnings, "aucun avertissement d'hydratation au chargement")
    check(not errors, "aucune erreur console / pageerror au chargement")

    rows = page.locator("table tbody tr")
    total = await rows.count()
    check(total == 6, f"6 contrats affichés au chargement (observé : {total})")

    # 2. Recherche : filtrage puis vidage du champ
    search = page.get_by_label("Rechercher un contrat")
    await search.fill("Ford")
    await page.wait_for_timeout(400)
    filtered = await rows.count()
    check(filtered == 1, f"recherche « Ford » filtre à 1 contrat (observé : {filtered})")
    await page.screenshot(path=str(SCREENSHOTS / f"{name}_2_recherche.png"))

    await search.fill("")
    await page.wait_for_timeout(400)
    restored = await rows.count()
    check(restored == 6, f"vider la recherche ramène les 6 contrats (observé : {restored})")

    # 3. Bouton Réinitialiser : désactivé par défaut, compteur, action, toast
    reset = page.get_by_role("button", name="Réinitialiser")
    check(await reset.is_disabled(), "bouton Réinitialiser désactivé sans réglage actif")

    await search.fill("Peugeot")
    await page.wait_for_timeout(400)
    check(await reset.is_enabled(), "bouton Réinitialiser activé avec une recherche")
    badge = await reset.locator('[data-slot="badge"]').inner_text()
    check(badge.strip() == "1", f"compteur-badge affiche 1 (observé : {badge.strip()!r})")

    await reset.click()
    await page.wait_for_timeout(400)
    value = await search.input_value()
    check(value == "", "la recherche est vidée après réinitialisation")
    check(await rows.count() == 6, "les 6 contrats réapparaissent après réinitialisation")
    check(await reset.is_disabled(), "bouton Réinitialiser de nouveau désactivé")
    toast = page.get_by_text("Recherche, filtres et tri réinitialisés")
    check(await toast.count() > 0, "toast de confirmation affiché")
    await page.screenshot(path=str(SCREENSHOTS / f"{name}_3_reset.png"))

    await browser.close()


async def main() -> None:
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as playwright:
        await run_format(playwright, "desktop", {"width": 1416, "height": 1800})
        await run_format(playwright, "mobile", {"width": 390, "height": 1200})

    print("\n=== Bilan ===")
    if FAILURES:
        print(f"{len(FAILURES)} échec(s) :")
        for f in FAILURES:
            print(f"  - {f}")
        sys.exit(1)
    print("Tous les tests passent (desktop + mobile).")


asyncio.run(main())
