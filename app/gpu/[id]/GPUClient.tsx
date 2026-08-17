'use client'
import { useEffect, useMemo, useState } from 'react'
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
  const illuminated = (ids:string[])=> ids.some(id=> workloadActiveIds.includes(id)) || (selected && ids.includes(selected))

  return (
    <group scale={[scale,scale,scale]} userData={{ testId: 'exterior-group' }}>
      <RoundedBox args={spec.boardSize as any} radius={0.08} userData={{ testId: 'board-mesh' }}>
        <meshStandardMaterial color={palette.board} emissive="#2a4a30" emissiveIntensity={illuminated(['board','structure'])?0.78:0.25} />
      </RoundedBox>
      <RoundedBox args={[spec.boardSize[0]-0.12,0.1,spec.boardSize[2]-0.12] as any} radius={0.13} smoothness={3} position={[0,0.13,0]} userData={{ testId: 'board-inner' }}>
        <meshStandardMaterial color={palette.boardInner} metalness={0.18} roughness={0.76} />
      </RoundedBox>

      <group userData={{ testId: 'power-stages-left' }}>
        {spec.leftPowerStages.map((pos,i)=>(
          <group key={`l-${i}`} position={[pos[0],0.18,pos[1]] as any} userData={{ testId: `power-l-${i}` }}>
            <mesh userData={{ testId: `vrm-l-${i}` }}><boxGeometry args={[0.18,0.08,0.14]} /><meshStandardMaterial color={palette.powerDark} /></mesh>
            <mesh position={[0,0.06,0]} userData={{ testId: `cap-l-${i}` }}><boxGeometry args={[0.08,0.06,0.08]} /><meshStandardMaterial color={palette.capacitor} /></mesh>
          </group>
        ))}
      </group>
      <group userData={{ testId: 'power-stages-right' }}>
        {spec.rightPowerStages.map((pos,i)=>(
          <group key={`r-${i}`} position={[pos[0],0.18,pos[1]] as any} userData={{ testId: `power-r-${i}` }}>
            <mesh userData={{ testId: `vrm-r-${i}` }}><boxGeometry args={[0.18,0.08,0.14]} /><meshStandardMaterial color={palette.powerAlt} /></mesh>
          </group>
        ))}
      </group>

      <group userData={{ testId: 'mounting-holes-group' }}>
        <MountingHoles positions={spec.mountingHoles as any} />
      </group>

      <group userData={{ testId: 'side-contacts' }}>
        {spec.sideContacts.map((z,i)=>(
          <group key={i} position={[0,0,0] as any} userData={{ testId: `contact-${i}` }}>
            <mesh position={[spec.boardSize[0]/2-0.08,0.08,z*0.16 as any] as any} userData={{ testId: `contact-mesh-${i}` }}>
              <boxGeometry args={[0.04,0.02,0.12]} />
              <meshStandardMaterial color={palette.goldContact} metalness={0.8} roughness={0.3} emissive={illuminated(['interconnect','structure'])?palette.interconnect:"black"} emissiveIntensity={illuminated(['interconnect'])?0.3:0} />
            </mesh>
          </group>
        ))}
      </group>

      <group userData={{ testId: 'top-clamps' }}>
        {spec.topClampPositions.map((x,i)=>(
          <group key={i} position={[x,0.24,0] as any} userData={{ testId: `clamp-${i}` }}>
            <mesh userData={{ testId: `clamp-mesh-${i}` }}><boxGeometry args={[0.22,0.06,0.52]} /><meshStandardMaterial color={palette.clamp} /></mesh>
            <mesh position={[0,0.05,0]} userData={{ testId: `clamp-top-${i}` }}><boxGeometry args={[0.2,0.03,0.48]} /><meshStandardMaterial color={palette.clampTop} /></mesh>
          </group>
        ))}
      </group>

      <group position={spec.packageOffset as any} userData={{ testId: 'package-group' }}>
        <RoundedBox args={spec.packageSize as any} radius={0.05} userData={{ testId: 'package-mesh' }}>
          <meshStandardMaterial color={palette.package} emissive="#1d2a1e" emissiveIntensity={illuminated(['package','structure'])?0.55:0.15} />
        </RoundedBox>
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

      {spec.packageSites.filter((s:any)=>s.kind==='memory').map((site:any,i:number)=>(
        <group key={i} position={[(site.position[0])*2.2,0.28,(site.position[1])*1.6] as any} userData={{ testId: `hbm-site-${i}` }}>
          <group position={[(site.position[0])*0.2, -0.06, (site.position[1])*0.1] as any} userData={{ testId: `hbm-trace-${i}` }}>
            <mesh userData={{ testId: `trace-mesh-${i}` }}>
              <boxGeometry args={[0.28,0.01,0.02]} />
              <meshStandardMaterial color={palette.trace} />
            </mesh>
          </group>
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

function InspectorPanel({ specId, selected }: { specId: string, selected: any }){
  const spec = getSpecSafe(specId) as any
  if(!selected) return null
  const isGpcSel = typeof selected === 'string' && selected.startsWith('gpc')
  const gpcIdx = isGpcSel ? parseInt(selected.replace('gpc-','').replace('gpc','')) : NaN
  const hasGpcIdx = !isNaN(gpcIdx)
  const isSm = selected==='sm' || (typeof selected==='string' && selected.startsWith('sm-')) || selected==='tensor-core' || selected==='cuda-core' || selected==='tma'
  let title = selected
  let body: string[] = []
  if(hasGpcIdx && spec?.smCountsPerGpc){
    const smIn = spec.smCountsPerGpc[gpcIdx] ?? spec.smPerGpc
    title = `GPC ${gpcIdx}`
    body = [`${smIn} SMs (visual shows up to 6)`, `Part of ${spec.gpcCount} GPCs`, `Total ${spec.smCount} enabled SMs`]
    if(spec.id==='h100-sxm5') body.push('132 active / 144 full GH100, per-GPC dist illustrative')
  } else if(selected==='gpc'){
    title = `${spec?.gpcCount ?? 8} GPCs`
    body = [`${spec?.smCount} enabled SMs; per-GPC distribution illustrative`, 'Click GPC to inspect']
  } else if(isSm){
    const smIdxInfo = typeof selected==='string' && selected.includes('-') ? selected : null
    title = smIdxInfo ? `SM ${smIdxInfo}` : 'Streaming Multiprocessor'
    body = ['Warp scheduler, 32 threads', 'Tensor Core + CUDA Core + TMA', spec?.id==='h100-sxm5' ? 'Hopper SM: 4th gen Tensor' : 'SM class']
  } else if(selected==='tensor-core'){
    title='Tensor Core'; body=['Matrix multiply-accumulate','FP8/FP16/BF16']
  } else if(selected==='cuda-core'){
    title='CUDA Core'; body=['FP32/FP64 general','SIMT']
  } else if(selected==='tma'){
    title='Tensor Memory Accelerator'; body=['Async bulk copy','GMEM→SMEM']
  } else {
    title = String(selected); body = ['Selected component']
  }
  return (
    <div className="absolute bottom-2 right-2 max-w-[220px] text-[11px] font-mono bg-black/75 border border-[#7fee64]/25 rounded px-2 py-2 backdrop-blur-sm pointer-events-none max-md:max-w-[160px] max-md:text-[10px]" data-testid="arch-inspector">
      <div className="text-[#d8f9d9] font-bold mb-1">{title}</div>
      <div className="text-white/60 leading-[1.3] space-y-0.5">
        {body.map((b,i)=><div key={i}>{b}</div>)}
      </div>
    </div>
  )
}

function ArchitectureExploded({ specId, selected, dimOthers, workloadActiveIds }: { specId:string, selected:any, dimOthers:boolean, workloadActiveIds:string[] }){
  const spec = getSpecSafe(specId) as GPUSpec | null
  const setSelected = useViewerStore(s=> s.setSelected)
  const [compact, setCompact] = useState(false)
  useEffect(()=>{
    const query = window.matchMedia('(max-width: 767px)')
    const update = ()=> setCompact(query.matches)
    update()
    query.addEventListener?.('change', update)
    return ()=> query.removeEventListener?.('change', update)
  },[])
  if(!spec) return null
  const gpcCount = spec.gpcCount ?? 8
  const smCounts = spec.smCountsPerGpc ?? Array.from({length:gpcCount},()=> spec.smPerGpc ?? 18)
  const totalSm = spec.smCount ?? smCounts.reduce((a,b)=>a+b,0)
  // Correct non-misleading summary – task requires this exact phrasing
  const archSummary = `${gpcCount} GPCs; ${totalSm} enabled SMs; per-GPC distribution illustrative`

  // Fixed scale 1.2, centered at origin, no boardSize driver
  const ARCH_SCALE = 1.2
  const showSmDetail = selected && (
    selected==='sm' ||
    selected==='tensor-core' ||
    selected==='cuda-core' ||
    selected==='tma' ||
    (typeof selected==='string' && (selected.startsWith('sm-') || selected.startsWith('gpc-')))
  )

  return (
    <group userData={{ testId: 'architecture-exploded' }} scale={[ARCH_SCALE,ARCH_SCALE,ARCH_SCALE]} position={[0,0.15,0] as any}>
      {/* Single concise summary at top, centered, pointerEvents none – exact phrasing required */}
      <group userData={{ testId: 'arch-summary' }} position={[0,2.4,0] as any}>
        <Html center position={[0,0,0]} style={{pointerEvents:'none'}} zIndexRange={[10,0]}>
          <div className="text-[12px] font-mono text-white/85 bg-black/80 px-3 py-1.5 rounded border border-[#7fee64]/30 backdrop-blur-sm whitespace-nowrap max-md:text-[11px] max-md:whitespace-normal max-md:max-w-[320px] max-md:text-center">
            {archSummary}
            {spec.id==='h100-sxm5' ? ' — GH100 full 144, H100 SXM5 132 active' : ''}
            <span className="text-white/50 ml-2">Conceptual count-based – not physical floorplan</span>
          </div>
        </Html>
      </group>
      {Array.from({length:gpcCount}).map((_,gpcIdx)=>{
        const smInGpc = smCounts[gpcIdx] ?? spec.smPerGpc ?? 18
        const isGpcActive = selected==='gpc' || selected===`gpc-${gpcIdx}` || (typeof selected==='string' && selected===`gpc-${gpcIdx}`) || workloadActiveIds.includes('gpc')
        const columns = compact ? 2 : 4
        const x = ((gpcIdx%columns)-(columns-1)/2)*1.85
        const z = (Math.floor(gpcIdx/columns)-(compact?1.5:0.5))*(compact?1.25:1.7)
        return (
          <group
            key={gpcIdx}
            position={[x, 0, z] as any}
            userData={{ testId: `gpc-${gpcIdx}` }}
            onClick={(event:any)=>{ event.stopPropagation(); setSelected(`gpc-${gpcIdx}`) }}
            onPointerOver={(event:any)=>{ event.stopPropagation(); document.body.style.cursor='pointer' }}
            onPointerOut={()=>{ document.body.style.cursor='default' }}
          >
            <RoundedBox args={[1.42,0.22,0.96] as any} radius={0.06} userData={{ testId: `gpc-box-${gpcIdx}` }}>
              <meshStandardMaterial color={palette.gpc} emissive={isGpcActive?palette.compute:"black"} emissiveIntensity={isGpcActive?0.65:0} transparent={dimOthers} opacity={dimOthers && !workloadActiveIds.includes('gpc') && selected!=='gpc' && selected!==`gpc-${gpcIdx}`?0.28:0.96} />
            </RoundedBox>
            {/* GPC label only – distanceFactor 6 per spec */}
            <group userData={{ testId: `gpc-label-${gpcIdx}` }} position={[0,0.26,0] as any}>
              <Html center position={[0,0,0]} style={{pointerEvents:'none'}} distanceFactor={6} occlude={false}>
                <div className="text-[11px] font-mono text-white/80 bg-black/60 px-1.5 py-0.5 rounded whitespace-nowrap border border-white/10">
                  GPC{gpcIdx} {smInGpc} SM
                </div>
              </Html>
            </group>
            {/* SM detail only when selected/zoomed to avoid overlap */}
            {showSmDetail && (
              <group userData={{ testId: `sm-detail-group-${gpcIdx}` }}>
                {Array.from({length: Math.min(smInGpc, 6)}).map((_,smIdx)=>{
                  const tcActive = selected==='tensor-core' || selected==='cuda-core' || selected==='tma' || selected===`sm-${gpcIdx}-${smIdx}` || workloadActiveIds.includes('tensor-core')
                  return (
                    <group key={smIdx} position={[(smIdx%2-0.5)*0.58,0.20,(Math.floor(smIdx/2)-0.5)*0.36] as any} userData={{ testId: `sm-${gpcIdx}-${smIdx}` }}>
                      <RoundedBox args={[0.46,0.14,0.34] as any} radius={0.02} userData={{ testId: `sm-box-${gpcIdx}-${smIdx}` }}>
                        <meshStandardMaterial color="#1a3a20" emissive={tcActive?palette.compute:"black"} emissiveIntensity={tcActive?0.5:0} transparent={dimOthers} opacity={0.92} />
                      </RoundedBox>
                      {(selected==='tensor-core' || selected==='cuda-core' || selected==='tma') && (
                        <group position={[0,0.12,0] as any} userData={{ testId: `group-tc-cc-tma-${gpcIdx}-${smIdx}` }}>
                          <mesh position={[-0.14,0,0] as any} userData={{ testId: `tensor-core-${gpcIdx}-${smIdx}` }}>
                            <boxGeometry args={[0.13,0.05,0.11] as any} />
                            <meshStandardMaterial color={palette.compute} emissive={selected==='tensor-core'?palette.compute:"black"} emissiveIntensity={0.45} />
                          </mesh>
                          <mesh position={[0,0,0] as any} userData={{ testId: `cuda-core-${gpcIdx}-${smIdx}` }}>
                            <boxGeometry args={[0.13,0.05,0.11] as any} />
                            <meshStandardMaterial color="#aaddaa" emissive={selected==='cuda-core'?palette.interaction:"black"} emissiveIntensity={0.25} />
                          </mesh>
                          <mesh position={[0.14,0,0] as any} userData={{ testId: `tma-${gpcIdx}-${smIdx}` }}>
                            <boxGeometry args={[0.11,0.05,0.1] as any} />
                            <meshStandardMaterial color={palette.interconnect} emissive={selected==='tma'?palette.interconnect:"black"} emissiveIntensity={0.55} />
                          </mesh>
                        </group>
                      )}
                    </group>
                  )
                })}
                {smInGpc>6 && (
                  <group position={[0.68,0,0] as any} userData={{ testId: `more-sm-${gpcIdx}` }}>
                    <Html position={[0,0.22,0] as any} center style={{pointerEvents:'none'}}><div className="text-[10px] text-white/45 whitespace-nowrap">+{smInGpc-6} more</div></Html>
                  </group>
                )}
              </group>
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
          <group position={[0,1.2,0] as any} userData={{ testId: 'nvlink-group' }}>
            <group userData={{ testId: 'nvlink-bridge' }}>
              <RoundedBox args={[1.2,0.12,0.6] as any} radius={0.03} userData={{ testId: 'nvlink-mesh' }}><meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkPulse} emissiveIntensity={workloadActiveIds.includes('nvlink')?0.9:0.7} transparent opacity={dimOthers && !workloadActiveIds.includes('nvlink') && selected!=='nvlink'?0.18:1} /></RoundedBox>
            </group>
            <group userData={{ testId: 'nvlink-label' }} position={[0,0.22,0] as any}><Html center position={[0,0,0] as any}><div className="text-[12px] font-mono text-[#7fee64] bg-black/50 px-1 rounded">{spec?.nvlinkBW_TBs ? `${spec.nvlinkBW_TBs}TB/s NVLink` : (isH100?'900GB/s':'1.8TB/s per GPU')}</div></Html></group>
          </group>
          {(specId==='blackwell-gb200' || specId==='h100-sxm5' ? true : false) && (
            <group position={[0,2,0] as any} userData={{ testId: 'superchip-group' }}>
              <group userData={{ testId: 'superchip-wireframe' }}><mesh userData={{ testId: 'superchip-box' }}><boxGeometry args={[5,0.3,3] as any} /><meshStandardMaterial color="#0a2010" wireframe /></mesh></group>
              <group position={[0,0.25,0] as any} userData={{ testId: 'superchip-label' }}>
                <Html center position={[0,0,0] as any} style={{pointerEvents:'auto'}}>
                  <div className="text-[12px] font-mono text-white/80 bg-black/60 px-2 py-1 rounded pointer-events-auto">
                    {specId==='blackwell-gb200' ? 'Superchip: 1 Grace 72c +2 Blackwell (372GB usable) 16TB/s mem 3.6TB/s NVLink 900GB/s C2C — conceptual' : 'H100: NVLink switch scale – 4 GPUs example'}
                  </div>
                </Html>
              </group>
            </group>
          )}
          {!isRackCapable_ && rackView && (
            <group position={[0,2.6,0] as any} userData={{ testId: 'rack-na-group' }}><Html center position={[0,0,0] as any}><div className="text-[12px] font-mono text-amber-200 bg-black/70 px-2 py-1 border border-amber-500/30 rounded">Rack view only for GB200 NVL72 and Vera Rubin NVL72 official – current {specId} has no official rack</div></Html></group>
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
  const [provOpen, setProvOpen] = useState(false)

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

  useEffect(()=>{
    if(!selected) return
    const def = partDefs.find((p:any)=> p.id===selected)
    if(def && def.view && def.view!==view){
      setView(def.view as any)
    }
  },[selected, setView, view])

  useEffect(()=>{
    useViewerStore.getState().setCurrentGPU(specId)
  },[specId])

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
            {isArch && (
              <div data-testid="arch-summary" className="basis-full text-[11px] md:text-[12px] font-mono text-white/65 leading-tight pb-0.5">
                {spec.gpcCount ?? 8} GPCs · {spec.smCount ?? '—'} enabled SMs · per-GPC distribution illustrative · conceptual count-based layout
                {spec.id==='h100-sxm5' ? ' · full GH100 144 / H100 SXM5 132 active' : ''}
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <SceneViewport isRack={rackView && isSystem && canRack} fallbackLabel={spec.label.toUpperCase()}>
              {!isArch && !isSystem && <BoardGroup specId={specId} selected={selected} dimOthers={dimOthers} workloadActiveIds={workloadActiveIds} view={view} />}
              {isArch && <ArchitectureExploded specId={specId} selected={selected} dimOthers={dimOthers} workloadActiveIds={workloadActiveIds} />}
              {isSystem && <SystemView specId={specId} rackView={rackView} selected={selected} dimOthers={dimOthers} workloadActiveIds={workloadActiveIds} />}
            </SceneViewport>

            <div className="hidden md:flex absolute top-2 left-2 flex-col gap-1 max-w-[70%] pointer-events-auto z-10" data-testid="provenance-bar">
              {spec.provenance?.slice(0,4).map((p:any,i:number)=>(
                <a key={i} href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-[12px] font-mono px-2 py-1 rounded bg-black/70 border pointer-events-auto inline-flex items-center gap-1 hover:underline" style={{borderColor: p.status==='official'?'#7fee64': p.status==='speculative'?'#ff7e64':'#0ec7ff', color: p.status==='official'?'#7fee64': p.status==='speculative'?'#ff8a6b':'#0ec7ff', zIndex:10}} data-testid={`provenance-badge-${p.field}`}>
                  <span>{p.field} {p.value}{p.unit?` ${p.unit}`:''}</span><span className="text-[10px] opacity-80">{p.status}</span><span className="text-[10px] opacity-60">{p.asOf}</span><span className="text-[10px] underline">src↗</span>
                </a>
              ))}
            </div>
            <div className="md:hidden absolute top-2 left-2 z-10 pointer-events-auto">
              <button type="button" data-testid="provenance-toggle" onClick={()=> setProvOpen(v=>!v)} className="text-[12px] font-mono bg-black/70 border border-[#7fee64]/25 text-[#7fee64]/80 px-2 py-1 rounded">Sources ({spec.provenance?.length ?? 0})</button>
              {provOpen && (
                <div className="mt-1 flex flex-col gap-1 max-w-[85vw] bg-black/80 p-1 rounded border border-white/10" data-testid="provenance-sheet">
                  {spec.provenance?.slice(0,6).map((p:any,i:number)=>(
                    <a key={i} href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-[12px] font-mono px-2 py-1 rounded bg-black/70 border inline-flex items-center gap-1" style={{borderColor:'#7fee64'}}>{p.field} {p.value}{p.unit?` ${p.unit}`:''} <span className="text-[10px] opacity-70">{p.status}</span></a>
                  ))}
                </div>
              )}
            </div>

            {rackView && isSystem && canRack && <RackStats specId={specId} />}

            {!canRack && rackView && isSystem && (
              <div data-testid="rack-na-notice" className="absolute bottom-14 left-2 text-[12px] font-mono text-amber-200 bg-black/70 border border-amber-500/30 px-2 py-1 rounded">
                Rack mode not applicable to {specId} – official racks: GB200 NVL72 (72 GPUs 36 Grace) / Vera Rubin NVL72 (expected)
              </div>
            )}

            <ConditionIndicators selected={selected} />
            {isArch && <InspectorPanel specId={specId} selected={selected} />}
            <div className="absolute bottom-2 right-2 text-[12px] font-mono text-white/50 pointer-events-none" data-testid="stage-status">MODEL READY – {view.toUpperCase()} {rackView && isSystem && canRack ? '| RACK' : '| MODULE'}</div>
          </div>
          <MobileBar />
          <HelpPanel />
        </div>
      </div>
    </div>
  )
}
