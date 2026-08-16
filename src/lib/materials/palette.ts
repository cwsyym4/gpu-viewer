export const palette = {
  ground: '#0d180a',
  lime: '#7fee64',
  lime80: 'rgba(127,238,100,0.8)',
  lime60: 'rgba(127,238,100,0.6)',
  lime20: 'rgba(127,238,100,0.2)',
  lime10: 'rgba(127,238,100,0.1)',
  ink: '#d8f9d9',
  fog: '#0d180a',
  gridMinor: '#133315', // exact Kyle match
  gridMajor: '#1a4a1e',
  board: '#080b09',
  boardInner: '#111512',
  package: '#171918',
  packageInner: '#080a09',
  mountingHole: '#1a1a1a', // muted, fixes orange #dc6d42 bug
  mountingHoleCore: '#020302',
  trace: '#5a4a35',
  powerDark: '#080a09',
  powerAlt: '#202421',
  powerAlt2: '#222724',
  capacitor: '#aaa99f',
  clamp: '#363b38',
  clampTop: '#777b78',
  hbmStack: '#202321',
  hbmBar: '#6c716d',
  hbm3e: '#0ec7ff',
  interposer: '#0e3014',
  interposerPlate: '#0f2211',
  goldContact: '#c7a85b',
  daughterboard: '#243b26',
  graceCpu: '#294d52',
  graceCpuHighlight: '#2a6b6f',
  nvlinkBridge: '#7fee64',
  nvlinkPulse: '#aaff99',
  rackMetal: '#151c19',
  rackSpine: '#1f3320',
  tilePalette: ['#9a6d2c','#a58c35','#728b3f','#3e8053','#347271','#554f7f'] as const,
  tilePaletteBW: ['#8b7355','#6a9a6a','#4a8080','#5a6b8a','#7a6a7a','#8a8a6a'] as const,
  gpc: '#254d23',
  contactShadowOpacity: 0.32,
  ambientIntensity: 0.65,
  dirIntensity: 2.2,
  dir2Intensity: 1.6,
} as const

export type Palette = typeof palette
export function isHexColor(s: string): boolean { return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) }
export function validatePalette(): string[] {
  const errs:string[]=[]
  const required: (keyof Palette)[] = ['ground','lime','fog','gridMinor','gridMajor','board']
  for(const k of required){ if(!isHexColor(palette[k] as any)) errs.push(`palette.${k} invalid`) }
  if(palette.lime !== '#7fee64') errs.push('lime must be #7fee64 per Kyle match')
  if(palette.gridMinor !== '#133315') errs.push('gridMinor must be #133315 exact')
  return errs
}
