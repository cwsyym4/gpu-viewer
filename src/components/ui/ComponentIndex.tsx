'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'

export function ComponentIndex(){
  const { hovered, selected, setHovered, setSelected } = useViewerStore()
  const active = hovered || selected
  return (
    <aside className="part-rail" aria-label="GPU components">
      <div className="rail-heading"><span>COMPONENT INDEX</span><span>07 PARTS</span></div>
      <nav className="part-list">
        {partDefs.map(p=>(
          <a key={p.id} href={p.glossaryUrl} target="_blank" rel="noreferrer" data-active={active===p.id} onMouseEnter={()=>setHovered(p.id as any)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(p.id as any)} onBlur={()=>setHovered(null)} onClick={(e)=>{ e.preventDefault(); setSelected(p.id as any)}}>
            <span className="part-index">{p.index}</span><span>{p.title}</span>{p.abbreviation && <small>{p.abbreviation}</small>}
          </a>
        ))}
      </nav>
      <div className="rail-footer"><span>DRAG TO ROTATE</span><span>SCROLL TO ZOOM</span><span>HOVER TO INSPECT</span></div>
    </aside>
  )
}
