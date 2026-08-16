export function HelpPanel({open}:{open:boolean}){
  if(!open) return null
  return (
    <div className="help-panel" role="dialog" aria-label="3D controls">
      <span>CONTROLS</span>
      <p>Drag to rotate. Scroll or pinch to zoom. Hover a component to inspect it.</p>
      <p>Desktop component clicks open Modal. Touch taps pin a card first.</p>
    </div>
  )
}
