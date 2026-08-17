'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'

export function MobileBar(){
  const selected = useViewerStore(s=> s.selected)
  const setSelected = useViewerStore(s=> s.setSelected)
  const setView = useViewerStore(s=> s.setView)
  const filtered = partDefs.filter((p:any)=>{
    if(!(p as any).onlyFor) return true
    // client-side spec detection best effort – if no spec, show generic
    try{
      const parts = window.location.pathname.split('/')
      const id = parts[parts.length-1]?.split('?')[0]
      const only = (p as any).onlyFor as string[]
      if(id){
        if(only.includes(id)) return true
        if(id.includes('gb200') && only.includes('blackwell-gb200')) return true
        if(id.includes('rubin') && only.some((o:string)=>o.includes('rubin'))) return true
        // if not matched, filter out specialized
        if(only.some(o=>o.includes('grace')||o.includes('vera')||o.includes('rubin')||o.includes('blackwell'))) return false
      }
    }catch{}
    return true
  })
  return (
    <div className="mobile-part-bar md:hidden" data-testid="mobile-bar" aria-label="Component index mobile" style={{overflowX:'auto', padding:'9px 20px 9px 10px', gap:'6px'}}>
      <div className="flex flex-nowrap gap-[6px]" style={{paddingRight:'20px', flexWrap:'nowrap', overflowX:'auto'}}>
        {filtered.map((p:any)=>{
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
