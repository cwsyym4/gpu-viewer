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
    <div className="border border-[#7fee64]/20 bg-[#0d180a] p-3 text-[12px] font-mono">
      <div className="text-[#7fee64] font-bold mb-1">{a.label} → {b.label} · What changed</div>
      <div className="grid grid-cols-2 gap-2 text-[#7fee64]/80">
        <div>Insight: <span className="text-[#d8f9d9]">Board {a.boardSize[0]}→{b.boardSize[0]} (+{deltaBoard}), Package {a.packageSize[0]}→{b.packageSize[0]} (+{deltaPack})</span></div>
        <div>Implication: <span className="text-[#d8f9d9]">Tile density {tilesA}→{tilesB} (+{deltaTiles}), HBM {a.hbm.totalGB}GB→{b.hbm.totalGB}GB (+{hbmDelta}GB) {b.hbm.version}</span></div>
      </div>
      <div className="mt-2 text-[11px] text-[#7fee64]/60">
        Evolution driver: {from==='h100-sxm5' && to==='b200-sxm' ? 'Reticle-limit workaround + interposer allows larger die + 8-stack HBM3e surrounds die reduces memory stalls. 1/3 brain 10-lane superhighway → visuals help see scale.' : ''}
        {from==='b200-sxm' && to==='blackwell-gb200' ? 'Dual-reticle coherence doubles dies on interposer, Grace CPU 72c Neoverse V2 adds 900GB/s C2C, rack NVL72 130TB/s domain scaling.' : ''}
        {from==='blackwell-gb200' && to==='rubin-r100' ? 'HBM4 36GB stacks 288GB total, NVLink 6 1.8TB/s doubling, tile count 252 reflects denser SMs for FP4 generation.' : ''}
        {from==='rubin-r100' && to==='rubin-ultra-nvl576' ? 'Rack-scale multiplication: NVL144→576 moves memory pooling beyond single rack, HBM4e 48GB stacks 576GB module.' : ''}
      </div>
      <div className="mt-1 flex gap-1 text-[10px] text-[#0ec7ff]/70">
        <span>BW: {ma?.bw} → {mb?.bw}</span><span className="mx-1">·</span>
        <span>NVLink: {ma?.nvlink} → {mb?.nvlink}</span>
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
