'use client'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { SceneViewport } from '@/components/scene/SceneViewport'
import { getSpecSafe, partDefs, workloadOverlays, superchips, racks } from '@/lib/definitions'
import type { GPUSpec } from '@/lib/definitions/types'
import { palette } from '@/lib/materials/palette'
import { useViewerStore } from '@/store/useViewerStore'
import { DieTileGrid } from '@/components/gpu/DieTileGrid'
import { HBMStack } from '@/components/gpu/HBMStack'
import { MountingHoles } from '@/components/gpu/MountingHole'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { ComponentIndex } from '@/components/ui/ComponentIndex'
import { MobileBar } from '@/components/ui/MobileBar'
import { HelpPanel } from '@/components/ui/HelpPanel'
import { GPUSelector } from '@/components/ui/GPUSelector'
import { NVL72Rack, RackStats } from '@/components/rack/NVL72Rack'
import { RoundedBox, Html } from '@react-three/drei'

// ---------- helpers ----------
function isRackCapable(specId: string): boolean {
  // Officially only GB200 NVL72 is official 72-rack product; Vera Rubin NVL72 (R100) also qualifies
  return specId === 'blackwell-gb200' || specId === 'rubin-r100'
}

function BoardGroup({ specId, selected, dimOthers, workloadActiveIds, view }: { specId:string, selected:any, dimOthers:boolean, workloadActiveIds:string[], view:any }){
  const spec = getSpecSafe(specId) as GPUSpec | null
  if(!spec) return null
  const scale = 3.9 / (spec.boardSize[0])
  const isMemoryActive = (p:string)=> selected==='gpu-ram' || selected==='board' || selected==='package' ? false : workloadActiveIds.includes('gpu-ram')
  const illuminated = (ids:string[])=> ids.some(id=> workloadActiveIds.includes(id)) || (selected && ids.includes(selected))

  return (
    <group scale={[scale,scale,scale]} data-testid="exterior-group">
      {/* Board base */}
      <RoundedBox args={spec.boardSize as any} radius={0.08} data-testid="board-mesh">
        <meshStandardMaterial color={palette.board} emissive="#2a4a30" emissiveIntensity={illuminated(['board','structure'])?0.78:0.25} />
      </RoundedBox>
      <RoundedBox args={[spec.boardSize[0]-0.12,0.1,spec.boardSize[2]-0.12] as any} radius={0.13} smoothness={3} position={[0,0.13,0]} data-testid="board-inner">
        <meshStandardMaterial color={palette.boardInner} metalness={0.18} roughness={0.76} />
      </RoundedBox>

      {/* Power delivery / VRM restored */}
      <group data-testid="power-stages-left">
        {spec.leftPowerStages.map((pos,i)=>(
          <group key={`l-${i}`} position={[pos[0],0.18,pos[1]] as any}>
            <mesh><boxGeometry args={[0.18,0.08,0.14]} /><meshStandardMaterial color={palette.powerDark} /></mesh>
            <mesh position={[0,0.06,0]}><boxGeometry args={[0.08,0.06,0.08]} /><meshStandardMaterial color={palette.capacitor} /></mesh>
          </group>
        ))}
      </group>
      <group data-testid="power-stages-right">
        {spec.rightPowerStages.map((pos,i)=>(
          <group key={`r-${i}`} position={[pos[0],0.18,pos[1]] as any}>
            <mesh><boxGeometry args={[0.18,0.08,0.14]} /><meshStandardMaterial color={palette.powerAlt} /></mesh>
          </group>
        ))}
      </group>

      {/* Mounting holes restored */}
      <group data-testid="mounting-holes-group">
        <MountingHoles positions={spec.mountingHoles as any} />
      </group>

      {/* Side gold contacts */}
      <group data-testid="side-contacts">
        {spec.sideContacts.map((z,i)=>(
          <mesh key={i} position={[spec.boardSize[0]/2-0.08,0.08,z*0.16 as any] as any}>
            <boxGeometry args={[0.04,0.02,0.12]} />
            <meshStandardMaterial color={palette.goldContact} metalness={0.8} roughness={0.3} emissive={illuminated(['interconnect','structure'])?palette.interconnect:"black"} emissiveIntensity={illuminated(['interconnect'])?0.3:0} />
          </mesh>
        ))}
      </group>

      {/* Top clamps */}
      <group data-testid="top-clamps">
        {spec.topClampPositions.map((x,i)=>(
          <group key={i} position={[x,0.24,0] as any}>
            <mesh><boxGeometry args={[0.22,0.06,0.52]} /><meshStandardMaterial color={palette.clamp} /></mesh>
            <mesh position={[0,0.05,0]}><boxGeometry args={[0.2,0.03,0.48]} /><meshStandardMaterial color={palette.clampTop} /></mesh>
          </group>
        ))}
      </group>

      {/* Package */}
      <group position={spec.packageOffset as any} data-testid="package-group">
        <RoundedBox args={spec.packageSize as any} radius={0.05} data-testid="package-mesh">
          <meshStandardMaterial color={palette.package} emissive="#1d2a1e" emissiveIntensity={illuminated(['package','structure'])?0.55:0.15} />
        </RoundedBox>
        {/* Die tiles driven by spec */}
        <DieTileGrid
          columns={spec.dieTileColumns}
          rows={spec.dieTileRows}
          size={spec.dieSize as any}
          active={selected as any}
          dualDie={(spec as any).dualDie}
          dimOthers={dimOthers}
          gpcCount={spec.gpcCount}
          smCountsPerGpc={spec.smCountsPerGpc as any}
          selectedPart={selected}
          workloadActiveIds={workloadActiveIds}
        />
      </group>

      {/* HBM stacks with traces */}
      {spec.packageSites.filter((s:any)=>s.kind==='memory').map((site:any,i:number)=>(
        <group key={i} position={[(site.position[0])*2.2,0.28,(site.position[1])*1.6] as any} data-testid="hbm-site-${i}">
          {/* trace line */}
          <mesh position={[(site.position[0])*0.2, -0.06, (site.position[1])*0.1] as any}>
            <boxGeometry args={[0.28,0.01,0.02]} />
            <meshStandardMaterial color={palette.trace} />
          </mesh>
          <HBMStack
            position={[0,0,0] as any}
            version={(spec as any).hbm.version}
            totalGB={(spec as any).hbm.gbPerStack}
            capacityGB={(spec as any).hbm.totalGB}
            active={selected==='gpu-ram' || workloadActiveIds.includes('gpu-ram')}
            dimOthers={dimOthers && !workloadActiveIds.includes('gpu-ram')}
            workloadActive={workloadActiveIds.includes('gpu-ram')}
          />
        </group>
      ))}
    </group>
  )
}

function ArchitectureExploded({ specId, selected, dimOthers, workloadActiveIds }: { specId:string, selected:any, dimOthers:boolean, workloadActiveIds:string[] }){
  const spec = getSpecSafe(specId) as GPUSpec | null
  if(!spec) return null
  const scale = 3.9 / (spec.boardSize[0])
  const gpcCount = spec.gpcCount ?? 8
  const smCounts = spec.smCountsPerGpc ?? Array.from({length:gpcCount},()=> spec.smPerGpc ?? 18)
  // compute total to validate vs smCount
  const totalSm = smCounts.reduce((a,b)=>a+b,0)
  const label = `${gpcCount} GPCs × ${spec.smPerGpc ?? Math.round(totalSm/gpcCount)} SM avg = ${spec.smCount ?? totalSm} SMs (${spec.id==='h100-sxm5'?'132 active / 144 full GH100':''})`

  return (
    <group data-testid="architecture-exploded" scale={[scale,scale,scale]}>
      <Html center position={[0,2.2,0]} style={{pointerEvents:'none'}}>
        <div className="text-[12px] font-mono text-white/70 bg-black/70 px-2 py-1 rounded border border-[#7fee64]/20">{label} – GPC→SM→Tensor/CUDA/TMA driven by spec</div>
      </Html>
      {Array.from({length:gpcCount}).map((_,gpcIdx)=>{
        const smInGpc = smCounts[gpcIdx] ?? spec.smPerGpc ?? 18
        // we will display up to 6 visual SM boxes per GPC to keep scene legible, but label true count
        const visualSm = Math.min(smInGpc, 6)
        const active = selected==='gpc' || selected==='sm' || workloadActiveIds.includes('gpc')
        const x = ((gpcIdx%4)-1.5)*1.8
        const z = (Math.floor(gpcIdx/4)-0.5)*1.6
        return (
          <group key={gpcIdx} position={[x, gpcIdx*0.08, z] as any} data-testid="gpc-${gpcIdx}">
            <RoundedBox args={[1.35,0.2,0.9] as any} radius={0.05}>
              <meshStandardMaterial color={palette.gpc} emissive={active?palette.compute:"black"} emissiveIntensity={active?0.6:0} transparent={dimOthers} opacity={dimOthers && !workloadActiveIds.includes('gpc') && selected!=='gpc'?0.25:0.95} />
            </RoundedBox>
            <Html center position={[0,0.22,0]} style={{pointerEvents:'none'}}>
              <div className="text-[10px] font-mono text-white/60 bg-black/40 px-1 rounded">GPC{gpcIdx} {smInGpc}SM</div>
            </Html>
            {Array.from({length:visualSm}).map((_,smIdx)=>{
              const trueIdx = smIdx
              const tcActive = selected==='tensor-core' || selected==='cuda-core' || selected==='tma' || workloadActiveIds.includes('tensor-core')
              return (
                <group key={smIdx} position={[(smIdx%2-0.5)*0.55,0.18,(Math.floor(smIdx/2)-0.5)*0.34] as any} data-testid="sm-${gpcIdx}-${trueIdx}">
                  <RoundedBox args={[0.44,0.13,0.32] as any} radius={0.02}>
                    <meshStandardMaterial color="#1a3a20" emissive={tcActive?palette.compute:"black"} emissiveIntensity={tcActive?0.5:0} transparent={dimOthers} opacity={dimOthers && !workloadActiveIds.includes('sm') && selected!=='sm'?0.22:0.9} />
                  </RoundedBox>
                  <group position={[0,0.11,0] as any} data-testid="group-tc-cc-tma-${gpcIdx}-${smIdx}">
                    <mesh position={[-0.13,0,0] as any} data-testid="tensor-core-${gpcIdx}-${smIdx}">
                      <boxGeometry args={[0.13,0.05,0.11] as any} />
                      <meshStandardMaterial color={palette.compute} emissive={selected==='tensor-core' || workloadActiveIds.includes('tensor-core')?palette.compute:"black"} emissiveIntensity={0.4} />
                    </mesh>
                    <mesh position={[0,0,0] as any} data-testid="cuda-core-${gpcIdx}-${smIdx}">
                      <boxGeometry args={[0.13,0.05,0.11] as any} />
                      <meshStandardMaterial color="#aaddaa" emissive={selected==='cuda-core'?palette.interaction:"black"} emissiveIntensity={0.2} />
                    </mesh>
                    <mesh position={[0.13,0,0] as any} data-testid="tma-${gpcIdx}-${smIdx}">
                      <boxGeometry args={[0.11,0.05,0.1] as any} />
                      <meshStandardMaterial color={palette.interconnect} emissive={selected==='tma' || workloadActiveIds.includes('tma')?palette.interconnect:"black"} emissiveIntensity={0.5} transparent opacity={dimOthers && !workloadActiveIds.includes('tma') && selected!=='tma'?0.25:1} />
                    </mesh>
                  </group>
                </group>
              )
            })}
            {smInGpc>visualSm && (
              <Html position={[0.6,0.18,0] as any} center><div className="text-[10px] text-white/40">+{smInGpc-visualSm} more SMs</div></Html>
            )}
          </group>
        )
      })}
    </group>
  )
}

function SystemView({ specId, rackView, selected, dimOthers, workloadActiveIds }: any){
  const isH100 = specId==='h100-sxm5'
  const spec = getSpecSafe(specId)
  const isRackCapable_ = isRackCapable(specId)
  const effectiveRack = rackView && isRackCapable_
  return (
    <group userData={{ testId: "system-view" }}>
      {!effectiveRack ? (
        <>
          <BoardGroup specId={specId} selected={selected} dimOthers={dimOthers} workloadActiveIds={workloadActiveIds} view="system" />
          <group position={[0,1.2,0] as any} data-testid="nvlink-group">
            <RoundedBox args={[1.2,0.12,0.6] as any} radius={0.03}><meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkPulse} emissiveIntensity={workloadActiveIds.includes('nvlink')?0.9:0.7} transparent opacity={dimOthers && !workloadActiveIds.includes('nvlink') && selected!=='nvlink'?0.18:1} /></RoundedBox>
            <Html center position={[0,0.22,0] as any}><div className="text-[12px] font-mono text-[#7fee64] bg-black/50 px-1 rounded">{spec?.nvlinkBW_TBs ? `${spec.nvlinkBW_TBs}TB/s NVLink` : (isH100?'900GB/s':'1.8TB/s per GPU')}</div></Html>
          </group>
          {(specId==='blackwell-gb200' || specId==='h100-sxm5' ? true : false) && (
            <group position={[0,2,0] as any} data-testid="superchip-group">
              <mesh><boxGeometry args={[5,0.3,3] as any} /><meshStandardMaterial color="#0a2010" wireframe /></mesh>
              <Html center position={[0,0.25,0] as any} style={{pointerEvents:'auto'}}>
                <div className="text-[12px] font-mono text-white/80 bg-black/60 px-2 py-1 rounded pointer-events-auto">
                  {specId==='blackwell-gb200' ? 'Superchip: 1 Grace 72c +2 Blackwell 384 raw 372 usable 16TB/s 3.6TB/s NVL 900GB/s C2C' : 'H100: NVLink switch scale – 4 GPU optional'}
                </div>
              </Html>
            </group>
          )}
          {!isRackCapable_ && rackView && (
            <Html center position={[0,2.6,0] as any}><div className="text-[12px] font-mono text-amber-200 bg-black/70 px-2 py-1 border border-amber-500/30 rounded">Rack view only for GB200 NVL72 and Vera Rubin NVL72 official – current {specId} has no official rack</div></Html>
          )}
        </>
      ) : (<NVL72Rack specId={specId} workloadActiveIds={workloadActiveIds} selected={selected} />)}
    </group>
  )
}

function ConditionIndicators({selected}:{selected:any}){
  const userInteracted = useViewerStore(s=> s.userInteracted)
  if(!userInteracted && !selected) return <div className="absolute top-2 right-2 text-[12px] font-mono text-[#7fee64]/70 border border-[#7fee64]/20 bg-black/60 px-2 py-1 rounded" data-testid="drag-indicator">DRAG TO BEGIN</div>
  if(selected) return <div className="absolute top-12 right-2 text-[12px] font-mono text-white/70 border border-white/20 bg-black/50 px-2 py-1 rounded" data-testid="esc-indicator">ESC TO CLEAR (press Escape)</div>
  return null
}

export default function GPUClient({ specId }: { specId:string }){
  const view = useViewerStore(s=> s.view)
  const searchParams = useSearchParams()
  const queryView = searchParams?.get('view') as any
  const rackView = useViewerStore(s=> s.rackView)
  const selected = useViewerStore(s=> s.selected)
  const setView = useViewerStore(s=> s.setView)
  const clearSelection = useViewerStore(s=> s.clearSelection)
  const workload = useViewerStore(s=> s.workload)
  const workloadActiveIds = workload ? (workloadOverlays as any)[workload]?.illuminates ?? [] : []
  const dimOthers = !!workload && workloadActiveIds.length>0
  const spec = getSpecSafe(specId) as GPUSpec | null

  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{ if(e.key==='Escape'){ clearSelection(); } }
    window.addEventListener('keydown', handler)
    return ()=> window.removeEventListener('keydown', handler)
  },[clearSelection])
  useEffect(()=>{
    if(queryView && ['exterior','architecture','system'].includes(queryView) && queryView!==view){
      useViewerStore.getState().setView(queryView)
    }
  },[queryView, view])

  // Auto switch view based on selected part
  useEffect(()=>{
    if(!selected) return
    const def = partDefs.find((p:any)=> p.id===selected)
    if(def && def.view && def.view!==view){
      setView(def.view as any)
    }
  },[selected, setView, view])

  if(!spec) return <div className="p-6 text-white">Spec not found</div>
  const isArch = view==='architecture'; const isSystem = view==='system'
  const canRack = isRackCapable(specId)

  return (
    <div className="flex flex-col min-h-[420px] border border-[#7fee64]/15 rounded overflow-hidden bg-[#080b09]">
      <GPUSelector />
      <div className="flex min-h-[420px]">
        <ComponentIndex />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2 px-2 py-1 border-b border-[#7fee64]/10 bg-[#090f0a]">
            <div className="text-[12px] font-mono text-[#7fee64] leading-[1.2]">
              <span className="text-[#d8f9d9]">{spec.label}</span> {spec.hbm.count}×{spec.hbm.version.toUpperCase()} {spec.hbm.gbPerStack}GB={spec.hbm.totalGB}GB {spec.dieTileColumns}×{spec.dieTileRows}={spec.dieTileColumns*spec.dieTileRows} {spec.dualDie?'dual-die interposer':''} {spec.speculative?'[speculative]':''}
            </div>
            <ViewToggle />
            {canRack ? (
              <button type="button" data-testid="toggle-rack" onClick={()=> useViewerStore.getState().setRackView(!rackView)} className={`ml-auto text-[12px] px-2 py-1 border rounded ${rackView?'bg-[#7fee64] text-black border-[#7fee64]':'border-[#7fee64]/20 text-[#7fee64]/70'}`}>Module|Rack</button>
            ) : (
              <button type="button" disabled title="Rack only for GB200 NVL72 / Vera Rubin NVL72 official" className="ml-auto text-[12px] px-2 py-1 border rounded border-white/10 text-white/20 cursor-not-allowed">Rack N/A</button>
            )}
            <button type="button" data-testid="reset-view" onClick={()=> useViewerStore.getState().reset()} className="text-[12px] px-2 py-1 border border-[#7fee64]/20 rounded text-white/60 hover:text-white">Reset view</button>
          </div>
          <div className="flex-1 relative">
            <SceneViewport isRack={rackView && isSystem && canRack}>
              {!isArch && !isSystem && <BoardGroup specId={specId} selected={selected} dimOthers={dimOthers} workloadActiveIds={workloadActiveIds} view={view} />}
              {isArch && <ArchitectureExploded specId={specId} selected={selected} dimOthers={dimOthers} workloadActiveIds={workloadActiveIds} />}
              {isSystem && <SystemView specId={specId} rackView={rackView} selected={selected} dimOthers={dimOthers} workloadActiveIds={workloadActiveIds} />}
            </SceneViewport>

            <div className="absolute top-2 left-2 flex flex-col gap-1 max-w-[70%] pointer-events-auto z-10" data-testid="provenance-bar">
              {spec.provenance?.slice(0,4).map((p:any,i:number)=>(
                <a key={i} href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-[12px] font-mono px-2 py-1 rounded bg-black/70 border pointer-events-auto inline-flex items-center gap-1 hover:underline" style={{borderColor: p.status==='official'?'#7fee64': p.status==='speculative'?'#ff7e64':'#0ec7ff', color: p.status==='official'?'#7fee64': p.status==='speculative'?'#ff8a6b':'#0ec7ff', zIndex:10}} data-testid="provenance-badge-${p.field}">
                  <span>{p.field} {p.value}{p.unit?` ${p.unit}`:''}</span><span className="text-[10px] opacity-80">{p.status}</span><span className="text-[10px] opacity-60">{p.asOf}</span><span className="text-[10px] underline">src↗</span>
                </a>
              ))}
            </div>

            {rackView && isSystem && canRack && <RackStats specId={specId} />}

            {!canRack && rackView && isSystem && (
              <div data-testid="rack-na-notice" className="absolute bottom-14 left-2 text-[12px] font-mono text-amber-200 bg-black/70 border border-amber-500/30 px-2 py-1 rounded">
                Rack mode not applicable to {specId} – official racks: GB200 NVL72 (72 GPUs 36 Grace) / Vera Rubin NVL72 (expected)
              </div>
            )}

            <ConditionIndicators selected={selected} />
            <div className="absolute bottom-2 right-2 text-[12px] font-mono text-white/50" data-testid="stage-status">MODEL READY – {view.toUpperCase()} {rackView && isSystem && canRack ? '| RACK' : '| MODULE'}</div>
          </div>
          <MobileBar />
          <HelpPanel />
        </div>
      </div>
    </div>
  )
}
