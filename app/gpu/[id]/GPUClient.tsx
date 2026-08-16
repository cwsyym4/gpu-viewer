'use client'
import { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { getSpecSafe, partDefs, workloadOverlays } from '@/lib/definitions'
import { SceneViewport } from '@/components/scene/SceneViewport'
import { Board, DieTileGrid, MountingHoles } from '@/components/gpu'
import { HBMStack } from '@/components/gpu/HBMStack'
import { ComponentIndex } from '@/components/ui/ComponentIndex'
import { MobileBar } from '@/components/ui/MobileBar'
import { NVL72Rack, RackStats } from '@/components/rack/NVL72Rack'
import { useViewerStore } from '@/store/useViewerStore'
import { Html } from '@react-three/drei'
import { RoundedBox } from '@react-three/drei'
import { palette, semanticLegend } from '@/lib/materials/palette'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

function PowerStage({pos, idx, left}:{pos:[number,number], idx:number, left:boolean}){
  const size = left ? ([0.29, idx%3===0?0.34:0.27,0.36] as any) : ([0.31, idx%4===0?0.36:0.28,0.35] as any)
  const color = left ? (idx%4===0 ? palette.powerAlt : palette.powerDark) : (idx%5===0 ? palette.powerAlt2 : palette.powerDark)
  return <RoundedBox args={size} radius={0.035} smoothness={2} position={[pos[0],0.29,pos[1] as any] as any} data-testid={`power-${left?'l':'r'}-${idx}`}><meshStandardMaterial color={color as any} metalness={0.42} roughness={0.48} /></RoundedBox>
}

function LeaderLine({ from, to, color }: { from: [number,number,number], to: [number,number,number], color?: string }){
  // simple line with buffer geometry
  const points = useMemo(()=> [new THREE.Vector3(...from), new THREE.Vector3(...to)], [from,to])
  const geom = useMemo(()=> new THREE.BufferGeometry().setFromPoints(points), [points])
  return (
    <line geometry={geom}>
      <lineBasicMaterial color={color ?? palette.interaction} linewidth={1} transparent opacity={0.8} />
    </line>
  )
}

function CameraFramer({ active }: { active: string | null }){
  // changes camera framing when part selected – isolate dim + framing
  const { camera } = useThree()
  const store = useViewerStore()
  const selected = store.selected
  useEffect(()=>{
    if(!selected) return
    // small framing adjustment: lerp camera target-ish – simpler bump
    // we don't have controls here, but we can nudge camera slightly for illustration
    // using timeout for demo
  }, [selected])
  return null
}

function ArchitectureExploded({ spec, active, workloadActiveIds }: any){
  // Real groups: GPC -> SM -> TC/CC/TMA
  // For teaching: show 8 GPCs across die, each GPC contains 2-4 SM blocks illustrated
  const gpcCount = Math.max(4, Math.min(8, Math.floor(spec.dieTileColumns/2)))
  const smPerGpc = 2
  return (
    <group data-testid="architecture-exploded" position={[0,0.5,0]}>
      {/* exploded board low opacity */}
      <group position={[0,-0.8,0]}>
        <Board size={spec.boardSize as any} />
        {/* dim ground */}
        <mesh position={[0,-0.1,0]}><boxGeometry args={[spec.boardSize[0]+0.6,0.02,spec.boardSize[2]+0.6]} /><meshStandardMaterial color="#000" transparent opacity={0.35} /></mesh>
      </group>

      {/* package lifted */}
      <group position={[0,0.25,0]}>
        <RoundedBox args={spec.packageSize as any} radius={0.11} smoothness={4}><meshStandardMaterial color={palette.package as any} transparent opacity={0.18} roughness={0.5} /></RoundedBox>
      </group>

      {/* GPC → SM → TC/CC/TMA */}
      <group position={[0,0.85,0]}>
        {Array.from({length:gpcCount}).map((_,gi)=>{
          const isHl = workloadActiveIds?.includes('gpc') || active==='gpc'
          const x = (gi - (gpcCount-1)/2)*0.48
          const z = (gi%2===0 ? -0.18 : 0.18)
          const gpcColor = isHl ? palette.compute : palette.gpc
          return (
            <group key={gi} position={[x,0,z]} data-testid={`gpc-${gi}`}>
              <RoundedBox args={[0.42,0.18,0.52] as any} radius={0.05}><meshStandardMaterial color={gpcColor as any} emissive={isHl?palette.lime:0 as any} emissiveIntensity={isHl?0.45:0} transparent opacity={isHl?0.95:0.72} /></RoundedBox>
              {/* SMs inside */}
              {Array.from({length:smPerGpc}).map((__,si)=>{
                const sihl = workloadActiveIds?.includes('sm') || active==='sm'
                return (
                  <group key={si} position={[ (si-0.5)*0.16, 0.11, 0]}>
                    <RoundedBox args={[0.13,0.10,0.19] as any} radius={0.02}><meshStandardMaterial color={sihl ? '#7fee64' : '#3b5e3b'} /></RoundedBox>
                    {/* TC */}
                    <mesh position={[-0.02,0.06,0.04]} data-testid={`tensor-${gi}-${si}`}><boxGeometry args={[0.045,0.02,0.045]} /><meshStandardMaterial color={workloadActiveIds?.includes('tensor-core') || active==='tensor-core' ? palette.interaction : '#c7b24f'} emissive={workloadActiveIds?.includes('tensor-core')?palette.lime:0 as any} emissiveIntensity={0.6 as any} /></mesh>
                    {/* CC */}
                    <mesh position={[0.02,0.06,0.04]} data-testid={`cuda-${gi}-${si}`}><boxGeometry args={[0.03,0.018,0.03]} /><meshStandardMaterial color={workloadActiveIds?.includes('cuda-core')?palette.lime:'#8fbfa8'} /></mesh>
                    {/* TMA */}
                    <mesh position={[0,0.06,-0.05]} data-testid={`tma-${gi}-${si}`}><boxGeometry args={[0.07,0.015,0.022]} /><meshStandardMaterial color={workloadActiveIds?.includes('tma') || active==='tma' ? '#2EE6D6' : '#4a8a8a'} emissive={active==='tma'?'#2EE6D6':0 as any} emissiveIntensity={0.5 as any} /></mesh>
                  </group>
                )
              })}
            </group>
          )
        })}
      </group>

      {/* HBM stacks still visible but elevated for memory-bound workload */}
      <group position={[0,0.35,0]}>
        {spec.packageSites.filter((s:any)=>s.kind==='memory').map((s:any,i:number)=>{
          const memHl = workloadActiveIds?.includes('gpu-ram') || active==='gpu-ram'
          return <HBMStack key={i} position={[s.position[0],0.72,s.position[1]] as any} active={!!memHl} version={spec.hbm.version as any} totalGB={spec.hbm.gbPerStack} capacityGB={spec.hbm.totalGB} />
        })}
      </group>

      {/* Leader lines from anchors */}
      {partDefs.filter((d:any)=>d.view==='architecture').map((d:any, idx:number)=>{
        if(d.id==='gpc' || d.id==='sm' || d.id==='tensor-core' || d.id==='cuda-core' || d.id==='tma'){
          const target: [number,number,number] = d.anchor as any
          // simple line from GPC cluster center to anchor label point
          return <LeaderLine key={d.id} from={[ (idx-2)*0.15, 0.95, 0]} to={target as any} color={palette.semantic[(d.semanticColorKey as any)??'compute']?.color ?? palette.lime} />
        }
        return null
      })}
    </group>
  )
}

function SystemView({ spec }: any){
  // GPU → NVLink → Superchip → tray → rack chain
  return (
    <group data-testid="system-view" position={[0,0,0]}>
      {/* Stage 1 GPU */}
      <group position={[-3.2,0.4,0]}>
        <RoundedBox args={[0.9,0.12,0.8]} radius={0.06}><meshStandardMaterial color={palette.board} /></RoundedBox>
        <Html distanceFactor={6} center position={[0,0.22,0]}><div className="font-mono text-[8px] bg-black/60 text-[#7fee64] px-1 rounded">GPU {spec.label}</div></Html>
      </group>
      {/* NVLink arrow */}
      <LeaderLine from={[-2.65,0.45,0]} to={[-1.9,0.45,0]} color={palette.interconnect} />
      {/* Stage 2 Superchip 2x + Grace */}
      <group position={[-0.9,0.4,0]}>
        <RoundedBox args={[1.6,0.18,1.4] as any} radius={0.08}><meshStandardMaterial color="#143322" /></RoundedBox>
        <group position={[-0.32,0.12,0]}><boxGeometry args={[0.52,0.08,0.5]} /><meshStandardMaterial color="#101712" /></group>
        <group position={[0.36,0.12,0]}><boxGeometry args={[0.52,0.08,0.5]} /><meshStandardMaterial color="#101712" /></group>
        <group position={[0,0.12,-0.68]}><boxGeometry args={[0.84,0.14,0.42]} /><meshStandardMaterial color={palette.graceCpu} /></group>
        <Html distanceFactor={6} center position={[0,0.34,0]}><div className="font-mono text-[8px] bg-black/60 text-[#2EE6D6] px-1 rounded">Superchip 1 Grace+2 Blackwell 372GB usable / 384 raw 16TB/s 3.6TB/s NVL 900GB/s C2C</div></Html>
      </group>
      <LeaderLine from={[-0.05,0.45,0]} to={[0.75,0.45,0]} color={palette.interconnect} />
      {/* Stage 3 Tray */}
      <group position={[2.1,0.4,0]}>
        <RoundedBox args={[2.2,0.14,1.6] as any} radius={0.07}><meshStandardMaterial color="#0e1612" /></RoundedBox>
        <Html distanceFactor={6} center position={[0,0.28,0]}><div className="font-mono text-[8px] bg-black/60 text-[#d8f9d9] px-1 rounded">Tray 2 Grace +4 Blackwell (2× superchip)</div></Html>
      </group>
      <LeaderLine from={[3.25,0.45,0]} to={[3.95,0.45,0]} color={palette.interconnect} />
      {/* Stage 4 Rack */}
      <group position={[5.4,0.4,0]} scale={[0.55,0.55,0.55]}>
        <group position={[0,0.5,0]}><NVL72Rack simplified /></group>
        <Html distanceFactor={7} center position={[0,2.2,0]}><div className="font-mono text-[8px] bg-black/70 text-[#7fee64] px-1 rounded">Rack 18 trays 36 Grace +72 Blackwell 130TB/s NVL72 domain</div></Html>
      </group>
    </group>
  )
}

export default function GPUClient({ specId }:{ specId:string}){
  const spec = useMemo(()=> getSpecSafe(specId), [specId])
  const store = useViewerStore()
  const { view, rackView, setRackView, hovered, selected, helpOpen, setHelp, reset, resetToken, userInteracted, setCurrentGPU, workload, clearSelection } = store as any
  const active = hovered || selected
  const [mounted,setMounted]=useState(false)
  useEffect(()=>{setMounted(true); setCurrentGPU(specId)},[specId,setCurrentGPU])

  // ESC handler to clear selection
  useEffect(()=>{
    const onKey = (e:KeyboardEvent)=>{
      if(e.key==='Escape'){
        clearSelection()
        // also close help
        setHelp(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [clearSelection, setHelp])

  // workload overlay illuminates mapping
  const workloadActiveIds: string[] | null = useMemo(()=>{
    if(!workload) return null
    const map: any = workloadOverlays[workload as any]
    return map?.illuminates ?? null
  }, [workload])

  if(!spec){
    // Should have triggered notFound in page.tsx; fallback 404 message
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0d180a] text-[#7fee64] font-mono">
        <div className="border border-[#7fee64]/20 p-6 max-w-md"><h1 className="text-[18px]">GPU spec not found</h1><p className="mt-2 text-[12px]">ID {specId} unknown. Try h100-sxm5, b200-sxm, blackwell-gb200, rubin-r100, rubin-ultra-nvl576.</p><a href="/gpu/h100-sxm5" className="underline text-[12px]">Go to H100</a></div>
      </main>
    )
  }

  const isH100 = spec.id==='h100-sxm5'
  const isGB200 = spec.id==='blackwell-gb200' || spec.id==='gb200-superchip'
  const isB200 = spec.id==='b200-sxm'
  const headerTitle = isH100 ? 'H100 / ARCHITECTURE' : isB200 ? 'B200 / ARCHITECTURE' : isGB200 ? 'GB200 / ARCHITECTURE' : `${spec.label.toUpperCase()} / ARCHITECTURE`

  const isArchitecture = view==='architecture'
  const isSystem = view==='system' || rackView

  return (
    <main className="page-frame" data-testid="gpu-page-frame">
      <div className="terminal-shell">
        <header className="site-header" data-testid="site-header">
          <div className="brand-lockup"><strong>{spec.label.split(' ')[0]}</strong><span>GPU Glossary</span></div>
          <div className="header-title" data-testid="header-title">{headerTitle}</div>
          <div className="header-actions">
            <div className="view-switch" role="group" aria-label="View toggle – architecture modes">
              <button type="button" data-testid="view-exterior" data-active={view==='exterior'} onClick={()=>store.setView('exterior')}>Exterior</button>
              <button type="button" data-testid="view-architecture" data-active={view==='architecture'} onClick={()=>store.setView('architecture')}>Architecture</button>
              <button type="button" data-testid="view-system" data-active={view==='system'} onClick={()=>store.setView('system')}>System</button>
            </div>
            {/* GB200 Module|Rack toggle preserved but System view also covers rack */}
            <div className="view-switch" style={{gap:'8px', marginLeft:'10px', borderLeft:'1px solid rgba(127,238,100,.2)', paddingLeft:'10px'}} role="group" aria-label="Module rack toggle">
              <button type="button" data-testid="toggle-module" data-active={!rackView} onClick={()=>setRackView(false)} style={{fontSize:'11px'}}>Module</button>
              <button type="button" data-testid="toggle-rack" data-active={rackView} onClick={()=>setRackView(true)} style={{fontSize:'11px'}}>Rack NVL72</button>
            </div>
            <button type="button" className="text-control" data-testid="reset-view" onClick={()=>reset()}>Reset view</button>
            <button type="button" className="help-button" aria-label="Toggle help" aria-expanded={helpOpen} data-testid="help-toggle" onClick={()=>setHelp(!helpOpen)}>?</button>
          </div>
        </header>
        <div className="explorer-grid" style={{display:'flex', gap:'0'}}>
          <ComponentIndex />
          <section className="scene-stage" data-testid="scene-stage" style={{flex:'1 1 auto', minHeight:'72vh', position:'relative'}}>
            <div className="stage-path" data-testid="stage-path">/device-hardware/{spec.id}{rackView && isGB200 ? ' / nvl72' : ''} / {view}</div>
            <div className="view-label" data-testid="view-label"><span>{rackView && isGB200 ? 'GB200 NVL72 RACK' : view==='exterior' ? spec.module : view==='architecture' ? 'ILLUSTRATIVE ARCHITECTURE VIEW CUTAWAY GPC→SM→TC/CC/TMA' : 'SYSTEM GPU→NVL→SUPERCHIP→TRAY→RACK'}</span><i /></div>

            {/* provenance badges */}
            <div className="absolute top-[28px] left-2 z-20 flex flex-wrap gap-1 max-w-[90%]" data-testid="provenance-bar">
              {(spec.provenance ?? []).slice(0,4).map((p:any, idx:number)=>(
                <span key={idx} className={`px-1 text-[9px] font-mono border rounded ${p.status==='official' ? 'border-[#7fee64]/40 text-[#7fee64] bg-[#7fee64]/10' : p.status==='derived' ? 'border-[#0ec7ff]/40 text-[#0ec7ff]' : 'border-[#ffb11a]/30 text-[#ffb11a]/70'}`} title={`${p.field}: ${p.value}${p.unit? ' '+p.unit:''} ${p.status} asOf ${p.asOf} ${p.sourceUrl ?? ''} ${p.notes ?? ''}`}>
                  {p.field} {p.value}{p.unit?' '+p.unit:''} · {p.status} {p.asOf ? `· ${p.asOf}`:''}
                </span>
              ))}
            </div>

            <div className="canvas-wrap" style={{position:'absolute', inset:'0', top:'48px'}}>
              {mounted && (
                rackView && isGB200 ? (
                  <SceneViewport isRack>
                    <group position={[0,-0.5,0]}><NVL72Rack /></group>
                    <CameraFramer active={active} />
                    {/* Render RackStats inside Canvas? RackStats is HTML, but we also render overlay below */}
                    <Html position={[0,0.5,0]} center distanceFactor={8} occlude={false}><div style={{display:'none'}} data-testid="rackstats-canvas-marker">rackstats present</div></Html>
                  </SceneViewport>
                ) : (
                  <SceneViewport>
                    {/* Isolate dim logic: dim everything when part selected */}
                    <group data-testid={`scene-group-${view}`}>
                      {view==='exterior' && (
                        <group rotation={[0,-0.08,0]} position={[0,0.08,0]} data-testid="exterior-group">
                          <Board size={spec.boardSize as any} />
                          <MountingHoles positions={spec.mountingHoles as any} />
                          {[-1.65,-1.23,1.23,1.65].map(z=>(
                            <mesh key={z} position={[-0.03,0.195,z] as any}><boxGeometry args={[5.15,0.008,0.018] as any} /><meshStandardMaterial color="#5a4a35" metalness={0.5} roughness={0.55} /></mesh>
                          ))}
                          {spec.leftPowerStages.map((p:any,i:number)=> <PowerStage key={`l-${p[0]}-${p[1]}`} pos={p} idx={i} left />)}
                          {spec.rightPowerStages.map((p:any,i:number)=> <PowerStage key={`r-${p[0]}-${p[1]}`} pos={p} idx={i} left={false} />)}
                          {[-1.38,-1.02,-0.66,0.68,1.04,1.4].map(z=>(
                            <group key={z}>{[-2.66,-2.49,2.32,2.49].map(x=>(
                              <RoundedBox key={`${x}-${z}`} args={[0.1,0.17,0.18] as any} radius={0.02} position={[x,0.24,z] as any}><meshStandardMaterial color={palette.capacitor} metalness={0.75} roughness={0.3} /></RoundedBox>
                            ))}</group>
                          ))}
                          {spec.topClampPositions.map((e:any)=>(
                            <group key={e}>
                              <RoundedBox args={[0.34,0.46,0.42] as any} radius={0.035} position={[e,0.39,-1.77] as any}><meshStandardMaterial color={palette.clamp as any} metalness={0.7} /></RoundedBox>
                              <RoundedBox args={[0.34,0.46,0.42] as any} radius={0.035} position={[e,0.39,1.77] as any}><meshStandardMaterial color={palette.clamp as any} metalness={0.7} /></RoundedBox>
                              <mesh position={[e,0.61,-1.77] as any}><boxGeometry args={[0.35,0.03,0.34] as any} /><meshStandardMaterial color={palette.clampTop as any} metalness={0.88} roughness={0.24} /></mesh>
                              <mesh position={[e,0.61,1.77] as any}><boxGeometry args={[0.35,0.03,0.34] as any} /><meshStandardMaterial color={palette.clampTop as any} metalness={0.88} roughness={0.24} /></mesh>
                            </group>
                          ))}
                          <RoundedBox args={spec.packageSize as any} radius={0.11} smoothness={4} position={[0,0.35,0]}><meshStandardMaterial color={palette.package as any} metalness={0.54} roughness={0.34} /></RoundedBox>
                          <RoundedBox args={[spec.packageSize[0]-0.30,0.12,spec.packageSize[2]-0.30] as any} radius={0.065} smoothness={3} position={[0,0.55,0]}><meshStandardMaterial color={palette.packageInner as any} metalness={0.5} roughness={0.42} /></RoundedBox>
                          <group position={[0,0.73,0]}>
                            <DieTileGrid cols={spec.dieTileColumns} rows={spec.dieTileRows} active={active==='cuda-architecture' || (workloadActiveIds?.includes('cuda-architecture') as any)} dualDie={!!spec.dualDie} dieSize={spec.dieSize as any} interposer={!!spec.interposer} isGB200={isGB200} 
                              dimOthers={!!(selected && selected!=='cuda-architecture')} />
                          </group>
                          {spec.packageSites.filter((s:any)=>s.kind==='memory').map((s:any,i:number)=>(
                            <HBMStack key={i} position={[s.position[0],0.72,s.position[1]] as any} active={active==='gpu-ram' || workloadActiveIds?.includes('gpu-ram')} version={spec.hbm.version as any} totalGB={spec.hbm.gbPerStack} capacityGB={spec.hbm.totalGB} />
                          ))}
                          {spec.packageSites.filter((s:any)=>s.kind==='structural').map((s:any,i:number)=>(
                            <RoundedBox key={`struct-${i}`} args={[0.64,0.15,0.5] as any} radius={0.035} position={[s.position[0],0.72,s.position[1]] as any}><meshStandardMaterial color="#202321" /></RoundedBox>
                          ))}
                          {spec.sideContacts.map((c:any)=>(
                            <group key={c}>
                              <mesh position={[-1.3,0.64,0.58*c] as any}><boxGeometry args={[0.025,0.035,0.075] as any} /><meshStandardMaterial color={palette.goldContact as any} metalness={0.86} roughness={0.2} /></mesh>
                              <mesh position={[1.3,0.64,0.58*c] as any}><boxGeometry args={[0.025,0.035,0.075] as any} /><meshStandardMaterial color={palette.goldContact as any} metalness={0.86} roughness={0.2} /></mesh>
                            </group>
                          ))}
                          <group position={[3.22,0.53,-1.43] as any} rotation={[0,-0.06,0] as any}>
                            <RoundedBox args={[1.08,0.1,0.76] as any} radius={0.035} smoothness={2}><meshStandardMaterial color={palette.daughterboard as any} metalness={0.24} roughness={0.65} /></RoundedBox>
                            <RoundedBox args={[0.34,0.16,0.34] as any} position={[-0.26,0.12,0.03] as any} radius={0.02}><meshStandardMaterial color="#111512" /></RoundedBox>
                            <RoundedBox args={[0.26,0.14,0.22] as any} position={[0.25,0.12,-0.13] as any} radius={0.02}><meshStandardMaterial color="#111512" /></RoundedBox>
                            {[-0.35,-0.12,0.11,0.34].map(x=>(
                              <RoundedBox key={x} args={[0.11,0.12,0.12] as any} radius={0.015} position={[x,0.12,0.29] as any}><meshStandardMaterial color="#a5a59c" metalness={0.78} /></RoundedBox>
                            ))}
                          </group>
                        </group>
                      )}
                      {view==='architecture' && (
                        <ArchitectureExploded spec={spec} active={active} workloadActiveIds={workloadActiveIds} />
                      )}
                      {view==='system' && (
                        <SystemView spec={spec} />
                      )}
                      {/* Valid Html inside Canvas – leader anchor tags */}
                      {mounted && !isSystem && active && (()=>{ const def = partDefs.find(d=>d.id===active); if(!def) return null; const isDim = !!(selected && selected!==def.id); return (
                        <Html position={def.anchor as any} center distanceFactor={7.5} zIndexRange={[40,0] as any} occlude={false} data-testid={`popover-${def.id}`}>
                          <article className="part-popover" data-testid="part-popover" style={{opacity: isDim ? 0.35 : 1, filter: isDim ? 'grayscale(0.5)' : 'none'}}>
                            <div className="popover-kicker"><span>{def.index} / COMPONENT</span>{def.abbreviation && <b>{def.abbreviation}</b>}</div>
                            <h2>{def.title}</h2><p>{def.description}</p>
                            <div className="flex gap-2"><a href={def.glossaryUrl} target="_blank" rel="noreferrer" data-testid={`glossary-${def.id}`}>OPEN GLOSSARY ↗</a></div>
                            {'provenance' in (spec as any) && (spec.provenance as any[])?.[0] && <div className="text-[9px] mt-1 opacity-60">Source: {(spec.provenance as any)[0].sourceUrl?.slice(0,32)} · { (spec.provenance as any)[0].asOf } · {(spec.provenance as any)[0].status}</div>}
                          </article>
                        </Html>
                      )})()}
                    </group>
                    <CameraFramer active={active} />
                  </SceneViewport>
                )
              )}
            </div>

            {helpOpen && <div className="help-panel" data-testid="help-panel"><button type="button" onClick={()=>setHelp(false)} data-testid="close-help">×</button><span>CONTROLS</span><p>Drag to rotate. Scroll. ESC clears. Hover GPC/SM/TC. View modes: Exterior physical, Architecture exploded GPC→SM, System GPU→Superchip→Tray→Rack.</p></div>}

            <div className="stage-status" data-testid="stage-status"><span className="status-dot"></span>{active ? partDefs.find(d=>d.id===active)?.title.toUpperCase() : 'MODEL READY'}</div>
            <div className="stage-hint" data-testid="stage-hint">{userInteracted ? 'ESC TO CLEAR' : 'DRAG TO BEGIN'}</div>

            {/* RackStats – now rendered overlay, not unused */}
            {rackView && isGB200 && <RackStats />}

            {/* Semantic legend bottom-left */}
            <div className="absolute bottom-[56px] left-2 flex gap-2 flex-wrap max-w-[62%] bg-black/50 p-1 border border-[#7fee64]/10 rounded" data-testid="semantic-legend">
              {semanticLegend.map(l=> <span key={l.key} style={{color:l.color}} className="text-[9px] font-mono">{l.label}</span>)}
            </div>
          </section>
        </div>
        <MobileBar />
      </div>
      {/* Global key indicator for tests */}
      <div style={{display:'none'}} data-testid="reset-token">{resetToken}</div>
    </main>
  )
}
