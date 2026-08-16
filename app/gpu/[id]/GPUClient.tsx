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

  // Scale anchors from H100 reference 2.78x2.72 to current package
  const scaleX = spec.packageSize[0] / 2.78
  const scaleZ = spec.packageSize[2] / 2.72
  const scaledParts = useMemo(()=> partDefs.map(p=>{
    // Keep original anchor but scale x/z slightly for larger B200 package, y up a bit
    const sx = p.anchor[0] * (0.6 + 0.4*scaleX) // mild scaling to avoid popover flying off
    const sy = p.anchor[1] + (spec.packageSize[0] > 2.9 ? 0.08 : 0)
    const sz = p.anchor[2] * (0.6 + 0.4*scaleZ)
    const title = p.id === 'gpu-ram' && spec.hbm.version === 'hbm3e' ? 'GPU RAM / HBM3e' : p.title
    const abbr = p.id === 'gpu-ram' && spec.hbm.version === 'hbm3e' ? 'HBM3e' : p.abbreviation
    return {...p, anchor:[sx,sy,sz] as [number,number,number], title, abbreviation:abbr}
  }), [scaleX, scaleZ, spec.packageSize, spec.hbm.version])

  const labelShort = spec.label.split(' ')[0] // H100 or B200 etc

  return (
    <main className="page-frame">
      <div className="terminal-shell grid grid-rows-[63px_minmax(0,1fr)] w-full h-full border border-[#7fee64]/80 bg-[#0d180a]">
        <header className="grid grid-cols-[1fr_1fr_2fr] sm:grid-cols-3 items-center border-b border-[#7fee64]/30">
          <div className="flex items-center gap-2 px-4 text-[24px]"><strong className="text-[#d8f9d9]">{labelShort}</strong><span className="text-[#7fee64]/80 text-[18px]">GPU Glossary</span>{spec.hbm.version==='hbm3e' && <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono border border-[#0ec7ff] text-[#0ec7ff] bg-[#0ec7ff]/10">{spec.hbm.totalGB}GB</span>}</div>
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
                      <DieTileGrid cols={spec.dieTileColumns} rows={spec.dieTileRows} active={active==='cuda-architecture'} dualDie={!!spec.dualDie} dieSize={spec.dieSize as any} interposer={!!spec.interposer} />
                    </group>

                    {spec.packageSites.filter(s=>s.kind==='memory').map((s,i)=>(
                      <HBMStack key={i} position={[s.position[0],0.72,s.position[1]] as any} active={active==='gpu-ram'} label={`${spec.hbm.count}`} version={spec.hbm.version as any} totalGB={spec.hbm.totalGB} />
                    ))}

                    {scaledParts.map(p=>(
                      <group key={p.id} position={p.anchor as any}>
                        <Html transform distanceFactor={7.5} position={[0,0,0]} style={{pointerEvents:'none', opacity: active===p.id?1:0}}>
                          <div className="w-[260px] border border-[#7fee64] bg-[#0d180a]/95 p-3 text-[12px] text-[#7fee64]/80">
                            <div className="text-[10px]">{p.index} / COMPONENT</div>
                            <div className="text-[#7fee64] text-[16px] font-bold">{p.title}{p.abbreviation? ` — ${p.abbreviation}`:''}</div>
                            <div className="mt-1">{p.description}</div>
                            <a href={p.glossaryUrl} target="_blank" className="inline-block mt-2 px-1 bg-[#7fee64]/20 text-[#7fee64] text-[11px]">OPEN GLOSSARY ↗</a>
                            {spec.id==='b200-sxm' && p.id==='gpu-ram' && <div className="mt-1 text-[10px] text-[#0ec7ff]">{spec.hbm.count}× {spec.hbm.version.toUpperCase()} {spec.hbm.gbPerStack}GB = {spec.hbm.totalGB}GB • 8-stack 4+4 • BW ~8TB/s</div>}
                            {spec.id==='b200-sxm' && p.id==='cuda-architecture' && <div className="mt-1 text-[10px] text-[#7fee64]/60">Dual-die {spec.dieTileColumns*spec.dieTileRows} tiles {spec.dieTileColumns}×{spec.dieTileRows} • interposer {(spec.interposer?'yes':'no')}</div>}
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
              <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#7fee64]" /><span>{active ? (scaledParts.find(p=>p.id===active)?.title.toUpperCase() ?? 'MODEL READY') : 'MODEL READY'}</span>
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
