import type { GPUSpec, ProvenanceEntry, RackSpec } from './types'
import { h100Spec } from './h100-sxm5'
const prov: ProvenanceEntry[] = [
  { level:'gpu', field:'hbm.totalGB', value:576, unit:'GB', status:'estimated', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'Rubin Ultra vision 12×48GB =576GB' },
  { level:'gpu', field:'memoryBW', value:32, unit:'TB/s', status:'estimated', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15' },
]
export const rubinUltraSpec: GPUSpec = {
  id:'rubin-ultra-nvl576', label:'Rubin Ultra NVL576', module:'RUBIN ULTRA NVL576 MODULE',
  boardSize:[10.2,0.36,5.2], packageSize:[4.8,0.55,4.4], packageOffset:[0,0.52,0], dieSize:[2.25,0.14,1.95],
  boardMm:[195,110], packageMm:[90,80], dieMm:[44,36],
  dieTileColumns:20, dieTileRows:16,
  packageSites:[{position:[-1.58,-1.18],kind:'memory'},{position:[-0.52,-1.18],kind:'memory'},{position:[0.52,-1.18],kind:'memory'},{position:[1.58,-1.18],kind:'memory'},{position:[-1.58,-0.32],kind:'memory'},{position:[1.58,-0.32],kind:'memory'},{position:[-1.58,0.52],kind:'memory'},{position:[-0.52,0.52],kind:'memory'},{position:[0.52,0.52],kind:'memory'},{position:[1.58,0.52],kind:'memory'},{position:[-0.52,1.22],kind:'memory'},{position:[0.52,1.22],kind:'memory'}],
  mountingHoles:h100Spec.mountingHoles, leftPowerStages:h100Spec.leftPowerStages, rightPowerStages:h100Spec.rightPowerStages, topClampPositions:h100Spec.topClampPositions, sideContacts:h100Spec.sideContacts,
  hbm:{count:12, version:'hbm4e' as any, gbPerStack:48, totalGB:576}, dualDie:true, nvlink:true, interposer:true,
  transistorsB:450, smCount:280, tdpW:1800, memoryBW_TBs:32, nvlinkBW_TBs:7.2,
  provenance:prov,
} as any
export const rubinUltraTiles=20*16
export const ultraSpec=rubinUltraSpec
export const rubinUltraRackSpec: RackSpec = {
  id:'rubin-ultra-nvl576-rack', label:'Rubin Ultra NVL576 Rack', level:'rack', traySpecId:'rubin-r100-compute-tray', trayCount:18, totalGPUs:144, totalCPUs:36, nvlinkDomain_TBs:1000, nvlinkVersion:'NVLink 6 / NVL576 vision 1PB/s', c2cPerSuperchip_GBs:1800,
  provenance:[{ level:'rack', field:'nvlinkDomain', value:1000, unit:'TB/s', status:'estimated', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15'}]
}
