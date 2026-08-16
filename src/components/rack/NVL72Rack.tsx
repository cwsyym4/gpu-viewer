'use client'
import { palette } from '@/lib/materials/palette'
export function NVL72Rack({ specId }: { specId?:string }){
  return (
    <group data-testid="rack-nvl72">
      {Array.from({length:18}).map((_,i)=>(
        <group key={i} position={[0, i*0.28, 0]} data-testid={`tray-${i}`}>
          <mesh><boxGeometry args={[4,0.18,2]} /><meshStandardMaterial color={palette.rackMetal} /></mesh>
        </group>
      ))}
      <mesh data-testid="rack-spine"><boxGeometry args={[0.12,5.5,0.2]} /><meshStandardMaterial color={palette.rackSpine} /></mesh>
    </group>
  )
}
export function RackStats({ specId }: { specId?:string }){
  return (
    <div data-testid="rack-stats" className="absolute bottom-2 left-2 text-[10px] bg-[#000a] border border-[#7fee64]/20 p-2 rounded text-white/70 font-mono">
      <div>GB200 NVL72 — 72 Blackwell GPUs fully NVLink domain 130TB/s 36 Grace CPUs 18 trays</div>
      <div>Superchip: 1 Grace 72c + 2 Blackwell 384 raw 372 usable 16TB/s 3.6TB/s NVL C2C 900GB/s</div>
      <div>Tray: 2 Grace +4 Blackwell · Rack 72 GPUs / 36 Grace</div>
    </div>
  )
}
