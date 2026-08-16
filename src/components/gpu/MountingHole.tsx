'use client'
import * as THREE from 'three'
import { palette } from '@/lib/materials/palette'
export function MountingHoles({ positions }:{ positions:[number,number][] }){
  return (
    <>
      {positions.map(([x,z],i)=>(
        <group key={i} position={[x,0.22,z] as any}>
          <mesh>
            <cylinderGeometry args={[0.2,0.2,0.035,32]} />
            <meshBasicMaterial color={palette.mountingHole} />
          </mesh>
          <mesh position={[0,0.02,0]}>
            <cylinderGeometry args={[0.1,0.1,0.055,24]} />
            <meshStandardMaterial color={palette.mountingHoleCore} metalness={0.1} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </>
  )
}
