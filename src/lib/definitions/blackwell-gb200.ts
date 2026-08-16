import type { GPUSpec } from './types'
import { h100Spec } from './h100-sxm5'

export const blackwellSpec: GPUSpec = {
  id: 'blackwell-gb200',
  label: 'GB200 Grace Blackwell',
  module: 'GB200 NVL72 MODULE',
  boardSize: [9.2,0.28,4.6],
  packageSize: [3.6,0.42,3.4],
  packageOffset: [0,0.42,0],
  dieSize: [1.85,0.12,1.55],
  dieTileColumns: 16,
  dieTileRows: 12,
  packageSites: [
    {position:[-1.12,-.92],kind:'memory'},
    {position:[0,-.92],kind:'memory'},
    {position:[1.12,-.92],kind:'memory'},
    {position:[-1.12,0],kind:'memory'},
    {position:[1.12,0],kind:'memory'},
    {position:[-1.12,.92],kind:'memory'},
    {position:[0,.92],kind:'memory'},
    {position:[1.12,.92],kind:'memory'},
  ],
  mountingHoles: h100Spec.mountingHoles,
  leftPowerStages: h100Spec.leftPowerStages,
  rightPowerStages: h100Spec.rightPowerStages,
  topClampPositions: h100Spec.topClampPositions,
  sideContacts: h100Spec.sideContacts,
  hbm: { count:8, version:'hbm3e', gbPerStack:24, totalGB:192 },
  dualDie: true,
  nvlink: true,
  interposer: true,
}
