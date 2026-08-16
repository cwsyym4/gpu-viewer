'use client'
import { useState } from 'react'
import { specs } from '@/lib/definitions'
import { YEAR_META } from '@/lib/definitions/meta'

const ORDER = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576']

export function EvolutionTimeline({ onSelect }:{ onSelect?:(id:string)=>void }){
  const [active, setActive] = useState<string>('b200-sxm')
  return (
    <div className="w-full overflow-x-auto content-scroll" style={{WebkitOverflowScrolling:'touch'}}>
      <div className="min-w-[900px] px-6 py-8">
        <div className="relative">
          <div className="absolute top-[34px] left-[20px] right-[20px] h-[2px] bg-[#7fee64]/20" />
          <div className="absolute top-[34px] left-[20px] h-[2px] bg-[#7fee64] transition-all duration-700" style={{width: `${(ORDER.indexOf(active)/(ORDER.length-1))*100}%`}} />
          <div className="grid grid-cols-5 gap-3">
            {ORDER.map(id=>{
              const spec = specs[id]
              const meta = YEAR_META[id]
              if(!spec) return null
              const isActive = active===id
              const isSpeculative = meta?.provenanceStatus==='speculative'
              return (
                <button key={id} onClick={()=>{setActive(id); onSelect?.(id)}}
                  className={`text-left p-3 rounded border transition-all min-w-0 ${isActive ? 'border-[#7fee64] bg-[#7fee64]/15 scale-[1.02]' : isSpeculative? 'border-amber-500/30 bg-amber-900/10 hover:border-amber-400/60' : 'border-[#7fee64]/20 bg-[#0d180a]/60 hover:border-[#7fee64]/60'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 mb-2 ${isActive ? 'bg-[#7fee64] border-[#7fee64] shadow-[0_0_8px_#7fee64]' : 'border-[#7fee64]/40 bg-[#0d180a]'}`} />
                  <div className="text-[12px] font-mono text-[#7fee64]/70">{meta?.year} {isSpeculative?'(speculative)':''}</div>
                  <div className="text-[13px] font-bold text-[#d8f9d9] leading-[1.15]">{spec.label}</div>
                  <div className="text-[12px] text-[#7fee64]/70 mt-1">{meta?.transistors} • {meta?.tdp}</div>
                  <div className="mt-2 flex items-end gap-[2px]">
                    <div className="h-[6px] bg-[#7fee64]/70 rounded-sm transition-all duration-500" style={{width:`${6+spec.boardSize[0]*2.2}px`}} title={`board render ${spec.boardSize[0]}×${spec.boardSize[2]} ≠ real mm`} />
                    <div className="h-[9px] bg-[#0ec7ff]/70 rounded-sm transition-all duration-500" style={{width:`${4+spec.packageSize[0]*3}px`}} title={`package ${spec.packageSize[0]}×${spec.packageSize[2]}`} />
                  </div>
                  <div className="mt-1 flex gap-[1px] flex-wrap">
                    {Array.from({length: Math.min(spec.hbm.count,12)}).map((_,i)=><div key={i} className="w-[4px] h-[4px] bg-[#2EE6D6]/60" />)}
                  </div>
                  <div className="text-[12px] text-[#7fee64]/50 mt-1 font-mono">{spec.dieTileColumns*spec.dieTileRows} tiles {spec.dieTileColumns}×{spec.dieTileRows} (no 64 cap, faithful counts)</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:390px){.min-w-[900px]{min-width:620px}}`}</style>
    </div>
  )
}
