'use client'
import { useMemo, useEffect, useState } from 'react'
import { getSpec, partDefs } from '@/lib/definitions'
import { SceneViewport } from '@/components/scene/SceneViewport'
import { Board, Package, DieTileGrid, HBMStack, MountingHoles } from '@/components/gpu'
import { ComponentIndex } from '@/components/ui/ComponentIndex'
import { MobileBar } from '@/components/ui/MobileBar'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { HelpPanel } from '@/components/ui/HelpPanel'
import { NVL72Rack, RackStats } from '@/components/rack/NVL72Rack'
import { useViewerStore } from '@/store/useViewerStore'
import { Html } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'

export default function GPUClient({ specId }:{ specId:string }){
  const spec = useMemo(()=> getSpec(specId), [specId])
  const { view, rackView, setRackView, hovered, selected, helpOpen, setHelp, reset, userInteracted, setCurrentGPU } = useViewerStore()
  const active = hovered || selected
  const [mounted, setMounted] = useState(false)
  useEffect(()=> { setMounted(true); setCurrentGPU(specId) }, [specId, setCurrentGPU])

  const isGB200 = spec.id === 'blackwell-gb200'
  const isB200 = spec.id === 'b200-sxm'

  // Scale anchors from H100 reference 2.78x2.72 to current package
  const scaleX = spec.packageSize[0] / 2.78
  const scaleZ = spec.packageSize[2] / 2.72
  const scaledParts = useMemo(()=> {
    const filtered = partDefs.filter(p=>{
      if(!p.onlyFor) return true
      // @ts-ignore
      return p.onlyFor.includes(spec.id)
    })
    // for GB200 include all, for others include those without onlyFor or matching
    const base = isGB200 ? partDefs : filtered
    return base.map(p=>{
      const sx = p.anchor[0] * (0.6 + 0.4*scaleX)
      const sy = p.anchor[1] + (spec.packageSize[0] > 2.9 ? 0.08 : 0) + (isGB200 && p.id==='nvlink' ? 0.18 : 0)
      const sz = p.anchor[2] * (0.6 + 0.4*scaleZ)
      const title = p.id === 'gpu-ram' && spec.hbm.version === 'hbm3e'
        ? (isGB200 ? 'GPU RAM / HBM3e (8× 24GB)' : 'GPU RAM / HBM3e')
        : p.title
      const abbr = p.id === 'gpu-ram' && spec.hbm.version === 'hbm3e' ? 'HBM3e' : p.abbreviation
      return {...p, anchor:[sx,sy,sz] as [number,number,number], title, abbreviation:abbr}
    })
  }, [scaleX, scaleZ, spec.packageSize, spec.hbm.version, spec.id, isGB200])

  const labelShort = spec.label.split(' ')[0] // H100 or GB200 etc

  return (
    <main className="page-frame">
      <div className="terminal-shell grid grid-rows-[63px_minmax(0,1fr)] w-full h-full border border-[#7fee64]/80 bg-[#0d180a]">
        <header className="grid grid-cols-[1fr_1fr_2fr] sm:grid-cols-[1fr_auto_1fr] items-center border-b border-[#7fee64]/30">
          <div className="flex items-center gap-2 px-4 text-[24px]"><strong className="text-[#d8f9d9]">{labelShort}</strong><span className="text-[#7fee64]/80 text-[18px]">GPU Glossary</span>
            {spec.hbm.version==='hbm3e' && <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono border border-[#0ec7ff] text-[#0ec7ff] bg-[#0ec7ff]/10">{spec.hbm.totalGB}GB</span>}
            {isGB200 && <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono border border-[#7fee64] text-[#7fee64] bg-[#7fee64]/10">208B transistors</span>}
          </div>
          <div className="hidden sm:flex justify-center gap-3 items-center text-[#7fee64]/80 text-[13px] tracking-widest">
            <span>{spec.label}</span>
            <span className="text-[#7fee64]/40">/</span>
            <span>{rackView ? 'NVL72 RACK' : view==='exterior'? 'ARCH' : 'ILLUS.'}</span>
          </div>
          <div className="flex justify-end gap-2 px-3 items-center">
            <ViewToggle />
            {isGB200 && (
              <button onClick={()=> setRackView(!rackView)} className={`px-2 py-1 text-[12px] font-mono border ${rackView ? 'bg-[#7fee64] text-black border-[#7fee64]' : 'bg-[#7fee64]/10 text-[#7fee64] border-[#7fee64]/30'}`}>
                {rackView ? 'Module View' : 'Rack View'}
              </button>
            )}
            <button onClick={()=>reset()} className="px-2 py-1 bg-[#7fee64]/10 text-[12px] hidden sm:block">Reset view</button>
            <button onClick={()=>setHelp(!helpOpen)} className="grid place-items-center w-7 h-7 rounded-full border border-[#7fee64] text-[13px]">?</button>
          </div>
        </header>
        <div className="grid grid-cols-[25%_75%] max-[839px]:block min-h-0">
          <ComponentIndex />
          <section className="relative min-h-0 min-w-0 bg-[#0d180a] h-[calc(100vh-63px-32px)] sm:h-auto">
            <div className="absolute top-5 left-6 z-10 text-[13px] text-[#7fee64]/60 pointer-events-none">/device-hardware/{spec.id}{rackView?' / nvl72':''}</div>
            <div className="absolute top-5 right-6 z-10 flex items-center gap-2 text-[11px] text-[#7fee64]/80 pointer-events-none"><span>{rackView ? 'GB200 NVL72 RACK' : view==='exterior'? spec.module : 'ILLUSTRATIVE ARCHITECTURE VIEW'}</span><i className="inline-block w-[7px] h-[7px] rounded-full bg-[#7fee64] shadow-[0_0_12px_rgba(127,238,100,0.7)]" /></div>

            <div className="absolute inset-0 cursor-grab touch-none">
              {mounted ? (
                rackView && isGB200 ? (
                  <SceneViewport isRack>
                    <group position={[0,-0.5,0]}>
                      <NVL72Rack />
                    </group>
                  </SceneViewport>
                ) : (
                <SceneViewport>
                  <group rotation={[0,-0.08,0]} position={[0,0.08,0]}>
                    <Board size={spec.boardSize as any} />
                    <MountingHoles positions={spec.mountingHoles as any} />
                    {[-1.65,-1.23,1.23,1.65].map(z=>(
                      <mesh key={z} position={[-0.03,0.195,z] as any}><boxGeometry args={[5.15,0.008,0.018]} /><meshStandardMaterial color="#5a4a35" metalness={0.5} roughness={0.55} /></mesh>
                    ))}
                    <Package size={spec.packageSize as any} offset={spec.packageOffset as any} />

                    <group position={[0,0.73,0]}>
                      <DieTileGrid cols={spec.dieTileColumns} rows={spec.dieTileRows} active={active==='cuda-architecture'} dualDie={!!spec.dualDie} dieSize={spec.dieSize as any} interposer={!!spec.interposer} isGB200={isGB200} />
                    </group>

                    {spec.packageSites.filter(s=>s.kind==='memory').map((s,i)=>(
                      <HBMStack key={i} position={[s.position[0],0.72,s.position[1]] as any} active={active==='gpu-ram'} label={`${spec.hbm.count}`} version={spec.hbm.version as any} totalGB={spec.hbm.totalGB} />
                    ))}

                    {/* Grace CPU for GB200 — distinct die on board corner */}
                    {isGB200 && (
                      <group position={[3.1,0.26,-1.62] as any} rotation={[0,0.06,0]}>
                        <mesh>
                          <boxGeometry args={[1.08,0.13,0.74]} />
                          <meshStandardMaterial color={(palette as any).graceCpu ?? '#294d52'} metalness={0.55} roughness={0.42} />
                        </mesh>
                        <mesh position={[0,0.082,0]}>
                          <boxGeometry args={[0.42,0.028,0.32]} />
                          <meshStandardMaterial color={(palette as any).graceCpuHighlight} emissive={(palette as any).graceCpuHighlight} emissiveIntensity={0.32} />
                        </mesh>
                        {/* C2C label tiny */}
                        <Html distanceFactor={7} position={[0,0.22,0]} center>
                          <div style={{fontSize:'9px',fontFamily:'monospace',color:'#5fbabd',background:'rgba(36,77,82,0.18)',border:'1px solid #2a6b6f',padding:'1px 5px',borderRadius:'8px',whiteSpace:'nowrap'}}>Grace CPU 900GB/s C2C</div>
                        </Html>
                        {/* NVLink-C2C link line to package */}
                        <mesh position={[-0.72,0.05,0.62] as any}>
                          <boxGeometry args={[1.44,0.012,0.035]} />
                          <meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkBridge} emissiveIntensity={0.72} />
                        </mesh>
                      </group>
                    )}

                    {scaledParts.map(p=>(
                      <group key={p.id} position={p.anchor as any}>
                        <Html transform distanceFactor={7.5} position={[0,0,0]} style={{pointerEvents:'none', opacity: active===p.id?1:0}}>
                          <div className="w-[280px] border border-[#7fee64] bg-[#0d180a]/95 p-3 text-[12px] text-[#7fee64]/80">
                            <div className="text-[10px]">{p.index} / COMPONENT {p.onlyFor?.includes('blackwell-gb200')?'· GB200':''}</div>
                            <div className="text-[#7fee64] text-[15px] font-bold">{p.title}{p.abbreviation? ` — ${p.abbreviation}`:''}</div>
                            <div className="mt-1 leading-[1.35]">{p.description}</div>
                            <a href={p.glossaryUrl} target="_blank" className="inline-block mt-2 px-1.5 py-0.5 bg-[#7fee64]/20 text-[#7fee64] text-[11px]">OPEN GLOSSARY ↗</a>
                            {spec.id==='b200-sxm' && p.id==='gpu-ram' && <div className="mt-1 text-[10px] text-[#0ec7ff]">{spec.hbm.count}× {spec.hbm.version.toUpperCase()} {spec.hbm.gbPerStack}GB = {spec.hbm.totalGB}GB • 8-stack 4+4 • BW ~8TB/s</div>}
                            {spec.id==='b200-sxm' && p.id==='cuda-architecture' && <div className="mt-1 text-[10px] text-[#7fee64]/60">Dual-die {spec.dieTileColumns*spec.dieTileRows} tiles {spec.dieTileColumns}×{spec.dieTileRows} • interposer {spec.interposer?'yes':'no'} • {spec.dieTileColumns*spec.dieTileRows} tiles</div>}
                            {isGB200 && p.id==='nvlink' && <div className="mt-1 text-[10px] text-[#7fee64]">NVLink 5 1.8TB/s per GPU · C2C 900GB/s Grace↔Blackwell · rack NVL72 domain 130TB/s · 208B transistors package</div>}
                            {isGB200 && p.id==='grace-cpu' && <div className="mt-1 text-[10px] text-[#5fbabd]">Grace 72-core Neoverse V2 + LPDDR5X 512GB/node · 10× node density vs H100 rack</div>}
                            {isGB200 && p.id==='gpu-ram' && <div className="mt-1 text-[10px] text-[#0ec7ff]">8× HBM3e north/south row · 4+4 layout surrounding interposer · 192GB per GB200 Superchip</div>}
                          </div>
                        </Html>
                      </group>
                    ))}
                  </group>
                </SceneViewport>
                )
              ) : (
                <div className="grid h-full place-items-center text-[13px] text-[#7fee64]/60 tracking-widest">INITIALIZING GPU MODEL_</div>
              )}
            </div>

            <div className="absolute bottom-[18px] left-6 flex items-center gap-2 text-[11px] text-[#7fee64]/80">
              <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#7fee64]" /><span>{rackView?'NVL72 72× GB200 READY': active ? (scaledParts.find(p=>p.id===active)?.title.toUpperCase() ?? 'MODEL READY') : 'MODEL READY'}</span>
              {isGB200 && !rackView && <span className="ml-3 text-[10px] text-[#7fee64]/50 tracking-widest">GB200 · DUAL-RETICLE · 192 TILES 16×12 · NVLINK-C2C 900GB/s</span>}
              {isB200 && <span className="ml-3 text-[10px] text-[#0ec7ff]/60">DUAL-DIE 140 TILES 14×10</span>}
            </div>
            <div className="absolute bottom-[18px] right-6 text-[11px] text-[#7fee64]/60">{userInteracted?'ESC TO CLEAR':'DRAG TO BEGIN'}</div>
            <HelpPanel />
            {rackView && isGB200 && <RackStats />}
          </section>
        </div>
        <MobileBar />
      </div>
    </main>
  )
}
