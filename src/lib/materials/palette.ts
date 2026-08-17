export const palette = {
  ground:'#0d180a', lime:'#7fee64', lime80:'rgba(127,238,100,0.8)', lime60:'rgba(127,238,100,0.6)', lime20:'rgba(127,238,100,0.2)', lime10:'rgba(127,238,100,0.1)',
  ink:'#d8f9d9', rule:'#7fee64', fog:'#0d180a', gridMinor:'#173214', gridMajor:'#315e2a', siteGridCss:'#133315',
  board:'#0f1a10', boardInner:'#1c3020', package:'#2a2e26', packageInner:'#1e2420',
  mountingHoleRing:'#dc6d42', mountingHoleCore:'#020302', mountingHole:'#dc6d42',
  trace:'#6b5a3b', powerDark:'#2b2214', powerAlt:'#332d1d', powerAlt2:'#3a3020', capacitor:'#aaa99f', clamp:'#3f4641', clampTop:'#8a8e8a',
  hbmStack:'#153a5a', hbmBar:'#7bbad6', hbm3e:'#0ec7ff', interposer:'#143d1a', interposerPlate:'#1a4a22', goldContact:'#c7a85b', daughterboard:'#243b26',
  graceCpu:'#1e4448', graceCpuHighlight:'#2EE6D6', nvlinkBridge:'#7fee64', nvlinkPulse:'#aaff99', rackMetal:'#1e2e26', rackSpine:'#2a4a2e',
  compute:'#7fee64', memory:'#0ec7ff', interconnect:'#2EE6D6', powerSemantic:'#ffb11a', structure:'#d8f9d9', interaction:'#7fee64',
  cache:'#ffb11a', sram:'#88aaff', disabled:'#2e2e2e',
  tilePalette:['#9a6d2c','#a58c35','#728b3f','#3e8053','#347271','#554f7f'] as const,
  tilePaletteBW:['#8b7355','#6a9a6a','#4a8080','#5a6b8a','#7a6a7a','#8a8a6a'] as const,
  gpc:'#2e6b2a', contactShadowColor:'#020602', contactShadowOpacity:0.7, contactShadowBlur:2.5, contactShadowScale:11,
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
