'use client'
import type { GPUSpec } from '@/lib/definitions/types'
import { palette } from '@/lib/materials/palette'
export function MiniBoard({ spec, highlight, overlay }: { spec: GPUSpec, highlight?: string[], overlay?: boolean }){
  // faithful: no 64 cap uses spec.dieTileColumns/Rows real palette faithful HBM layout
  const cols = spec.dieTileColumns; const rows = spec.dieTileRows; const tiles = cols*rows
  return (
    <div className="relative w-full aspect-[16/10] bg-[#080b09] border border-[#7fee64]/15 rounded p-1" data-testid={`miniboard-${spec.id}`}>
      <div className="text-[9px] text-white/50 font-mono">{spec.label} · {cols}×{rows}={tiles} {spec.hbm.count}×HBM{spec.hbm.version.toUpperCase()} {spec.hbm.gbPerStack}GB={spec.hbm.totalGB}GB</div>
      <div className="mt-1 grid gap-[1px]" style={{ gridTemplateColumns:`repeat(${cols}, minmax(0,1fr))` }}>
        {Array.from({length: tiles}).map((_,i)=> <div key={i} className="aspect-square rounded-[1px]" style={{ background:(palette as any).tilePalette[i%6], opacity: highlight?.includes('tensor-core')?1:0.92 }} />)}
      </div>
      <div className="mt-1 flex flex-wrap gap-[2px]">
        {spec.packageSites.filter(s=>s.kind==='memory').map((s,i)=>(
          <div key={i} className="px-1 py-0.5 rounded text-[8px]" style={{ background:'#0ec7ff22', border:'1px solid #0ec7ff55', left:`${50 + (s.position[0])*18}%`, top:`${50 + (s.position[1])*16}%` }}>{i}</div>
        ))}
      </div>
      {overlay && highlight && highlight.length>0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#7fee6412] border border-[#7fee64]/30 text-[8px] text-[#7fee64]"> ovl {highlight.join(',')}</div>
      )}
    </div>
  )
}
