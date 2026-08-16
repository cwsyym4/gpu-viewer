'use client'
import { useViewerStore } from '@/store/useViewerStore'
export function HelpPanel(){
  const workload = useViewerStore(s=> s.workload)
  const helpOpen = useViewerStore(s=> s.helpOpen)
  const setHelp = useViewerStore(s=> s.setHelp)
  if(!helpOpen) return null
  return (
    <div className="help-panel" data-testid="help-panel" style={{fontSize:'12px', lineHeight:'1.4'}}>
      <button type="button" onClick={()=>setHelp(false)} aria-label="Close help" data-testid="close-help">×</button>
      <span>CONTROLS</span>
      <p>Drag to rotate (marks userInteracted). Scroll / pinch to zoom. Hover to inspect. ESC clears selection. Reset view uses camera reset.</p>
      <p>View modes: Exterior = board/package/HBM/power, Architecture = exploded GPC→SM→TC/CC/TMA, System = GPU→NVLink→Superchip→tray→rack.</p>
      {workload && <p>Workload overlay {workload}: highlights relevant parts for bottleneck analysis. Switch via COMPONENT INDEX.</p>}
      <p className="mt-2 opacity-60 text-[11px]">Zero /40 opacity decorative labels removed – 12-14px readable.</p>
    </div>
  )
}
