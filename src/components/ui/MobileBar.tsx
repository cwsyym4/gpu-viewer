'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'
export function MobileBar(){
  const { hovered, selected, setSelected } = useViewerStore()
  const active = hovered || selected
  return (
    <nav className="mobile-part-bar grid grid-cols-7 gap-[3px] px-2 py-2 pr-5 border-t border-[#7fee64] md:hidden" aria-label="GPU component shortcuts" style={{paddingRight:'20px'}}>
      {partDefs.map(p=>(
        <button key={p.id} data-active={active===p.id} onClick={()=>setSelected(p.id as any)} className="px-1 py-1 border border-[#7fee64]/20 text-[8.5px] data-[active=true]:bg-[#7fee64] data-[active=true]:text-[#0d180a] text-[#7fee64]/60 truncate">
          {p.index} {p.abbreviation || p.title.split(' ')[0]}
        </button>
      ))}
    </nav>
  )
}
