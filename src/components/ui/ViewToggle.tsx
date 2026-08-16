'use client'
import { useViewerStore } from '@/store/useViewerStore'
export function ViewToggle(){
  const { view, setView } = useViewerStore()
  return (
    <div className="flex items-center gap-3">
      <button data-active={view==='exterior'} onClick={()=>setView('exterior')} className="px-0 border-0 bg-transparent text-[#7fee64]/60 data-[active=true]:text-[#7fee64] text-[13px]">Exterior</button>
      <button data-active={view==='architecture'} onClick={()=>setView('architecture')} className="px-0 border-0 bg-transparent text-[#7fee64]/60 data-[active=true]:text-[#7fee64] text-[13px]">Architecture</button>
    </div>
  )
}
