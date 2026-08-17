import type { GPUSpec, ProvenanceEntry } from './types'
import { h100Spec } from './h100-sxm5'
const prov: ProvenanceEntry[] = [
  { level:'gpu', field:'transistorsB', value:336, unit:'B', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'Rubin official preliminary 336B transistors per NVIDIA Vera Rubin specs July 2026 – subject to change' },
  { level:'gpu', field:'smCount', value:224, unit:'SMs', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'224 SMs – official preliminary' },
  { level:'gpu', field:'hbm.totalGB', value:288, unit:'GB', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'8×36GB HBM4 =288GB – official preliminary' },
  { level:'gpu', field:'memoryBW', value:22, unit:'TB/s', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'22TB/s – official preliminary' },
  { level:'gpu', field:'nvlinkBW', value:3.6, unit:'TB/s', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'NVLink 6 3.6TB/s per GPU (7.2TB/s per superchip) – official preliminary per Vera Rubin NVL72 spec https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/' },
  { level:'superchip', field:'c2c', value:1800, unit:'GB/s', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'C2C 1.8TB/s belongs to Vera Rubin Superchip, not standalone GPU – official preliminary, subject to change' },
  { level:'gpu', field:'fp8_TFLOPS', value:17.5, unit:'PFLOPS', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'Dense FP8/FP6 training 17.5 PFLOPS corrected from 4 PFLOPS mislabel – official preliminary' },
  { level:'gpu', field:'fp16_TFLOPS', value:4, unit:'PFLOPS', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-us/data-center/rubin/', asOf:'2026-07-15', notes:'FP16/BF16 4 PFLOPS – official preliminary' },
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
  transistorsB:336, smCount:224, tdpW:1400, memoryBW_TBs:22, nvlinkBW_TBs:3.6, // c2cBW removed from GPU – belongs to Vera Rubin Superchip per spec table not standalone GPU (https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/)
  fp8_TFLOPS:17.5, fp16_TFLOPS:4,
  provenance:prov,
} as any
export const rubinTiles=18*14


export const rubinSuperchipSpec: any = {
  id:'rubin-superchip', label:'Vera Rubin Superchip', level:'superchip',
  gpuIds:['rubin-r100','rubin-r100'], cpu:{model:'Vera CPU', count:1, coresPerCpu:88, totalCores:88},
  gpus:{count:2, perGpu:'rubin-r100'},
  hbm:{count:16, version:'hbm4' as any, gbPerStack:36, totalGB:576, usableGB:576, rawGB:576},
  memoryBW_TBs:44, nvlinkBW_TBs:7.2, c2cBW_GBs:1800, tdpW:2800, transistorsB:672,
  provenance:[
    { level:'superchip', field:'gpus', value:'2 Rubin GPUs + 1 Vera CPU', unit:'count', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'Vera Rubin official preliminary NVL72 superchip – C2C 1.8TB/s per superchip (3.6TB/s per GPU NVLink6, 7.2TB/s per superchip), not standalone GPU' },
    { level:'superchip', field:'hbm.totalGB', value:576, unit:'GB', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'2×288GB per GPU raw 576GB total – official preliminary' },
    { level:'superchip', field:'memoryBW', value:44, unit:'TB/s', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'2×22TB/s per GPU – official preliminary' },
    { level:'superchip', field:'nvlinkBW', value:7.2, unit:'TB/s', status:'derived', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'2×3.6TB/s per GPU – superchip NVLink 7.2TB/s total (3.6TB/s per GPU) – derived from per-GPU spec, official preliminary' },
    { level:'superchip', field:'c2c', value:1800, unit:'GB/s', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'C2C belongs to superchip – corrected from GPU object, official preliminary subject to change' },
  ],
  contains:{gpus:['rubin-r100','rubin-r100'], cpus:['vera-cpu']},
} as any

export const rubinRackSpec: any = {
  id:'rubin-nvl72-rack', label:'Vera Rubin NVL72 Rack (Official Preliminary)', level:'rack',
  traySpecId:'rubin-r100-compute-tray', trayCount:18, totalGPUs:72, totalCPUs:36, nvlinkDomain_TBs:260, nvlinkVersion:'NVLink 6 – 260TB/s domain per https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/ (corrected from 130, 3.6TB/s per GPU, 7.2TB/s per superchip – official preliminary subject to change)', c2cPerSuperchip_GBs:1800,
  provenance:[
    { level:'rack', field:'totalGPUs', value:72, unit:'GPUs', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'72 GPUs – official preliminary' },
    { level:'rack', field:'totalCPUs', value:36, unit:'CPUs', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'36 CPUs – official preliminary' },
    { level:'rack', field:'nvlinkDomain', value:260, unit:'TB/s', status:'official preliminary', sourceUrl:'https://www.nvidia.com/en-gb/data-center/vera-rubin-nvl72/', asOf:'2026-07-15', notes:'Official preliminary 260TB/s vs previous 130TB/s GB200 reuse – corrected, 3.6TB/s per GPU / 7.2TB/s per superchip, subject to change' },
  ],
  workloadImplications:'Vera Rubin 260TB/s enables larger MoE 1T expert scale, long-context 10M tokens with KV offload via Vera host DDR.'
}
