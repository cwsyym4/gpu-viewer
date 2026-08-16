'use client'
import { useViewerStore } from '@/store/useViewerStore'
export function HelpPanel(){
  const { helpOpen, setHelp } = useViewerStore()
  if(!helpOpen) return null
  return (
    <div className="absolute top-[52px] right-6 z-20 w-[min(330px,calc(100%-48px))] border border-[#7fee64] bg-[#0d180a]/95 p-4 text-[#7fee64]/80">
      <button onClick={()=>setHelp(false)} className="absolute top-2 right-2 bg-transparent border-0 text-xl">×</button>
      <span className="text-[#7fee64] text-xs tracking-widest">CONTROLS</span>
      <p className="mt-2 text-[13px] leading-relaxed">Drag to rotate. Scroll or pinch to zoom. Hover a component to inspect it.</p>
      <p className="mt-2 text-[13px]">Desktop component clicks open Modal. Touch taps pin a card first. Press ESC to clear.</p>
    </div>
  )
}
