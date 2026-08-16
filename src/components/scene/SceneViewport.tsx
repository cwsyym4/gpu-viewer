'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '@/lib/materials/palette'

export function SceneViewport({ children, onCreated }: { children: React.ReactNode, onCreated?: (state:any)=>void }){
  return (
    <Canvas
      dpr={[1,2] as any}
      shadows
      gl={{ antialias:true, powerPreference:'high-performance' } as any}
      camera={{ fov:32, position:[9.2,6.5,9.6], near:0.1, far:100 } as any}
      onCreated={onCreated as any}
      style={{width:'100%',height:'100%'}}
    >
      <color attach="background" args={[palette.fog]} />
      <fog attach="fog" args={[palette.fog, 24, 42]} />
      <ambientLight intensity={palette.ambientIntensity} />
      <directionalLight intensity={palette.dirIntensity} position={[6,10,8]} castShadow shadow-mapSize={[2048,2048]} />
      <directionalLight intensity={palette.dir2Intensity} position={[-6,5,-4]} />
      <pointLight color={palette.lime} intensity={4} distance={15} position={[0,2,7]} />
      <Grid args={[18,36]} position={[0,-0.52,0]} cellColor={palette.gridMinor as any} sectionColor={palette.gridMajor as any} fadeDistance={18} />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.5,0]} receiveShadow>
        <planeGeometry args={[11,11]} />
        <shadowMaterial opacity={palette.contactShadowOpacity} />
      </mesh>
      {children}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.065}
        minDistance={6.8}
        maxDistance={24}
        minPolarAngle={0.35}
        maxPolarAngle={1.48}
        autoRotate
        autoRotateSpeed={0.55}
      />
    </Canvas>
  )
}
