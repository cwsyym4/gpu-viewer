'use client'
import { palette } from '@/lib/materials/palette'
import { getRackSafe, getSuperchipSafe, getSpecSafe } from '@/lib/definitions'
import type { RackSpec, SuperchipSpec } from '@/lib/definitions/types'
import { RoundedBox, Html } from '@react-three/drei'

export function NVL72Rack({ specId, workloadActiveIds, selected }: { specId?:string, workloadActiveIds?:string[], selected?:string }){
  // @ts-ignore rack safe may be null
  const rack: any = getRackSafe(specId ?? 'blackwell-gb200') as any ?? getRackSafe('blackwell-gb200') as any
  const spec = getSpecSafe(specId ?? 'blackwell-gb200')
  const isRubin = specId==='rubin-r100'
  const gpuColor = isRubin ? '#8fe8ff' : palette.package
  const dim = !!workloadActiveIds?.length
  const trayCount = rack?.trayCount ?? 18
  const gpusPerTray = rack?.gpusPerTray ?? (rack?.totalGPUs ? Math.ceil(rack.totalGPUs/trayCount) : 4)

  return (
    <group userData={{ testId: 'rack-nvl72' }}>
      {/* spine */}
      <group position={[1.9,2.4,0] as any} userData={{ testId: 'rack-spine-group' }}>
        <group userData={{ testId: 'rack-spine-mesh' }}><mesh userData={{ testId: 'rack-spine' }}><boxGeometry args={[0.18,6.2,0.32] as any} /><meshStandardMaterial color={(palette as any).rackSpine ?? "#2a2a2a"} /></mesh></group>
        <group position={[0.18,0,0] as any} userData={{ testId: 'spine-nvlink' }}><mesh userData={{ testId: 'spine-nvlink-mesh' }}><boxGeometry args={[0.06,5.8,0.04] as any} /><meshStandardMaterial color={palette.nvlinkPulse} emissive={palette.nvlinkPulse} emissiveIntensity={0.6} /></mesh></group>
      </group>

      {Array.from({length: trayCount}).map((_,trayIdx)=>{
        const y = trayIdx*0.34
        const activeTray = !selected || selected==='rack' || (selected as any)==='tray'
        return (
          <group key={trayIdx} position={[0,y,0] as any} userData={{ testId: `tray-${trayIdx}` }}>
            <group userData={{ testId: `tray-box-${trayIdx}` }}>
              <RoundedBox args={[4.2,0.18,2.2] as any} radius={0.03} userData={{ testId: `tray-mesh-${trayIdx}` }}>
                <meshStandardMaterial color={(palette as any).rackMetal ?? "#1a1f1a"} transparent={dim && !activeTray} opacity={dim && !activeTray?0.3:0.9} />
              </RoundedBox>
            </group>
            {/* Grace CPUs – 2 per tray */}
            <group position={[-1.1,0.14,0.4] as any} userData={{ testId: `grace-cpu-${trayIdx}-0` }}>
              <group userData={{ testId: `grace-mesh-${trayIdx}-0` }}><mesh userData={{ testId: `grace-${trayIdx}-0` }}><boxGeometry args={[0.72,0.08,0.54] as any} /><meshStandardMaterial color="#112233" emissive={selected==='grace-cpu' || workloadActiveIds?.includes('grace-cpu')?"#0ec7ff":"black"} emissiveIntensity={0.4} /></mesh></group>
            </group>
            <group position={[-1.1,0.14,-0.4] as any} userData={{ testId: `grace-cpu-${trayIdx}-1` }}>
              <group userData={{ testId: `grace-mesh-${trayIdx}-1` }}><mesh userData={{ testId: `grace-${trayIdx}-1` }}><boxGeometry args={[0.72,0.08,0.54] as any} /><meshStandardMaterial color="#112233" emissive={selected==='grace-cpu'?"#0ec7ff":"black"} emissiveIntensity={0.4} /></mesh></group>
            </group>
            {/* 4 Blackwell / Rubin GPUs per tray */}
            {Array.from({length: gpusPerTray}).map((__,gpuIdx)=>{
              const active = selected==='gpu' || selected==='gpc' || selected==='tensor-core' || workloadActiveIds?.includes('gpc') || workloadActiveIds?.includes('sm')
              const xoff = (gpuIdx-1.5)*0.82
              return (
                <group key={gpuIdx} position={[xoff+0.55,0.14,0] as any} userData={{ testId: `rack-gpu-${trayIdx}-${gpuIdx}` }}>
                  <group userData={{ testId: `rack-gpu-box-${trayIdx}-${gpuIdx}` }}>
                    <RoundedBox args={[0.7,0.08,0.5] as any} radius={0.02} userData={{ testId: `rack-gpu-mesh-${trayIdx}-${gpuIdx}` }}>
                      <meshStandardMaterial color={gpuColor} emissive={active?palette.compute:"black"} emissiveIntensity={active?0.45:0} transparent={dim && !active} opacity={dim && !active?0.25:0.95} />
                    </RoundedBox>
                  </group>
                  {gpuIdx===0 && trayIdx===0 && (
                    <group userData={{ testId: `rack-label-${trayIdx}` }} position={[0,0.14,0] as any}><Html center position={[0,0,0] as any} style={{pointerEvents:'none'}}><div className="text-[12px] font-mono bg-black/60 text-white/60 px-1 rounded border border-white/10">{specId?.includes('rubin')?'R100':'B200'} tile — 18 trays conceptual</div></Html></group>
                  )}
                </group>
              )
            })}
          </group>
        )
      })}
      
      {/* 9 separate NVLink switch trays – per official DGX GB200 hardware */}
      {Array.from({length:9}).map((_,swIdx)=>{
        const y = 6.4 + swIdx*0.32
        return (
          <group key={`sw-${swIdx}`} position={[1.0,y,0] as any} userData={{ testId: `nvswitch-tray-${swIdx}` }}>
            <group userData={{ testId: `nvswitch-box-${swIdx}` }}>
              <RoundedBox args={[1.6,0.16,1.0] as any} radius={0.03} userData={{ testId: `nvswitch-mesh-${swIdx}` }}>
                <meshStandardMaterial color={palette.nvlinkBridge} emissive={palette.nvlinkPulse} emissiveIntensity={workloadActiveIds?.includes('nvlink')?0.95:0.7} />
              </RoundedBox>
            </group>
            <group userData={{ testId: `nvswitch-inner-${swIdx}` }} position={[0,0.11,0] as any}>
              <RoundedBox args={[1.2,0.04,0.8] as any} radius={0.015} userData={{ testId: `nvswitch-inner-mesh-${swIdx}` }} position={[0,0,0] as any}>
                <meshStandardMaterial color="#0a1a12" />
              </RoundedBox>
            </group>
          </group>
        )
      })}
      {/* Power shelves */}
      {Array.from({length:6}).map((_,ps)=>(
        <group key={`ps-${ps}`} position={[0,-0.8-ps*0.25,0] as any} userData={{ testId: `power-shelf-${ps}` }}>
          <group userData={{ testId: `power-shelf-mesh-${ps}` }}><mesh userData={{ testId: `ps-mesh-${ps}` }}><boxGeometry args={[4.6,0.12,2.4] as any} /><meshStandardMaterial color="#1c2220" /></mesh></group>
        </group>
      ))}
      {/* Mgmt switch */}
      <group position={[0,9.2,0] as any} userData={{ testId: 'mgmt-switch' }}>
        <group userData={{ testId: 'mgmt-box' }}><RoundedBox args={[2.2,0.14,0.9] as any} radius={0.02} userData={{ testId: 'mgmt-mesh' }}><meshStandardMaterial color="#222" /></RoundedBox></group>
      </group>
      <group position={[0,6.8,0] as any} userData={{ testId: 'rack-label-group' }}><Html center position={[0,0,0] as any}><div className="text-[12px] font-mono text-white/50 bg-black/50 px-2 py-1 rounded">{rack?.label ?? 'GB200 NVL72 18×4 GPUs 36 Grace 9 switch trays 72 GPUs domain 130TB/s – conceptual'}</div></Html></group>
    </group>
  )
}

export function RackStats({ specId }: { specId?:string }){
  const rack: any = getRackSafe(specId ?? 'blackwell-gb200') as any
  const superchip: any = getSuperchipSafe(specId==='blackwell-gb200'?'blackwell-gb200': specId ?? 'blackwell-gb200') as any
  const spec = getSpecSafe(specId ?? 'blackwell-gb200')
  const isGB200 = specId==='blackwell-gb200'
  const isRubin = specId==='rubin-r100'

  if(isGB200){
    const cpusPer = superchip?.cpu?.count ?? superchip?.cpusPerSuperchip ?? 1
    const gpusPer = superchip?.gpus?.count ?? superchip?.gpusPerSuperchip ?? 2
    return (
      <div data-testid="rack-stats" className="absolute bottom-2 left-2 text-[12px] bg-black/70 border border-[#7fee64]/20 p-2 rounded text-white/75 font-mono leading-[1.35] pointer-events-none">
        <div className="text-[#7fee64] font-semibold">GB200 NVL72 — 72 Blackwell GPUs fully NVLink domain 130TB/s 36 Grace CPUs 18 trays</div>
        <div>Superchip: {cpusPer} Grace 72c + {gpusPer} Blackwell 208B ea {spec?.hbm.totalGB ?? 192} raw {superchip?.hbm.usableGB ?? 186} per GPU usable (total {superchip?.hbm.usableGB ? superchip.hbm.totalGB : 372}GB raw {superchip?.hbm.rawGB ?? 384}GB, ECC/spare) 16TB/s mem BW 3.6TB/s NVLink/superchip 900GB/s C2C</div>
        <div>Tray: 2 Grace +4 Blackwell dual-die · Rack 18U = 72 GPUs / 36 Grace · Spine NVLink 130TB/s</div>
      </div>
    )
  }
  if(isRubin){
    return (
      <div data-testid="rack-stats" className="absolute bottom-2 left-2 text-[12px] bg-black/70 border border-[#0ec7ff]/30 p-2 rounded text-white/75 font-mono leading-[1.35] pointer-events-none">
        <div className="text-[#8fe8ff] font-semibold">Vera Rubin NVL72 – 72 Rubin GPUs + 36 Vera CPUs 260TB/s NVLink6 domain 9 switch trays + 18 compute trays</div>
        <div>BW: 22TB/s HBM4 · NVLink6 3.6TB/s/superchip · C2C 1.8TB/s · {spec?.fp8_TFLOPS ? `${spec.fp8_TFLOPS} PFLOPS FP8 dense` : '17.5 PFLOPS FP8 dense'} official July 2026 336B xtors 224 SMs</div>
        <div>Tray: 2 Vera +4 Rubin</div>
      </div>
    )
  }
  return (
    <div data-testid="rack-stats" className="absolute bottom-2 left-2 text-[12px] bg-black/60 border border-white/10 p-2 rounded text-white/60 font-mono">
      <div>{rack?.label ?? `${specId} rack – ${rack?.totalGPUs ?? '?'} GPUs domain`} {spec?.hbm.totalGB ? `· ${spec.hbm.totalGB}GB HBM` : ''}</div>
      {superchip && <div>Superchip: {superchip?.cpu?.count ?? superchip?.cpusPerSuperchip ?? '?'} CPU + {superchip?.gpus?.count ?? superchip?.gpusPerSuperchip ?? '?'} GPU · C2C {superchip?.c2cBW_GBs ?? superchip?.c2cPerSuperchip_GBs ?? '?'}GB/s · NVLink {superchip?.nvlinkBW_TBs ?? '?'}TB/s</div>}
    </div>
  )
}
