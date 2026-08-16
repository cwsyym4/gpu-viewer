'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'

export function ComponentIndex(){
  const { hovered, selected, setHovered, setSelected } = useViewerStore()
  const active = hovered || selected
  return (
    <aside className="part-rail flex flex-col overflow-hidden border-r border-dashed border-[#7fee64]/30">
      <div className="flex justify-between px-4 py-5 text-[13px] tracking-wider text-[#7fee64]/80"><span>COMPONENT INDEX</span><span>07 PARTS</span></div>
      <nav className="flex flex-col">
        {partDefs.map(p=>(
          <a key={p.id} data-id={p.id} data-active={active===p.id} className="grid grid-cols-[34px_1fr_auto] gap-2 px-4 py-3 border-t border-[#7fee64]/10 hover:bg-[#7fee64] hover:text-[#0d180a] data-[active=true]:bg-[#7fee64] data-[active=true]:text-[#0d180a] cursor-pointer no-underline text-[#7fee64]/80"
             onMouseEnter={()=>setHovered(p.id as any)} onMouseLeave={()=>setHovered(null)} onClick={(e)=>{e.preventDefault(); setSelected(p.id as any)} }>
            <span className="opacity-55 text-xs">{p.index}</span><span>{p.title}</span>{p.abbreviation && <small className="px-1 text-[11px] bg-[#7fee64]/10">{p.abbreviation}</small>}
          </a>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-[#7fee64]/20 p-4 text-[11px] text-[#7fee64]/60 tracking-widest">
        <span>→ DRAG TO ROTATE</span><span>→ SCROLL TO ZOOM</span><span>→ HOVER TO INSPECT</span>
      </div>
    </aside>
  )
}
