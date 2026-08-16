'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { palette } from '@/lib/materials/palette'
export function DieTileGrid({ cols, rows, active }:{ cols:number, rows:number, active:boolean }){
  const tiles = useMemo(()=>{
    const arr=[]
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const color = palette.tilePalette[Math.floor(c/cols*palette.tilePalette.length)]
      arr.push({c,r,color, x:(c-(cols-1)/2)*0.113, z:(r-(rows-1)/2)*0.115 })
    }
    return arr
  },[cols,rows])
  return (
    <group>
      <mesh position={[0,0,0]}>
        <boxGeometry args={[1.52,0.08,1.28]} />
        <meshStandardMaterial color="#171b19" metalness={0.72} roughness={0.24} />
      </mesh>
      {tiles.map((t,i)=>(
        <mesh key={i} position={[t.x,0.061,t.z]}>
          <boxGeometry args={[0.078,0.018,0.078]} />
          <meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} />
        </mesh>
      ))}
    </group>
  )
}
