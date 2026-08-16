'use client'
import type { GPUSpec } from '@/lib/definitions/types'
import { palette } from '@/lib/materials/palette'

export function MiniBoard({ spec, highlight, overlay }: { spec: GPUSpec, highlight?: string[], overlay?: boolean }){
  const cols = spec.dieTileColumns; const rows = spec.dieTileRows; const tiles = cols*rows
  const isPrototypical = false // we render faithful, not schematic; explicit label
  return (
    <div className="relative w-full bg-[#080b09] border border-[#7fee64]/15 rounded p-2 flex flex-col gap-1" data-testid={`miniboard-${spec.id}`}>
      <div className="text-[12px] text-white/70 font-mono leading-[1.2]">{spec.label} · {cols}×{rows}={tiles} {spec.hbm.count}×HBM{spec.hbm.version.toUpperCase()} {spec.hbm.gbPerStack}GB={spec.hbm.totalGB}GB – faithful tiles no 64 cap {spec.speculative?'(speculative concept vision)':''}</div>
      {/* faithful board viz */}
      <div className="relative aspect-[16/10] w-full border border-[#7fee64]/10 rounded bg-[#0a1a10]">
        <div className="absolute inset-[3%] grid gap-[1px] rounded-[3px] p-[2%]" style={{ gridTemplateColumns:`repeat(${cols}, minmax(0,1fr))` , background:'#121212' }}>
          {Array.from({length: tiles}).map((_,i)=>{
            const isDisabled = spec.gpcCount && spec.smCountsPerGpc ? i >= (spec.smCountsPerGpc.reduce((a,b)=>a+b,0)) : false
            const col = isDisabled ? '#2a2a2a' : (i%8===0 ? palette.cache : i%5===0 ? palette.memory : (palette as any).tilePalette[i%6])
            return <div key={i} className="aspect-[1.2] rounded-[1px]" style={{ background:col, opacity: highlight?.includes('tensor-core') && i%3!==0?0.4: (isDisabled?0.35:0.96) }} title={`tile ${i} ${isDisabled?'disabled SM':''}`} />
          })}
        </div>
        {/* HBM markers */}
        <div className="absolute right-[2%] top-[8%] bottom-[8%] flex flex-col gap-[2px] justify-between">
          {spec.packageSites.filter(s=>s.kind==='memory').map((_,i)=>(
            <div key={i} className="w-[9px] h-[13%] rounded-[2px] border border-[#0ec7ff55] text-[8px] leading-none flex items-center justify-center" style={{ background:'#0ec7ff22', color:'#8fe' }}>{i}</div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 text-[12px] font-mono text-white/40 leading-[1.15]">Board {spec.boardSize[0]}×{spec.boardSize[2]}mm render · Pack {spec.packageSize[0]}×{spec.packageSize[2]} · {spec.dualDie?'dual-die CoWoS-L interposer':'single reticle · 80B Hopper wall'} · GPC {spec.gpcCount ?? '?'} SM {spec.smCount ?? tiles}</div>
      {spec.speculative && <div className="text-[12px] font-mono text-amber-200/80 border border-amber-500/20 rounded px-1 py-0.5 bg-amber-900/10">Speculative Concept – NOT in primary 2023-2026 evolution – 2028 class vision 576GB 1PB/s class</div>}
      <div className="text-[12px] font-mono text-[#7fee64]/30">*Tiles illustrative placement driven by spec counts, not GDS physical; schematic not to scale but count-faithful.</div>
      {overlay && highlight && highlight.length>0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#7fee6412] border border-[#7fee64]/30 text-[12px] text-[#7fee64] font-mono rounded pointer-events-none">active {highlight.join(',')}</div>
      )}
    </div>
  )
}
