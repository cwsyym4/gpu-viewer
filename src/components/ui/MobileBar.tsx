'use client'
import { partDefs } from '@/lib/definitions'
import { useViewerStore } from '@/store/useViewerStore'

export function MobileBar(){
  const { hovered, selected, setSelected } = useViewerStore()
  const active = hovered || selected
  return (
    <nav className="mobile-part-bar" aria-label="GPU component shortcuts">
      {partDefs.map(p=>(
        <button key={p.id} type="button" data-active={active===p.id} onClick={()=>setSelected(p.id as any)}>{p.index} {p.abbreviation || p.title.split(' ')[0]}</button>
      ))}
    </nav>
  )
}
