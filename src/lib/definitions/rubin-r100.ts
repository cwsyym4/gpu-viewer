import type { GPUSpec, ProvenanceEntry } from './types'
import { h100Spec } from './h100-sxm5'
const prov: ProvenanceEntry[] = [
  { level:'gpu', field:'transistorsB', value:336, unit:'B', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'Rubin official 336B transistors per NVIDIA Vera Rubin specs July 2026' },
  { level:'gpu', field:'smCount', value:224, unit:'SMs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'224 SMs' },
  { level:'gpu', field:'hbm.totalGB', value:288, unit:'GB', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'8×36GB HBM4 =288GB' },
  { level:'gpu', field:'memoryBW', value:22, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15' },
  { level:'gpu', field:'nvlinkBW', value:3.6, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'NVLink 6 3.6TB/s per GPU' },
  { level:'gpu', field:'c2c', value:1800, unit:'GB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'C2C 1.8TB/s double GB200 aggregate per superchip' },
  { level:'gpu', field:'fp8_TFLOPS', value:17.5, unit:'PFLOPS', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'Dense FP8/FP6 training 17.5 PFLOPS corrected from 4 PFLOPS mislabel' },
  { level:'gpu', field:'fp16_TFLOPS', value:4, unit:'PFLOPS', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'FP16/BF16 4 PFLOPS' },
]
export const rubinSpec: GPUSpec = {
  id:'rubin-r100', label:'R100 Rubin', module:'R100 RUBIN MODULE',
  boardSize:[9.6,0.32,4.8], packageSize:[4.1,0.45,3.9], packageOffset:[0,0.45,0], dieSize:[2.05,0.13,1.75],
  boardMm:[185,100], packageMm:[80,72], dieMm:[38,30],
  dieTileColumns:18, dieTileRows:14,
  gpcCount:8, smPerGpc:28, smCountsPerGpc:[28,28,28,28,28,28,28,28],
  packageSites:[{position:[-1.32,-1.04],kind:'memory'},{position:[0,-1.04],kind:'memory'},{position:[1.32,-1.04],kind:'memory'},{position:[-1.32,-0.18],kind:'memory'},{position:[1.32,-0.18],kind:'memory'},{position:[-1.32,0.84],kind:'memory'},{position:[0,0.84],kind:'memory'},{position:[1.32,0.84],kind:'memory'}],
  mountingHoles:h100Spec.mountingHoles, leftPowerStages:h100Spec.leftPowerStages, rightPowerStages:h100Spec.rightPowerStages, topClampPositions:h100Spec.topClampPositions, sideContacts:h100Spec.sideContacts,
  hbm:{count:8, version:'hbm4', gbPerStack:36, totalGB:288}, dualDie:true, nvlink:true, interposer:true,
  transistorsB:336, smCount:224, tdpW:1400, memoryBW_TBs:22, nvlinkBW_TBs:3.6, c2cBW_GBs:1800,
  fp8_TFLOPS:17.5, fp16_TFLOPS:4,
  provenance:prov,
} as any
export const rubinTiles=18*14
