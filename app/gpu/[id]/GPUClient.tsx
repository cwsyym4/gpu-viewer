'use client'
import { useEffect, useState } from 'react'
import { SceneViewport } from '@/components/scene/SceneViewport'
import { getSpecSafe, partDefs, workloadOverlays } from '@/lib/definitions'
import { palette } from '@/lib/materials/palette'
import { useViewerStore } from '@/store/useViewerStore'
import { DieTileGrid } from '@/components/gpu/DieTileGrid'
import { HBMStack } from '@/components/gpu/HBMStack'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { ComponentIndex } from '@/components/ui/ComponentIndex'
import { MobileBar } from '@/components/ui/MobileBar'
import { HelpPanel } from '@/components/ui/HelpPanel'
import { GPUSelector } from '@/components/ui/GPUSelector'
import { NVL72Rack, RackStats } from '@/components/rack/NVL72Rack'
import { RoundedBox, Html } from '@react-three/drei'

function BoardGroup({ specId, selected, dimOthers, view }: any){
  const spec = getSpecSafe(specId)
  if(!spec) return null
  const scale = 3.9 / (spec.boardSize[0])
  return (
    <group scale={[scale,scale,scale]} data-testid="exterior-group">
      <RoundedBox args={spec.boardSize} radius={0.08}><meshStandardMaterial color={palette.board} emissive="#2a4a30" emissiveIntensity={0.78} /></RoundedBox>
      <group position={spec.packageOffset as any}>
        <RoundedBox args={spec.packageSize} radius={0.05}><meshStandardMaterial color={palette.package} emissive="#1d2a1e" emissiveIntensity={0.55} /></RoundedBox>
        <DieTileGrid columns={spec.dieTileColumns} rows={spec.dieTileRows} size={spec.dieSize as any} active={selected} dualDie={(spec as any).dualDie} dimOthers={dimOthers} />
      </group>
      {spec.packageSites.filter((s:any)=>s.kind==='memory').map((site:any,i:number)=>(
        <group key={i} position={[(site.position[0])*2.2,0.28,(site.position[1])*1.6]}>
          <HBMStack position={[0,0,0] as any} version={(spec as any).hbm.version} totalGB={(spec as any).hbm.gbPerStack} capacityGB={(spec as any).hbm.totalGB} active={selected==='gpu-ram'} dimOthers={dimOthers} />
        </group>
      ))}
    </group>
  )
}

function ArchitectureExploded({ specId, selected, dimOthers }: any){
  const spec = getSpecSafe(specId); if(!spec) return null
  const scale = 3.9 / (spec.boardSize[0]); const gpcCount = 8; const smPerGPC = 4
  return (
    <group data-testid="architecture-exploded" scale={[scale,scale,scale]}>
      {Array.from({length:gpcCount}).map((_,gpcIdx)=>{
        const active = selected==='gpc' || selected==='sm'
        const x = ((gpcIdx%4)-1.5)*1.6; const z = (Math.floor(gpcIdx/4)-0.5)*1.2
        return (
          <group key={gpcIdx} position={[x, gpcIdx*0.06, z]} data-testid={`gpc-${gpcIdx}`}>
            <RoundedBox args={[1.2,0.18,0.8]} radius={0.05}><meshStandardMaterial color={palette.gpc} emissive={active?palette.compute:"black"} emissiveIntensity={active?0.6:0} /></RoundedBox>
            {Array.from({length:smPerGPC}).map((_,smIdx)=>{
              const tcActive = selected==='tensor-core' || selected==='cuda-core' || selected==='tma'
              return (
                <group key={smIdx} position={[(smIdx%2-0.5)*0.5,0.15,(Math.floor(smIdx/2)-0.5)*0.3]} data-testid={`sm-${gpcIdx}-${smIdx}`}>
                  <RoundedBox args={[0.42,0.12,0.28]} radius={0.02}><meshStandardMaterial color="#1a3a20" emissive={tcActive?palette.compute:"black"} emissiveIntensity={tcActive?0.4:0} /></RoundedBox>
                  <group position={[0,0.09,0]} data-testid={`group-tc-cc-tma-${gpcIdx}-${smIdx}`}>
                    <mesh position={[-0.12,0,0]}><boxGeometry args={[0.12,0.05,0.1]} /><meshStandardMaterial color={palette.compute} /></mesh>
                    <mesh position={[0,0,0]}><boxGeometry args={[0.12,0.05,0.1]} /><meshStandardMaterial color="#aaddaa" /></mesh>
                    <mesh position={[0.12,0,0]} data-testid="tma-guard"><boxGeometry args={[0.1,0.04,0.08]} /><meshStandardMaterial color={palette.interconnect} /></mesh>
                  </group>
                </group>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

function SystemView({ specId, rackView, selected, dimOthers }: any){
  const isH100 = specId==='h100-sxm5'
  return (
    <group data-testid="system-view">
      {!rackView ? (
        <>
          <BoardGroup specId={specId} selected={selected} dimOthers={dimOthers} view="system" />
          <group position={[0,1.2,0]} data-testid="nvlink-group">
            <RoundedBox args={[1.2,0.12,0.6]} radius={0.03}><meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkPulse} emissiveIntensity={0.7} /></RoundedBox>
            <Html center position={[0,0.22,0]}><div className="text-[9px] font-mono text-[#7fee64] bg-black/50 px-1 rounded">NVLink {isH100 ? '900GB/s':'1.8TB/s per GPU'}</div></Html>
          </group>
          {specId==='blackwell-gb200' && (
            <group position={[0,2,0]} data-testid="superchip-group">
              <mesh><boxGeometry args={[5,0.3,3]} /><meshStandardMaterial color="#0a2010" wireframe /></mesh>
              <Html center position={[0,0.25,0]}><div className="text-[9px] font-mono text-white/80 bg-black/60 px-2 py-1 rounded">Superchip: 1 Grace 72c +2 Blackwell 384 raw 372 usable 16TB/s 3.6TB/s NVL 900GB/s C2C </div></Html>
            </group>
          )}
        </>
      ) : (<NVL72Rack specId={specId} />)}
    </group>
  )
}

export default function GPUClient({ specId }: { specId:string }){
  const view = useViewerStore(s=> s.view)
  const rackView = useViewerStore(s=> s.rackView)
  const selected = useViewerStore(s=> s.selected)
  const clearSelection = useViewerStore(s=> s.clearSelection)
  const workload = useViewerStore(s=> s.workload)
  const workloadActiveIds = workload ? (workloadOverlays as any)[workload]?.illuminates ?? [] : []
  const dimOthers = !!workload && workloadActiveIds.length>0
  const spec = getSpecSafe(specId)
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{ if(e.key==='Escape'){ clearSelection(); } }
    window.addEventListener('keydown', handler); return ()=> window.removeEventListener('keydown', handler)
  },[clearSelection])
  if(!spec) return <div className="p-6 text-white">Spec not found</div>
  const isArch = view==='architecture'; const isSystem = view==='system'
  return (
    <div className="flex flex-col min-h-[420px] border border-[#7fee64]/15 rounded overflow-hidden bg-[#080b09]">
      <GPUSelector />
      <div className="flex min-h-[420px]">
        <ComponentIndex />
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 px-2 py-1 border-b border-[#7fee64]/10 bg-[#090f0a]">
            <div className="text-[11px] font-mono text-[#7fee64]">{spec.label} {spec.hbm.count}×{spec.hbm.version.toUpperCase()} {spec.hbm.gbPerStack}GB={spec.hbm.totalGB}GB {spec.dieTileColumns}×{spec.dieTileRows}={spec.dieTileColumns*spec.dieTileRows} dualDie={String(!!(spec as any).dualDie)}</div>
            <ViewToggle />
            <button type="button" data-testid="toggle-rack" onClick={()=> useViewerStore.getState().setRackView(!rackView)} className="ml-auto text-[10px] px-2 py-0.5 border border-[#7fee64]/20 rounded text-[#7fee64]/60">Module|Rack</button>
            <button type="button" data-testid="reset-view" onClick={()=> useViewerStore.getState().reset()} className="text-[10px] px-2 py-0.5 border border-[#7fee64]/20 rounded text-white/50">Reset view</button>
          </div>
          <div className="flex-1 relative">
            <SceneViewport isRack={rackView && isSystem}>
              {!isArch && !isSystem && <BoardGroup specId={specId} selected={selected} dimOthers={dimOthers} view={view} />}
              {isArch && <ArchitectureExploded specId={specId} selected={selected} dimOthers={dimOthers} />}
              {isSystem && <SystemView specId={specId} rackView={rackView} selected={selected} dimOthers={dimOthers} />}
            </SceneViewport>
            <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1" data-testid="provenance-bar">
              {spec.provenance?.slice(0,4).map((p:any,i:number)=>(
                <a key={i} href={p.sourceUrl} target="_blank" className="text-[9px] font-mono px-1 py-0.5 rounded bg-black/60 border" style={{borderColor: p.status==='official'?'#7fee64':'#0ec7ff', color: p.status==='official'?'#7fee64':'#0ec7ff'}} data-testid={`provenance-badge-${p.field}`}>{p.field} {p.value}{p.unit?` ${p.unit}`:''} {p.status} {p.asOf}</a>
              ))}
            </div>
            {rackView && isSystem && <RackStats specId={specId} />}
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/40" data-testid="stage-status">MODEL READY</div>
          </div>
          <MobileBar />
          <HelpPanel />
        </div>
      </div>
    </div>
  )
}
