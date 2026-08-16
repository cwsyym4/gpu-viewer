'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei'
import { palette } from '@/lib/materials/palette'
import { useViewerStore } from '@/store/useViewerStore'
import * as THREE from 'three'

type Props = { children: React.ReactNode, onCreated?: (state:any)=>void, isRack?: boolean }

function WebGLFallback({ isRack }: { isRack?: boolean }){
  // static SVG fallback when WebGL disabled
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#090f0a] border border-[#7fee64]/20" data-testid="webgl-fallback">
      <svg viewBox="0 0 320 180" width="80%" height="80%" role="img" aria-label="Static GPU board diagram fallback when WebGL disabled">
        <rect x="20" y="40" width="280" height="100" rx="8" fill={palette.board} stroke={palette.gridMajor} strokeWidth="1" />
        <rect x="80" y="65" width="80" height="50" rx="6" fill={palette.package} />
        <g>
          {Array.from({length:12}).map((_,i)=> <rect key={i} x={90 + (i%4)*18} y={70 + Math.floor(i/4)*12} width="12" height="6" fill={palette.tilePalette[i%6]} opacity="0.9" />)}
        </g>
        {Array.from({length:5}).map((_,i)=><rect key={i} x={180+ (i%2)*22} y={68 + Math.floor(i/2)*22} width="16" height="14" rx="2" fill={palette.memory} opacity="0.6" />)}
        <text x="160" y="20" textAnchor="middle" fill={palette.lime} fontFamily="monospace" fontSize="10">{isRack ? 'NVL72 RACK 72 GPUs 36 CPUs 130TB/s' : 'GPU MODULE – NO WEBGL FALLBACK'}</text>
        <text x="160" y="160" textAnchor="middle" fill={palette.lime80} fontFamily="monospace" fontSize="8">Enable WebGL for interactive 3D · Board {isRack?'rack':'SXM'} view still readable</text>
      </svg>
    </div>
  )
}

export function SceneViewport({ children, onCreated, isRack }: Props){
  const userInteracted = useViewerStore(s=> s.userInteracted)
  const resetToken = useViewerStore(s=> s.resetToken)
  const setUserInteracted = useViewerStore(s=> s.setUserInteracted)
  const controlsRef = useRef<any>(null)
  const [webglFailed, setWebglFailed] = useState(false)
  const [glError, setGlError] = useState<string | null>(null)

  // reset camera consumption
  const resetCamera = useCallback(()=>{
    const ctl = controlsRef.current
    if(!ctl) return
    ctl.reset?.()
    // also reset target and camera position manually
    ctl.object?.position?.set(isRack ? 11.5 : 9.2, isRack ? 8.2 : 6.5, isRack ? 14.8 : 9.6)
    ctl.target?.set(0, isRack ? 0 : 0.3, 0)
    ctl.update()
  }, [isRack])

  useEffect(()=>{
    if(resetToken>0){
      resetCamera()
    }
  }, [resetToken, resetCamera])

  const handleCreated = useCallback((state:any)=>{
    // detect WebGL failure: if renderer missing
    try {
      const gl = state.gl as THREE.WebGLRenderer
      if(!gl || !gl.domElement) {
        setWebglFailed(true)
        setGlError('WebGLRenderer creation failed')
      }
    } catch(e:any){
      setWebglFailed(true)
      setGlError(String(e))
    }
    onCreated?.(state)
  }, [onCreated])

  if(webglFailed){
    return <WebGLFallback isRack={isRack} />
  }

  return (
    <Canvas
      data-testid="scene-canvas"
      dpr={[1,2] as any}
      shadows
      gl={{ antialias:true, alpha:true, powerPreference:'high-performance', preserveDrawingBuffer:true,
        onContextLost: (e:any)=>{ e.preventDefault(); setWebglFailed(true); setGlError('WebGL context lost') } } as any}
      camera={{ fov: isRack? 28:32, position: isRack? [11.5,8.2,14.8] as any : [9.2,6.5,9.6] as any, near:0.1, far:100 } as any}
      onCreated={handleCreated as any}
      style={{width:'100%',height:'100%'}}
      // overall canvas gets error boundary
      onError={()=> { setWebglFailed(true) }}
    >
      <color attach="background" args={[isRack ? '#090f0a' : palette.fog]} />
      <fog attach="fog" args={[isRack ? '#090f0a' : palette.fog, isRack? 20:24, isRack? 80:42]} />
      <ambientLight intensity={0.9} />
      <directionalLight intensity={2.8} position={[6,10,8]} color={'#f4fff3'} castShadow shadow-mapSize={[2048,2048] as any} />
      <directionalLight intensity={1.6} position={[-6,5,-4]} color={'#dce6dc'} />
      <pointLight color={palette.lime} intensity={4} distance={15} position={[0,2,7]} />
      <Grid args={[isRack?24:18,isRack?48:36] as any} position={[0,-0.52,0]} cellColor={palette.gridMinor as any} sectionColor={palette.gridMajor as any} fadeDistance={isRack?28:18} />
      {isRack ? (
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.5,0]} receiveShadow>
          <planeGeometry args={[14,14]} />
          <shadowMaterial opacity={0.4} />
        </mesh>
      ) : (
        <ContactShadows position={[0,-0.5,0]} opacity={0.7} scale={11} blur={2.5} far={5} color={"#020602"} />
      )}
      {children}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={isRack ? true : false}
        enableDamping
        dampingFactor={0.065}
        minDistance={isRack?12:6.8}
        maxDistance={isRack?90:24}
        minPolarAngle={isRack?0.15:0.35}
        maxPolarAngle={isRack?1.6:1.48}
        autoRotate={!isRack && !userInteracted}
        autoRotateSpeed={0.55}
        onStart={()=> setUserInteracted(true)}
        onChange={()=> { if(!userInteracted) setUserInteracted(true) }}
      />
    </Canvas>
  )
}
