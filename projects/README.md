# Public project documentation and benchmark dashboard

This is the public documentation section of **MythologIQ Labs' existing organization GitHub Pages site**. The live site's existing root and hosting boundaries are preserved. It is **not** the Netlify-hosted MythologIQ Studio marketing site or Qortara's private operational workspace.

## Layout

- `/projects/`: curated searchable index.
- `/projects/<slug>/`: independent page for each documented product/repository, with design principles, goals, interfaces, and evidence.
- `/projects/agent-memory/#benchmarks`: horizontal **per-native-metric** bar charts.
- `projects/catalog.js`: explicitly curated **public-only** project metadata, including public product pages for private-source products. Never synchronize private repo names or sensitive issue descriptions automatically.
- `projects/agent-memory/benchmark-snapshot.json`: frozen subset of real qualified F1 leaderboard projection source.
- `projects/verify_site.py`: manual local validation, no CI/Actions required.

Current directory contains **18** independent project pages; the Qortara SDLC, Qortara Logic, Agent Governance, P.A.I., and Agent Memory surfaces remain distinct.

## Benchmark evidence authority

The standalone Pages chart view is a visualization of **historically accepted same-harness measurement**. Its initial source is the exact PR #785 projection:

- Source commit: `517183c28c0bdf07a5e8dfd915da747a925152a6`.
- Source projection Git blob: `dbb8860a37ec628b3353a05982a7da2a723a272f`.
- Snapshot: `git-evidence-v1:2acc39d36b3b637a08289aa757919f55da04c54c:bde6730898e0be1c4caa52c8d18344b9d6dd5266:93038c547b36f205617b618206193921e1496456:bb0df8fa38141932075dd7f203c4e33fadef0897`.
- Source projection: https://github.com/MythologIQ-Labs-LLC/agent-memory/blob/517183c28c0bdf07a5e8dfd915da747a925152a6/reports/benchmarks/ui/frontier-leaderboards.json
- Only **58** eligible within-metric comparison rows are visualized, spanning AMB PrecisionMemBench v1/v2 and LongMemEval S v1/v2. **455** registered metric definitions remain available for coverage context, not as fabricated zero-score bars.

The benchmark snapshots include only the roles `subject`, `external_competitor`, and `control`. Every bar inherits native units, direction, frozen task-profile and input identity. Individual provenance links point to exact commit source reports. The UI never combines different benchmarks or generations into a blended score. It does not claim universal best-in-class status or establish adequacy thresholds.

**Important:** PR #787 demonstrates the existence and many verified identities/digests of v3–v6 evidence, but the authoritative dashboard's missing lane registrations and remaining validation gates must be reconciled **before** those newer scores are added to Pages. PR #787's audit proposal is marked `no_authority:true` and must never be consumed as if it were a released ranking.

### Updating the snapshot after evidence approval

1. Confirm owner approval of the canonical `reports/benchmarks/dashboard/current.json` reconciliation and the accepted exact-harness catalog at a committed, immutable Agent Memory SHA.
2. Independently run scorecard/catalog/frontier-generation checks in a local or authorized cloud checkout, without GitHub Actions. No new model/benchmark expense is required for a view refresh.
3. Extract eligible rows from the qualified projection, retaining exact evidence identity and role, native metric unit/direction, adequacy state, source reference, coverage, and snapshot hash. Do not pull vendor-published reference scores into a competitive bar series.
4. Replace only the derived `projects/agent-memory/benchmark-snapshot.json` with a reviewed reproducible update; update the snapshot label and exact source links if applicable.
5. Run `python projects/verify_site.py` and inspect desktop/mobile keyboard and filter behavior locally.
6. Review and merge the separate GitHub Pages PR. **Do not merge Agent Memory runtime or benchmark evidence PRs implicitly.**

## Development and publishing

From the organization Pages repository root:

```bash
python projects/verify_site.py
python -m http.server 8765
```

Open `http://localhost:8765/projects/` and `http://localhost:8765/projects/agent-memory/#benchmarks`. No NPM, generated site framework, API token, backend service, model call or hosting workflow is required. Plain static files and scripts are used.

The feature branch / draft PR is **not deployed**. Pages publishing follows the existing organization repository's configured source after an explicitly approved merge or Pages configuration change. Do not add a new GitHub Actions deployment workflow or deploy to Netlify. Verify the live GitHub Pages source setting before merging.

## Known limitations

- This is a curated snapshot, not a live synchronization. Freshness requires approved changes.
- Benchmarks are current only **for the pinned historical evidence**, not the latest undeclared runtime.
- The website's own browser/accessibility and Python manual tests must be executed in a local checkout before merging. Static source and chart arithmetic checks were independently performed before draft PR creation; no browser-test success is asserted without execution.
- Private source repositories are represented only through existing public product descriptions, never unpublished code or internal issue metadata.
