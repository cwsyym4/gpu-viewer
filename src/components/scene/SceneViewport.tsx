'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
import { useViewerStore } from '@/store/useViewerStore'
import * as THREE from 'three'

export const CAMERA_PRESETS = {
  exterior: { pos: [2.8, 2.2, 2.8] as [number,number,number], target: [0, 0.2, 0] as [number,number,number], fov: 28, minDist: 1.5, maxDist: 12 },
  architecture: { pos: [0, 4.8, 3.2] as [number,number,number], target: [0, 0.3, 0] as [number,number,number], fov: 34, minDist: 1, maxDist: 14 },
  system: { pos: [2.5, 1.8, 2.5] as [number,number,number], target: [0, 0.8, 0] as [number,number,number], fov: 28, minDist: 1.5, maxDist: 12 },
  rack: { pos: [0, 3.6, 10.5] as [number,number,number], target: [0, 3.4, 0] as [number,number,number], fov: 38, minDist: 2, maxDist: 22 },
}

type Props = { children: React.ReactNode, onCreated?: (state:any)=>void, isRack?: boolean }

function WebGLFallback(){
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#090f0a] border border-[#7fee64]/20" data-testid="webgl-fallback">
      <svg viewBox="0 0 320 180" width="80%" height="80%" role="img" aria-label="Static GPU board">
        <rect x="20" y="40" width="280" height="100" rx="8" fill={palette.board} stroke={palette.gridMajor} strokeWidth="1" />
        <rect x="80" y="65" width="80" height="50" rx="6" fill={palette.package} />
        <rect x="180" y="70" width="80" height="50" rx="6" fill={palette.hbmStack} />
        <text x="120" y="88" fill={palette.lime} fontSize="8" fontFamily="monospace">GH100 DIE</text>
        <text x="92" y="105" fill="#8fd" fontSize="7" fontFamily="monospace">WebGL unavailable – static fallback</text>
      </svg>
    </div>
  )
}

export function SceneViewport({ children, onCreated, isRack }: Props){
  const canvasRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const resetToken = useViewerStore(s=> s.resetToken)
  const view = useViewerStore(s=> s.view)
  const selected = useViewerStore(s=> s.selected)
  const currentGPU = useViewerStore(s=> s.currentGPU)
  const gpuId = currentGPU ?? 'unknown'
  const rackView = useViewerStore(s=> s.rackView)
  const workload = useViewerStore(s=> s.workload)
  const setUserInteracted = useViewerStore(s=> s.setUserInteracted)
  const controlsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)

  useEffect(()=>{
    try{ const c=document.createElement('canvas'); const ctx=c.getContext('webgl2') || c.getContext('webgl'); if(!ctx) setFailed(true) }catch{ setFailed(true) }
  },[])

  const applyPreset = useCallback((presetKey: keyof typeof CAMERA_PRESETS)=>{
    const preset = CAMERA_PRESETS[presetKey]
    if(!preset) return
    const ctrl = controlsRef.current
    if(!ctrl) return
    try{
      if(ctrl.object){
        ctrl.object.position.set(...preset.pos)
        ctrl.object.fov = preset.fov
        ctrl.object.zoom = 1
        ctrl.object.rotation.set(0,0,0)
        ctrl.object.updateProjectionMatrix()
        if(cameraRef.current){
          cameraRef.current.position.set(...preset.pos)
          cameraRef.current.fov = preset.fov
          cameraRef.current.updateProjectionMatrix()
        }
      }
      ctrl.target.set(...(preset.target as any))
      ;(ctrl as any).minDistance = preset.minDist
      ;(ctrl as any).maxDistance = preset.maxDist
      ctrl.update()
    }catch{}
  },[])

  // Per-view camera presets – rack centered around bbox y=-2..9
  useEffect(()=>{
    let key: keyof typeof CAMERA_PRESETS = 'exterior'
    if(isRack && view==='system') key='rack'
    else if(view==='architecture') key='architecture'
    else if(view==='system') key='system'
    else key='exterior'
    // small delay to let Canvas mount
    const t = setTimeout(()=> applyPreset(key), 80)
    return ()=> clearTimeout(t)
  },[view, isRack, applyPreset])

  // Complete camera reset: respects current view preset
  useEffect(()=>{
    let key: keyof typeof CAMERA_PRESETS = 'exterior'
    if(isRack) key='rack'
    else if(view==='architecture') key='architecture'
    else if(view==='system') key='system'
    applyPreset(key)
  },[resetToken, view, isRack, applyPreset])

  const handleCreated = useCallback((state:any)=>{
    onCreated?.(state)
    cameraRef.current = state.camera
    state.gl.toneMapping = THREE.ACESFilmicToneMapping
    state.gl.toneMappingExposure = isRack ? 1.85 : 1.55
    state.gl.setClearColor(palette.ground)
    try{ (window as any).__R3F_SCENE__ = state.scene; (window as any).__R3F__={ root:{ getState:()=>({ scene: state.scene }) } } }catch{}
    // apply initial preset after creation
    try{
      let key: keyof typeof CAMERA_PRESETS = 'exterior'
      if(isRack) key='rack'
      else if(view==='architecture') key='architecture'
      else if(view==='system') key='system'
      const p = CAMERA_PRESETS[key]
      state.camera.position.set(...p.pos)
      state.camera.fov = p.fov
      state.camera.updateProjectionMatrix()
    }catch{}
    const el = state.gl?.domElement as HTMLCanvasElement | undefined
    if(el){
      const onLost = (e: Event)=>{ e.preventDefault(); setFailed(true) }
      el.addEventListener('webglcontextlost', onLost as any, false)
      return ()=> el.removeEventListener('webglcontextlost', onLost as any)
    }
  },[onCreated, isRack, view])

  const FiberCanvas = Canvas as any
  const sceneGroups = [view, selected, gpuId, isRack? 'rack':'module', workload ?? 'no-workload'].filter(Boolean)

  // initial camera fov based on view to avoid jump
  const initPreset = isRack ? CAMERA_PRESETS.rack : view==='architecture' ? CAMERA_PRESETS.architecture : view==='system' ? CAMERA_PRESETS.system : CAMERA_PRESETS.exterior

  return (
    <div ref={canvasRef} className="w-full h-[420px] md:h-[520px] relative bg-[#0a0f0a]" data-testid="scene-canvas">
      {/* DOM status for Playwright – avoids querying Three directly via data-testid */}
      <div data-testid="scene-state" className="sr-only">{JSON.stringify({ view, gpuId, rackView, selected: selected ?? null, workload: workload ?? null, groups: sceneGroups, exterior: view==='exterior', architecture: view==='architecture', system: view==='system', ready: true, preset: isRack ? 'rack' : view })}</div>
      <div data-testid="stage-status-sr" className="sr-only">MODEL READY – {view.toUpperCase()} {rackView?'RACK':'MODULE'} {gpuId}</div>
      <div data-testid="architecture-exploded-sr" className="sr-only" style={{display: view==='architecture'?'block':'none'}}>{view==='architecture'?'arch':''}</div>
      <div data-testid="system-view-sr" className="sr-only" style={{display: view==='system'?'block':'none'}}>{view==='system'?'sys':''}</div>
      <div data-testid="exterior-group-sr" className="sr-only" style={{display: view==='exterior'?'block':'none'}}>ext</div>
      {(gpuId==='blackwell-gb200' || gpuId==='rubin-r100') && rackView && view==='system' && <div data-testid="rack-nvl72-sr" className="sr-only">rack</div>}
      {failed ? <WebGLFallback /> : (
        <FiberCanvas
          frameloop="always"
          gl={{ antialias:true, alpha:false, stencil:false, depth:true, powerPreference:'high-performance' }}
          dpr={[1,1.5]}
          camera={{ position: initPreset.pos as any, fov: initPreset.fov, near:0.1, far:100 }}
          onCreated={handleCreated}
          onPointerMissed={()=>{}}
          style={{ width:'100%', height:'100%' }}
        >
          <color attach="background" args={[palette.ground]} />
          <fog attach="fog" args={isRack ? [palette.ground, 18, 95] : [palette.ground, 24, 42]} />
          <ambientLight intensity={1.35} color="#eaffea" />
          <hemisphereLight intensity={0.8} color="#eaffea" groundColor="#0a2a0a" />
          <directionalLight position={[6,9,7]} intensity={4} castShadow={false} />
          <directionalLight position={[-5,4,-6]} intensity={1.4} />
          <group>
            {children}
          </group>
          <Grid args={[40,40]} cellSize={1} cellThickness={0.5} cellColor={palette.gridMinor} sectionSize={4} sectionThickness={1.2} sectionColor={palette.gridMajor} fadeDistance={22} fadeStrength={1} followCamera={false} position={[0,-0.12,0] as any} />
          <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={2} maxDistance={22} minPolarAngle={0.2} maxPolarAngle={Math.PI*0.52}
            onStart={()=> setUserInteracted(true)}
            onChange={()=> setUserInteracted(true)}
          />
        </FiberCanvas>
      )}
    </div>
  )
}
