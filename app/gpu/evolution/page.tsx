'use client'
import { useState } from 'react'
import { EvolutionTimeline } from '@/components/comparison/EvolutionTimeline'
import { MetricChart } from '@/components/comparison/MetricChart'
import { DiffHighlight } from '@/components/comparison/DiffHighlight'
import { YEAR_META } from '@/lib/definitions/meta'
import { specs } from '@/lib/definitions'

const ORDER = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576']

export default function EvolutionPage(){
  const [cur, setCur] = useState('b200-sxm')
  const idx = ORDER.indexOf(cur)
  return (
    <div className="min-h-screen bg-[#080b09] text-[#7fee64]/90">
      <div className="border-b border-[#7fee64]/30 bg-[#0d180a] p-3 flex justify-between items-center">
        <a href="/gpu/compare" className="text-[12px] text-[#7fee64]/60 font-mono">← Compare</a>
        <div className="text-[13px] font-mono text-[#d8f9d9]">Evolution 2023→2028 · Horizontal timeline · reported/envelope numbers for teaching</div>
        <a href="/gpu/h100-sxm5" className="text-[12px] text-[#7fee64]/60">GPU Viewer →</a>
      </div>
      <EvolutionTimeline onSelect={setCur} />
      <div className="px-4">
        <MetricChart />
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          {idx>0 && <DiffHighlight from={ORDER[idx-1]} to={ORDER[idx]} />}
          {idx<ORDER.length-1 && <div className="mt-2"><DiffHighlight from={ORDER[idx]} to={ORDER[idx+1]} /></div>}
        </div>
        <div className="border border-[#7fee64]/20 bg-[#0d180a]/50 p-3 text-[11px] font-mono text-[#7fee64]/70">
          <div className="text-[#d8f9d9] font-bold mb-1">{specs[cur]?.label} · {YEAR_META[cur]?.year}</div>
          <div>Process {YEAR_META[cur]?.process}</div>
          <div className="mt-1 text-[#7fee64]">Why this evolution matters for your 1/3-brain visual highway:</div>
          <ul className="list-disc ml-4 mt-1 text-[10px] space-y-1">
            <li>H100 baseline: 80B transistors single reticle — shows reticle limit wall.</li>
            <li>B200: workaround with larger board + 8 HBM surrounds die — perf up but still power 1000W.</li>
            <li>GB200: adds Grace CPU, NVLink-C2C 900GB/s, rack 130TB/s — moves from single GPU to superchip + rack as unit.</li>
            <li>Rubin R100: HBM4 36GB stacks 288GB — memory capacity doubling needed for MoE 1T+, tile density 252 reflects FP4.</li>
            <li>Ultra NVL576: rack-scale as GPU — 576GB HBM4e vision, NVL144→576 shows future is network of GPUs as single.</li>
          </ul>
          <div className="mt-2 text-[9px] text-[#7fee64]/40">Public envelope numbers synthesized from SemiAnalysis / Dylan / NVIDIA GTC / roadmap notes. Label explicitly reported/envelope, not exact NDA. Use for Intelligence Lift teaching.</div>
        </div>
      </div>
      <div className="px-4 pb-8 overflow-x-auto" style={{paddingRight:'20px'}}>
        <div className="min-w-[760px] border border-[#7fee64]/10 bg-[#0d180a] p-2">
          <div className="flex items-end gap-[2px] h-[40px]">
            {ORDER.map(id=>{
              const s = specs[id]
              if(!s) return null
              const w = 18 + (s.packageSize[0]/4.8)*60
              const h = 10 + (s.boardSize[0]/10.2)*28
              const active = id===cur
              return <div key={id} className={`flex flex-col items-center gap-1 ${active?'opacity-100':'opacity-60'}`}>
                <div className={`rounded-sm transition-all duration-500 ${active?'bg-[#7fee64]':'bg-[#7fee64]/40'}`} style={{width:`${w}px`, height:`${h}px`}} />
                <div className="text-[8px] font-mono">{id.split('-')[0]}</div>
              </div>
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
