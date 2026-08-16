'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'
import { palette, semanticLegend } from '@/lib/materials/palette'
export function ComponentIndex(){
  const selected = useViewerStore(s=> s.selected); const setSelected = useViewerStore(s=> s.setSelected)
  const drawerOpen = useViewerStore(s=> s.drawerOpen); const setDrawerOpen = useViewerStore(s=> s.setDrawerOpen)
  const workload = useViewerStore(s=> s.workload); const setWorkload = useViewerStore(s=> s.setWorkload)
  return (
    <section aria-label="Component Index" data-testid="component-index" className={`${drawerOpen ? 'w-[230px]' : 'w-[56px]'} shrink-0 border-r border-[#7fee64]/15 bg-[#080b09] transition-all`} style={{ minHeight:'420px' }}>
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#7fee64]/10">
        <span className={`text-[12px] font-mono text-[#7fee64] ${!drawerOpen ? 'hidden' : ''}`}>GPU MAP · 11 PARTS</span>
        <button type="button" data-testid="toggle-drawer" onClick={()=> setDrawerOpen(!drawerOpen)} className="text-[10px] px-1 py-0.5 border border-[#7fee64]/20 rounded text-[#7fee64]/70">{drawerOpen ? '◀' : '▶'}</button>
      </div>
      <div className="py-1">
        {partDefs.map(p=>{
          const active = selected===p.id
          const ck = (p as any).semanticColorKey as keyof typeof palette | undefined
          const semColor = ck ? (palette as any)[ck] ?? (palette as any).semantic?.[ck]?.color ?? '#7fee64' : '#7fee64'
          return (
            <button key={p.id} type="button" data-testid={`part-${p.id}`} data-part-id={p.id} data-active={active}
              onClick={()=> setSelected(active ? null : p.id as any)}
              className={`w-full text-left px-2 py-[3px] flex items-center gap-1 text-[12px] transition ${active ? 'bg-[#7fee6418] text-white' : 'text-white/70 hover:text-white'}`}
              style={{ borderLeft:`3px solid ${active ? (semColor as string) : 'transparent'}`, fontSize:'12px' }}
            >
              <span className="font-mono text-[10px] opacity-60">{p.index}</span>
              <span className={`${drawerOpen ? '' : 'truncate'}`}>{drawerOpen ? p.title.slice(0,24) : p.abbreviation?.slice(0,3) ?? p.index}</span>
            </button>
          )
        })}
      </div>
      {drawerOpen && (
        <>
          <div className="px-2 py-2 border-t border-[#7fee64]/10">
            <div className="text-[10px] text-[#7fee64]/60 mb-1">WORKLOAD OVERLAY</div>
            <select data-testid="workload-select" value={workload ?? ''} onChange={e=> setWorkload((e.target.value || null) as any)} className="w-full bg-[#000] border border-[#7fee64]/20 text-[11px] text-[#7fee64] rounded px-1 py-1">
              <option value="">— none —</option>
              <option value="dense-training">dense-training (TC+HBM+BW)</option>
              <option value="moe-training">moe-training (SM+NVLink+Grace)</option>
              <option value="moe-inference">moe-inference (SM+NVL+HBM)</option>
              <option value="long-context">long-context (TMA+HBM+NVL)</option>
              <option value="recsys">recsys (HBM+Grace+TMA)</option>
              <option value="memory-bound">memory-bound (HBM+TMA)</option>
              <option value="comm-bound">comm-bound (NVLink+Grace)</option>
            </select>
          </div>
          <div className="px-2 py-2 border-t border-[#7fee64]/10" data-testid="semantic-legend">
            <div className="text-[10px] text-white/50 mb-1">SEMANTIC LEGEND</div>
            {semanticLegend.map(l=><div key={l.key} className="flex items-center gap-1 text-[11px] text-white/70"><span className="inline-block w-2 h-2 rounded-full" style={{background:l.color}} /><span>{l.label}</span></div>)}
          </div>
        </>
      )}
    </section>
  )
}
