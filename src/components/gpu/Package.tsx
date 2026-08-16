'use client'
import { RoundedBox } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
export function Package({ size, offset }:{ size:[number,number,number], offset:[number,number,number] }){
  return (
    <group position={offset as any}>
      <RoundedBox args={size as any} radius={0.11} smoothness={4}>
        <meshStandardMaterial color={palette.package} metalness={0.54} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[size[0]-0.3,0.12,size[2]-0.3] as any} radius={0.065} position={[0,0.2,0]}>
        <meshStandardMaterial color={palette.packageInner} metalness={0.5} roughness={0.42} />
      </RoundedBox>
    </group>
  )
}
