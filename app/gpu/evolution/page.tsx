'use client'
import Link from 'next/link'
import { useState } from 'react'
import { EvolutionTimeline } from '@/components/comparison/EvolutionTimeline'
import { MetricChart } from '@/components/comparison/MetricChart'
import { DiffHighlight } from '@/components/comparison/DiffHighlight'
import { YEAR_META } from '@/lib/definitions/meta'
import { specs } from '@/lib/definitions'
import { GPUSelector } from '@/components/ui/GPUSelector'

const ORDER = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576'] as const
const ORDER_PRIMARY = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100'] as const

export default function EvolutionPage(){
  const [cur, setCur] = useState('b200-sxm' as typeof ORDER[number])
  const [metric, setMetric] = useState<'bw'|'power'|'nvlink'>('bw')
  const idx = (ORDER as readonly string[]).indexOf(cur)

  return (
    <div className="min-h-screen bg-[#080b09] text-[#7fee64]/90 content-scroll">
      <div className="content-scroll-inner">
        <GPUSelector />
        <div className="border-b border-[#7fee64]/30 bg-[#0d180a] p-3 flex flex-wrap justify-between items-center gap-2 sticky top-0 z-20">
          <Link href="/gpu/compare" className="text-[12px] font-mono text-[#7fee64]/70 border border-[#7fee64]/15 rounded px-2 py-1 bg-black/20">← Compare</Link>
          <div className="text-[12px] font-mono text-[#d8f9d9] leading-[1.3]">Evolution 2023→2028 · Horizontal timeline · Official vs derived numbers · Separate scales · Bottlenecks highlighted</div>
          <Link href="/gpu/h100-sxm5" className="text-[12px] font-mono text-[#7fee64]/70 border border-[#7fee64]/10 rounded px-2 py-1">GPU Viewer →</Link>
        </div>

        <EvolutionTimeline onSelect={(id)=> setCur(id as any)} />

        <div className="px-4 py-2 flex flex-wrap gap-2 bg-[#0d180a]/50 border-y border-[#7fee64]/10">
          <button data-testid="metric-evol-bw" onClick={()=> setMetric('bw')} className={`px-3 py-1 text-[12px] font-mono border rounded ${metric==='bw'?'bg-[#7fee64] text-black border-[#7fee64]':'border-[#7fee64]/20 text-white/60'}`}>BW 0-32TB/s HBM4 288GB 22TB/s separate</button>
          <button data-testid="metric-evol-power" onClick={()=> setMetric('power')} className={`px-3 py-1 text-[12px] font-mono border rounded ${metric==='power'?'bg-[#2EE6D6] text-black border-[#2EE6D6]':'border-[#2EE6D6]/20 text-white/60'}`}>Power 0-1800W teal vs NVLink lime</button>
          <button data-testid="metric-evol-nvlink" onClick={()=> setMetric('nvlink')} className={`px-3 py-1 text-[12px] font-mono border rounded ${metric==='nvlink'?'bg-[#7fee64] text-black border-[#7fee64]':'border-[#7fee64]/20 text-white/60'}`}>NVL 0-7.2TB/s</button>
        </div>

        <div className="px-4 py-2"><MetricChart metric={metric} /></div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">
          <div className="md:col-span-2 flex flex-col gap-3 min-w-0">
            {idx>0 && <DiffHighlight from={ORDER[idx-1]} to={ORDER[idx]} />}
            {idx<ORDER.length-1 && <div className="mt-2"><DiffHighlight from={ORDER[idx]} to={ORDER[idx+1]} /></div>}
          </div>
          <div className="border border-[#7fee64]/20 bg-[#0d180a]/70 p-3 text-[12px] font-mono text-[#7fee64]/80 rounded min-w-0">
            <div className="text-[#d8f9d9] font-bold mb-1 text-[12px] leading-[1.3]">{specs[cur]?.label} · {YEAR_META[cur]?.year} · {YEAR_META[cur]?.provenanceStatus} source {YEAR_META[cur]?.asOf} <a href={YEAR_META[cur]?.sourceUrl} target="_blank" rel="noreferrer" className="underline pointer-events-auto z-10 relative">link↗</a></div>
            <div className="text-[12px]">Process {YEAR_META[cur]?.process} – {YEAR_META[cur]?.transistors} – TDP {YEAR_META[cur]?.tdp} – BW {YEAR_META[cur]?.bw} – FP8 {YEAR_META[cur]?.fp8} – NVL {YEAR_META[cur]?.nvlink}</div>
            <ul className="list-disc ml-4 mt-2 text-[12px] space-y-1 leading-[1.25]">
              <li>H100 80B single reticle wall – 132 active SMs / 144 full GH100 (12 disabled yield)</li>
              <li>B200 dual-die workaround 140 tiles (14×10) – 8×HBM3e 192GB</li>
              <li>GB200 Superchip 1 Grace 72c +2 Blackwell 208B ea 384 raw 372 usable 16TB/s BW 3.6TB/s NVLink per superchip 900GB/s C2C – NVL72 72 GPUs 130TB/s domain</li>
              <li>Rubin R100 official July 2026: 336B transistors, 224 SMs, 288GB HBM4, 22TB/s BW, 3.6TB/s NVLink6, 1.8TB/s C2C, 17.5 PFLOPS dense FP8/FP6 training 4 PFLOPS FP16/BF16</li>
              <li>Ultra 576GB vision – 1PB/s class – speculative concept separate from Vera Rubin NVL72 official (primary = H100,B200,GB200,Rubin)</li>
            </ul>
            <div className="mt-3 p-2 bg-[#000]/40 border border-[#7fee64]/10 rounded text-[11px] text-white/50 leading-[1.3]">Primary sequence {ORDER_PRIMARY.join(' → ')} – Ultra concepts in separate speculative section with badge. Provenance links clickable.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
