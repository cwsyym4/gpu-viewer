'use client'
import { RoundedBox, Html } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'

export function HBMStack({
  position, active, label,
  version, totalGB, capacityGB,
  dimOthers, workloadActive
}: {
  position:[number,number,number],
  active?:boolean, label?:string,
  version?:'hbm3'|'hbm3e'|'hbm4'|'hbm4e',
  totalGB?:number, capacityGB?:number,
  dimOthers?:boolean,
  workloadActive?:boolean
}){
  const isHBM3e = version === 'hbm3e'; const isHBM4 = version==='hbm4' || version==='hbm4e'
  const badgeColor = isHBM3e ? '#0ec7ff' : isHBM4 ? '#a0e8ff' : palette.lime
  const opacity = (dimOthers && !active && !workloadActive) ? 0.18 : 1
  const isActive = active || workloadActive

  return (
    <group position={position as any} userData={{ testId: `hbm-stack-${version ?? 'unknown'}-${totalGB ?? ''}` }}>
      <RoundedBox args={[0.64,0.22,0.5] as any} radius={0.035} smoothness={2}>
        <meshStandardMaterial color={isActive?"#2f5c2b":palette.hbmStack} emissive={isActive?palette.lime:"black"} emissiveIntensity={isActive?0.55:0} transparent={dimOthers} opacity={opacity} />
      </RoundedBox>
      <group userData={{ testId: "hbm-badge" }} />
      {/* stack layers visual */}
      <group position={[0,0.14,0] as any}>
        <RoundedBox args={[0.58,0.04,0.44] as any} radius={0.02}><meshStandardMaterial color={palette.hbmStack} /></RoundedBox>
        <RoundedBox args={[0.54,0.04,0.40] as any} radius={0.02} position={[0,0.05,0] as any}><meshStandardMaterial color={palette.hbmStack} /></RoundedBox>
      </group>
      {isActive && (
        <Html center position={[0,0.38,0] as any}><div className="text-[11px] font-mono text-[#7fee64] bg-black/60 px-1 rounded pointer-events-none">{version?.toUpperCase()} {totalGB}GB</div></Html>
      )}
    </group>
  )
}
