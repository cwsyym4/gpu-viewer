# GPU Viewer

GPU Viewer is an interactive, source-linked 3D explainer for NVIDIA accelerator packaging, architecture, interconnects, and rack-scale systems. It favors legible conceptual models over pretending to reproduce confidential physical die floorplans.

## Models

| Model | Representation | Status |
|---|---|---|
| H100 SXM5 | GPU module, GPC/SM architecture, NVLink system example | Production product |
| B200 SXM | Dual-die GPU module and architecture | Production product |
| GB200 NVL72 | Blackwell GPU, Grace Blackwell Superchip, compute tray, and rack | Production system |
| Vera Rubin NVL72 | Rubin GPU and rack-scale topology | Official preliminary specifications; subject to change |
| Rubin Ultra NVL576 | Forward-looking teaching concept | Clearly labeled speculative |

Every important number is labeled by provenance status—official, official preliminary, derived, illustrative, or speculative—and links to its source where available.

## Run locally

The repository uses Bun 1.2.22, declared in `package.json` and locked by `bun.lock`.

```bash
bun install --frozen-lockfile
bun run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
bun run typecheck
bun run lint
bun run test:unit
bun run build
bunx playwright install chromium
bun run test:e2e
```

## Product behavior

- Exterior shows the module, package, memory stacks, power delivery, and board structure.
- Architecture shows a count-based GPC overview. Select a GPC to inspect its illustrative SM distribution.
- System shows NVLink and superchip context. GB200 and Vera Rubin also provide rack views.
- Workload overlays highlight the components most relevant to common training and inference bottlenecks.
- Mobile uses the same information model with collapsed provenance and rack-detail panels.
- Camera framing is calculated from the scene envelope and viewport aspect ratio so complete models remain visible across desktop and mobile.

## Technical structure

- Next.js App Router and React 19
- React Three Fiber, Drei, and Three.js for procedural rendering
- Zustand for viewer state
- Vitest and Testing Library for unit tests
- Playwright for desktop/mobile behavior, visual regression, WebGL scene assertions, and accessibility checks
- GitHub Actions for typecheck, lint, unit, production build, and browser/visual tests

GPU and system definitions live under `src/lib/definitions`. Visual colors and semantic roles live in `src/lib/materials/palette.ts`; generation metadata has one canonical source in `src/lib/definitions/meta.ts`.

## Accuracy boundaries

The diagrams teach hierarchy, component counts, packaging relationships, and system topology. They are not physical die floorplans, manufacturing drawings, thermal simulations, or performance guarantees. Per-GPC SM distributions are marked illustrative when NVIDIA publishes only the enabled total.

GB200 memory labels distinguish a single Blackwell GPU (192 GB raw HBM3e) from a two-GPU Grace Blackwell Superchip (384 GB raw, 372 GB usable). Rack topology follows NVIDIA's public DGX GB200 documentation: 18 compute trays, 9 NVLink switch trays, 8 power shelves, and 2 top-of-rack switches.

See [TESTING.md](TESTING.md) for the reproducible verification process.

## License

MIT. See [LICENSE](LICENSE).
