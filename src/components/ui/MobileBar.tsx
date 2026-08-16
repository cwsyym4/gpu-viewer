'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'
export function MobileBar(){
  const selected = useViewerStore(s=> s.selected); const setSelected = useViewerStore(s=> s.setSelected)
  return (
    <div className="mobile-part-bar md:hidden" data-testid="mobile-bar" style={{paddingLeft:'10px', paddingRight:'10px', gap:'6px'}} aria-label="Component index mobile">
      <div className="flex flex-wrap gap-[6px] px-[10px] py-2" style={{paddingRight:'10px'}}>
        {partDefs.map((p:any)=>{
          const active = selected===p.id
          return (
            <button key={p.id} type="button" data-testid={`mobile-part-${p.id}`} data-part-id={p.id} data-active={active} onClick={()=> setSelected(active? null : p.id as any)}
              className={`text-[11px] px-2 py-1 rounded border ${active ? 'bg-[#7fee64] text-black border-[#7fee64]' : 'border-[#7fee64]/20 text-[#7fee64]/80'}`}
            >{p.index}</button>
          )
        })}
      </div>
    </div>
  )
}
