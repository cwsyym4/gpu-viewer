'use client'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { palette } from '@/lib/materials/palette'

export function DieTileGrid({ cols, rows, active, dualDie, dieSize, interposer, isGB200 }:{
  cols:number, rows:number, active:boolean,
  dualDie?:boolean,
  dieSize?:[number,number,number],
  interposer?:boolean,
  isGB200?:boolean
}){
  const pulseRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock })=>{
    if(pulseRef.current){
      const t = (Math.sin(clock.elapsedTime*1.8)+1)/2
      // @ts-ignore material emissiveIntensity modulation
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

  // dual-die logic: GB200 uses larger gap 0.32 for NVLink die-to-die C2C 900GB/s
  // B200 gap 0.12, GB200 gap 0.32
  const gap = isGB200 ? 0.34 : 0.12
  const colsPerDie = Math.floor(cols/2)
  const remainder = cols % 2
  const leftCols = colsPerDie + remainder // if odd favor left
  const rightCols = colsPerDie

  const dieW = dieSize ? (dieSize[0]/2 - gap/2) : (isGB200 ? 0.84 : 0.76) // GB200 slightly bigger reticle
  const dieD = dieSize ? Math.min(dieSize[2], isGB200?1.55:1.36) : (isGB200?1.45:1.24)
  const dieXOffset = dieW/2 + gap/2 + 0.02

  const makeTiles = (cCount:number, xOrigin:number)=>{
    const arr:{x:number,z:number,color:string}[]=[]
    for(let r=0;r<rows;r++) for(let c=0;c<cCount;c++){
      const globalC = xOrigin < 0 ? c : leftCols + c
      // use BW palette for GB200 to distinguish? keep same for now with slightly desaturated
      const paletteArr = isGB200 ? palette.tilePalette : palette.tilePalette
      const color = paletteArr[Math.floor(globalC/cols*paletteArr.length)]
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
      {/* interposer base plate — larger for GB200, subtle */}
      {interposer && (
        <mesh position={[0,-0.04,0]}>
          <boxGeometry args={[dieW*2 + gap + 0.46, 0.05, dieD + 0.48]} />
          <meshStandardMaterial color={(palette as any).interposerPlate ?? '#0f2211'} metalness={0.22} roughness={0.78} />
        </mesh>
      )}
      {/* left die reticle */}
      <mesh position={[-dieXOffset,0,0]}>
        <boxGeometry args={[dieW,0.09,dieD]} />
        <meshStandardMaterial color={isGB200?"#121a13":"#171b19"} metalness={0.72} roughness={0.22} />
      </mesh>
      {/* right die reticle */}
      <mesh position={[dieXOffset,0,0]}>
        <boxGeometry args={[dieW,0.09,dieD]} />
        <meshStandardMaterial color={isGB200?"#121a13":"#171b19"} metalness={0.72} roughness={0.22} />
      </mesh>
      {/* NVLink-C2C die-to-die bridge — interposer line */}
      {interposer && (
        <>
          <mesh position={[0,0.012,0]}>
            <boxGeometry args={[gap+0.02,0.095,dieD+0.08]} />
            <meshStandardMaterial color={palette.interposer ?? '#0e3014'} metalness={0.3} roughness={0.8} />
          </mesh>
          {/* emissive thin bridge pulse */}
          <mesh ref={pulseRef} position={[0,0.064,0]}>
            <boxGeometry args={[gap+0.08,0.008,dieD*0.72]} />
            <meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkBridge} emissiveIntensity={0.85} transparent opacity={0.88} />
          </mesh>
          {isGB200 && (
            <group>
              {/* small C2C bumps representing 900GB/s link */}
              {[-0.28,0,0.28].map((z,i)=>(
                <mesh key={i} position={[0,0.071,z]}>
                  <boxGeometry args={[0.22,0.014,0.06]} />
                  <meshStandardMaterial color="#aaff99" emissive="#7fee64" emissiveIntensity={0.5} />
                </mesh>
              ))}
            </group>
          )}
        </>
      )}
      {leftTiles.map((t,i)=>(
        <mesh key={`l-${i}`} position={[t.x,0.062,t.z]}>
          <boxGeometry args={[isGB200?0.07:0.074,0.019,isGB200?0.07:0.074]} />
          <meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} />
        </mesh>
      ))}
      {rightTiles.map((t,i)=>(
        <mesh key={`r-${i}`} position={[t.x,0.062,t.z]}>
          <boxGeometry args={[isGB200?0.07:0.074,0.019,isGB200?0.07:0.074]} />
          <meshStandardMaterial color={active?palette.lime:t.color} emissive={active?palette.lime:0} emissiveIntensity={active?0.22:0} metalness={0.68} roughness={0.26} />
        </mesh>
      ))}
      {isGB200 && (
        <group>
          <mesh position={[0,0.13,0]}>
            <boxGeometry args={[0.02,0.02,0.02]} />
            <meshStandardMaterial color="#000" transparent opacity={0} />
          </mesh>
        </group>
      )}
    </group>
  )
}
