'use client'
import { useEffect } from 'react'
import { useViewerStore } from '@/store/useViewerStore'
export function HelpPanel(){
  const helpOpen = useViewerStore(s=> s.helpOpen); const setHelp = useViewerStore(s=> s.setHelp); const clear = useViewerStore(s=> s.clearSelection)
  const setWorkload = useViewerStore(s=> s.setWorkload)
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{ if(e.key==='Escape'){ clear(); setHelp(false); setWorkload(null as any) } }
    window.addEventListener('keydown', handler); return ()=> window.removeEventListener('keydown', handler)
  },[clear, setHelp, setWorkload])
  if(!helpOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={()=> setHelp(false)}>
      <div className="bg-[#080b09] border border-[#7fee64]/20 p-4 rounded max-w-[380px] text-[12px] text-white/80" onClick={e=> e.stopPropagation()}>
        <div className="font-mono text-[#7fee64] mb-2">DRAG/SCROLL/HOVER → ESC/CLEAR · WORKLOAD OVERLAY</div>
        <p>Exterior shows board/package/HBM/power. Architecture explodes GPC→SM groups (8 SM per GPC) with Tensor/CUDA/TMA isolation. System groups GPU→NVLink→Superchip→Tray→Rack.</p>
        <p className="mt-2 text-white/50">Press ESC to clear selection & workload.</p>
        <button type="button" className="mt-3 px-2 py-1 border border-[#7fee64]/30 rounded text-[#7fee64]" onClick={()=> setHelp(false)}>CLOSE</button>
      </div>
    </div>
  )
}
