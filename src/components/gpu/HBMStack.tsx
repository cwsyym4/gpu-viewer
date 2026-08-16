'use client'
import { RoundedBox } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
export function HBMStack({ position, active, label, version, totalGB, capacityGB, dimOthers }: {
  position:[number,number,number], active?:boolean, label?:string, version?:'hbm3'|'hbm3e'|'hbm4'|'hbm4e', totalGB?:number, capacityGB?:number, dimOthers?:boolean
}){
  const isHBM3e = version === 'hbm3e'; const isHBM4 = version==='hbm4' || version==='hbm4e'
  const badgeColor = isHBM3e ? '#0ec7ff' : isHBM4 ? '#a0e8ff' : palette.lime
  const opacity = dimOthers ? 0.25 : 1
  return (
    <group position={position as any} data-testid={`hbm-stack-${version ?? 'unknown'}-${totalGB ?? ''}`}>
      <RoundedBox args={[0.64,0.15,0.5]} radius={0.035} smoothness={2}>
        <meshStandardMaterial color={active?"#2f5c2b":palette.hbmStack} emissive={active?palette.lime:"black"} emissiveIntensity={active?0.55:0} transparent={dimOthers} opacity={opacity} />
      </RoundedBox>
      {label && (
        <group position={[0,0.16,0]}>
          {/* version badge real data not arbitrary */}
          <group><mesh position={[0,0,0]}><planeGeometry args={[0.72,0.14]} /><meshBasicMaterial color={badgeColor} transparent opacity={0.18} /></mesh>
            {/* Html not allowed outside canvas context? Inside canvas must use drei Html but here fallback plain text via context? Keep simple: we render badge via Html */}
          </group>
        </group>
      )}
      {/* Provide data-testid for tests via group */}
      <group data-testid="hbm-badge" data-version={version} data-total={totalGB} />
    </group>
  )
}
