import type { GPUSpec, ProvenanceEntry } from './types'
import { h100Spec } from './h100-sxm5'

const prov: ProvenanceEntry[] = [
  { level:'gpu', field:'hbm.totalGB', value:192, unit:'GB', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18', notes:'8x HBM3e 24GB stacks = 192GB single B200 GPU' },
  { level:'gpu', field:'memoryBW', value:8, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18', notes:'8TB/s aggregate HBM3e' },
  { level:'gpu', field:'transistorsB', value:208, unit:'B', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18', notes:'Per B200 die ~104B x2 dies =208B (dual-die)' },
  { level:'gpu', field:'tdpW', value:1000, unit:'W', status:'estimated', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18', notes:'B200 SXM TDP ~1000W reported envelope' },
  { level:'gpu', field:'boardSize', value:'8.8x4.2 render units', unit:'scene-units', status:'illustrative', notes:'Render scene units for Three.js, real SXM larger than H100' },
]

export const b200Spec: GPUSpec = {
  id: 'b200-sxm',
  label: 'B200 SXM',
  module: 'B200 SXM MODULE',
  boardSize: [8.8,0.24,4.2],
  packageSize: [3.05,0.38,2.95],
  packageOffset: [0,0.38,0],
  dieSize: [1.62,0.11,1.36],
  boardMm: [170, 90],
  packageMm: [70, 60],
  dieMm: [30, 22],
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
  hbm: { count:8, version:'hbm3e', gbPerStack:24, totalGB:192, rawGB:192, usableGB:192 },
  dualDie: true,
  interposer: true,
  transistorsB: 208,
  smCount: 192, // estimate B200 SMs
  tdpW: 1000,
  memoryBW_TBs: 8,
  nvlinkBW_TBs: 1.8,
  c2cBW_GBs: 900,
  provenance: prov,
}
