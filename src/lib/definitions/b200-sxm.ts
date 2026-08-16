import type { GPUSpec } from './types'
import { h100Spec } from './h100-sxm5'

export const b200Spec: GPUSpec = {
  id: 'b200-sxm',
  label: 'B200 SXM',
  module: 'B200 SXM MODULE',
  boardSize: [8.8,0.24,4.2],
  packageSize: [3.05,0.38,2.95],
  packageOffset: [0,0.38,0],
  dieSize: [1.62,0.11,1.36],
  dieTileColumns: 14,
  dieTileRows: 10,
  packageSites: [
    {position:[-.98,-.82],kind:'memory'},
    {position:[0,-.82],kind:'memory'},
    {position:[.98,-.82],kind:'memory'},
    {position:[-.98,-.16],kind:'memory'},
    {position:[.98,-.16],kind:'memory'},
    {position:[-.98,.62],kind:'memory'},
    {position:[0,.62],kind:'memory'},
    {position:[.98,.62],kind:'memory'},
  ],
  mountingHoles: h100Spec.mountingHoles,
  leftPowerStages: h100Spec.leftPowerStages,
  rightPowerStages: h100Spec.rightPowerStages,
  topClampPositions: h100Spec.topClampPositions,
  sideContacts: h100Spec.sideContacts,
  hbm: { count:8, version:'hbm3e', gbPerStack:24, totalGB:192 },
  dualDie: true,
  interposer: true,
}
