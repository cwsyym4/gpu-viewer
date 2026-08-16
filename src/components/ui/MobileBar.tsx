'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'

export function MobileBar(){
  const selected = useViewerStore(s=> s.selected)
  const setSelected = useViewerStore(s=> s.setSelected)
  const setView = useViewerStore(s=> s.setView)
  return (
    <div className="mobile-part-bar md:hidden" data-testid="mobile-bar" aria-label="Component index mobile" style={{overflowX:'auto', padding:'9px 20px 9px 10px', gap:'6px'}}>
      <div className="flex flex-nowrap gap-[6px]" style={{paddingRight:'20px', flexWrap:'nowrap', overflowX:'auto'}}>
        {partDefs.map((p:any)=>{
          const active = selected===p.id
          return (
            <button key={p.id} type="button" data-testid={`mobile-part-${p.id}`} data-part-id={p.id} data-active={active}
              onClick={()=>{
                const willClear = active
                setSelected(willClear? null : p.id as any)
                if(!willClear) setView(p.view as any)
              }}
              className={`shrink-0 text-[12px] font-mono px-[9px] py-[5px] rounded border ${active ? 'bg-[#7fee64] text-black border-[#7fee64]' : 'border-[#7fee64]/20 text-[#7fee64]/80 bg-[#0d180a]/70'}`}
              title={p.title}
            >{p.abbreviation?.slice(0,4) ?? p.index}</button>
          )
        })}
      </div>
    </div>
  )
}
