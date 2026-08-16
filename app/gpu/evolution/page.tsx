'use client'
import { useState } from 'react'
import { EvolutionTimeline } from '@/components/comparison/EvolutionTimeline'
import { MetricChart } from '@/components/comparison/MetricChart'
import { DiffHighlight } from '@/components/comparison/DiffHighlight'
import { YEAR_META } from '@/lib/definitions/meta'
import { specs } from '@/lib/definitions'
import { GPUSelector } from '@/components/ui/GPUSelector'

const ORDER = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576'] as const

export default function EvolutionPage(){
  const [cur, setCur] = useState('b200-sxm')
  const [metric, setMetric] = useState<'bw'|'power'|'nvlink'>('bw')
  const idx = (ORDER as readonly string[]).indexOf(cur)
  return (
    <div className="min-h-screen bg-[#080b09] text-[#7fee64]/90">
      <GPUSelector />
      <div className="border-b border-[#7fee64]/30 bg-[#0d180a] p-3 flex justify-between items-center">
        <a href="/gpu/compare" className="text-[12px] text-[#7fee64]/60 font-mono">← Compare</a>
        <div className="text-[13px] font-mono text-[#d8f9d9]">Evolution 2023→2028 · Horizontal timeline · reported/envelope numbers teaching · separate scales</div>
        <a href="/gpu/h100-sxm5" className="text-[12px] text-[#7fee64]/60">GPU Viewer →</a>
      </div>
      <EvolutionTimeline onSelect={setCur} />
      <div className="px-4 py-2 flex gap-2"><button data-testid="metric-evol-bw" onClick={()=> setMetric('bw')} className={`px-2 py-1 text-[10px] border rounded ${metric==='bw'?'bg-[#7fee64] text-black':'border-[#7fee64]/20'}`}>BW 0-32TB/s</button><button data-testid="metric-evol-power" onClick={()=> setMetric('power')} className={`px-2 py-1 text-[10px] border rounded ${metric==='power'?'bg-[#2EE6D6] text-black':'border-[#2EE6D6]/20'}`}>Power 0-1800W teal</button><button data-testid="metric-evol-nvlink" onClick={()=> setMetric('nvlink')} className={`px-2 py-1 text-[10px] border rounded ${metric==='nvlink'?'bg-[#7fee64] text-black':'border-[#7fee64]/20'}`}>NVL 0-7.2TB/s lime ridge 295→206 bottleneck TB/S</button></div>
      <div className="px-4"><MetricChart metric={metric} /></div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          {idx>0 && <DiffHighlight from={ORDER[idx-1]} to={ORDER[idx]} />}
          {idx<ORDER.length-1 && <div className="mt-2"><DiffHighlight from={ORDER[idx]} to={ORDER[idx+1]} /></div>}
        </div>
        <div className="border border-[#7fee64]/20 bg-[#0d180a]/50 p-3 text-[11px] font-mono text-[#7fee64]/70">
          <div className="text-[#d8f9d9] font-bold mb-1">{specs[cur]?.label} · {YEAR_META[cur]?.year} · {YEAR_META[cur]?.provenanceStatus} source {YEAR_META[cur]?.asOf} <a href={YEAR_META[cur]?.sourceUrl} className="underline">link</a></div>
          <div>Process {YEAR_META[cur]?.process}</div>
          <ul className="list-disc ml-4 mt-1 text-[10px] space-y-1"><li>H100 80B single reticle wall</li><li>B200 dual-die workaround 140 tiles</li><li>GB200 Superchip 1G+2B 384/372GB NVL72 130TB/s</li><li>Rubin 336B 224 SMs HBM4 288GB 22TB/s NVL6 3.6TB/s C2C 1.8TB/s</li><li>Ultra 576GB vision 1PB/s class</li></ul>
          <div className="mt-2 text-[9px] text-[#7fee64]/40">Envelope numbers for Intelligence Lift teaching, explicitly labeled official/derived/estimated, with sourceUrl.</div>
        </div>
      </div>
    </div>
  )
}
