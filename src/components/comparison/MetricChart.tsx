'use client'
import { YEAR_META } from '@/lib/definitions/meta'
import { specs } from '@/lib/definitions'

export function MetricChart({ metric }:{ metric?:'bw'|'fp8'|'power'|'nvlink' }){
  const data = [
    { id:'h100-sxm5', label:'H100', bw:3.35, fp8:0.989, power:700, nv:0.9, source:'https://www.nvidia.com/en-us/data-center/h100/', asOf:'2023-03-21' },
    { id:'b200-sxm', label:'B200', bw:8, fp8:1.9, power:1000, nv:1.8, source:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18' },
    { id:'blackwell-gb200', label:'GB200*', bw:8, fp8:2.5, power:1200, nv:1.8, rack:130, source:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', note:'*single Blackwell GPU 192GB 8TB/s. Superchip 384/372GB 16TB/s 3.6TB/s' },
    { id:'rubin-r100', label:'R100', bw:22, fp8:4, power:1400, nv:3.6, source:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15' },
    { id:'rubin-ultra-nvl576', label:'Ultra', bw:32, fp8:6, power:1800, nv:7.2, source:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', note:'env vision' },
  ]
  const maxBW = 32
  const maxFP8 = 6
  const maxP = 1800
  const maxNV = 7.2
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]" role="group" aria-label="Comparison metrics HBM bandwidth, FP8 TFLOPS, power and NVLink separate scales with source provenance">
      <div className="border border-[#7fee64]/20 p-3 bg-[#0d180a]/40" data-testid="chart-bw">
        <div className="text-[#7fee64]/70 mb-2 flex justify-between"><span>HBM Bandwidth TB/s (official unless noted)</span><span className="text-[9px]">[X-axis GPUs, Y-axis TB/s 0–32]</span></div>
        <svg viewBox="0 0 220 90" className="w-full h-[90px]" role="img" aria-label="HBM bandwidth bar chart 3.35 to 32 TB/s across H100 to Rubin Ultra. Y axis linear 0 to 32 TB/s">
          <line x1="0" y1="80" x2="220" y2="80" stroke="#7fee64" strokeOpacity={0.3} strokeWidth={0.5} />
          <text x="2" y="12" fontSize="7" fill="#7fee64" opacity={0.6}>32TB/s ─ Rubin Ultra HBM4e</text>
          {data.map((d,i)=>{
            const h = (d.bw/maxBW)*68
            return <g key={d.id}>
              <rect x={i*44+6} y={80-h} width={24} height={h} fill="#0ec7ff" opacity={0.8} aria-label={`${d.label} ${d.bw} TB/s ${d.source} asOf ${d.asOf}`} />
              <text x={i*44+18} y={78-h} textAnchor="middle" fontSize="7" fill="#7fee64">{d.bw}</text>
              <text x={i*44+18} y={89} textAnchor="middle" fontSize="8" fill="#7fee64">{d.label}</text>
            </g>
          })}
        </svg>
        <div className="text-[10px] text-[#7fee64]/40">Ratio: Rubin 22 / H100 3.35 = 6.6× BW gain reduces memory-bound bottleneck. Bottleneck implication: Low arithmetic intensity ridge 295→206 ops/byte wins proportional to 22TB/s.</div>
        <div className="text-[9px] text-[#7fee64]/40 mt-1">Sources {data.map(d=> `${d.label} ${d.source} ${d.asOf}`).join(' | ')} – status badge per bar official/estimated</div>
      </div>
      <div className="border border-[#7fee64]/20 p-3 bg-[#0d180a]/40" data-testid="chart-fp8">
        <div className="text-[#7fee64]/70 mb-2 flex justify-between"><span>FP8 TFLOPS envelope per GPU</span><span className="text-[9px]">[Y 0–6 PFLOPS]</span></div>
        <svg viewBox="0 0 220 90" className="w-full h-[90px]" role="img" aria-label="FP8 TFLOPS chart H100 0.989 to Ultra 6 PFLOPS">
          <line x1="0" y1="80" x2="220" y2="80" stroke="#7fee64" strokeOpacity={0.3} strokeWidth={0.5} />
          {data.map((d,i)=>{
            const h = (d.fp8/maxFP8)*68
            return <g key={d.id}>
              <rect x={i*44+6} y={80-h} width={24} height={h} fill="#7fee64" aria-label={`${d.label} ${d.fp8} PFLOPS FP8`} />
              <text x={i*44+18} y={78-h} textAnchor="middle" fontSize="7" fill="#7fee64">{d.fp8}</text>
              <text x={i*44+18} y={89} textAnchor="middle" fontSize="8" fill="#7fee64">{d.label}</text>
            </g>
          })}
        </svg>
        <div className="text-[10px] text-[#7fee64]/40">Ratio FP8 4× R100 vs 0.989 H100 = 4.0× compute for dense matmuls. Bottleneck: Compute-bound MoE still needs NVLink for all-to-all 130TB/s → NVL72 domain.</div>
      </div>
      <div className="border border-[#7fee64]/20 p-3 bg-[#0d180a]/40" data-testid="chart-power-nvlink-separate">
        <div className="text-[#7fee64]/70 mb-2">Power W (teal separate scale) vs NVLink TB/s (lime separate scale) – NOT combined</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[9px] text-[#2EE6D6]">TDP W [0–1800W] Y-scale 0–1800W bottom 700W H100 top 1800W Ultra</div>
            <svg viewBox="0 0 100 80" className="w-full h-[70px]" role="img" aria-label="Power watts separate scale 700 to 1800">
              {data.map((d,i)=>{
                const h = (d.power/maxP)*60
                return <g key={d.id}><rect x={i*20+2} y={70-h} width={12} height={h} fill="#2EE6D6" opacity={0.7} /><text x={i*20+8} y={77} fontSize="6" fill="#7fee64">{d.power}</text></g>
              })}
            </svg>
          </div>
          <div>
            <div className="text-[9px] text-[#7fee64]">NVLink TB/s [0–7.2TB/s] separate</div>
            <svg viewBox="0 0 100 80" className="w-full h-[70px]" role="img" aria-label="NVLink bandwidth separate scale 0.9 to 7.2 TB/s per GPU 130TB/s rack domain">
              {data.map((d,i)=>{
                const h = (d.nv/maxNV)*60
                return <g key={d.id}><rect x={i*20+2} y={70-h} width={12} height={h} fill="#7fee64" /><text x={i*20+8} y={77} fontSize="6" fill="#7fee64">{d.nv}</text></g>
              })}
            </svg>
            <div className="text-[8px] text-[#7fee64]/60">GB200 rack 130TB/s NVL72 domain (not per-GPU scaled, line separate), Ultra NVL576 1PB/s vision</div>
          </div>
        </div>
        <div className="text-[10px] text-[#7fee64]/40 mt-1">Source: NVIDIA GB200 NVL72 Nov 2024, Rubin July 2026 official NVLink6 3.6TB/s, C2C 1.8TB/s. Status badges official vs estimated per chip.</div>
      </div>
    </div>
  )
}
