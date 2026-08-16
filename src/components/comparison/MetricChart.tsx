'use client'
import { YEAR_META } from '@/lib/definitions/meta'

export function MetricChart({ metric }:{ metric?:'bw'|'fp8'|'power'|'nvlink' }){
  // Simple SVG bar charts for teaching trends — envelope numbers
  const data = [
    { id:'h100-sxm5', label:'H100', bw:3.35, fp8:0.989, power:700, nv:0.9 },
    { id:'b200-sxm', label:'B200', bw:8, fp8:1.9, power:1000, nv:1.8 },
    { id:'blackwell-gb200', label:'GB200', bw:8, fp8:2.5, power:1200, nv:1.8, rack:130 },
    { id:'rubin-r100', label:'R100', bw:12, fp8:4, power:1400, nv:3.6 },
    { id:'rubin-ultra-nvl576', label:'Ultra', bw:16, fp8:6, power:1800, nv:7.2 },
  ]
  const maxBW = Math.max(...data.map(d=>d.bw))
  const maxFP8 = Math.max(...data.map(d=>d.fp8))
  const maxP = Math.max(...data.map(d=>d.power))
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
      <div className="border border-[#7fee64]/20 p-3 bg-[#0d180a]/40">
        <div className="text-[#7fee64]/70 mb-2">HBM Bandwidth TB/s (reported)</div>
        <svg viewBox="0 0 200 80" className="w-full h-[80px]">
          {data.map((d,i)=>{
            const h = 6 + (d.bw/maxBW)*64
            return <g key={d.id}>
              <rect x={i*40+6} y={80-h} width={24} height={h} fill="#0ec7ff" opacity={0.8} />
              <text x={i*40+18} y={78-h} textAnchor="middle" fontSize="7" fill="#7fee64">{d.bw}</text>
              <text x={i*40+18} y={78} textAnchor="middle" fontSize="8" fill="#7fee64">{d.label}</text>
            </g>
          })}
        </svg>
      </div>
      <div className="border border-[#7fee64]/20 p-3 bg-[#0d180a]/40">
        <div className="text-[#7fee64]/70 mb-2">FP8 TFLOPS (envelope) per GPU</div>
        <svg viewBox="0 0 200 80" className="w-full h-[80px]">
          {data.map((d,i)=>{
            const h = 8 + (d.fp8/maxFP8)*60
            return <g key={d.id}>
              <rect x={i*40+6} y={80-h} width={24} height={h} fill="#7fee64" />
              <text x={i*40+18} y={78-h} textAnchor="middle" fontSize="7" fill="#7fee64">{d.fp8}</text>
              <text x={i*40+18} y={78} textAnchor="middle" fontSize="8" fill="#7fee64">{d.label}</text>
            </g>
          })}
        </svg>
      </div>
      <div className="border border-[#7fee64]/20 p-3 bg-[#0d180a]/40">
        <div className="text-[#7fee64]/70 mb-2">TDP / Module Power W + NVLink</div>
        <svg viewBox="0 0 220 80" className="w-full h-[80px]">
          {data.map((d,i)=>{
            const h = 6 + (d.power/maxP)*48
            return <g key={d.id}>
              <rect x={i*44+4} y={60-h} width={16} height={h} fill="#2EE6D6" opacity={0.7} />
              <rect x={i*44+22} y={60 - (d.nv/(7.2))*20} width={10} height={(d.nv/7.2)*20} fill="#7fee64" />
              <text x={i*44+12} y={74} textAnchor="middle" fontSize="7" fill="#7fee64">{d.power}</text>
            </g>
          })}
          <text x={2} y={10} fontSize="6" fill="#2EE6D6">teal=power</text>
          <text x={60} y={10} fontSize="6" fill="#7fee64">lime=NVLink TB/s</text>
        </svg>
        <div className="text-[9px] text-[#7fee64]/40 mt-1">GB200 rack 130TB/s NVL72 domain (not per-GPU shown scaled), Ultra NVL576 vision &gt;1PB/s class</div>
      </div>
    </div>
  )
}
