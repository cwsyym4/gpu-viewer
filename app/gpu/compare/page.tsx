'use client'
import { useState } from 'react'
import { specs } from '@/lib/definitions'
import { GPUSpecTable, specsSortedByYear } from '@/components/comparison/GPUSpecTable'
import { YEAR_META } from '@/lib/definitions/meta'
import { DiffHighlight } from '@/components/comparison/DiffHighlight'

function MiniBoard({ id }:{ id:string }){
  const spec = specs[id]
  if(!spec) return null
  // scaled outlines: board outer, package inner, tiles grid as dots
  const scale = 10 // px per unit
  const bw = 8 + spec.boardSize[0]*6
  const bh = 8 + spec.boardSize[2]*6
  const pw = 6 + spec.packageSize[0]*7.5
  const ph = 6 + spec.packageSize[2]*7.5
  const tiles = spec.dieTileColumns*spec.dieTileRows
  return (
    <div className="relative w-full h-[220px] bg-[#090f0a] border border-[#7fee64]/10 grid place-items-center overflow-hidden">
      <div className="relative" style={{width:`${bw}px`, height:`${bh}px`}}>
        <div className="absolute inset-0 bg-[#080b09] border border-[#7fee64]/20" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#171918] border border-[#7fee64]/30 grid place-items-center"
             style={{width:`${pw}px`, height:`${ph}px`}}>
          <div className="grid gap-[1px]" style={{gridTemplateColumns:`repeat(${Math.min(spec.dieTileColumns,8)}, minmax(0,1fr))`}}>
            {Array.from({length: Math.min(tiles, 64)}).map((_,i)=><div key={i} className="w-[4px] h-[4px] bg-[#7fee64]/60" />)}
          </div>
          {spec.dualDie && <div className="absolute w-[1px] h-full bg-[#7fee64]/50 left-1/2 top-0" />}
        </div>
        {Array.from({length: Math.min(spec.hbm.count,12)}).map((_,i)=>(
          <div key={i} className="absolute w-[8px] h-[10px] bg-[#2EE6D6]/40 border border-[#2EE6D6]/30"
               style={{left:`${8 + (i%4)*22}%`, top:`${i<4?6:78}%`}} />
        ))}
      </div>
      <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#7fee64]/50">{tiles} tiles {spec.dieTileColumns}×{spec.dieTileRows}</div>
      <div className="absolute top-1 right-1 text-[7px] font-mono text-[#7fee64]/40">{spec.hbm.version} {spec.hbm.totalGB}GB</div>
    </div>
  )
}

export default function ComparePage(){
  const allIds = specsSortedByYear()
  const [sel, setSel] = useState<string[]>(['h100-sxm5','b200-sxm','blackwell-gb200'])
  const toggle = (id:string)=>{
    setSel(prev=>{
      if(prev.includes(id)){
        if(prev.length<=1) return prev
        return prev.filter(x=>x!==id)
      }
      if(prev.length>=3) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }
  return (<div className="min-h-screen bg-[#0d180a] text-[#7fee64]/90 p-4">
    <div className="border border-[#7fee64]/30 bg-[#080b09] p-3 mb-3 flex justify-between items-center">
      <a href="/gpu/h100-sxm5" className="text-[12px] text-[#7fee64]/60">← H100</a>
      <div className="text-[14px] font-mono text-[#d8f9d9]">GPU Compare — up to 3 side-by-side · lightweight preview (3D on detail pages)</div>
      <a href="/gpu/evolution" className="text-[12px] text-[#7fee64]">Evolution →</a>
    </div>
    <div className="flex flex-wrap gap-2 mb-3">
      {allIds.map(id=>{
        const s = specs[id]; const meta = YEAR_META[id]; if(!s) return null
        const active = sel.includes(id)
        return <button key={id} onClick={()=>toggle(id)} className={`px-2 py-1 text-[11px] font-mono border ${active?'border-[#7fee64] bg-[#7fee64]/20 text-[#7fee64]':'border-[#7fee64]/20 text-[#7fee64]/60'}`}>{s.label} {meta?.year} {active?'✓':''}</button>
      })}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {sel.map(id=>{
        const spec = specs[id]
        return (
          <div key={id} className="border border-[#7fee64]/20 bg-[#0d180a]">
            <div className="p-2 text-[12px] font-mono text-[#d8f9d9] border-b border-[#7fee64]/10">{spec.label} — {spec.module}
              <a href={`/gpu/${id}`} className="float-right text-[10px] text-[#7fee64]/60 underline">open 3D →</a>
            </div>
            <MiniBoard id={id} />
            <div className="p-2 text-[10px] font-mono text-[#7fee64]/60">
              Board {spec.boardSize[0]}×{spec.boardSize[2]} · Pack {spec.packageSize[0]}×{spec.packageSize[2]} · Tiles {spec.dieTileColumns*spec.dieTileRows} · HBM {spec.hbm.count}×{spec.hbm.version} {spec.hbm.totalGB}GB · {spec.dualDie?'dual-die':''}
            </div>
          </div>
        )
      })}
    </div>
    <GPUSpecTable selectedIds={sel} />
    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
      {sel.length>=2 && sel.slice(1).map((_,i)=>{
        const from = sel[i]; const to = sel[i+1]
        return <DiffHighlight key={`${from}-${to}`} from={from} to={to} />
      })}
    </div>
  </div>)
}
