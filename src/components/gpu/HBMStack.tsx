'use client'
import { RoundedBox } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
export function HBMStack({ position, active, label }:{ position:[number,number,number], active:boolean, label?:string }){
  return (
    <group position={position as any}>
      <RoundedBox args={[0.64,0.15,0.5]} radius={0.035} smoothness={2}>
        <meshStandardMaterial color={active?"#2f5c2b":palette.hbmStack} emissive={active?palette.lime:"black"} emissiveIntensity={active?0.32:0} metalness={0.48} roughness={0.38} />
      </RoundedBox>
      <mesh position={[0,0.085,0]}>
        <boxGeometry args={[0.48,0.018,0.025]} />
        <meshStandardMaterial color={palette.hbmBar} metalness={0.68} roughness={0.3} />
      </mesh>
    </group>
  )
}
