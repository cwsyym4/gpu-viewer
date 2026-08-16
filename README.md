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

## Next — B200 ✅

**B200 SXM true variant now implemented** (not just toggled H100):

- `boardSize [8.8,0.24,4.2]` vs H100 `[8.6,0.22,4]` — larger PCB for higher power
- `packageSize [3.05,0.38,2.95]` vs H100 `[2.78,0.34,2.72]` — scaled to hold 8 stacks
- `dieSize [1.62,0.11,1.36]` dual-die true — two dies side-by-side [0.78,0.11,0.68] each with 0.12 interposer gap (Blackwell stitching precursor)
- Tiles 14×10=140 — split 7×10 per die (70 each) vs H100 12×9=108 single die
  - Tile palette same 6 colors but 0.074 mesh vs 0.078 for density
  - Interposer line `#0e3014` mesh between dies when `spec.interposer=true`
- HBM 8× HBM3e 24GB = 192GB total (4+4 layout around die) vs H100 5× HBM3 16GB=80GB
  - Positions `[-.98,-.82],[0,-.82],[.98,-.82],[-.98,-.16],[.98,-.16],[-.98,.62],[0,.62],[.98,.62]`
  - Badge cyan `#0ec7ff` vs H100 lime `#7fee64` — visual distinction
  - No overlap check: `Math.abs(x) < dieHalfW*0.6 && |z|<dieHalfD*0.6` fails for all 8 sites
- Board power stages / clamps / contacts reused from H100 but validated fit inside 8.8 width
- Palette additions: `hbm3e:#0ec7ff`, `interposer:#0e3014` — keep terminal-dark #080b09, fog #0d180a unchanged

**Dynamic spec rendering:**
- `GPUClient` now loads spec by id (`getSpec`), scales `partDefs` anchors by package ratio (`scaleX = pkg[0]/2.78`, `scaleZ = pkg[2]/2.72` mild 0.6+0.4*scale)
  - HBM3e part title becomes `GPU RAM / HBM3e — HBM3e`
  - Extra popover detail when b200: `8× HBM3e 24GB =192GB • 8-stack 4+4 • BW ~8TB/s`
  - Dual-die detail: `Dual-die 140 tiles 14×10 • interposer yes`
- Header `{labelShort} GPU Glossary` dynamic not hardcoded H100
- `/gpu/h100-sxm5` and `/gpu/b200-sxm` both work side-by-side — same `SceneViewport`, same `OrbitControls` (min 6.8 max 24 polar .35–1.48 autoRotate 0.55)
- Tests guard both: unit 13 passing, e2e h100 + b200 desktop/mobile hard-reload no .glb console 0

**Build:**
- `generateStaticParams` includes `h100-sxm5`, `b200-sxm`, `blackwell-gb200`
- `bun run build` generates `_next/static/chunks/app/gpu/[id]/page-*.js` per route — hash recorded for verification as in Kyle's `page-ed370fd7a86ce09f.js`
- Next step: Blackwell dual-die NVL72 rack — reuse b200 dualDie+interposer pattern, add NVLink 8× 1.8TB/s, rack instancing 72× GPU

