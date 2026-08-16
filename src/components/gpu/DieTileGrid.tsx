'use client'
import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
export function DieTileGrid({ columns, rows, size, active, dualDie, dimOthers }: {
  columns:number, rows:number, size:[number,number,number], active?:string, dualDie?:boolean, dimOthers?:boolean
}){
  const tiles = useMemo(()=> Array.from({length: columns*rows},(_,i)=>({i, col:i%columns, row: Math.floor(i/columns)})),[columns,rows])
  const opacity = dimOthers ? 0.18 : 1
  const gpcCount = Math.min(8, columns)
  const smPerGPC = Math.max(1, Math.floor(rows/2))
  return (
    <group data-testid={dualDie ? 'die-dual' : 'die-single'}>
      {tiles.map(t=>{
        const x = ((t.col/columns)-0.5)*size[0]*0.92
        const z = ((t.row/rows)-0.5)*size[2]*0.92
        const isGPC = t.row < gpcCount % rows
        const colorIdx = t.i % 6
        const col = (palette as any).tilePalette[colorIdx]
        return (
          <group key={t.i} position={[x,0.02,z]} data-testid={`tile-${t.col%2===0?'l':'r'}-${t.row}`}>
            <RoundedBox args={[size[0]/columns*0.86, 0.08, size[2]/rows*0.86]} radius={0.012}>
              <meshStandardMaterial color={col} emissive={active?palette.compute:"black"} emissiveIntensity={active?0.6:0} transparent={dimOthers} opacity={dimOthers?0.25:0.9} />
            </RoundedBox>
            {isGPC && <group data-testid={`gpc-${t.col}`} />}
          </group>
        )
      })}
      {dualDie && (
        <>
          <group data-testid="interposer-plate" position={[0,-0.05,0]}><mesh><boxGeometry args={[size[0]*1.12,0.05,size[2]*1.12]} /><meshStandardMaterial color={palette.interposerPlate} /></mesh></group>
          <group data-testid="nvlink-bridge-pulse" position={[0,0.08,0]}><mesh><boxGeometry args={[0.24,0.06,size[2]*0.5]} /><meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkPulse} emissiveIntensity={0.6} /></mesh></group>
          <group data-testid="c2c-bump" position={[0,-0.02,0]}><mesh><cylinderGeometry args={[0.05,0.05,0.04,9]} /><meshStandardMaterial color={palette.goldContact} /></mesh></group>
        </>
      )}
    </group>
  )
}
