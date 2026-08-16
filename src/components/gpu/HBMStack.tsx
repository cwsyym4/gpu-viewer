'use client'
import { RoundedBox, Html } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
export function HBMStack({ position, active, label, version, totalGB }:{
  position:[number,number,number],
  active:boolean,
  label?:string,
  version?:'hbm3'|'hbm3e',
  totalGB?:number
}){
  const isHBM3e = version === 'hbm3e'
  const badgeColor = isHBM3e ? '#0ec7ff' : palette.lime
  return (
    <group position={position as any}>
      <RoundedBox args={[0.64,0.15,0.5]} radius={0.035} smoothness={2}>
        <meshStandardMaterial color={active?"#2f5c2b":palette.hbmStack} emissive={active?palette.lime:"black"} emissiveIntensity={active?0.32:0} metalness={0.48} roughness={0.38} />
      </RoundedBox>
      <mesh position={[0,0.085,0]}>
        <boxGeometry args={[0.48,0.018,0.025]} />
        <meshStandardMaterial color={isHBM3e?'#0aa3d0':palette.hbmBar} metalness={0.68} roughness={0.3} />
      </mesh>
      {version && (
        <Html distanceFactor={6} position={[0,0.22,0]} center transform style={{pointerEvents:'none'}}>
          <div style={{
            fontSize:'9px', fontFamily:'monospace', padding:'2px 6px',
            borderRadius:'10px', border:`1px solid ${badgeColor}`,
            background: isHBM3e ? 'rgba(14,199,255,0.12)' : 'rgba(127,238,100,0.12)',
            color: badgeColor,
            whiteSpace:'nowrap'
          }}>
            {version.toUpperCase()} {totalGB ? `${totalGB}G / ${ (totalGB/ (label==='8'?'8':'1') ) }` : ''}{label && !totalGB ? label : ''}{isHBM3e ? ' 24GB' : ' 16GB'}
          </div>
        </Html>
      )}
    </group>
  )
}
