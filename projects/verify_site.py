"""Manual, network-free check for the curated GitHub Pages directory and pinned benchmark snapshot.

Run from repo root: python projects/verify_site.py
No GitHub Actions workflow or hosted inference is required.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    source = (ROOT / "catalog.js").read_text(encoding="utf-8")
    marker = "window.MYTHO_PROJECTS = "
    assert marker in source, "missing catalog export"
    catalog_source = source.split(marker, 1)[1].split(";\nwindow.MYTHO_PROJECT_UPDATED", 1)[0]
    catalog = json.loads(catalog_source)
    slugs = [p["slug"] for p in catalog]
    assert len(catalog) >= 16, "incomplete major-project catalog"
    assert len(slugs) == len(set(slugs)), "duplicate project slug"
    for project in catalog:
        slug = project["slug"]
        assert slug and all(ch.islower() or ch.isdigit() or ch == "-" for ch in slug), slug
        assert project["name"] and project["summary"] and project["category"], slug
        for field in ("principles", "goals", "integrations", "benchmarks"):
            assert project[field] and all(isinstance(x, str) and x for x in project[field]), (slug, field)
        assert project.get("repo") or project.get("repoUrl") or project.get("site"), slug
        page = ROOT / slug / "index.html"
        assert page.is_file(), f"missing standalone URL for {slug}"
        text = page.read_text(encoding="utf-8")
        assert f'data-project="{slug}"' in text, slug
        for dom_id in (
            "project-title", "project-summary", "project-actions", "list-principles",
            "list-goals", "list-integrations", "list-benchmark-info", "source-links"
        ):
            assert f'id="{dom_id}"' in text, (slug, dom_id)
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    assert 'id="project-list"' in index

    snap = json.loads((ROOT / "agent-memory" / "benchmark-snapshot.json").read_text(encoding="utf-8"))
    assert snap["schema_version"] == "public-docs-1"
    assert len(snap["source_commit"]) == 40
    assert snap["source_projection_sha"] and len(snap["source_projection_sha"]) == 40
    assert snap["ranked_count"] == len(snap["ranked"]) and snap["ranked"]
    assert snap["metric_coverage_count"] == len(snap["coverage"])
    assert len({r["id"] for r in snap["ranked"]}) == len(snap["ranked"])
    for row in snap["ranked"]:
        assert row["direction"] in {"higher_better", "lower_better", "zero_target"}, row["id"]
        assert row["unit"], row["id"]
        assert row["context"]["adequacy"] == "threshold_not_established", row["id"]
        assert len(row["systems"]) >= 2 and row["systems"], row["id"]
        assert len([s for s in row["systems"] if s["role"] == "subject"]) == 1, row["id"]
        assert all(s["role"] in {"subject", "external_competitor", "control"} for s in row["systems"]), row["id"]
        assert all(isinstance(s["value"], (int, float)) and not isinstance(s["value"], bool)
                   and math.isfinite(s["value"]) and s["value"] >= 0 for s in row["systems"]), row["id"]
        if row["unit"] == "ratio":
            assert all(s["value"] <= 1 for s in row["systems"]), row["id"]
        nums = [s["value"] for s in row["systems"]]
        best = min(nums) if row["direction"] in {"lower_better", "zero_target"} else max(nums)
        agent = next(s["value"] for s in row["systems"] if s["role"] == "subject")
        expected_gap = agent - best if row["direction"] in {"lower_better", "zero_target"} else best - agent
        assert math.isclose(row["gap"], expected_gap, abs_tol=1e-8), row["id"]
        assert row["currency"] in {"current", "superseded", "newer_unaccepted_evidence", "undetermined"}
    external_peers = {
        s["id"] for row in snap["ranked"] for s in row["systems"]
        if s["role"] == "external_competitor"
    }
    lexical_controls = {
        s["id"] for row in snap["ranked"] for s in row["systems"]
        if s["role"] == "control"
    }
    assert external_peers.isdisjoint(lexical_controls), "competitors cannot be counted as lexical controls"
    assert external_peers, "empty external competitor set cannot imply competitive breadth"
    assert len(external_peers) <= len(snap["ranked"]), "impossible external population"
    chart_renderer = (ROOT / "benchmark.js").read_text(encoding="utf-8")
    assert 'systemIds("external_competitor"' in chart_renderer, "external competitor coverage missing"
    assert 'systemIds("control"' in chart_renderer, "control coverage missing"
    memory_page = (ROOT / "agent-memory" / "index.html").read_text(encoding="utf-8")
    assert 'id="benchmark-grid"' in memory_page
    assert 'id="benchmark-coverage-list"' in memory_page
    assert "PR #787" in memory_page
    assert 'id="benchmark-peer-coverage"' in memory_page, "measured peer disclosure missing"
    assert 'id="benchmark-peer-by-family"' in memory_page, "family peer coverage missing"
    assert "/agent-memory/issues/789" in memory_page, "peer expansion program link missing"
    print(f"PASS: {len(catalog)} pages, {len(snap['ranked'])} native charts, "
          f"{len(snap['coverage'])} coverage definitions, all gap arithmetic consistent")


if __name__ == "__main__":
    main()
