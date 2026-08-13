# Qortara GitHub Pages reference host

This directory is the first browser-renderable reference implementation of the Qortara SDLC governance workspace.

It is intentionally static and build-free so the same source can be published through a public GitHub Pages repository while the richer authenticated Qortara web host evolves.

## Product planes

- **Overview** composes organization posture without hiding gaps.
- **Qor Oversight** presents attention, freshness, provenance, and source health.
- **Qor Compliance** presents evidence dimensions, control relevance, coverage, and export readiness.
- **Repositories** exposes the repository set admitted to the current presentation fixture.

## Source-owned component bindings

The current reference host is validated against exact published component packages:

- `@mythologiq-labs-llc/qor-oversight-contracts@1.1.0`, source revision `6416689804d7f52ea9c8d7059fbff227a0bea78e`, including `qor-oversight/workspace-surface/v1`;
- `@mythologiq-labs-llc/qor-compliance-contracts@1.1.0`, source revision `0c1eb0b00b3f1fb6a7198764e64c613435533d05`, including `qor.compliance.workspace-surface/v1`.

The host composes those contracts through Qortara workspace semantics. Component meaning remains source-owned rather than being redefined by the static renderer.

`data/reference-fixture.json` is demonstrative UI data, not a live governance conclusion. The repository names and public visibility were verified at implementation time; the posture values are deliberately varied fixture states used to exercise the interface.

## Run locally

```bash
python -m http.server 8000 --directory reference-hosts/github-pages
```

Then open `http://localhost:8000`.

## Validate

```bash
npm run validate:pages-reference
```

The reference host must remain directly portable to the future public Pages repository and conceptually portable to the authenticated Qortara web application.
