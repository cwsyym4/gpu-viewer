'use client'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { palette } from '@/lib/materials/palette'

export function DieTileGrid({ cols, rows, active, dualDie, dieSize, interposer, isGB200, dimOthers }: {
  cols:number, rows:number, active:boolean|any,
  dualDie?:boolean,
  dieSize?:[number,number,number],
  interposer?:boolean,
  isGB200?:boolean,
  dimOthers?:boolean
}){
  const pulseRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock })=>{
    if(pulseRef.current){
      const t = (Math.sin(clock.elapsedTime*1.8)+1)/2
      const mat:any = pulseRef.current.material
      if(mat) mat.emissiveIntensity = 0.4 + t*0.9
    }
  })

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
      <group data-testid="die-single">
        <mesh position={[0,0,0]}>
          <boxGeometry args={[w,0.08,d]} />
          <meshStandardMaterial color="#171b19" metalness={0.72} roughness={0.24} transparent opacity={dimOthers?0.25:1} />
        </mesh>
        {singleTiles.map((t,i)=>(
          <mesh key={i} position={[t.x,0.061,t.z]} data-testid={`tile-${i}`}>
            <boxGeometry args={[0.078,0.018,0.078]} />
            <meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0 as any} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} transparent opacity={dimOthers?0.25:1} />
          </mesh>
        ))}
      </group>
    )
  }

  const gap = isGB200 ? 0.34 : 0.12
  const colsPerDie = Math.floor(cols/2)
  const remainder = cols % 2
  const leftCols = colsPerDie + remainder
  const rightCols = colsPerDie

  const dieW = dieSize ? (dieSize[0]/2 - gap/2) : (isGB200 ? 0.84 : 0.76)
  const dieD = dieSize ? Math.min(dieSize[2], isGB200?1.55:1.36) : (isGB200?1.45:1.24)
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
    <group data-testid="die-dual">
      {interposer && (
        <mesh position={[0,-0.04,0]} data-testid="interposer-plate">
          <boxGeometry args={[dieW*2 + gap + 0.46, 0.05, dieD + 0.48]} />
          <meshStandardMaterial color={(palette as any).interposerPlate ?? '#0f2211'} metalness={0.22} roughness={0.78} transparent opacity={dimOthers?0.25:1} />
        </mesh>
      )}
      <mesh position={[-dieXOffset,0,0]} data-testid="die-left"><boxGeometry args={[dieW,0.09,dieD]} /><meshStandardMaterial color={isGB200?"#121a13":"#171b19"} metalness={0.72} roughness={0.22} transparent opacity={dimOthers?0.25:1} /></mesh>
      <mesh position={[dieXOffset,0,0]} data-testid="die-right"><boxGeometry args={[dieW,0.09,dieD]} /><meshStandardMaterial color={isGB200?"#121a13":"#171b19"} metalness={0.72} roughness={0.22} transparent opacity={dimOthers?0.25:1} /></mesh>
      {interposer && (
        <>
          <mesh position={[0,0.012,0]} data-testid="interposer-line"><boxGeometry args={[gap+0.02,0.095,dieD+0.08]} /><meshStandardMaterial color={palette.interposer ?? '#0e3014'} metalness={0.3} roughness={0.8} transparent opacity={dimOthers?0.25:0.8} /></mesh>
          <mesh ref={pulseRef} position={[0,0.064,0]} data-testid="nvlink-bridge-pulse"><boxGeometry args={[gap+0.08,0.008,dieD*0.72]} /><meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkBridge} emissiveIntensity={0.85} transparent opacity={0.88} /></mesh>
          {isGB200 && (
            <group>
              {[-0.28,0,0.28].map((z,i)=>(
                <mesh key={i} position={[0,0.071,z]} data-testid={`c2c-bump-${i}`}><boxGeometry args={[0.22,0.014,0.06]} /><meshStandardMaterial color="#aaff99" emissive="#7fee64" emissiveIntensity={0.5} /></mesh>
              ))}
            </group>
          )}
        </>
      )}
      {leftTiles.map((t,i)=>(
        <mesh key={`l-${i}`} position={[t.x,0.062,t.z]} data-testid={`tile-l-${i}`}><boxGeometry args={[isGB200?0.07:0.074,0.019,isGB200?0.07:0.074]} /><meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0 as any} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} transparent opacity={dimOthers?0.18:1} /></mesh>
      ))}
      {rightTiles.map((t,i)=>(
        <mesh key={`r-${i}`} position={[t.x,0.062,t.z]} data-testid={`tile-r-${i}`}><boxGeometry args={[isGB200?0.07:0.074,0.019,isGB200?0.07:0.074]} /><meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0 as any} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} transparent opacity={dimOthers?0.18:1} /></mesh>
      ))}
    </group>
  )
}
