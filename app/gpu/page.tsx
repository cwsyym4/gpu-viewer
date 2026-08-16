import { specs } from '@/lib/definitions'
import { YEAR_META } from '@/lib/definitions/meta'

export default function GPUIndex(){
  const order = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576']
  return (
    <div className="min-h-screen bg-[#080b09] text-[#7fee64]/80 p-6 font-mono">
      <div className="max-w-[960px] mx-auto border border-[#7fee64]/30 bg-[#0d180a] p-4">
        <h1 className="text-[18px] text-[#d8f9d9] font-bold">GPU Viewer — Generations</h1>
        <p className="text-[11px] text-[#7fee64]/50 mt-1">Private WIP, procedural no GLBs, terminal palette #7fee64 lime #133315 grid #0d180a fog. Visualizing evolution to help Intelligence Lift — 10-lane superhighway.</p>
        <div className="mt-4 flex gap-2">
          <a href="/gpu/compare" className="px-3 py-1 border border-[#7fee64] bg-[#7fee64]/15 text-[12px]">Compare → side-by-side 3</a>
          <a href="/gpu/evolution" className="px-3 py-1 border border-[#2EE6D6] bg-[#2EE6D6]/10 text-[12px] text-[#2EE6D6]">Evolution timeline 2023→2028 →</a>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {order.map(id=>{
            const s = specs[id]; const meta = (YEAR_META as any)[id]
            if(!s) return null
            return (
              <a key={id} href={`/gpu/${id}`} className="border border-[#7fee64]/20 p-3 hover:border-[#7fee64]/60 block bg-[#080b09]/60">
                <div className="flex justify-between">
                  <div className="text-[#d8f9d9] font-bold text-[13px]">{s.label}</div>
                  <div className="text-[10px] text-[#7fee64]/60">{meta?.year} {meta?.tdp}</div>
                </div>
                <div className="text-[11px] mt-1">{s.module}</div>
                <div className="text-[10px] mt-1 text-[#7fee64]/60">{s.dieTileColumns}×{s.dieTileRows} tiles={s.dieTileColumns*s.dieTileRows} · {s.hbm.count}×{s.hbm.version} {s.hbm.totalGB}GB · {s.dualDie?'dual-die':''} {s.nvlink?'nvlink':''}</div>
                <div className="text-[9px] mt-1 text-[#0ec7ff]/60">{meta?.bw} · {meta?.fp8}</div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
