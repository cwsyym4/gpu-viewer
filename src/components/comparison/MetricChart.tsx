'use client'
export function MetricChart({ metric='bw' }:{ metric?:'bw'|'fp8'|'power'|'nvlink' }){
  const sourceMeta = [
    { label:'H100 SXM5', bw:3.35, fp8:0.989, power:700, nv:0.9, source:'https://www.nvidia.com/en-us/data-center/h100/', asOf:'2023-03-21' },
    { label:'B200 SXM', bw:8, fp8:1.9, power:1000, nv:1.8, source:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18' },
    { label:'GB200 GPU', bw:8, fp8:2.5, power:1200, nv:1.8, rack:130, source:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', note:'single Blackwell 192GB 8TB/s – Superchip 384/372GB 16TB/s 3.6TB/s per superchip 900GB/s C2C' },
    { label:'R100 Rubin', bw:22, fp8:17.5, power:1400, nv:3.6, source:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15' },
    { label:'Ultra NVL576*', bw:32, fp8:6, power:1800, nv:7.2, source:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15' },
  ]
  const maxBW = 32; const maxPower = 1800; const maxNV = 7.2
  const valFor = (r:any)=> metric==='power' ? r.power/maxPower*100 : metric==='nvlink' ? r.nv/maxNV*100 : r.bw/maxBW*100
  return (
    <div className="space-y-2 p-2 border border-[#7fee64]/10 rounded bg-[#080b09]/70" data-testid="metric-chart" aria-label={`Metric chart ${metric} conceptual`}>
      <div className="flex justify-between text-[12px] text-white/70 font-mono"><span>{metric==='power' ? 'Power W 0-1800 (teal separate scale)' : metric==='nvlink' ? 'NVLink TB/s 0-7.2 (lime separate scale)' : 'Memory BW TB/s 0-32 (HBM4 288GB 22TB/s)'}</span><span>0 → {metric==='power'?maxPower: metric==='nvlink'?maxNV:maxBW}</span></div>
      {sourceMeta.map((r,i)=>(
        <div key={i} className="flex items-center gap-3 text-[12px] font-mono">
          <div className="w-[92px] text-white/80 truncate">{r.label}</div>
          <div className="flex-1 h-2.5 bg-[#0a1a00] rounded overflow-hidden"><div className="h-full rounded transition-all duration-700" style={{ width:`${valFor(r)}%`, background: metric==='power' ? '#2EE6D6' : '#7fee64' }} /></div>
          <div className="w-[76px] text-white/60 text-[12px]">{metric==='power'? r.power : metric==='nvlink'? r.nv : r.bw}{metric==='power'?'W': metric==='nvlink'?'TB/s':'TB/s'}</div>
        </div>
      ))}
      <div className="text-[12px] font-mono text-white/40 leading-[1.3]"><a href={sourceMeta[0].source} target="_blank" rel="noreferrer" className="underline pointer-events-auto z-10 relative">source</a> asOf {sourceMeta[0].asOf} · GB200 Superchip usable 372GB vs raw 384GB (ECC/spare) · FP8 17.5 PFLOPS dense official July 2026 · Numbers labeled official/derived/estimated/speculative.</div>
    </div>
  )
}
