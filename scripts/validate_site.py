from pathlib import Path
import re
from urllib.parse import urlparse

root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
html_lower = html.lower()

required_html = [
    "mythologiq labs llc",
    "https://mythologiq.studio/assets/header-logo.webp",
    'id="documentation"',
    'id="products"',
    'id="open-source"',
    'id="qortara"',
    "secure workspace",
    "qortara sdlc",
    "development",
    "governance",
    "oversight",
    "compliance",
    "evidence",
    "operations",
    "administration",
    "qortara agent governance",
    "provenance",
]
for token in required_html:
    assert token in html_lower, f"missing required site token: {token}"

for forbidden in [
    "documentation front door",
    "public documentation front door",
    "app.qortara.com",
    "open qortara",
]:
    assert forbidden.lower() not in html_lower, f"forbidden public-site language: {forbidden}"

for color in ["#ffb84c", "#0c1b2a", "#2f3e51", "#00d6fb", "#f6f8ff"]:
    assert color in css.lower(), f"missing canonical MythologIQ color: {color}"

matches = re.findall(r'<a class="portal-nav" href="([^"]+)" data-qortara-portal>', html)
assert len(matches) == 1, "Secure Workspace must be the single Qortara private-workspace entry"
portal = matches[0]
assert portal != "__QORTARA_PAGES_URL__", "Qortara portal URL has not been resolved"
parsed_portal = urlparse(portal)
assert parsed_portal.scheme == "https", "Qortara portal must use HTTPS"
assert parsed_portal.hostname == "upgraded-lamp-y89lq1o.pages.github.io", "Secure Workspace must resolve to the exact authenticated GitHub Pages host"
assert parsed_portal.path in ("", "/"), "Secure Workspace must enter at the authenticated workspace root"
assert not parsed_portal.params and not parsed_portal.query and not parsed_portal.fragment, "Secure Workspace URL must not contain extra routing state"

assert html_lower.count("data-qortara-portal") == 1, "only the Secure Workspace control may enter the private Qortara workspace"
assert "<strong>qor oversight</strong>" not in html_lower, "repository/source identity must not be the public SDLC module label"
assert "<strong>qor compliance</strong>" not in html_lower, "repository/source identity must not be the public SDLC module label"
assert "qortara agent governance</strong> · sibling product" in html_lower, "Agent Governance must be presented as a sibling product"
assert "not a qortara sdlc module" in html_lower, "Agent Governance must not be presented as an SDLC module"
assert "prefers-reduced-motion" in css, "reduced-motion support is required"
assert "@media" in css and "max-width" in css, "responsive rules are required"

print("MythologIQ Labs Pages validation passed")