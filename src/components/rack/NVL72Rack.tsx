'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '@/lib/materials/palette'

// NVL72 rack: 72x GB200 Blackwell GPUs + 36x Grace CPUs
// Physical: 18 compute trays x 4 Blackwell + 2 Grace each = 72 +36
// For perf we render simplified boxes with instances + NVLink spines

export function NVL72Rack({ simplified=true }:{ simplified?: boolean }){
  const stripRef = useRef<THREE.Group>(null)
  useFrame(({ clock })=>{
    if(stripRef.current){
      stripRef.current.rotation.y = Math.sin(clock.elapsedTime*0.12)*0.02
    }
  })

  // tray positions: 18 trays stacked vertical
  const trays = useMemo(()=>{
    const arr:{ y:number, id:number }[]=[]
    const trayHeight = 0.9
    const startY = -7.2
    for(let i=0;i<18;i++){
      arr.push({ y: startY + i*trayHeight, id:i })
    }
    return arr
  },[])

  const rackW = 6.2
  const rackD = 3.8
  const rackH = 16.5

  return (
    <group>
      {/* rack frame */}
      <group>
        {/* vertical posts */}
        {[[-rackW/2,0,-rackD/2],[rackW/2,0,-rackD/2],[-rackW/2,0,rackD/2],[rackW/2,0,rackD/2]].map((p,i)=>(
          <mesh key={i} position={p as any}>
            <boxGeometry args={[0.08,rackH,0.08]} />
            <meshStandardMaterial color={palette.rackMetal ?? '#151c19'} metalness={0.6} roughness={0.5} />
          </mesh>
        ))}
        {/* horizontal top/bottom */}
        <mesh position={[0,rackH/2-0.4,0]}>
          <boxGeometry args={[rackW+0.12,0.1,rackD+0.12]} />
          <meshStandardMaterial color={palette.rackMetal} />
        </mesh>
        <mesh position={[0,-rackH/2+0.4,0]}>
          <boxGeometry args={[rackW+0.12,0.1,rackD+0.12]} />
          <meshStandardMaterial color={palette.rackMetal} />
        </mesh>
      </group>

      {trays.map(t=>(
        <group key={t.id} position={[0,t.y,0]}>
          {/* tray chassis */}
          <mesh>
            <boxGeometry args={[rackW-0.18,0.08,rackD-0.14]} />
            <meshStandardMaterial color="#0e1612" metalness={0.5} roughness={0.7} />
          </mesh>
          {/* 2x Grace CPUs — muted teal */}
          {[-1.22,0.18].map((x,i)=>(
            <group key={`g-${i}`} position={[x,0.18,i===0?-0.1:0.12]}>
              <mesh>
                <boxGeometry args={[0.84,0.14,0.72]} />
                <meshStandardMaterial color={(palette as any).graceCpu ?? '#294d52'} metalness={0.55} roughness={0.45} />
              </mesh>
              <mesh position={[0,0.085,0]}>
                <boxGeometry args={[0.2,0.06,0.34]} />
                <meshStandardMaterial color={(palette as any).graceCpuHighlight ?? '#2a6b6f'} emissive={(palette as any).graceCpuHighlight} emissiveIntensity={0.35} />
              </mesh>
            </group>
          ))}
          {/* 4x Blackwell dies per tray */}
          {[-1.9,-0.62,0.62,1.9].map((x,i)=>(
            <group key={`b-${i}`} position={[x,0.12,i%2===0?-0.62:0.62]}>
              <mesh>
                <boxGeometry args={[0.78,0.11,0.76]} />
                <meshStandardMaterial color="#101712" metalness={0.72} roughness={0.28} />
              </mesh>
              {/* small tile hint */}
              <mesh position={[0,0.067,0]}>
                <boxGeometry args={[0.42,0.02,0.42]} />
                <meshStandardMaterial color={palette.lime} emissive={palette.lime} emissiveIntensity={0.18} metalness={0.4} />
              </mesh>
            </group>
          ))}
          {/* NVLink spine inside tray */}
          <mesh position={[0,0.09,0]}>
            <boxGeometry args={[rackW-0.6,0.02,0.05]} />
            <meshStandardMaterial color={palette.nvlinkBridge ?? '#7fee64'} emissive={palette.nvlinkBridge} emissiveIntensity={0.65} />
          </mesh>
        </group>
      ))}

      {/* vertical NVLink spine for rack-scale 130TB/s */}
      <group ref={stripRef}>
        <mesh position={[0,0,-rackD/2-0.08]}>
          <boxGeometry args={[0.06,rackH-0.8,0.06]} />
          <meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkBridge} emissiveIntensity={0.75} transparent opacity={0.92} />
        </mesh>
        <mesh position={[0,0,rackD/2+0.08]}>
          <boxGeometry args={[0.06,rackH-0.8,0.06]} />
          <meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkBridge} emissiveIntensity={0.45} />
        </mesh>
      </group>

      {/* labels */}
      {/* Keep minimal for perf */}
    </group>
  )
}

export function RackStats(){
  return (
    <div className="absolute bottom-[46px] left-6 text-[10px] font-mono text-[#7fee64]/70 leading-[1.35] pointer-events-none max-w-[92%]">
      <div className="text-[#7fee64]">GB200 NVL72 — 72 Blackwell GPUs fully NVLink domain 130TB/s, 36 Grace CPUs, 18 compute trays</div>
      <div className="mt-1 text-[#7fee64]/60">NVL72: 18× trays · 72× Blackwell GPU · 36× Grace CPU · NVLink domain 130TB/s · C2C 900GB/s per Superchip · 208B transistors</div>
    </div>
  )
}
