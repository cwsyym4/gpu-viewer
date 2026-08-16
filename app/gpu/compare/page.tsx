'use client'
import Link from 'next/link'
import { useState } from 'react'
import { specs } from '@/lib/definitions'
import { GPUSpecTable, specsSortedByYear } from '@/components/comparison/GPUSpecTable'
import { YEAR_META } from '@/lib/definitions/meta'
import { DiffHighlight } from '@/components/comparison/DiffHighlight'
import { MiniBoard } from '@/components/comparison/MiniBoard'
import { MetricChart } from '@/components/comparison/MetricChart'
import { GPUSelector } from '@/components/ui/GPUSelector'

export default function ComparePage(){
  const allIds = specsSortedByYear()
  const [sel, setSel] = useState<string[]>(['h100-sxm5','b200-sxm','blackwell-gb200'])
  const [metric, setMetric] = useState<'bw'|'power'|'nvlink'>('bw')
  const toggle = (id:string)=>{
    setSel(prev=>{
      if(prev.includes(id)){ if(prev.length<=1) return prev; return prev.filter(x=>x!==id) }
      if(prev.length>=3) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }

  return (
    <div className="min-h-screen bg-[#0d180a] text-[#7fee64]/90 content-scroll">
      <div className="content-scroll-inner">
        <GPUSelector />
        <div className="p-3 flex flex-wrap justify-between items-center gap-2 border-b border-[#7fee64]/10 bg-[#0d180a] sticky top-0 z-20">
          <Link href="/gpu/h100-sxm5" className="text-[12px] font-mono text-[#7fee64]/70 hover:text-[#7fee64] border border-[#7fee64]/15 rounded px-2 py-1 bg-black/20">← H100 Viewer</Link>
          <div className="text-[12px] font-mono text-[#d8f9d9] leading-[1.3]">GPU Compare — up to 3 side-by-side · faithful boards (no 64 cap) · separate scales · Intelligence Lift teaching · ridge 295→206 bottleneck</div>
          <Link href="/gpu/evolution" className="text-[12px] font-mono text-[#7fee64] border border-[#7fee64]/20 px-2 py-1 rounded hover:bg-[#7fee64]/15">Evolution →</Link>
        </div>

        <div className="flex flex-wrap gap-2 p-2 bg-[#080b09] border-b border-[#7fee64]/10">
          {allIds.map(id=>{
            const s = specs[id]; const meta = YEAR_META[id]; if(!s) return null
            const active = sel.includes(id)
            return (
              <button key={id} onClick={()=>toggle(id)} className={`px-2 py-1 text-[12px] font-mono border rounded ${active?'border-[#7fee64] bg-[#7fee64]/20 text-[#7fee64]':'border-[#7fee64]/20 text-[#7fee64]/60 hover:border-[#7fee64]/40 hover:text-[#7fee64]'}`}>
                {s.label} {meta?.year} {s.speculative?'(speculative)':''} {active?'✓':''}
              </button>
            )
          })}
        </div>

        <div className="p-2 flex flex-wrap gap-2 bg-[#090f0a] border-b border-[#7fee64]/10">
          <button data-testid="metric-bw" onClick={()=> setMetric('bw')} className={`px-3 py-1 text-[12px] font-mono border rounded ${metric==='bw' ? 'bg-[#7fee64] text-black border-[#7fee64]' : 'border-[#7fee64]/20 text-white/60'}`}>BW TB/s 0-32 (HBM + NVLink separate)</button>
          <button data-testid="metric-power" onClick={()=> setMetric('power')} className={`px-3 py-1 text-[12px] font-mono border rounded ${metric==='power' ? 'bg-[#2EE6D6] text-black border-[#2EE6D6]' : 'border-[#2EE6D6]/20 text-white/60'}`}>Power W 0-1800 teal vs NVLink lime separate scales</button>
          <button data-testid="metric-nvlink" onClick={()=> setMetric('nvlink')} className={`px-3 py-1 text-[12px] font-mono border rounded ${metric==='nvlink' ? 'bg-[#7fee64] text-black border-[#7fee64]' : 'border-[#7fee64]/20 text-white/60'}`}>NVLink TB/s 0-7.2</button>
        </div>

        <MetricChart metric={metric} />

        {/* Compare grid – mobile single-column cards (390px → 1 col) desktop 3 col */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 mb-4 min-w-0">
          {sel.map(id=>{
            const spec = specs[id]; if(!spec) return null
            return (
              <div key={id} className="border border-[#7fee64]/20 bg-[#0d180a] rounded overflow-hidden flex flex-col min-w-0 w-full">
                <div className="p-2 text-[12px] font-mono text-[#d8f9d9] border-b border-[#7fee64]/10 flex justify-between gap-2 items-center"><span className="truncate">{spec.label} — {spec.module}</span><Link href={`/gpu/${id}`} className="shrink-0 text-[12px] text-[#7fee64]/70 underline hover:text-[#7fee64]">open 3D →</Link></div>
                <MiniBoard spec={spec} />
                <div className="p-2 text-[12px] font-mono text-[#7fee64]/70 leading-[1.35]">Board {spec.boardSize[0]}×{spec.boardSize[2]} · Pack {spec.packageSize[0]}×{spec.packageSize[2]} · Tiles faithful {spec.dieTileColumns}×{spec.dieTileRows}={spec.dieTileColumns*spec.dieTileRows} · HBM {spec.hbm.count}×{spec.hbm.version.toUpperCase()} {spec.hbm.gbPerStack}GB={spec.hbm.totalGB}GB · {spec.dualDie?'dual-die interposer · CoWoS-L':''} · {spec.gpcCount?`${spec.gpcCount} GPCs ${spec.smCount?`→${spec.smCount} SMs`:''}`:''} · provenance {spec.provenance?.[0]?.status} {spec.provenance?.[0]?.asOf} <a href={spec.provenance?.[0]?.sourceUrl} target="_blank" rel="noreferrer" className="underline ml-1 pointer-events-auto z-10 relative">src↗</a></div>
              </div>
            )
          })}
        </div>

        <GPUSpecTable selectedIds={sel} />

        {/* Diff highlights – fixed null filter bug */}
        <div className="p-2 flex flex-col gap-3">
          {sel
            .filter((_,i)=> i>0)
            .map((id,i)=>{
              const from = sel[i]
              const to = id
              if(!from || !to) return null
              return <div key={`${from}-${to}`} className="p-2 border border-[#7fee64]/10 rounded bg-[#0d180a]/70"><DiffHighlight from={from} to={to} /></div>
            })}
        </div>

        <div className="p-2 text-[11px] font-mono text-white/40 leading-[1.3]">* Envelope numbers for Intelligence Lift teaching, explicitly labeled official/derived/estimated/speculative with sourceUrl – pointer-events-auto z-10 ensures link clickability – no forced 64 tile cap, tile colors by function GPC/SM/cache/mem/disabled.</div>
      </div>
    </div>
  )
}
