import type { GPUSpec } from './types'

const mkPowerLeft = (): [number,number][] => {
  const a=[-3.88,-3.52,-3.16], b=[-1.38,-.92,-.46,0,.46,.92,1.38]
  return b.flatMap(z=>a.map(x=>[x,z] as [number,number]))
}
const mkPowerRight = (): [number,number][] => {
  const a=[2.7,3.08,3.46,3.84], b=[-1.1,-.64,-.18,.28,.74,1.2]
  return b.flatMap(z=>a.map(x=>[x,z] as [number,number]))
}

export const h100Spec: GPUSpec = {
  id: 'h100-sxm5',
  label: 'H100 SXM5',
  module: 'H100 SXM5 MODULE',
  boardSize: [8.6,0.22,4],
  packageSize: [2.78,0.34,2.72],
  packageOffset: [0,0.35,0],
  dieSize: [1.42,0.1,1.18],
  dieTileColumns: 12,
  dieTileRows: 9,
  packageSites: [
    {position:[-.84,-.72],kind:'memory'},
    {position:[0,-.72],kind:'memory'},
    {position:[.84,-.72],kind:'memory'},
    {position:[-.84,.72],kind:'memory'},
    {position:[0,.72],kind:'memory'},
    {position:[.84,.72],kind:'structural'},
  ],
  mountingHoles: [[-2.72,-1.58],[-2.18,-1.58],[2.2,-1.58],[2.74,-1.58],[-2.72,1.58],[-2.18,1.58],[2.2,1.58],[2.74,1.58]],
  leftPowerStages: mkPowerLeft(),
  rightPowerStages: mkPowerRight(),
  topClampPositions: [-1.65,-.56,.56,1.65],
  sideContacts: [-1.54,-1.26,-.98,-.7,-.42,-.14,.14,.42,.7,.98,1.26,1.54],
  hbm: { count:5, version:'hbm3', gbPerStack:16, totalGB:80 },
}

export const h100Tiles = 12*9 // 108, palette 6 colors
