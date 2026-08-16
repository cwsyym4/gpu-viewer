export const palette = {
  ground: '#0d180a', // var(--ground)
  lime: '#7fee64',
  lime80: 'rgba(127,238,100,0.8)',
  lime60: 'rgba(127,238,100,0.6)',
  lime20: 'rgba(127,238,100,0.2)',
  lime10: 'rgba(127,238,100,0.1)',
  ink: '#d8f9d9',
  rule: '#7fee64',
  fog: '#0d180a',
  gridMinor: '#173214', // original GridHelper minor — matches 448 chunk args [18,36,"#315e2a","#173214"]
  gridMajor: '#315e2a', // original major
  siteGridCss: '#133315', // css background linear-gradient grid 2% — for site page-frame
  board: '#080b09',
  boardInner: '#111512',
  package: '#171918',
  packageInner: '#080a09',
  mountingHoleRing: '#dc6d42', // original outer ring per 448
  mountingHoleCore: '#020302',
  mountingHole: '#dc6d42',
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
  graceCpu: '#1e4448',
  graceCpuHighlight: '#2EE6D6',
  nvlinkBridge: '#7fee64',
  nvlinkPulse: '#aaff99',
  rackMetal: '#151c19',
  rackSpine: '#1f3320',
  tilePalette: ['#9a6d2c','#a58c35','#728b3f','#3e8053','#347271','#554f7f'] as const,
  tilePaletteBW: ['#8b7355','#6a9a6a','#4a8080','#5a6b8a','#7a6a7a','#8a8a6a'] as const,
  gpc: '#254d23',
  contactShadowColor: '#020602',
  contactShadowOpacity: 0.7, // original ContactShadows opacity .7 not .32/.4
  contactShadowBlur: 2.5,
  contactShadowScale: 11,
  ambientIntensity: 0.9, // original ambientLight intensity .9
  dirIntensity: 2.8,
  dir2Intensity: 1.6,
  pointIntensity: 4,
  fogNear: 24,
  fogFar: 42,
} as const

export type Palette = typeof palette
export function isHexColor(s: string): boolean { return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) }
export function validatePalette(): string[] {
  const errs:string[]=[]
  const required: (keyof Palette)[] = ['ground','lime','fog','gridMinor','gridMajor','board']
  for(const k of required){ if(!isHexColor(palette[k] as any)) errs.push(`palette.${k} invalid`) }
  if(palette.lime !== '#7fee64') errs.push('lime must be #7fee64 per Kyle match')
  if(palette.gridMinor !== '#173214') errs.push('gridMinor must be #173214 exact per original 448 chunk')
  if(palette.gridMajor !== '#315e2a') errs.push('gridMajor must be #315e2a exact')
  return errs
}
