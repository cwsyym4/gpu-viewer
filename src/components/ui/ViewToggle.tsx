'use client'
import { useViewerStore, ViewMode } from '@/store/useViewerStore'
export function ViewToggle(){
  const view = useViewerStore(s=> s.view)
  const setView = useViewerStore(s=> s.setView)
  const modes: {id: ViewMode, label:string, short:string}[] = [
    { id:'exterior', label: 'EXTERIOR – board/package/HBM/power VRM', short:'EXTERIOR' },
    { id:'architecture', label: 'ARCHITECTURE – exploded GPC→8 SM→Tensor/CUDA/TMA', short:'ARCH' },
    { id:'system', label: 'SYSTEM – GPU→NVLink→Superchip(1G+2B)→tray→NVL72 rack', short:'SYSTEM' },
  ]
  return (
    <div role="group" aria-label="View mode" className="flex gap-1 rounded border border-[#7fee64]/20 bg-[#0008] p-0.5" style={{fontSize:'11px'}}>
      {modes.map(m=>{
        const active = view===m.id
        return (
          <button key={m.id} type="button" data-testid={`view-${m.id}`} data-view={m.id} aria-pressed={active}
            onClick={()=> setView(m.id)}
            className={`px-2 py-1 rounded transition ${active ? 'bg-[#7fee64] text-black' : 'text-[#7fee64]/70 hover:text-white hover:bg-[#7fee6422]'}`}
            title={m.label}
          >{m.short}</button>
        )
      })}
    </div>
  )
}
