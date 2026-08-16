'use client'
import { useViewerStore, ViewMode } from '@/store/useViewerStore'
import { getSpecSafe } from '@/lib/definitions'

export function ViewToggle(){
  const view = useViewerStore(s=> s.view)
  const setView = useViewerStore(s=> s.setView)
  const specId = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('gpu') ?? window.location.pathname.split('/gpu/')[1]?.split('/')[0] ?? 'h100-sxm5') : 'h100-sxm5'
  const spec = getSpecSafe(specId)
  const modes: {id: ViewMode, label:string, short:string, tip:string}[] = [
    {
      id:'exterior',
      label:`Exterior ${spec ? `${spec.dieTileColumns}×${spec.dieTileRows}=${spec.dieTileColumns*spec.dieTileRows}`:''}`,
      short:'EXTERIOR',
      tip:`board/package/HBM/power VRM – no GLB`
    },
    {
      id:'architecture',
      label:`Arch ${spec?.gpcCount ?? 8} GPCs ${spec?.smCount ? `→${spec.smCount} SMs`:''}`,
      short:'ARCH',
      tip:`Architecture – exploded ${spec?.gpcCount ?? 8} GPCs ${spec?.smCountsPerGpc ? `(${spec.smCountsPerGpc.join('/')})` : `×${spec?.smPerGpc ?? 18} SM avg`} → Tensor/CUDA/TMA driven by spec`
    },
    {
      id:'system',
      label:'System → Superchip→Rack',
      short:'SYSTEM',
      tip:'System – GPU→NVLink→Superchip(1G+2B)→tray→NVL72 rack (only GB200 / Vera Rubin NVL72 official)'
    },
  ]
  return (
    <div role="group" aria-label="View mode" className="flex gap-1 rounded border border-[#7fee64]/20 bg-[#0008] p-0.5" style={{fontSize:'12px'}}>
      {modes.map(m=>{
        const active = view===m.id
        return (
          <button key={m.id} type="button" data-testid={`view-${m.id}`} data-view={m.id} aria-pressed={active}
            onClick={()=> setView(m.id)}
            className={`px-2 py-1 rounded transition text-[12px] font-mono ${active ? 'bg-[#7fee64] text-black' : 'text-[#7fee64]/70 hover:text-white hover:bg-[#7fee6422]'}`}
            title={`${m.label} – ${m.tip}`}
          >{m.short}</button>
        )
      })}
    </div>
  )
}
