'use client'
import { RoundedBox, Html } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
export function HBMStack({ position, active, label, version, totalGB, capacityGB, dimOthers }: {
  position:[number,number,number],
  active?:boolean,
  label?:string,
  version?:'hbm3'|'hbm3e'|'hbm4'|'hbm4e',
  totalGB?:number, // per stack
  capacityGB?:number, // total module
  dimOthers?:boolean
}){
  const isHBM3e = version === 'hbm3e'
  const isHBM4 = version === 'hbm4' || version === 'hbm4e'
  const badgeColor = isHBM3e ? '#0ec7ff' : isHBM4 ? '#a0e8ff' : palette.lime
  const opacity = dimOthers ? 0.25 : 1
  return (
    <group position={position as any} data-testid={`hbm-stack-${version ?? 'unknown'}-${totalGB ?? ''}`}>
      <RoundedBox args={[0.64,0.15,0.5]} radius={0.035} smoothness={2}>
        <meshStandardMaterial color={active?"#2f5c2b":palette.hbmStack} emissive={active?palette.lime:"black"} emissiveIntensity={active?0.32:0} metalness={0.48} roughness={0.38} transparent opacity={opacity} />
      </RoundedBox>
      <mesh position={[0,0.085,0]}>
        <boxGeometry args={[0.48,0.018,0.025]} />
        <meshStandardMaterial color={isHBM3e?'#0aa3d0': isHBM4 ? '#4db5ff' : palette.hbmBar} metalness={0.68} roughness={0.3} transparent opacity={opacity} />
      </mesh>
      {(version || capacityGB!==undefined) && (
        <Html distanceFactor={6} position={[0,0.22,0]} center transform style={{pointerEvents:'none'}}>
          <div style={{
            fontSize:'9px', fontFamily:'monospace', padding:'2px 6px',
            borderRadius:'10px', border:`1px solid ${badgeColor}`,
            background: isHBM3e ? 'rgba(14,199,255,0.12)' : isHBM4 ? 'rgba(0,180,255,0.12)' : 'rgba(127,238,100,0.12)',
            color: badgeColor,
            whiteSpace:'nowrap'
          }} data-testid="hbm-badge">
            {version?.toUpperCase()} {totalGB ? `${totalGB}GB/stack` : ''} {capacityGB ? `· ${capacityGB}GB total` : ''}{label && !totalGB ? label : ''}
          </div>
        </Html>
      )}
    </group>
  )
}
