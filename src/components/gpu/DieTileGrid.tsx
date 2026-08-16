'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { palette } from '@/lib/materials/palette'

export function DieTileGrid({ cols, rows, active, dualDie, dieSize, interposer }:{
  cols:number, rows:number, active:boolean,
  dualDie?:boolean,
  dieSize?:[number,number,number],
  interposer?:boolean
}){
  const singleTiles = useMemo(()=>{
    const arr:{c:number,r:number,color:string,x:number,z:number}[]=[]
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const color = palette.tilePalette[Math.floor(c/cols*palette.tilePalette.length)]
      arr.push({c,r,color, x:(c-(cols-1)/2)*0.113, z:(r-(rows-1)/2)*0.115 })
    }
    return arr
  },[cols,rows])

  if(!dualDie){
    const w = dieSize ? dieSize[0] + 0.1 : 1.52
    const d = dieSize ? dieSize[2] + 0.1 : 1.28
    return (
      <group>
        <mesh position={[0,0,0]}>
          <boxGeometry args={[w,0.08,d]} />
          <meshStandardMaterial color="#171b19" metalness={0.72} roughness={0.24} />
        </mesh>
        {singleTiles.map((t,i)=>(
          <mesh key={i} position={[t.x,0.061,t.z]}>
            <boxGeometry args={[0.078,0.018,0.078]} />
            <meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} />
          </mesh>
        ))}
      </group>
    )
  }

  // dual-die: split cols into two halves with interposer gap 0.12
  const gap = 0.12
  const colsPerDie = Math.floor(cols/2)
  const remainder = cols % 2
  const leftCols = colsPerDie + remainder // if odd favor left
  const rightCols = colsPerDie

  const dieW = dieSize ? (dieSize[0]/2 - gap/2) : 0.76 // reference [0.78,0.11,0.68] scaled
  const dieD = dieSize ? Math.min(dieSize[2], 1.36) : 1.24
  const dieXOffset = dieW/2 + gap/2 + 0.02

  const makeTiles = (cCount:number, xOrigin:number)=>{
    const arr:{x:number,z:number,color:string}[]=[]
    for(let r=0;r<rows;r++) for(let c=0;c<cCount;c++){
      const globalC = xOrigin < 0 ? c : leftCols + c
      const color = palette.tilePalette[Math.floor(globalC/cols*palette.tilePalette.length)]
      const x = (c-(cCount-1)/2)*0.113 + xOrigin
      const z = (r-(rows-1)/2)*0.115
      arr.push({x,z,color})
    }
    return arr
  }

  const leftTiles = makeTiles(leftCols, -dieXOffset)
  const rightTiles = makeTiles(rightCols, dieXOffset)

  return (
    <group>
      {/* left die substrate */}
      <mesh position={[-dieXOffset,0,0]}>
        <boxGeometry args={[dieW,0.08,dieD]} />
        <meshStandardMaterial color="#171b19" metalness={0.72} roughness={0.24} />
      </mesh>
      {/* right die substrate */}
      <mesh position={[dieXOffset,0,0]}>
        <boxGeometry args={[dieW,0.08,dieD]} />
        <meshStandardMaterial color="#171b19" metalness={0.72} roughness={0.24} />
      </mesh>
      {/* interposer line */}
      {interposer && (
        <mesh position={[0,0.01,0]}>
          <boxGeometry args={[0.06,0.09,dieD+0.08]} />
          <meshStandardMaterial color={palette.interposer ?? '#0e3014'} metalness={0.3} roughness={0.8} />
        </mesh>
      )}
      {leftTiles.map((t,i)=>(
        <mesh key={`l-${i}`} position={[t.x,0.061,t.z]}>
          <boxGeometry args={[0.074,0.018,0.074]} />
          <meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} />
        </mesh>
      ))}
      {rightTiles.map((t,i)=>(
        <mesh key={`r-${i}`} position={[t.x,0.061,t.z]}>
          <boxGeometry args={[0.074,0.018,0.074]} />
          <meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} />
        </mesh>
      ))}
    </group>
  )
}
