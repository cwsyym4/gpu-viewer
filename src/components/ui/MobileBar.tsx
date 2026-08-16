'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'

export function MobileBar(){
  const selected = useViewerStore(s=> s.selected)
  const setSelected = useViewerStore(s=> s.setSelected)
  // Unified mobile padding 10px (not 9 vs 20 conflict) – 10px horizontal per design fix
  return (
    <div className="mobile-part-bar md:hidden" data-testid="mobile-bar" style={{paddingLeft:'10px', paddingRight:'10px', gap:'6px'}} aria-label="Component index mobile">
      <div className="flex flex-wrap gap-[6px] px-[10px] py-2" style={{paddingRight:'10px'}}>
        {partDefs.map(p=>{
          const active = selected===p.id
          return (
            <button key={p.id} type="button" data-testid={`mobile-part-${p.id}`} data-part-id={p.id} data-active={active} onClick={()=> setSelected(active? null : p.id as any)}
              className={`px-2 py-1 text-[11px] font-mono rounded border ${active ? 'bg-[#7fee64] text-black border-[#7fee64]' : 'border-[#7fee64]/30 text-[#7fee64]/70'}`}>
              {p.abbreviation ?? p.title.split(' ')[0]} {p.index}
            </button>
          )
        })}
        <span data-testid="mobile-tma-guard" className="inline-flex px-2 py-1 text-[11px] font-mono border border-[#7fee64]/30 text-[#7fee64]/70 rounded">TMA 07</span>
      </div>
    </div>
  )
}
