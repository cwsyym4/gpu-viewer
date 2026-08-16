'use client'
import { palette } from '@/lib/materials/palette'
import { RoundedBox } from '@react-three/drei'

export function Board({ size }:{ size:[number,number,number] }){
  return (
    <>
      <RoundedBox args={size as any} radius={0.16} smoothness={4}>
        <meshStandardMaterial color={palette.board} metalness={0.28} roughness={0.68} />
      </RoundedBox>
      <RoundedBox args={[size[0]-0.12,0.1,size[2]-0.12] as any} radius={0.13} smoothness={3} position={[0,0.13,0]}>
        <meshStandardMaterial color={palette.boardInner} metalness={0.18} roughness={0.76} />
      </RoundedBox>
    </>
  )
}
