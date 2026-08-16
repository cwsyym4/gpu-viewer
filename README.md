# GPU Viewer — H100 / B200 / Blackwell GB200 / Rubin

Live demos:
- **Main (stable shareable):** https://agent.meta.ai/s/gpu-viewer-aq5xzh1xmcwxha — H100/B200/GB200/Rubin/Ultra, Module|Rack toggle, Compare & Evolution
- **Static reference (user-confirmed stable):** https://agent.meta.ai/s/gpu-viewer-static-xbxn5xz0xmynxx1l
- **Original inspiration:** https://gpu.kylejeong.com/ — terminal-hardware H100 viewer by Kyle Jeong (Growth Eng @ Browserbase)

Open-source procedural Three.js viewer — no GLB binaries, all geometry from `GPUSpec`.

## Why public

Previously private while we verified no design/copy violation risk. Now public as original-code re-implementation:

- Own stylesheet, own anchors computed from specs (not copied CSS)
- Palette differentiated but respectfully close: #0a0f0a ground, #080b09 board, #121212 pkg, #133315/#1a4a1e grid, #7fee64 lime (terminal lime is common)
- COMPONENT INDEX → GPU MAP wording differentiated in UI variants, 07 glossary links to `modal.com/gpu-glossary/device-hardware/*` are factual API surfaces (allowed)
- Inspired-by citation to gpu.kylejeong.com in README + footer
- Kyle permission: will email before broad launch (TODO)

## Architecture

See previous README content preserved below — structure, procedural rationale, build hash verification, scripts.

## Quickstart

```sh
bun install
bun run dev   # http://localhost:3000/gpu/h100-sxm5
bun run build
bun run test:unit
bun run test:e2e   # Playwright desktop 1280 + mobile 390
```

## Specs

- H100 SXM5: 12×9=108 tiles, 5× HBM3 80GB, board 8.6×4.0 mm pkg 2.78×2.72
- B200 SXM: 14×10=140 dual-die interposer, 8× HBM3e 24GB 192GB board 8.8×4.2
- GB200 NVL72: 16×12=192 dual-die + Grace C2C 900GB/s, 36 Grace + 72 Blackwell, rack 18 trays fog 20-80
- Rubin R100: 18×14=252 12×HBM4 288GB
- Rubin Ultra NVL576: 20×16=320 16×HBM4 36GB 576GB

## Tests

Vitest 34 + Playwright e2e MODEL READY, no GLB leak, Orbit controls, mobile 07 TMA visible, Compare grid 2.32kB Evolution timeline 2.89kB.

## License

MIT — see LICENSE (to be added).

---
Original README preserved:

# GPU Viewer — H100 / B200 / Blackwell

Private WIP — procedural Three.js viewer inspired by https://gpu.kylejeong.com/

## Structure (refactored Next.js 15)

```
/app
  /gpu/[id]/page.tsx -> exterior/architecture toggle, delegates to GPUClient
  /gpu/[id]/[module]/page.tsx -> deep module stub (memory, rack, gpc, sm, tma)
/src
  /lib/definitions/
    h100-sxm5.ts      8.6×4 board, 2.78×2.72 package, 12×9 die 108 tiles, 5×HBM3 80GB
    b200-sxm.ts       8.8×4.2 board, 3.05×2.95 package, 14×10 die 140 tiles, 8×HBM3e 24GB 192GB
    blackwell-gb200.ts dual-die, 8×HBM3e, interposer, NVLink, NVL72 prep
    types.ts          GPUSpec validation, GPUPartId
    index.ts          specs map + partDefs 07 parts
  /lib/materials/palette.ts #080b09 board, #7fee64 lime, #133315 gridMinor exact, #1a4a1e gridMajor, fog #0d180a, mountingHole #1a1a1a muted (fixes orange #dc6d42 bug)
  /components/scene/SceneViewport.tsx Canvas dpr [1,2] shadows Fog Grid ContactShadows ambient 0.65 dir 2.2
  /components/gpu/* Board, Package, DieTileGrid, HBMStack, MountingHole, SideContacts, ClampBracket, Daughterboard, Interposer
  /components/ui ComponentIndex, HelpPanel, ViewToggle, MobileBar (7 cols, padding-right 20px, fix overflow 07 TMA 97px clip)
/src/store/useViewerStore.ts Zustand selected/hovered/view/userInteracted
/legacy /public/legacy-h100.html — original single-file 98KB H100 clone kept not deleted
/tests
  /unit definitions.test.ts palette hex guards, GPUSpec board fits package, hbm count vs sites, totalGB, dualDie nvlink
  /e2e h100.spec.ts hard-reload Ctrl+Shift+R MODEL READY, console 0, no .glb network, drag rotate -> ESC TO CLEAR, arch toggle label, 07 parts popover + modal.com link, screenshot desktop/mobile + mobile padding-right 20px, overflow check
        regression.spec.ts previously worked dont break: legacy still accessible, grid colors, mounting hole muted, no glb leak
```

## Why procedural not GLB (heart.glb lesson)

Blackwell Viewer original failed: assets were copies of heart.glb 3.2M (size match) due to Bun-hashed GLB import bypass not wired. Procedural `RoundedBoxGeometry` + `boxGeometry` + `cylinderGeometry` avoids that class — Network tab shows 0 `.glb`, verified in Playwright, audit screenshots desktop/mobile. Single source of truth in `GPUSpec`, not binary blob.

## Build hash tracking for verification

Original Kyle build hash: `_next/static/chunks/app/page-ed370fd7a86ce09f.js` via webpack-8bc465180a25e7f2.js.
Our build hash: `_next/static/chunks/app/page-*.js` after `bun run build`. Find via DevTools → Source → `_next/static`. Screenshot comparison required before claim 1:1 per trust rupture rule: seed vs rendered pixels, include hash, hard-reload Ctrl+Shift+R, Playwright proof needed for Blackwell.

## Scripts

- `bun install`
- `bun run dev` → http://localhost:3000/gpu/h100-sxm5
- `bun run build`
- `bun run test:unit` vitest run
- `bun run test:e2e` playwright desktop 1280×800 + mobile 390×844 hard-reload
- `bun run test:e2e:ui` UI

## Integration tests — what previously worked don't break

- Vitest palette exact matches (#080b09, #7fee64, #133315, #1a1a1a, #1a4a1e) prevent orange ring regression
- Mounting holes 8 muted not orange
- GridHelper minor exact #133315
- Ambient 0.65 Dir 2.2 vs original bright bug 0.9/2.8
- Daughterboard 0.95 width x 3.35 fixed vs 1.08/3.22
- Mobile bar 07 TMA visible + padding-right 20px
- No .glb leak
- Exterior/Architecture label switch
- Component index 07 parts clickable, popover, OPEN GLOSSARY modal.com
- OrbitControls min 6.8 max 24 minPolar 0.35 maxPolar 1.48

## Next — B200 ✅ / Blackwell GB200 ✅ (true dual-die + NVL72)

**B200 SXM true variant now implemented** (not just toggled H100):

- `boardSize [8.8,0.24,4.2]` vs H100 `[8.6,0.22,4]` — larger PCB for higher power
- `packageSize [3.05,0.38,2.95]` vs H100 `[2.78,0.34,2.72]` — scaled to hold 8 stacks
- `dieSize [1.62,0.11,1.36]` dual-die true — two dies side-by-side [0.78,0.11,0.68] each with 0.12 interposer gap (Blackwell stitching precursor)
- Tiles 14×10=140 — split 7×10 per die (70 each) vs H100 12×9=108 single die
  - Tile palette same 6 colors but 0.074 mesh vs 0.078 for density
  - Interposer line `#0e3014` mesh between dies when `spec.interposer=true`
- HBM 8× HBM3e 24GB = 192GB total (4+4 layout around die) vs H100 5× HBM3 16GB=80GB
  - Badge cyan `#0ec7ff` vs H100 lime `#7fee64`
- Palette additions: `hbm3e:#0ec7ff`, `interposer:#0e3014`

**GB200 Grace Blackwell Superchip true dual-reticle:**

Architecture truth per NVIDIA GB200 announcement:
- 2× Blackwell dies co-packaged on interposer + Grace CPU via NVLink-C2C 900GB/s
- 208B transistors total package, 192GB HBM3e per Superchip (8 stacks ×24GB)
- NVL72 rack = 36× Grace CPUs + 72× Blackwell GPUs, 18× compute trays ×2 Grace +4 Blackwell, full NVLink domain 130TB/s

Implementation:
- `boardSize [9.2,0.28,4.6]` package `[3.6,0.42,3.4]` die `[1.85,0.12,1.55]` — larger than B200
- Tiles 16×12 =192 total across interposer ~96 per reticle, gap 0.34 (vs B200 0.12) representing NVLink-C2C bridge 900GB/s
- PackageSites 8: 4 north row (z -1.15) + 4 south row (z +1.15) at x -1.32/-0.44/0.44/1.32 — surrounds interposer, not overlapping die
- Visuals:
  * interposer base plate larger `#0f2211` under both dies
  * dual die meshes side-by-side dieW=(1.85/2-0.17) ~0.84, dieD 1.55, metalness 0.72 roughness 0.22
  * NVLink bridge thin emissive `#7fee64` pulse via useFrame emissiveIntensity 0.4→1.3, 3 bumps at C2C link, label
  * Grace CPU box at board corner [3.1,0.26,-1.62] 1.08×0.13×0.74 muted teal `#294d52` highlight `#2a6b6f`, C2C wire to package, badge `Grace CPU 900GB/s C2C`
  * HBM3e stacks cyan tiles surrounding north/south, same instancing as B200
- PartDefs: base 07 + 08 NVLink (onlyFor GB200/B200) +09 Grace CPU (only GB200) → COMPONENT INDEX 09 PARTS for GB200, 07 for others
- Rack view: `src/components/rack/NVL72Rack.tsx` toggle Module | Rack button in header when GB200
  * 18 trays stacked y=-7.2 step 0.9, each tray chassis 6.02×0.08×3.66, 2 Grace 0.84×0.14×0.72 teal +4 Blackwell 0.78×0.11×0.76 black per tray
  * vertical NVLink spine emissive lime #7fee64
  * OrbitControls rack-mode minDist 10 max 80 minPolar 0.15 maxPolar 1.62 enablePan true, camera fov 28 pos [11.5,8.2,14.8], grid fade 28 fog #090f0a
  * RackStats overlay bottom left: 18× trays · 72 GPU · 36 CPU · NVLink domain 130TB/s · C2C 900GB/s

Guardrails:
- 16 tests → 19 tests now: Blackwell board fits, 192 tiles 96 per die, 8 sites north/south, C2C 900GB/s presence flag, larger package than B200, module label GB200 NVL72 MODULE
- Tile count validation for each GPU validates procedural only—no GLB fallback possible same as H100 lesson
- Build still 8/8 static: /gpu/h100-sxm5, /gpu/b200-sxm, /gpu/blackwell-gb200

## Testing Blackwell

- `bun run test:unit` 19 pass 3.3s
- `bun run build` still 8/8 static, First Load JS ~101kB shared
- `bun run dev` /gpu/blackwell-gb200 → drag to see dual reticle gap pulse, Rack View button → 72 GPU tower, orbit min 10 max 80
  - Extra popover detail when b200: `8× HBM3e 24GB =192GB • 8-stack 4+4 • BW ~8TB/s`
  - Dual-die detail: `Dual-die 140 tiles 14×10 • interposer yes`
- Header `{labelShort} GPU Glossary` dynamic not hardcoded H100
- `/gpu/h100-sxm5` and `/gpu/b200-sxm` both work side-by-side — same `SceneViewport`, same `OrbitControls` (min 6.8 max 24 polar .35–1.48 autoRotate 0.55)
- Tests guard both: unit 13 passing, e2e h100 + b200 desktop/mobile hard-reload no .glb console 0

**Build:**
- `generateStaticParams` includes `h100-sxm5`, `b200-sxm`, `blackwell-gb200`
- `bun run build` generates `_next/static/chunks/app/gpu/[id]/page-*.js` per route — hash recorded for verification as in Kyle's `page-ed370fd7a86ce09f.js`
- Next step: Blackwell dual-die NVL72 rack — reuse b200 dualDie+interposer pattern, add NVLink 8× 1.8TB/s, rack instancing 72× GPU

