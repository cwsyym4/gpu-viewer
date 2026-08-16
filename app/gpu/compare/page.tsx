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
    <div className="min-h-screen bg-[#0d180a] text-[#7fee64]/90">
      <GPUSelector />
      <div className="p-3 flex justify-between items-center border-b border-[#7fee64]/10">
        <Link href="/gpu/h100-sxm5" className="text-[12px] text-[#7fee64]/60">← H100</Link>
        <div className="text-[13px] font-mono text-[#d8f9d9]">GPU Compare — up to 3 side-by-side · faithful boards no 64 cap · separate scales</div>
        <Link href="/gpu/evolution" className="text-[12px] text-[#7fee64]">Evolution →</Link>
      </div>
      <div className="flex flex-wrap gap-2 p-2">
        {allIds.map(id=>{
          const s = specs[id]; const meta = YEAR_META[id]; if(!s) return null
          const active = sel.includes(id)
          return <button key={id} onClick={()=>toggle(id)} className={`px-2 py-1 text-[11px] font-mono border ${active?'border-[#7fee64] bg-[#7fee64]/20 text-[#7fee64]':'border-[#7fee64]/20 text-[#7fee64]/60'}`}>{s.label} {meta?.year} {active?'✓':''}</button>
        })}
      </div>
      <div className="p-2 flex gap-2">
        <button data-testid="metric-bw" onClick={()=> setMetric('bw')} className={`px-2 py-1 text-[10px] border rounded ${metric==='bw' ? 'bg-[#7fee64] text-black' : 'border-[#7fee64]/20 text-white/60'}`}>BW TB/s 0-32</button>
        <button data-testid="metric-power" onClick={()=> setMetric('power')} className={`px-2 py-1 text-[10px] border rounded ${metric==='power' ? 'bg-[#2EE6D6] text-black' : 'border-[#2EE6D6]/20 text-white/60'}`}>Power W 0-1800 teal vs NVLink lime separate</button>
        <button data-testid="metric-nvlink" onClick={()=> setMetric('nvlink')} className={`px-2 py-1 text-[10px] border rounded ${metric==='nvlink' ? 'bg-[#7fee64] text-black' : 'border-[#7fee64]/20 text-white/60'}`}>NVLink TB/s 0-7.2</button>
      </div>
      <MetricChart metric={metric} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 mb-4">
        {sel.map(id=>{
          const spec = specs[id]; if(!spec) return null
          return (
            <div key={id} className="border border-[#7fee64]/20 bg-[#0d180a]">
              <div className="p-2 text-[12px] font-mono text-[#d8f9d9] border-b border-[#7fee64]/10">{spec.label} — {spec.module}<Link href={`/gpu/${id}`} className="float-right text-[10px] text-[#7fee64]/60 underline">open 3D →</Link></div>
              <MiniBoard spec={spec} />
              <div className="p-2 text-[10px] font-mono text-[#7fee64]/60">Board {spec.boardSize[0]}×{spec.boardSize[2]} · Pack {spec.packageSize[0]}×{spec.packageSize[2]} · Tiles faithful {spec.dieTileColumns}×{spec.dieTileRows}={spec.dieTileColumns*spec.dieTileRows} · HBM {spec.hbm.count}×{spec.hbm.version.toUpperCase()} {spec.hbm.gbPerStack}GB={spec.hbm.totalGB}GB · {spec.dualDie?'dualDie interposer':''} · provenance {spec.provenance?.[0]?.status} {spec.provenance?.[0]?.asOf} <a href={spec.provenance?.[0]?.sourceUrl} className="underline ml-1">src</a></div>
            </div>
          )
        })}
      </div>
      <GPUSpecTable selectedIds={sel} />
      {sel.map((id,i)=> i===0?null: <div key={`${sel[i-1]}-${id}`} className="mt-2 p-2"><DiffHighlight from={sel[i-1]} to={id} /></div>)[0]}
    </div>
  )
}
