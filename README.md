# GPU Viewer - H100 / B200 / Blackwell

Private WIP — procedural Three.js clone inspired by https://gpu.kylejeong.com/

Current: H100 SXM5 1:1 clone (procedural, no GLBs)
- Board 8.6×4, package 2.78×2.72, 5× HBM3, 12×9 die tiles (108)
- OrbitControls, Exterior/Architecture toggle, 07-part index
- Verified: console 0 errors, no .glb leak, mobile responsive

Next: B200 SXM (8× HBM3e 24GB, 14×10 tiles), then Blackwell dual-die + NVL72.

Stack: Three.js + OrbitControls + RoundedBox (r160 importmap for quick static). Will migrate to Next.js 15 + @react-three/fiber + drei r185 like original for OSS quality.

Audits: `./audits/` desktop + mobile hard-reload screenshots.

Status: Private, iterating to 1:1 before public release.

Inspiration: Kyle Jeong's H100 viewer — if open-sourcing, will contact author for permission and differentiate visual/text, or keep as private reference implementation.
