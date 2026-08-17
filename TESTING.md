# Testing

The repository treats visual correctness as a testable product behavior, not a manual claim.

## Local verification

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test:unit
bun run build
bunx playwright install chromium
bun run test:e2e
```

`typecheck` covers application code, Playwright configuration, and end-to-end tests. The production build must complete before browser verification.

## Browser coverage

Playwright runs at two reference sizes:

- Desktop Chrome: 1280 × 800
- Mobile: 390 × 844

The suite verifies:

- real Three.js scene objects through `window.__R3F_SCENE__`
- exterior, architecture, system, and rack mode transitions
- aspect-aware camera framing for architecture corners and rack extremes
- GPC selection and workload state
- absence of client exceptions and unexpected `.glb` requests
- accessibility landmarks and page heading structure
- committed visual-regression screenshots

Playwright requests reduced motion. The application responds by using demand-based rendering, which keeps WebGL screenshots deterministic while preserving normal animation for users who have not requested reduced motion.

## Updating visual baselines

Only update baselines after reviewing the generated images at both viewport sizes:

```bash
bun run build
PLAYWRIGHT_WEB_COMMAND="bun run start" bunx playwright test tests/e2e/visual.spec.ts --update-snapshots
bun run test:e2e
```

Do not catch or suppress screenshot failures. A changed baseline should correspond to an intentional visual change.

## Continuous integration

`.github/workflows/ci.yml` installs the locked Bun dependencies, runs static and unit gates, builds the production application, installs Chromium, and executes the complete Playwright suite. A green workflow is the source of truth for repository health.
