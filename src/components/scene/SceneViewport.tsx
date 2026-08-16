'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
import { useViewerStore } from '@/store/useViewerStore'
import * as THREE from 'three'

type Props = { children: React.ReactNode, onCreated?: (state:any)=>void, isRack?: boolean }

function WebGLFallback(){
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#090f0a] border border-[#7fee64]/20" data-testid="webgl-fallback">
      <svg viewBox="0 0 320 180" width="80%" height="80%" role="img" aria-label="Static GPU board">
        <rect x="20" y="40" width="280" height="100" rx="8" fill={palette.board} stroke={palette.gridMajor} strokeWidth="1" />
        <rect x="80" y="65" width="80" height="50" rx="6" fill={palette.package} />
        <rect x="180" y="70" width="80" height="50" rx="6" fill={palette.hbmStack} />
        <text x="120" y="88" fill={palette.lime} fontSize="8" fontFamily="monospace">GH100 DIE</text>
      </svg>
    </div>
  )
}

export function SceneViewport({ children, onCreated, isRack }: Props){
  const canvasRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const resetToken = useViewerStore(s=> s.resetToken)
  const setUserInteracted = useViewerStore(s=> s.setUserInteracted)
  const controlsRef = useRef<any>(null)

  useEffect(()=>{
    if(controlsRef.current){
      controlsRef.current.target.set(0,0.3,0); controlsRef.current.update()
    }
  },[resetToken])

  const handleCreated = useCallback((state:any)=>{
    onCreated?.(state)
    state.gl.toneMapping = THREE.ACESFilmicToneMapping
    state.gl.toneMappingExposure = isRack ? 1.85 : 1.55
    state.gl.setClearColor(palette.ground)
  },[onCreated, isRack])

  return (
    <div ref={canvasRef} className="w-full h-[420px] md:h-[520px] relative bg-[#0a0f0a]" data-testid="scene-canvas">
      {failed ? <WebGLFallback /> : (
        <Canvas
          frameloop={"always" as any}
          gl={{ antialias:true, alpha:false, stencil:false, depth:true, powerPreference:'high-performance' }}
          dpr={[1,1.5]}
          camera={{ position:[6,6,6], fov:28, near:0.1, far:100 }}
          onCreated={handleCreated}
          onPointerMissed={()=>{}}
          style={{ width:'100%', height:'100%' }}
        >
          <color attach="background" args={[palette.ground]} />
          <fog attach="fog" args={isRack ? [palette.ground, 20, 80] : [palette.ground, 24, 42]} />
          <ambientLight intensity={1.35} color="#eaffea" />
          <hemisphereLight intensity={0.8} color="#eaffea" groundColor="#0a2a0a" />
          <directionalLight position={[6,9,7]} intensity={4} castShadow={false} />
          <directionalLight position={[-5,4,-6]} intensity={1.4} />
          <group>
            {children}
          </group>
          <Grid args={[40,40]} cellSize={1} cellThickness={0.5} cellColor={palette.gridMinor} sectionSize={4} sectionThickness={1.2} sectionColor={palette.gridMajor} fadeDistance={22} fadeStrength={1} followCamera={false} position={[0,-0.12,0]} />
          <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={2} maxDistance={18} minPolarAngle={0.25} maxPolarAngle={Math.PI*0.48}
            onStart={()=> setUserInteracted(true)}
            onChange={()=> setUserInteracted(true)}
          />
        </Canvas>
      )}
    </div>
  )
}
