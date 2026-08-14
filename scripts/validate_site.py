from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")

required_html = [
    "MythologIQ Labs LLC",
    "https://mythologiq.studio/assets/header-logo.webp",
    'id="documentation"',
    'id="products"',
    'id="open-source"',
    'id="qortara"',
    "Qortara",
    "Authenticated workspace",
    "Oversight",
    "Compliance",
    "CI gates",
    "Roadmap",
    "Provenance",
]
for token in required_html:
    assert token in html, f"missing required site token: {token}"

for forbidden in [
    "documentation front door",
    "public documentation front door",
    "app.qortara.com",
]:
    assert forbidden.lower() not in html.lower(), f"forbidden public-site language: {forbidden}"

for color in ["#ffb84c", "#0c1b2a", "#2f3e51", "#00d6fb", "#f6f8ff"]:
    assert color in css.lower(), f"missing canonical MythologIQ color: {color}"

match = re.search(r'<a class="button gold" href="([^"]+)" data-qortara-portal>', html)
assert match, "missing Qortara portal link"
portal = match.group(1)
assert portal != "__QORTARA_PAGES_URL__", "Qortara portal URL has not been resolved"
assert portal.startswith("https://"), "Qortara portal must use HTTPS"
assert "github.com" not in portal, "Qortara portal must not be a repository URL"
assert portal.rstrip("/") != "https://qortara.com", "Qortara portal must not be the public marketing site"
assert "pages.github.io" in portal, "current Qortara portal must resolve to the authenticated GitHub Pages host"

assert "prefers-reduced-motion" in css, "reduced-motion support is required"
assert "@media" in css and "max-width" in css, "responsive rules are required"

print("MythologIQ Labs Pages validation passed")
