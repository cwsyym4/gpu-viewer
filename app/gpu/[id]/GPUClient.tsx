'use client'
import { useMemo, useEffect, useState } from 'react'
import { getSpec, partDefs } from '@/lib/definitions'
import { SceneViewport } from '@/components/scene/SceneViewport'
import { Board, DieTileGrid, MountingHoles } from '@/components/gpu'
import { HBMStack } from '@/components/gpu/HBMStack'
import { ComponentIndex } from '@/components/ui/ComponentIndex'
import { MobileBar } from '@/components/ui/MobileBar'
import { NVL72Rack } from '@/components/rack/NVL72Rack'
import { useViewerStore } from '@/store/useViewerStore'
import { Html } from '@react-three/drei'
import { RoundedBox } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'

function PowerStage({pos, idx, left}:{pos:[number,number], idx:number, left:boolean}){
  const size = left ? ([0.29, idx%3===0?0.34:0.27,0.36] as any) : ([0.31, idx%4===0?0.36:0.28,0.35] as any)
  const color = left ? (idx%4===0 ? palette.powerAlt : palette.powerDark) : (idx%5===0 ? palette.powerAlt2 : palette.powerDark)
  return <RoundedBox args={size} radius={0.035} smoothness={2} position={[pos[0],0.29,pos[1] as any] as any}><meshStandardMaterial color={color as any} metalness={0.42} roughness={0.48} /></RoundedBox>
}

export default function GPUClient({ specId }:{ specId:string}){
  const spec = useMemo(()=> getSpec(specId), [specId])
  const store = useViewerStore()
  const { view, rackView, setRackView, hovered, selected, helpOpen, setHelp, reset, userInteracted, setCurrentGPU } = store as any
  const active = hovered || selected
  const [mounted,setMounted]=useState(false)
  useEffect(()=>{setMounted(true); setCurrentGPU(specId)},[specId,setCurrentGPU])
  const isH100 = spec.id==='h100-sxm5'
  const isGB200 = spec.id==='blackwell-gb200'
  const isB200 = spec.id==='b200-sxm'
  const headerTitle = isH100 ? 'H100 / ARCHITECTURE' : isB200 ? 'B200 / ARCHITECTURE' : isGB200 ? 'GB200 / ARCHITECTURE' : `${spec.label.toUpperCase()} / ARCHITECTURE`

  return (
    <main className="page-frame">
      <div className="terminal-shell">
        <header className="site-header">
          <div className="brand-lockup"><strong>{spec.label.split(' ')[0]}</strong><span>GPU Glossary</span></div>
          <div className="header-title">{headerTitle}</div>
          <div className="header-actions">
            <div className="view-switch">
              <button type="button" data-active={view==='exterior'} onClick={()=>store.setView('exterior')}>Exterior</button>
              <button type="button" data-active={view==='architecture'} onClick={()=>store.setView('architecture')}>Architecture</button>
            </div>
            {isGB200 && (
              <div className="view-switch" style={{gap:'8px', marginLeft:'10px', borderLeft:'1px solid rgba(127,238,100,.2)', paddingLeft:'10px'}}>
                <button type="button" data-active={!rackView} onClick={()=>setRackView(false)} style={{fontSize:'11px'}}>Module</button>
                <button type="button" data-active={rackView} onClick={()=>setRackView(true)} style={{fontSize:'11px'}}>Rack NVL72</button>
              </div>
            )}
            <button type="button" className="text-control" onClick={()=>reset()}>Reset view</button>
            <button type="button" className="help-button" aria-label="Toggle help" aria-expanded={helpOpen} onClick={()=>setHelp(!helpOpen)}>?</button>
          </div>
        </header>
        <div className="explorer-grid">
          <ComponentIndex />
          <section className="scene-stage">
            <div className="stage-path">/device-hardware/{spec.id}{rackView && isGB200 ? ' / nvl72' : ''}</div>
            <div className="view-label"><span>{rackView && isGB200 ? 'GB200 NVL72 RACK' : view==='exterior' ? spec.module : 'ILLUSTRATIVE ARCHITECTURE VIEW'}</span><i /></div>
            <div className="canvas-wrap" style={{position:'absolute', inset:0}}>
              {mounted && (
                rackView && isGB200 ? (
                  <SceneViewport isRack>
                    <group position={[0,-0.5,0]}><NVL72Rack /></group>
                  </SceneViewport>
                ) : (
                  <SceneViewport>
                    <group rotation={[0,-0.08,0]} position={[0,0.08,0]}>
                      <Board size={spec.boardSize as any} />
                      <MountingHoles positions={spec.mountingHoles as any} />
                      {/* traces */}
                      {[-1.65,-1.23,1.23,1.65].map(z=>(
                        <mesh key={z} position={[-0.03,0.195,z] as any}><boxGeometry args={[5.15,0.008,0.018] as any} /><meshStandardMaterial color="#5a4a35" metalness={0.5} roughness={0.55} /></mesh>
                      ))}
                      {/* power stages left/right */}
                      {spec.leftPowerStages.map((p:any,i:number)=> <PowerStage key={`l-${p[0]}-${p[1]}`} pos={p} idx={i} left />)}
                      {spec.rightPowerStages.map((p:any,i:number)=> <PowerStage key={`r-${p[0]}-${p[1]}`} pos={p} idx={i} left={false} />)}
                      {/* capacitors */}
                      {[-1.38,-1.02,-0.66,0.68,1.04,1.4].map(z=>(
                        <group key={z}>{[-2.66,-2.49,2.32,2.49].map(x=>(
                          <RoundedBox key={`${x}-${z}`} args={[0.1,0.17,0.18] as any} radius={0.02} position={[x,0.24,z] as any}><meshStandardMaterial color={palette.capacitor} metalness={0.75} roughness={0.3} /></RoundedBox>
                        ))}</group>
                      ))}
                      {/* clamps top */}
                      {spec.topClampPositions.map((e:any)=>(
                        <group key={e}>
                          <RoundedBox args={[0.34,0.46,0.42] as any} radius={0.035} position={[e,0.39,-1.77] as any}><meshStandardMaterial color={palette.clamp as any} metalness={0.7} /></RoundedBox>
                          <RoundedBox args={[0.34,0.46,0.42] as any} radius={0.035} position={[e,0.39,1.77] as any}><meshStandardMaterial color={palette.clamp as any} metalness={0.7} /></RoundedBox>
                          <mesh position={[e,0.61,-1.77] as any}><boxGeometry args={[0.35,0.03,0.34] as any} /><meshStandardMaterial color={palette.clampTop as any} metalness={0.88} roughness={0.24} /></mesh>
                          <mesh position={[e,0.61,1.77] as any}><boxGeometry args={[0.35,0.03,0.34] as any} /><meshStandardMaterial color={palette.clampTop as any} metalness={0.88} roughness={0.24} /></mesh>
                        </group>
                      ))}
                      {/* package + interposer */}
                      <RoundedBox args={spec.packageSize as any} radius={0.11} smoothness={4} position={[0,0.35,0]}><meshStandardMaterial color={palette.package as any} metalness={0.54} roughness={0.34} /></RoundedBox>
                      <RoundedBox args={[spec.packageSize[0]-0.30,0.12,spec.packageSize[2]-0.30] as any} radius={0.065} smoothness={3} position={[0,0.55,0]}><meshStandardMaterial color={palette.packageInner as any} metalness={0.5} roughness={0.42} /></RoundedBox>
                      <group position={[0,0.73,0]}>
                        <DieTileGrid cols={spec.dieTileColumns} rows={spec.dieTileRows} active={active==='cuda-architecture'} dualDie={!!spec.dualDie} dieSize={spec.dieSize as any} interposer={!!spec.interposer} isGB200={isGB200} />
                      </group>
                      {spec.packageSites.filter((s:any)=>s.kind==='memory').map((s:any,i:number)=>(
                        <HBMStack key={i} position={[s.position[0],0.72,s.position[1]] as any} active={active==='gpu-ram'} />
                      ))}
                      {/* structural dummy */}
                      {spec.packageSites.filter((s:any)=>s.kind==='structural').map((s:any,i:number)=>(
                        <RoundedBox key={`struct-${i}`} args={[0.64,0.15,0.5] as any} radius={0.035} position={[s.position[0],0.72,s.position[1]] as any}><meshStandardMaterial color="#202321" /></RoundedBox>
                      ))}
                      {/* side contacts gold */}
                      {spec.sideContacts.map((c:any)=>(
                        <group key={c}>
                          <mesh position={[-1.3,0.64,0.58*c] as any}><boxGeometry args={[0.025,0.035,0.075] as any} /><meshStandardMaterial color={palette.goldContact as any} metalness={0.86} roughness={0.2} /></mesh>
                          <mesh position={[1.3,0.64,0.58*c] as any}><boxGeometry args={[0.025,0.035,0.075] as any} /><meshStandardMaterial color={palette.goldContact as any} metalness={0.86} roughness={0.2} /></mesh>
                        </group>
                      ))}
                      {/* daughterboard original 1.08x.1x.76 at 3.22,.53,-1.43 rot -.06 */}
                      <group position={[3.22,0.53,-1.43] as any} rotation={[0,-0.06,0] as any}>
                        <RoundedBox args={[1.08,0.1,0.76] as any} radius={0.035} smoothness={2}><meshStandardMaterial color={palette.daughterboard as any} metalness={0.24} roughness={0.65} /></RoundedBox>
                        <RoundedBox args={[0.34,0.16,0.34] as any} position={[-0.26,0.12,0.03] as any} radius={0.02}><meshStandardMaterial color="#111512" /></RoundedBox>
                        <RoundedBox args={[0.26,0.14,0.22] as any} position={[0.25,0.12,-0.13] as any} radius={0.02}><meshStandardMaterial color="#111512" /></RoundedBox>
                        {[-0.35,-0.12,0.11,0.34].map(x=>(
                          <RoundedBox key={x} args={[0.11,0.12,0.12] as any} radius={0.015} position={[x,0.12,0.29] as any}><meshStandardMaterial color="#a5a59c" metalness={0.78} /></RoundedBox>
                        ))}
                      </group>
                    </group>
                  </SceneViewport>
                )
              )}
            </div>
            {mounted && !rackView && active && (()=>{ const def = partDefs.find(d=>d.id===active); if(!def) return null; return (
              <Html position={def.anchor as any} center distanceFactor={7.5} zIndexRange={[40,0] as any}>
                <article className="part-popover">
                  <div className="popover-kicker"><span>{def.index} / COMPONENT</span>{def.abbreviation && <b>{def.abbreviation}</b>}</div>
                  <h2>{def.title}</h2><p>{def.description}</p><a href={def.glossaryUrl} target="_blank" rel="noreferrer">OPEN GLOSSARY ↗</a>
                </article>
              </Html>
            )})()}
            {helpOpen && <div className="help-panel"><button type="button" onClick={()=>setHelp(false)}>×</button><span>CONTROLS</span><p>Drag to rotate. Scroll or pinch to zoom. Hover a component to inspect it.</p><p>Desktop component clicks open Modal. Touch taps pin a card first.</p></div>}
            <div className="stage-status"><span className="status-dot"></span>{active ? partDefs.find(d=>d.id===active)?.title.toUpperCase() : 'MODEL READY'}</div>
            <div className="stage-hint">{userInteracted ? 'ESC TO CLEAR' : 'DRAG TO BEGIN'}</div>
          </section>
        </div>
        <MobileBar />
      </div>
    </main>
  )
}
