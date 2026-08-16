export const palette = {
  ground:'#0d180a', lime:'#7fee64', lime80:'rgba(127,238,100,0.8)', lime60:'rgba(127,238,100,0.6)', lime20:'rgba(127,238,100,0.2)', lime10:'rgba(127,238,100,0.1)',
  ink:'#d8f9d9', rule:'#7fee64', fog:'#0d180a', gridMinor:'#173214', gridMajor:'#315e2a', siteGridCss:'#133315',
  board:'#080b09', boardInner:'#111512', package:'#171918', packageInner:'#080a09',
  mountingHoleRing:'#dc6d42', mountingHoleCore:'#020302', mountingHole:'#dc6d42',
  trace:'#5a4a35', powerDark:'#080a09', powerAlt:'#202421', powerAlt2:'#222724', capacitor:'#aaa99f', clamp:'#363b38', clampTop:'#777b78',
  hbmStack:'#202321', hbmBar:'#6c716d', hbm3e:'#0ec7ff', interposer:'#0e3014', interposerPlate:'#0f2211', goldContact:'#c7a85b', daughterboard:'#243b26',
  graceCpu:'#1e4448', graceCpuHighlight:'#2EE6D6', nvlinkBridge:'#7fee64', nvlinkPulse:'#aaff99', rackMetal:'#151c19', rackSpine:'#1f3320',
  compute:'#7fee64', memory:'#0ec7ff', interconnect:'#2EE6D6', powerSemantic:'#ffb11a', structure:'#d8f9d9', interaction:'#7fee64',
  cache:'#ffb11a', sram:'#88aaff', disabled:'#222222',
  tilePalette:['#9a6d2c','#a58c35','#728b3f','#3e8053','#347271','#554f7f'] as const,
  tilePaletteBW:['#8b7355','#6a9a6a','#4a8080','#5a6b8a','#7a6a7a','#8a8a6a'] as const,
  gpc:'#254d23', contactShadowColor:'#020602', contactShadowOpacity:0.7, contactShadowBlur:2.5, contactShadowScale:11,
  ambientIntensity:0.9, dirIntensity:2.8, dir2Intensity:1.6, pointIntensity:4, fogNear:24, fogFar:42,
  semantic:{
    compute:{color:'#7fee64', label:'Compute (GPC/SM/TC/CC)'},
    memory:{color:'#0ec7ff', label:'Memory (HBM3/3e/4/4e)'},
    interconnect:{color:'#2EE6D6', label:'Interconnect (NVLink/C2C/TMA)'},
    power:{color:'#ffb11a', label:'Power / SXM VRM'},
    structure:{color:'#d8f9d9', label:'Structure (board, package, interposer, tray, rack)'},
    interaction:{color:'#7fee64', label:'Interaction / status'},
  }
} as const
export type Palette = typeof palette
export function isHexColor(s:string){ return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) }
export function validatePalette(): string[] {
  const errs:string[]=[]; const required:(keyof Palette)[]=['ground','lime','fog','gridMinor','gridMajor','board']
  for(const k of required){ if(!isHexColor(palette[k] as any)) errs.push(`palette.${k} invalid`) }
  if(palette.lime !== '#7fee64') errs.push('lime must be #7fee64'); if(palette.gridMinor !== '#173214') errs.push('gridMinor exact'); if(palette.gridMajor !== '#315e2a') errs.push('gridMajor exact'); return errs
}
export const semanticLegend = [
  {key:'compute', color: (palette as any).semantic.compute.color, label: (palette as any).semantic.compute.label},
  {key:'memory', color: (palette as any).semantic.memory.color, label: (palette as any).semantic.memory.label},
  {key:'interconnect', color: (palette as any).semantic.interconnect.color, label: (palette as any).semantic.interconnect.label},
  {key:'power', color: (palette as any).semantic.power.color, label: (palette as any).semantic.power.label},
  {key:'structure', color: (palette as any).semantic.structure.color, label: (palette as any).semantic.structure.label},
] as const
export const YEAR_META: Record<string,{year:number, process:string, transistors:string, tdp:string, bw:string, fp8:string, nvlink:string, provenanceStatus:'official'|'derived'|'estimated'|'speculative', sourceUrl?: string, asOf?:string, gpcCount?: number, smCount?: number}> = {
  'h100-sxm5': { year:2023, process:'4N TSMC', transistors:'80B', tdp:'700W', bw:'3.35TB/s', fp8:'989 TFLOPS (est)', nvlink:'900GB/s', provenanceStatus:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/hopper/', asOf:'2023-03-21', gpcCount:8, smCount:132 },
  'b200-sxm': { year:2024, process:'4NP TSMC', transistors:'208B', tdp:'~1000W', bw:'8TB/s', fp8:'1.9 PFLOPS', nvlink:'1.8TB/s (chip)', provenanceStatus:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18', gpcCount:8, smCount:192 },
  'blackwell-gb200': { year:2025, process:'4NP 2× reticle', transistors:'208B per GPU, 416B per superchip', tdp:'1200W GPU / 2700W superchip', bw:'8TB/s per GPU, 16TB/s per superchip, 372GB usable per superchip (384 raw)', fp8:'2.5 PFLOPS per GPU', nvlink:'NVLink 5 1.8TB/s per GPU, 3.6TB/s per superchip + C2C 900GB/s, 130TB/s NVL72', provenanceStatus:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', gpcCount:8, smCount:160 },
  'rubin-r100': { year:2026, process:'3nm + CoWoS-L', transistors:'336B (official July 2026)', tdp:'1400W', bw:'22TB/s HBM4 288GB', fp8:'17.5 PFLOPS FP8/FP6 dense, 4 PFLOPS FP16/BF16', nvlink:'NVLink 6 3.6TB/s, C2C 1.8TB/s', provenanceStatus:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', gpcCount:8, smCount:224 },
  'rubin-ultra-nvl576': { year:2028, process:'3nm + 3D – speculative concept', transistors:'~450B speculative', tdp:'1800W', bw:'32TB/s HBM4e speculative', fp8:'6 PFLOPS env speculative', nvlink:'NVL144/576 1PB/s class vision speculative – separate from Vera Rubin NVL72 official', provenanceStatus:'speculative', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', gpcCount:10, smCount:280 },
}
export const GPU_ORDER = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576'] as const
export const GPU_ORDER_PRIMARY = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100'] as const
export const GPU_ORDER_SPECULATIVE = ['rubin-ultra-nvl576'] as const
