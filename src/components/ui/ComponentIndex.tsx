'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'
import { palette, semanticLegend } from '@/lib/materials/palette'

export function ComponentIndex(){
  const selected = useViewerStore(s=> s.selected)
  const setSelected = useViewerStore(s=> s.setSelected)
  const setHovered = useViewerStore(s=> s.setHovered)
  const drawerOpen = useViewerStore(s=> s.drawerOpen)
  const setDrawerOpen = useViewerStore(s=> s.setDrawerOpen)
  const workload = useViewerStore(s=> s.workload)
  const setWorkload = useViewerStore(s=> s.setWorkload)

  return (
    <aside className="gpu-index-drawer" style={{width: drawerOpen ? '230px' : '56px', minWidth: drawerOpen ? '230px' : '56px'}} data-testid="component-index">
      <div className="flex items-center justify-between px-2 py-2 border-b border-[#7fee64]/20">
        <div className="text-[11px] font-mono text-[#7fee64] truncate">{drawerOpen ? 'COMPONENT INDEX (11 PARTS)' : 'MAP'}</div>
        <button type="button" aria-label="Toggle component drawer" data-testid="toggle-drawer" onClick={()=> setDrawerOpen(!drawerOpen)} className="text-[10px] border border-[#7fee64]/30 px-1 rounded">
          {drawerOpen ? '‹' : '›'}
        </button>
      </div>
      {drawerOpen && (
        <>
          <div className="p-2">
            <div className="text-[10px] font-mono text-[#7fee64]/60 mb-1">WORKLOAD OVERLAY</div>
            <select value={workload ?? ''} onChange={e=> setWorkload(e.target.value as any || null)} data-testid="workload-select" className="w-full text-[11px] bg-[#0d180a] border border-[#7fee64]/20 text-[#7fee64] px-1 py-1">
              <option value="">None — explain only</option>
              <option value="dense-training">Dense training</option>
              <option value="moe-training">MoE training</option>
              <option value="moe-inference">MoE inference</option>
              <option value="long-context">Long-context 1M</option>
              <option value="recsys">Recommendation</option>
              <option value="memory-bound">Memory-bound</option>
              <option value="comm-bound">Comm-bound</option>
            </select>
            {workload && (
              <div className="mt-2 text-[10px] font-mono text-[#d8f9d9]/80 border border-[#7fee64]/20 p-1" data-testid="workload-desc">
                Overlay highlights {(useViewerStore.getState() as any).workload} parts – see description in spec.
              </div>
            )}
          </div>
          <nav className="flex flex-col gap-0">
            {partDefs.map(part=>{
              const active = selected===part.id
              const sem = palette.semantic[(part.semanticColorKey as any) ?? 'structure'] ?? palette.semantic.structure
              return (
                <button
                  key={part.id}
                  type="button"
                  data-testid={`part-${part.id}`}
                  data-part-id={part.id}
                  data-active={active}
                  onMouseEnter={()=> setHovered(part.id as any)}
                  onMouseLeave={()=> setHovered(null)}
                  onClick={()=> setSelected(active? null : part.id as any)}
                  className={`text-left px-2 py-[6px] text-[12px] font-mono border-l-[3px] hover:bg-[#7fee64]/10 ${active ? 'bg-[#7fee64]/15 text-[#d8f9d9]' : 'text-[#7fee64]/70'}`}
                  style={{borderLeftColor: sem.color, fontSize:'12px', lineHeight:'1.25'}}
                >
                  <span className="opacity-60 mr-1">{part.index}</span>
                  <span className="font-bold">{part.title.split(' ')[0]}</span>
                  <span className="ml-1 opacity-70 truncate">{part.title.slice(part.title.indexOf(' ')+1)}</span>
                  {part.abbreviation && <span className="ml-1 text-[10px] px-1 rounded border" style={{borderColor:sem.color, color:sem.color}}>{part.abbreviation}</span>}
                </button>
              )
            })}
          </nav>
          {/* Legend */}
          <div className="mt-3 p-2 border-t border-[#7fee64]/20">
            <div className="text-[10px] font-mono text-[#7fee64]/60 mb-1">COLOR LEGEND</div>
            <div className="flex flex-col gap-1">
              {semanticLegend.map(entry=>(
                <div key={entry.key} className="flex items-center gap-1 text-[10px] font-mono">
                  <span style={{width:'10px', height:'10px', background:entry.color, display:'inline-block', borderRadius:'2px'}} /> 
                  <span className="text-[#d8f9d9]/80">{entry.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-2 text-[10px] font-mono text-[#7fee64]/40">
            80-90% attention to 3D — drawer closed by default. Lime only for interaction/status.
          </div>
        </>
      )}
    </aside>
  )
}

// Shared helpers for Board faithful mode
export function SemanticLegend(){
  const { semanticLegend } = require('@/lib/materials/palette')
  return (
    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
      {semanticLegend.map((e:any)=><span key={e.key} style={{color:e.color}}>{e.label}</span>)}
    </div>
  )
}
