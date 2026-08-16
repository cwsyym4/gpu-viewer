'use client'
import { useMemo, useEffect, useState } from 'react'
import { getSpec, partDefs } from '@/lib/definitions'
import { SceneViewport } from '@/components/scene/SceneViewport'
import { Board, Package, DieTileGrid, HBMStack, MountingHoles } from '@/components/gpu'
import { ComponentIndex } from '@/components/ui/ComponentIndex'
import { MobileBar } from '@/components/ui/MobileBar'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { HelpPanel } from '@/components/ui/HelpPanel'
import { useViewerStore } from '@/store/useViewerStore'
import { Html } from '@react-three/drei'

export default function GPUClient({ specId }:{ specId:string }){
  const spec = useMemo(()=> getSpec(specId), [specId])
  const { view, hovered, selected, helpOpen, setHelp, reset, userInteracted } = useViewerStore()
  const active = hovered || selected
  const [mounted, setMounted] = useState(false)
  useEffect(()=> setMounted(true), [])

  return (
    <main className="page-frame">
      <div className="terminal-shell grid grid-rows-[63px_minmax(0,1fr)] w-full h-full border border-[#7fee64]/80 bg-[#0d180a]">
        <header className="grid grid-cols-[1fr_1fr_2fr] sm:grid-cols-3 items-center border-b border-[#7fee64]/30">
          <div className="flex items-center gap-2 px-4 text-[24px]"><strong className="text-[#d8f9d9]">H100</strong><span className="text-[#7fee64]/80 text-[18px]">GPU Glossary</span></div>
          <div className="hidden sm:flex justify-center text-[#7fee64]/80 text-[14px] tracking-widest">{spec.label} / ARCHITECTURE</div>
          <div className="flex justify-end gap-3 px-4 items-center">
            <ViewToggle />
            <button onClick={()=>reset()} className="px-2 py-1 bg-[#7fee64]/10 text-[13px]">Reset view</button>
            <button onClick={()=>setHelp(!helpOpen)} className="grid place-items-center w-8 h-8 rounded-full border border-[#7fee64]">?</button>
          </div>
        </header>
        <div className="grid grid-cols-[25%_75%] max-[839px]:block min-h-0">
          <ComponentIndex />
          <section className="relative min-h-0 min-w-0 bg-[#0d180a] h-[calc(100vh-63px-32px)] sm:h-auto">
            <div className="absolute top-5 left-6 z-10 text-[13px] text-[#7fee64]/60 pointer-events-none">/device-hardware/{spec.id}</div>
            <div className="absolute top-5 right-6 z-10 flex items-center gap-2 text-[11px] text-[#7fee64]/80 pointer-events-none"><span>{view==='exterior'? spec.module : 'ILLUSTRATIVE ARCHITECTURE VIEW'}</span><i className="inline-block w-[7px] h-[7px] rounded-full bg-[#7fee64] shadow-[0_0_12px_rgba(127,238,100,0.7)]" /></div>

            <div className="absolute inset-0 cursor-grab touch-none">
              {mounted ? (
                <SceneViewport>
                  <group rotation={[0,-0.08,0]} position={[0,0.08,0]}>
                    <Board size={spec.boardSize as any} />
                    <MountingHoles positions={spec.mountingHoles as any} />
                    {[-1.65,-1.23,1.23,1.65].map(z=>(
                      <mesh key={z} position={[-0.03,0.195,z] as any}><boxGeometry args={[5.15,0.008,0.018]} /><meshStandardMaterial color="#5a4a35" metalness={0.5} roughness={0.55} /></mesh>
                    ))}
                    <Package size={spec.packageSize as any} offset={spec.packageOffset as any} />

                    <group position={[0,0.73,0]}>
                      <DieTileGrid cols={spec.dieTileColumns} rows={spec.dieTileRows} active={active==='cuda-architecture'} />
                    </group>

                    {spec.packageSites.filter(s=>s.kind==='memory').map((s,i)=>(
                      <HBMStack key={i} position={[s.position[0],0.72,s.position[1]] as any} active={active==='gpu-ram'} label={spec.hbm.version} />
                    ))}

                    {partDefs.map(p=>(
                      <group key={p.id} position={p.anchor as any}>
                        <Html transform distanceFactor={7.5} position={[0,0,0]} style={{pointerEvents:'none', opacity: active===p.id?1:0}}>
                          <div className="w-[260px] border border-[#7fee64] bg-[#0d180a]/95 p-3 text-[12px] text-[#7fee64]/80">
                            <div className="text-[10px]">{p.index} / COMPONENT</div>
                            <div className="text-[#7fee64] text-[16px] font-bold">{p.title}</div>
                            <div className="mt-1">{p.description}</div>
                            <a href={p.glossaryUrl} target="_blank" className="inline-block mt-2 px-1 bg-[#7fee64]/20 text-[#7fee64] text-[11px]">OPEN GLOSSARY ↗</a>
                          </div>
                        </Html>
                      </group>
                    ))}
                  </group>
                </SceneViewport>
              ) : (
                <div className="grid h-full place-items-center text-[13px] text-[#7fee64]/60 tracking-widest">INITIALIZING GPU MODEL_</div>
              )}
            </div>

            <div className="absolute bottom-[18px] left-6 flex items-center gap-2 text-[11px] text-[#7fee64]/80">
              <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#7fee64]" /><span>{active ? (partDefs.find(p=>p.id===active)?.title.toUpperCase() ?? 'MODEL READY') : 'MODEL READY'}</span>
            </div>
            <div className="absolute bottom-[18px] right-6 text-[11px] text-[#7fee64]/60">{userInteracted?'ESC TO CLEAR':'DRAG TO BEGIN'}</div>
            <HelpPanel />
          </section>
        </div>
        <MobileBar />
      </div>
    </main>
  )
}
