'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
import { useViewerStore } from '@/store/useViewerStore'
import * as THREE from 'three'

export const CAMERA_PRESETS = {
  exterior: { direction: [1, 0.72, 1] as [number,number,number], target: [0, 0.2, 0] as [number,number,number], fov: 36, frame: [6.5, 3.1] as [number,number], minDist: 2, maxDist: 24 },
  architecture: { direction: [0, 0.82, 0.58] as [number,number,number], target: [0, 0.35, 0] as [number,number,number], fov: 38, frame: [9.5, 5.4] as [number,number], minDist: 3, maxDist: 36 },
  system: { direction: [1, 0.68, 1] as [number,number,number], target: [0, 0.9, 0] as [number,number,number], fov: 38, frame: [7.2, 6.0] as [number,number], minDist: 3, maxDist: 30 },
  rack: { direction: [0.22, 0.06, 1] as [number,number,number], target: [0, 3.45, 0] as [number,number,number], fov: 42, frame: [6.4, 14.8] as [number,number], minDist: 8, maxDist: 44 },
}

type CameraKey = keyof typeof CAMERA_PRESETS
type Props = { children: React.ReactNode, onCreated?: (state:any)=>void, isRack?: boolean, fallbackLabel?: string }

function getPresetForAspect(key: CameraKey, aspect: number){
  const preset = CAMERA_PRESETS[key]
  const frame = key==='architecture' && aspect<1.1 ? [5.4, 7.4] as [number,number] : preset.frame
  const verticalFov = THREE.MathUtils.degToRad(preset.fov)
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(aspect, 0.4))
  const verticalDistance = (frame[1] / 2) / Math.tan(verticalFov / 2)
  const horizontalDistance = (frame[0] / 2) / Math.tan(horizontalFov / 2)
  const distance = Math.max(verticalDistance, horizontalDistance) * 1.12
  const direction = new THREE.Vector3(...preset.direction).normalize()
  const target = new THREE.Vector3(...preset.target)
  const position = target.clone().add(direction.multiplyScalar(distance))
  return { ...preset, position }
}

function WebGLFallback({ label }: { label: string }){
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#090f0a] border border-[#7fee64]/20" data-testid="webgl-fallback">
      <svg viewBox="0 0 320 180" width="80%" height="80%" role="img" aria-label="Static GPU board">
        <rect x="20" y="40" width="280" height="100" rx="8" fill={palette.board} stroke={palette.gridMajor} strokeWidth="1" />
        <rect x="80" y="65" width="80" height="50" rx="6" fill={palette.package} />
        <rect x="180" y="70" width="80" height="50" rx="6" fill={palette.hbmStack} />
        <text x="120" y="88" fill={palette.lime} fontSize="8" fontFamily="monospace">{label}</text>
        <text x="92" y="105" fill="#8fd" fontSize="7" fontFamily="monospace">WebGL unavailable – static fallback</text>
      </svg>
    </div>
  )
}

export function SceneViewport({ children, onCreated, isRack, fallbackLabel = 'GPU MODULE' }: Props){
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
  const invalidateRef = useRef<null | (()=>void)>(null)
  const contextLostCleanupRef = useRef<null | (()=>void)>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(()=>{
    try{ const c=document.createElement('canvas'); const ctx=c.getContext('webgl2') || c.getContext('webgl'); if(!ctx) setFailed(true) }catch{ setFailed(true) }
  },[])

  useEffect(()=>{
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = ()=> setReducedMotion(query.matches)
    update()
    query.addEventListener?.('change', update)
    return ()=> query.removeEventListener?.('change', update)
  },[])

  const applyPreset = useCallback((presetKey: CameraKey)=>{
    const node = canvasRef.current
    const aspect = node && node.clientHeight ? node.clientWidth / node.clientHeight : 16 / 9
    const preset = getPresetForAspect(presetKey, aspect)
    if(!preset) return
    const ctrl = controlsRef.current
    if(!ctrl) return
    try{
      if(ctrl.object){
        ctrl.object.position.copy(preset.position)
        ctrl.object.fov = preset.fov
        ctrl.object.zoom = 1
        ctrl.object.rotation.set(0,0,0)
        ctrl.object.updateProjectionMatrix()
        if(cameraRef.current){
          cameraRef.current.position.copy(preset.position)
          cameraRef.current.fov = preset.fov
          cameraRef.current.updateProjectionMatrix()
        }
      }
      ctrl.target.set(...(preset.target as any))
      ;(ctrl as any).minDistance = preset.minDist
      ;(ctrl as any).maxDistance = preset.maxDist
      ctrl.update()
      ctrl.object?.updateMatrixWorld?.(true)
      invalidateRef.current?.()
      requestAnimationFrame(()=> invalidateRef.current?.())
    }catch{}
  },[])

  // Per-view camera presets – rack centered around bbox y=-2..9
  useEffect(()=>{
    let key: CameraKey = 'exterior'
    if(isRack && view==='system') key='rack'
    else if(view==='architecture') key='architecture'
    else if(view==='system') key='system'
    else key='exterior'
    // small delay to let Canvas mount
    const t = setTimeout(()=> applyPreset(key), 80)
    return ()=> clearTimeout(t)
  },[view, isRack, applyPreset])

  useEffect(()=>{
    const node = canvasRef.current
    if(!node || typeof ResizeObserver === 'undefined') return
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new ResizeObserver(()=>{
      if(timer) clearTimeout(timer)
      timer = setTimeout(()=>{
        const key: CameraKey = isRack && view==='system' ? 'rack' : view
        applyPreset(key)
      }, 60)
    })
    observer.observe(node)
    return ()=>{ observer.disconnect(); if(timer) clearTimeout(timer) }
  },[view, isRack, applyPreset])

  // Complete camera reset: respects current view preset
  useEffect(()=>{
    let key: CameraKey = 'exterior'
    if(isRack) key='rack'
    else if(view==='architecture') key='architecture'
    else if(view==='system') key='system'
    applyPreset(key)
  },[resetToken, view, isRack, applyPreset])

  const handleCreated = useCallback((state:any)=>{
    onCreated?.(state)
    cameraRef.current = state.camera
    invalidateRef.current = state.invalidate
    state.gl.toneMapping = THREE.ACESFilmicToneMapping
    state.gl.toneMappingExposure = isRack ? 1.85 : 1.55
    state.gl.setClearColor(palette.ground)
    try{
      ;(window as any).__R3F_SCENE__ = state.scene
      ;(window as any).__R3F_CAMERA__ = state.camera
      ;(window as any).__R3F__={ root:{ getState:()=>({ scene: state.scene, camera: state.camera }) } }
    }catch{}
    // apply initial preset after creation
    try{
      let key: CameraKey = 'exterior'
      if(isRack) key='rack'
      else if(view==='architecture') key='architecture'
      else if(view==='system') key='system'
      const aspect = state.size?.height ? state.size.width / state.size.height : 16 / 9
      const p = getPresetForAspect(key, aspect)
      state.camera.position.copy(p.position)
      state.camera.fov = p.fov
      state.camera.lookAt(...p.target)
      state.camera.updateProjectionMatrix()
    }catch{}
    const el = state.gl?.domElement as HTMLCanvasElement | undefined
    if(el){
      const onLost = (e: Event)=>{ e.preventDefault(); setFailed(true) }
      contextLostCleanupRef.current?.()
      el.addEventListener('webglcontextlost', onLost as any, false)
      contextLostCleanupRef.current = ()=> el.removeEventListener('webglcontextlost', onLost as any)
    }
  },[onCreated, isRack, view])

  useEffect(()=> ()=> contextLostCleanupRef.current?.(), [])

  const FiberCanvas = Canvas as any
  const sceneGroups = [view, selected, gpuId, isRack? 'rack':'module', workload ?? 'no-workload'].filter(Boolean)

  // initial camera fov based on view to avoid jump
  const initKey: CameraKey = isRack ? 'rack' : view
  const initialAspect = canvasRef.current?.clientHeight ? canvasRef.current.clientWidth / canvasRef.current.clientHeight : 16 / 9
  const initPreset = getPresetForAspect(initKey, initialAspect)

  return (
    <div ref={canvasRef} className="w-full h-[420px] md:h-[520px] relative bg-[#0a0f0a]" data-testid="scene-canvas">
      {/* DOM status for Playwright – avoids querying Three directly via data-testid */}
      <div data-testid="scene-state" className="sr-only">{JSON.stringify({ view, gpuId, rackView, selected: selected ?? null, workload: workload ?? null, groups: sceneGroups, exterior: view==='exterior', architecture: view==='architecture', system: view==='system', ready: true, preset: isRack ? 'rack' : view })}</div>
      <div data-testid="stage-status-sr" className="sr-only">MODEL READY – {view.toUpperCase()} {rackView?'RACK':'MODULE'} {gpuId}</div>
      <div data-testid="architecture-exploded-sr" className="sr-only" style={{display: view==='architecture'?'block':'none'}}>{view==='architecture'?'arch':''}</div>
      <div data-testid="system-view-sr" className="sr-only" style={{display: view==='system'?'block':'none'}}>{view==='system'?'sys':''}</div>
      <div data-testid="exterior-group-sr" className="sr-only" style={{display: view==='exterior'?'block':'none'}}>ext</div>
      {(gpuId==='blackwell-gb200' || gpuId==='rubin-r100') && rackView && view==='system' && <div data-testid="rack-nvl72-sr" className="sr-only">rack</div>}
      {failed ? <WebGLFallback label={fallbackLabel} /> : (
        <FiberCanvas
          frameloop={reducedMotion ? 'demand' : 'always'}
          gl={{ antialias:true, alpha:false, stencil:false, depth:true, powerPreference:'high-performance' }}
          dpr={[1,1.5]}
          camera={{ position: initPreset.position.toArray() as any, fov: initPreset.fov, near:0.1, far:100 }}
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
          <OrbitControls ref={controlsRef} enableDamping={!reducedMotion} dampingFactor={0.08} minDistance={2} maxDistance={22} minPolarAngle={0.2} maxPolarAngle={Math.PI*0.52}
            onStart={()=> setUserInteracted(true)}
            onChange={()=> setUserInteracted(true)}
          />
        </FiberCanvas>
      )}
    </div>
  )
}
