# Agent Memory public benchmark freshness

The public page \`projects/agent-memory/index.html\` now requests the accepted projection from Agent Memory's \`main\` branch **on each page load**. This removes the need for a second, manually committed static snapshot update every time Agent Memory accepts a new benchmark run.

- Live URL: \`https://raw.githubusercontent.com/MythologIQ-Labs-LLC/agent-memory/main/reports/benchmarks/ui/frontier-leaderboards.json\`.
- Projection must match \`0.2.0\`, explicitly deny authority/aggregate score, include an accepted source revision and contain structurally valid comparable ranked rows. One inconsistent claimed ranked row refuses the live projection rather than silently counting it.
- The separately fetched \`refresh-status.json\` shows new raw evidence still pending source registration. Unregistered items never become numeric rankings by being recorded.
- When the live projection cannot be reached (including before PR #785 is merged), the page explicitly labels its existing \`benchmark-snapshot.json\` as an historical fallback. A malformed but delivered live projection is not silently replaced with a misleading success.
- The existing immutable static snapshot remains as a transparent fallback. It is **not** updated by scheduled CI or a separate publishing worker.
- The browser fetch is subject to network availability and CDN caching; page loads do not guarantee instantaneous server push. GitHub source recordings made through API bypass local hook refresh; see Agent Memory's benchmark refresh governance for the required event-driven publisher/executor boundary.

No GitHub Actions is required to rebuild the data or this static page per measurement. One initial website code change is needed. All future accepted score changes flow from Agent Memory's committed projection, provided its producer-side local/Claude hook or independently authorized non-CI publisher is operating.
