from pathlib import Path
import re
from urllib.parse import urlparse

root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
hierarchy_css = (root / "qortara-hierarchy.css").read_text(encoding="utf-8")
html_lower = html.lower()
hierarchy_css_lower = hierarchy_css.lower()

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
assert "qortara agent governance</h3>" in html_lower, "Agent Governance sibling product must be visible"
assert "not a qortara sdlc module" in html_lower, "Agent Governance must not be presented as an SDLC module"

# Product hierarchy is semantic structure, not a decorative flat list.
assert 'class="qortara-hierarchy" role="tree"' in html_lower, "Qortara public composition must render as a hierarchy tree"
assert 'data-product-family="qortara"' in html_lower, "Qortara must be the family root"
assert 'data-product="qortara-sdlc"' in html_lower, "Qortara SDLC must be a child product"
assert 'data-product="qortara-agent-governance"' in html_lower, "Agent Governance must be a sibling product"
assert 'aria-label="qortara sdlc modules"' in html_lower, "SDLC module group must be explicit"

modules = [
    "development",
    "governance",
    "oversight",
    "compliance",
    "evidence",
    "operations",
    "administration",
]
for module in modules:
    token = f'data-sdlc-module="{module}"'
    assert html_lower.count(token) == 1, f"SDLC module must appear exactly once in the SDLC branch: {module}"

sdlc_start = html_lower.index('data-product="qortara-sdlc"')
agent_start = html_lower.index('data-product="qortara-agent-governance"')
assert sdlc_start < agent_start, "SDLC branch must be structurally distinct from the Agent Governance sibling"
for module in modules:
    module_pos = html_lower.index(f'data-sdlc-module="{module}"')
    assert sdlc_start < module_pos < agent_start, f"{module} must be nested beneath Qortara SDLC, not flattened beside sibling products"

# Layout regression guards. The hierarchy stylesheet loads after the base stylesheet
# and must reclaim full width from the legacy two-column portal shell.
assert './qortara-hierarchy.css' in html_lower, "Qortara hierarchy stylesheet must be loaded"
assert ".portal-shell" in hierarchy_css_lower, "hierarchy stylesheet must override the portal shell"
assert "grid-template-columns: minmax(0, 1fr);" in hierarchy_css, "Qortara hierarchy must not be trapped in the legacy narrow side column"
assert "overflow-wrap: anywhere;" in hierarchy_css, "hierarchy text must have a safe wrapping rule"
assert "repeat(2, minmax(0, 1fr))" in hierarchy_css, "desktop hierarchy should use responsive equal-width product/module columns"
assert ".qortara-product-branches::before" not in hierarchy_css, "decorative product connector lines are prohibited after overlap regression"
assert ".qortara-module-node::before" not in hierarchy_css, "decorative module connector lines are prohibited after overlap regression"
assert "prefers-reduced-motion" in hierarchy_css, "hierarchy styling must preserve reduced-motion support"
assert "@media" in hierarchy_css and "max-width" in hierarchy_css, "hierarchy styling must remain responsive"
assert "prefers-reduced-motion" in css, "base reduced-motion support is required"
assert "@media" in css and "max-width" in css, "base responsive rules are required"

print("MythologIQ Labs Pages validation passed")