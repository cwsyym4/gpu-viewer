'use client'
import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'

export function DieTileGrid({
  columns, rows, size,
  active, dualDie, dimOthers,
  gpcCount, smCountsPerGpc,
  selectedPart,
  workloadActiveIds
}: {
  columns:number, rows:number, size:[number,number,number],
  active?:string, dualDie?:boolean, dimOthers?:boolean,
  gpcCount?:number,
  smCountsPerGpc?:number[],
  selectedPart?:string,
  workloadActiveIds?: string[]
}){
  const tiles = useMemo(()=> Array.from({length: columns*rows},(_,i)=>({i, col:i%columns, row: Math.floor(i/columns)})),[columns,rows])
  const workloadActive = !!workloadActiveIds?.length
  const isIlluminated = (tid:string)=> workloadActiveIds?.includes(tid) || selectedPart===tid
  const gpcTotal = gpcCount ?? 8
  const smDist = smCountsPerGpc ?? Array.from({length:gpcTotal},()=> Math.round(columns*rows/gpcTotal))

  // tile function palette by functional role – keep stable per position but driven by GPC/SM/cache/mem grouping
  // Approximate: divide grid into functional zones: GPC tiles = first 70%, cache ~15%, mem ~10%, disabled ~5%
  const paletteFor = (idx:number, isGpcTile:boolean) => {
    if(isGpcTile) return palette.gpc
    // alternate disabled aesthetic after total SM count
    if(idx % 18 === 0) return (palette as any).disabled ?? "#222"
    const r = idx % 5
    if(r===0) return palette.cache
    if(r===1) return palette.memory
    return (palette as any).tilePalette?.[idx%6] ?? palette.sram ?? "#445533"
  }

  return (
    <group userData={{ testId: dualDie ? "die-dual" : "die-single" }}>
      {tiles.map(t=>{
        const x = ((t.col/columns)-0.5)*size[0]*0.92
        const z = ((t.row/rows)-0.5)*size[2]*0.92
        const isGPCZone = t.i < gpcTotal * Math.max(1, Math.floor((columns*rows)/gpcTotal/1.2))
        const isCompute = selectedPart==='sm' || selectedPart==='gpc' || selectedPart==='tensor-core' || selectedPart==='cuda-core'
        const activeHit = isIlluminated('sm') || isIlluminated('gpc') || isIlluminated('tensor-core') || isIlluminated('cuda-core') || (active && (active==='gpc' || active==='sm' || active==='tensor-core'))
        const color = paletteFor(t.i, isGPCZone)
        // Dim when workload active but not this zone
        const shouldDim = dimOthers && !activeHit && !(workloadActive && (workloadActiveIds?.some(id=> ['gpc','sm','tensor-core','cuda-core'].includes(id))))
        const emissive = activeHit ? palette.compute : (workloadActive && workloadActiveIds?.some(id=>['gpc','sm','compute'].includes(id)) ? palette.compute : "black")
        const emi = activeHit ? 0.6 : (workloadActiveIds?.includes('gpc')?0.45:0)

        return (
          <group key={t.i} position={[x,0.02,z] as any} userData={{ testId: `tile-${t.col%2===0?'l':'r'}-${t.row}-${t.i}` }}>
            <RoundedBox args={[size[0]/columns*0.86, 0.08, size[2]/rows*0.86] as any} radius={0.012}>
              <meshStandardMaterial color={color} emissive={emissive as any} emissiveIntensity={emi} transparent={dimOthers} opacity={shouldDim?0.15:0.95} />
            </RoundedBox>
            {/* indicate disabled SMs for H100 where active 132 vs 144 full – last 12 tiles dimmer */}
            { (t.i >= (smDist.reduce((a,b)=>a+b,0) - 2)) && size[0] && (
              <group position={[0,0.04,0] as any} userData={{ testId: `disabled-hint-${t.i}` }} />
            )}
          </group>
        )
      })}
      {dualDie && (
        <>
          <group userData={{ testId: "interposer-plate" }} position={[0,-0.05,0] as any}><mesh><boxGeometry args={[size[0]*1.12,0.05,size[2]*1.12] as any} /><meshStandardMaterial color={palette.interposerPlate ?? "#111"} /></mesh></group>
          <group userData={{ testId: "nvlink-bridge-pulse" }} position={[0,0.08,0] as any}><mesh><boxGeometry args={[0.24,0.06,size[2]*0.5] as any} /><meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkPulse} emissiveIntensity={0.6} /></mesh></group>
          <group userData={{ testId: "c2c-bump" }} position={[0,-0.02,0] as any}><mesh><cylinderGeometry args={[0.05,0.05,0.04,9] as any} /><meshStandardMaterial color={palette.goldContact} /></mesh></group>
        </>
      )}
    </group>
  )
}
