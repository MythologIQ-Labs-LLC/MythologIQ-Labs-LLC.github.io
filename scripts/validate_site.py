from pathlib import Path
import re

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
    'id="secure-workspace"',
    "secure workspace",
    "oversight",
    "compliance",
    "ci gates",
    "roadmap",
    "provenance",
]
for token in required_html:
    assert token in html_lower, f"missing required site token: {token}"

for forbidden in [
    "documentation front door",
    "public documentation front door",
    "app.qortara.com",
    'href="#qortara"',
    "open qortara",
    "about qortara",
    "data-qortara-portal",
]:
    assert forbidden.lower() not in html_lower, f"forbidden public-site language or routing: {forbidden}"

for color in ["#ffb84c", "#0c1b2a", "#2f3e51", "#00d6fb", "#f6f8ff"]:
    assert color in css.lower(), f"missing canonical MythologIQ color: {color}"

workspace_links = re.findall(r'<a[^>]+href="([^"]+)"[^>]+data-secure-workspace[^>]*>', html)
assert len(workspace_links) >= 2, "secure workspace must be directly reachable from navigation and workspace section"
assert len(set(workspace_links)) == 1, "all secure-workspace entry points must resolve to the same destination"
workspace = workspace_links[0]
assert workspace.startswith("https://"), "secure workspace must use HTTPS"
assert not workspace.startswith("#"), "secure workspace must not route to an in-page product section"
assert "github.com" not in workspace, "secure workspace must not be a repository URL"
assert workspace.rstrip("/") != "https://qortara.com", "secure workspace must not be the public Qortara marketing site"
assert "pages.github.io" in workspace, "current secure workspace must resolve to the authenticated GitHub Pages host"

assert "prefers-reduced-motion" in css, "reduced-motion support is required"
assert "@media" in css and "max-width" in css, "responsive rules are required"

print("MythologIQ Labs Pages validation passed")
