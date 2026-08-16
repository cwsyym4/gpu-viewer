'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'
import { palette, semanticLegend } from '@/lib/materials/palette'
import { useEffect, useState } from 'react'

export function ComponentIndex(){
  const selected = useViewerStore(s=> s.selected)
  const setSelected = useViewerStore(s=> s.setSelected)
  const setView = useViewerStore(s=> s.setView)
  const drawerOpen = useViewerStore(s=> s.drawerOpen)
  const setDrawerOpen = useViewerStore(s=> s.setDrawerOpen)
  const workload = useViewerStore(s=> s.workload)
  const setWorkload = useViewerStore(s=> s.setWorkload)
  const [specId, setSpecId] = useState<string>('h100-sxm5')
  useEffect(()=>{
    try{
      const parts = window.location.pathname.split('/')
      const id = parts[parts.length-1]?.split('?')[0]
      if(id && id.includes('-')) setSpecId(id)
      else {
        const q = new URLSearchParams(window.location.search)
        const pid = q.get('id') ?? q.get('specId')
        if(pid) setSpecId(pid)
      }
    }catch{}
  },[])

  const filtered = partDefs.filter((p:any)=>{
    if(!(p as any).onlyFor) return true
    const only = (p as any).onlyFor as string[]
    // allow if current specId in onlyFor or current specId contains substring
    if(only.includes(specId)) return true
    if(specId.includes('gb200') && only.includes('blackwell-gb200')) return true
    if(specId.includes('rubin') && only.some((o:string)=>o.includes('rubin'))) return true
    return false
  })

  return (
    <section aria-label="Component Index" data-testid="component-index" className={`${drawerOpen ? 'w-[230px]' : 'w-[56px]'} shrink-0 border-r border-[#7fee64]/15 bg-[#080b09] transition-all`} style={{ minHeight:'420px' }}>
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#7fee64]/10">
        <span className={`text-[12px] font-mono text-[#7fee64] ${!drawerOpen ? 'hidden' : ''}`}>GPU MAP · {filtered.length} PARTS</span>
        <button type="button" data-testid="toggle-drawer" onClick={()=> setDrawerOpen(!drawerOpen)} className="text-[12px] px-1 py-0.5 border border-[#7fee64]/20 rounded text-[#7fee64]/70">{drawerOpen ? '◀' : '▶'}</button>
      </div>
      <div className="py-1">
        {filtered.map(p=>{
          const active = selected===p.id
          const ck = (p as any).semanticColorKey as keyof typeof palette | undefined
          const semColor = ck ? (palette as any)[ck] ?? (palette as any).semantic?.[ck]?.color ?? '#7fee64' : '#7fee64'
          return (
            <button key={p.id} type="button" data-testid={`part-${p.id}`} data-part-id={p.id} data-active={active}
              onClick={()=>{
                const willClear = active
                const next = willClear ? null : (p.id as any)
                setSelected(next)
                if(!willClear){
                  // push required view ?view=arch etc. and URL query for module isolation
                  setView(p.view as any)
                  try{
                    const u = new URL(window.location.href)
                    u.searchParams.set('view', p.view)
                    u.searchParams.set('module', p.id)
                    history.replaceState(null,'',u.toString())
                  }catch{}
                }
              }}
              className={`w-full text-left px-2 py-[5px] flex items-center gap-1 text-[12px] leading-[1.1] transition ${active ? 'bg-[#7fee6418] text-white' : 'text-white/70 hover:text-white'}`}
              style={{ borderLeft:`3px solid ${active ? (semColor as string) : 'transparent'}`, fontSize:'12px' }}
              title={p.description}
            >
              <span className="font-mono text-[12px] opacity-70 min-w-[22px]">{p.index}</span>
              <span className={`${drawerOpen ? '' : 'truncate'} text-[12px]`}>{drawerOpen ? p.title.slice(0,28) : p.abbreviation?.slice(0,3) ?? p.index.slice(0,3)}</span>
            </button>
          )
        })}
      </div>
      {drawerOpen && (
        <>
          <div className="px-2 py-2 border-t border-[#7fee64]/10">
            <div className="text-[12px] text-[#7fee64]/70 mb-1 font-mono">WORKLOAD OVERLAY</div>
            <select data-testid="workload-select" value={workload ?? ''} onChange={e=> setWorkload((e.target.value || null) as any)} className="w-full bg-[#000] border border-[#7fee64]/20 text-[12px] text-[#7fee64] rounded px-1 py-1">
              <option value="">— none —</option>
              <option value="dense-training">dense-training (TC+HBM+BW)</option>
              <option value="moe-training">moe-training (SM+NVLink+Grace)</option>
              <option value="moe-inference">moe-inference (SM+NVL+HBM)</option>
              <option value="long-context">long-context (TMA+HBM+NVL)</option>
              <option value="recsys">recsys (HBM+Grace+TMA)</option>
              <option value="memory-bound">memory-bound (HBM+TMA)</option>
              <option value="comm-bound">comm-bound (NVLink+Grace)</option>
            </select>
            <div className="text-[11px] text-white/40 mt-1 leading-[1.2]">Selecting workload illuminates relevant modules (dim 0.15 elsewhere / illuminate 1.0 emissive)</div>
          </div>
          <div className="px-2 py-2 border-t border-[#7fee64]/10" data-testid="semantic-legend">
            <div className="text-[11px] text-white/50 mb-1 font-mono">SEMANTIC LEGEND</div>
            {semanticLegend.map(l=><div key={l.key} className="flex items-center gap-1 text-[12px] text-white/70 font-mono"><span className="inline-block w-2 h-2 rounded-full" style={{background:l.color}} /><span>{l.label}</span></div>)}
          </div>
          <div className="px-2 py-2 border-t border-[#7fee64]/10 text-[11px] font-mono text-white/40 leading-[1.2]">Click part to isolate module / ESC clears. Conceptual layout helps compare generations.</div>
        </>
      )}
    </section>
  )
}
