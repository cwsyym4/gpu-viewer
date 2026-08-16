'use client'
import { useViewerStore } from '@/store/useViewerStore'

export function ViewToggle(){
  const view = useViewerStore(s=> s.view)
  const setView = useViewerStore(s=> s.setView)
  return (
    <div className="view-switch" aria-label="Model view" role="group">
      <button type="button" aria-label="Show exterior view – physical board, package, HBM, power delivery" data-testid="view-exterior" data-active={view==='exterior'} onClick={()=>setView('exterior')}>Exterior</button>
      <button type="button" aria-label="Show architecture view – exploded GPC→SM→Tensor/CUDA/TMA" data-testid="view-architecture" data-active={view==='architecture'} onClick={()=>setView('architecture')}>Architecture</button>
      <button type="button" aria-label="Show system view – GPU→NVLink→Superchip→tray→rack" data-testid="view-system" data-active={view==='system'} onClick={()=>setView('system')}>System</button>
    </div>
  )
}
