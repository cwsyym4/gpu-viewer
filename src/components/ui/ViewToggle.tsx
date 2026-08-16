'use client'
import { useViewerStore } from '@/store/useViewerStore'

export function ViewToggle(){
  const view = useViewerStore(s=> s.view)
  const setView = useViewerStore(s=> s.setView)
  return (
    <div className="view-switch" aria-label="Model view">
      <button type="button" aria-label="Show exterior view" data-active={view==='exterior'} onClick={()=>setView('exterior')}>Exterior</button>
      <button type="button" aria-label="Show architecture view" data-active={view==='architecture'} onClick={()=>setView('architecture')}>Architecture</button>
    </div>
  )
}
