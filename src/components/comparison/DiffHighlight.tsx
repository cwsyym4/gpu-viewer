'use client'
import { specs } from '@/lib/definitions'
import { YEAR_META } from '@/lib/definitions/meta'

const ORDER = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576']

export function DiffHighlight({ from = 'h100-sxm5', to = 'b200-sxm' }:{ from?:string, to?:string }){
  const a = specs[from]; const b = specs[to]
  const ma = YEAR_META[from]; const mb = YEAR_META[to]
  if(!a || !b) return null
  const deltaBoard = (b.boardSize[0]-a.boardSize[0]).toFixed(2)
  const deltaPack = (b.packageSize[0]-a.packageSize[0]).toFixed(2)
  const tilesA = a.dieTileColumns*a.dieTileRows
  const tilesB = b.dieTileColumns*b.dieTileRows
  const deltaTiles = tilesB - tilesA
  const hbmDelta = b.hbm.totalGB - a.hbm.totalGB
  return (
    <div className="border border-[#7fee64]/20 bg-[#0d180a] p-3 text-[12px] font-mono leading-[1.35] rounded">
      <div className="text-[#7fee64] font-bold mb-1 text-[12px]">{a.label} → {b.label} · What changed – Insight → Implication → Tension</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#7fee64]/80">
        <div><span className="text-white/60">Insight:</span> <span className="text-[#d8f9d9]">Board render {a.boardSize[0]}→{b.boardSize[0]} (+{deltaBoard}) [illustrative scene units, real SXM ~166×86mm], Package {a.packageSize[0]}→{b.packageSize[0]} (+{deltaPack}) (≠ real mm, illustrative for visualization)</span></div>
        <div><span className="text-white/60">Implication:</span> <span className="text-[#d8f9d9]">Tile density {tilesA}→{tilesB} (+{deltaTiles}) conceptual layout, HBM {a.hbm.totalGB}GB→{b.hbm.totalGB}GB (+{hbmDelta}GB) {b.hbm.version} {b.dualDie?'dual-die interposer':''}</span></div>
      </div>
      <div className="mt-2 text-[12px] text-[#7fee64]/70 leading-[1.3]">
        <span className="text-white/60">Tension:</span> {from==='h100-sxm5' && to==='b200-sxm' ? 'Single reticle hits yield limits – dual-die interposer enables larger die but complicates NVLink topology; visual scale clarifies generational leaps.' : ''}
        {from==='b200-sxm' && to==='blackwell-gb200' ? 'Dual-reticle coherence doubles dies on interposer, Grace CPU 72c Neoverse V2 adds 900GB/s C2C, rack NVL72 130TB/s domain scaling but needs 18 compute trays × 4 GPUs +2 Grace + NVSwitch – rack only for GB200 NVL72 / Vera Rubin NVL72 official.' : ''}
        {from==='blackwell-gb200' && to==='rubin-r100' ? 'HBM4 36GB stacks 288GB total 22TB/s BW, NVLink 6 1.8→3.6TB/s per GPU doubling, tile count 252 reflects denser SMs (224 SMs) for FP4 generation – official July 2026 336B transistors 17.5 PFLOPS dense FP8/FP6 corrected from 4 mislabel.' : ''}
        {from==='rubin-r100' && to==='rubin-ultra-nvl576' ? 'Rack-scale multiplication: NVL144→576 moves memory pooling beyond single rack, HBM4e 48GB stacks 576GB module – speculative concept vision separate from Vera Rubin NVL72 official 72 GPUs, flagged [speculative] badge.' : ''}
        {(!['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100'].includes(from) || !['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576'].includes(to)) ? 'Evolution driver: architecture scaling driven by memory capacity vs power – envelope numbers teaching.' : ''}
      </div>
      <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-[#0ec7ff]/70">
        <span>BW: {ma?.bw} → {mb?.bw}</span><span className="mx-1 text-white/20">·</span>
        <span>NVLink: {ma?.nvlink} → {mb?.nvlink}</span><span className="mx-1 text-white/20">·</span>
        <span>FP8: {ma?.fp8} → {mb?.fp8} (Rubin 17.5 corrected)</span>
        <a href={mb?.sourceUrl} target="_blank" rel="noreferrer" className="ml-auto underline text-[#7fee64]/80 pointer-events-auto z-10 relative">src↗ {mb?.asOf} {mb?.provenanceStatus}</a>
      </div>
    </div>
  )
}

export function generationDeltas(){
  return ORDER.slice(1).map((id,i)=>{
    const prev = ORDER[i]; const cur = id
    const a = specs[prev]; const b = specs[cur]
    if(!a||!b) return null
    return { from: prev, to: cur, tilesDelta: b.dieTileColumns*b.dieTileRows - a.dieTileColumns*a.dieTileRows, bwUp: true, memUp: b.hbm.totalGB >= a.hbm.totalGB }
  }).filter(Boolean)
}
