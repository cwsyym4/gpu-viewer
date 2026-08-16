'use client'
import { specs } from '@/lib/definitions'
import { palette } from '@/lib/materials/palette'
import { YEAR_META } from '@/lib/definitions/meta'

export function GPUSpecTable({ selectedIds }:{ selectedIds:string[] }){
  const selected = selectedIds.map(id=> ({ id, spec: specs[id], meta: YEAR_META[id] })).filter(s=>s.spec)
  return (
    <div className="overflow-x-auto border border-[#7fee64]/20" style={{paddingRight:'20px'}}>
      <table className="w-full text-[12px] font-mono text-[#7fee64]/80">
        <thead>
          <tr className="bg-[#0d180a] text-[#7fee64]/60 border-b border-[#7fee64]/30">
            <th className="text-left p-2">Metric</th>
            {selected.map(s=> <th key={s.id} className="text-left p-2">{s.spec.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {[
            {k:'Year', fn:(s:any)=> s.meta.year + ' (reported)'},
            {k:'Board', fn:(s:any)=> `${s.spec.boardSize[0]}×${s.spec.boardSize[2]} ${s.spec.boardSize[0]>8.8 ? '↑ larger' : ''}`},
            {k:'Package', fn:(s:any)=> `${s.spec.packageSize[0]}×${s.spec.packageSize[2]}`},
            {k:'Die tiles', fn:(s:any)=> `${s.spec.dieTileColumns}×${s.spec.dieTileRows} = ${s.spec.dieTileColumns*s.spec.dieTileRows} ${s.id==='h100-sxm5'?'baseline':`+${s.spec.dieTileColumns*s.spec.dieTileRows - (specs['h100-sxm5'].dieTileColumns*specs['h100-sxm5'].dieTileRows)}`}`},
            {k:'HBM', fn:(s:any)=> `${s.spec.hbm.count}× ${s.spec.hbm.version} ${s.spec.hbm.gbPerStack}GB = ${s.spec.hbm.totalGB}GB`, highlight:(s:any)=> s.spec.hbm.totalGB},
            {k:'BW', fn:(s:any)=> s.meta.bw},
            {k:'FP8', fn:(s:any)=> s.meta.fp8},
            {k:'NVLink', fn:(s:any)=> s.meta.nvlink},
            {k:'TDP', fn:(s:any)=> s.meta.tdp},
            {k:'Transistors', fn:(s:any)=> s.meta.transistors},
            {k:'Dual-die', fn:(s:any)=> s.spec.dualDie ? 'yes · interposer' : 'single reticle'},
          ].map((row, ri)=>(
            <tr key={ri} className="border-b border-[#7fee64]/10 hover:bg-[#7fee64]/5">
              <td className="p-2 text-[#7fee64]/60 font-bold">{row.k}</td>
              {selected.map(s=>{
                const val = row.fn(s)
                // green ↑ for memory increase
                const isHigher = row.k==='HBM' ? s.spec.hbm.totalGB > specs['h100-sxm5'].hbm.totalGB : false
                return <td key={s.id} className={`p-2 ${isHigher?'text-[#7fee64] bg-[#7fee64]/10':''}`}>{val}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 text-[10px] text-[#7fee64]/40">Numbers public envelope / SemiAnalysis synthesis, labeled reported/envelope. Not exact NDA. Use for teaching evolution.</div>
    </div>
  )
}

export function specsSortedByYear(){
  return Object.keys(specs).map(id=> ({ id, year: YEAR_META[id]?.year ?? 2030 })).sort((a,b)=> a.year - b.year).map(s=>s.id)
}
