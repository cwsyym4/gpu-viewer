'use client'
export function MetricChart({ metric='bw' }:{ metric?:'bw'|'fp8'|'power'|'nvlink' }){
  const sourceMeta = [
    { label:'H100', bw:3.35, fp8:0.989, power:700, nv:0.9, source:'https://www.nvidia.com/en-us/data-center/h100/', asOf:'2023-03-21' },
    { label:'B200', bw:8, fp8:1.9, power:1000, nv:1.8, source:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18' },
    { label:'GB200*', bw:8, fp8:2.5, power:1200, nv:1.8, rack:130, source:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', note:'*single Blackwell 192GB 8TB/s. Superchip 384/372GB 16TB/s 3.6TB/s' },
    { label:'R100', bw:22, fp8:4, power:1400, nv:3.6, source:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15' },
    { label:'Ultra', bw:32, fp8:6, power:1800, nv:7.2, source:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15' },
  ]
  // separate scales per feedback: power 0-1800W teal vs NVLink 0-7.2TB/s lime vs BW 0-32TB/s
  const maxBW = 32; const maxPower = 1800; const maxNV = 7.2
  const valFor = (r:any)=> metric==='power' ? r.power/maxPower*100 : metric==='nvlink' ? r.nv/maxNV*100 : r.bw/maxBW*100
  return (
    <div className="space-y-2" data-testid="metric-chart" aria-label={`Metric chart ${metric} source ${sourceMeta[sourceMeta.length-1].source} asOf ${sourceMeta[sourceMeta.length-1].asOf} ratio 6.6x BW bottleneck TB/S ridge 295->206`}>
      <div className="flex justify-between text-[10px] text-white/60 font-mono"><span>{metric==='power' ? 'Power W' : metric==='nvlink' ? 'NVLink TB/s' : 'Memory BW TB/s'}</span><span>0 → {metric==='power'?maxPower: metric==='nvlink'?maxNV:maxBW}</span></div>
      {sourceMeta.map((r,i)=>(
        <div key={i} className="flex items-center gap-2 text-[10px]">
          <div className="w-12 text-white/70">{r.label}</div>
          <div className="flex-1 h-2 bg-[#0a1a00] rounded overflow-hidden"><div className="h-full rounded" style={{ width:`${valFor(r)}%`, background: metric==='power' ? '#2EE6D6' : '#7fee64' }} /></div>
          <div className="w-10 text-white/50">{metric==='power'? r.power : metric==='nvlink'? r.nv : r.bw}</div>
        </div>
      ))}
      <div className="text-[9px] text-white/40"><a href={sourceMeta[0].source} className="underline">source</a> asOf {sourceMeta[0].asOf} · GB200 Superchip usable 372 vs raw 384</div>
    </div>
  )
}
