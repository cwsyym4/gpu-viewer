import type { GPUSpec, ProvenanceEntry } from './types'
import { h100Spec } from './h100-sxm5'
const prov: ProvenanceEntry[] = [
  { level:'gpu', field:'hbm.totalGB', value:192, unit:'GB', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18', notes:'Launch SKU B200 SXM 8×24GB=192GB raw; current tuning guide notes up to 180GB usable per single B200 after ECC/spare – see https://docs.nvidia.com/cuda/archive/12.9.1/blackwell-tuning-guide/index.html – retain raw for historical, mark usable=180' },
  { level:'gpu', field:'hbm.usableGB', value:180, unit:'GB', status:'derived', sourceUrl:'https://docs.nvidia.com/cuda/archive/12.9.1/blackwell-tuning-guide/index.html', asOf:'2025-03-01', notes:'Usable after 12GB ECC/spare reserve, 192-12=180 – aligns with DGX Spark example up to 180GB https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/' },
  { level:'gpu', field:'memoryBW', value:8, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18' },
  { level:'gpu', field:'transistorsB', value:208, unit:'B', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18', notes:'Per B200 ~208B dual-die' },
  { level:'gpu', field:'tdpW', value:1000, unit:'W', status:'estimated', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18' },
  { level:'gpu', field:'gpcCount', value:8, unit:'GPCs', status:'derived', sourceUrl:'https://www.nvidia.com/en-us/data-center/b200/', asOf:'2024-03-18', notes:'Blackwell has 8 GPCs per die? dual-die 8 total per GPU? Modeling 8' },
]
export const b200Spec: GPUSpec = {
  id:'b200-sxm', label:'B200 SXM', module:'B200 SXM MODULE',
  boardSize:[8.8,0.24,4.2], packageSize:[3.05,0.38,2.95], packageOffset:[0,0.38,0], dieSize:[1.62,0.11,1.36],
  boardMm:[170,90], packageMm:[70,60], dieMm:[30,22],
  dieTileColumns:14, dieTileRows:10,
  gpcCount:8, smPerGpc:19, smCountsPerGpc:[20,20,20,20,18,18,16,16], // 148 SMs per current NVIDIA B200 technical material 2025 (https://developer.nvidia.com/blog/scaling-autonomous-ai-agents-and-workloads-with-nvidia-dgx-spark/ reports 148 SMs) – previously modeled 192 SMs dual-die theoretical max, update to 148 active
  packageSites:[{position:[-.98,-.82],kind:'memory'},{position:[0,-.82],kind:'memory'},{position:[.98,-.82],kind:'memory'},{position:[-.98,-.16],kind:'memory'},{position:[.98,-.16],kind:'memory'},{position:[-.98,.62],kind:'memory'},{position:[0,.62],kind:'memory'},{position:[.98,.62],kind:'memory'}],
  mountingHoles: h100Spec.mountingHoles, leftPowerStages: h100Spec.leftPowerStages, rightPowerStages: h100Spec.rightPowerStages, topClampPositions: h100Spec.topClampPositions, sideContacts: h100Spec.sideContacts,
  hbm:{count:8, version:'hbm3e', gbPerStack:24, totalGB:192, rawGB:192, usableGB:180}, dualDie:true, interposer:true,
  transistorsB:208, smCount:148, // official 148 SMs active per current guide vs 192 theoretical max – corrected per reviewer tdpW:1000, memoryBW_TBs:8, nvlinkBW_TBs:1.8,
  // c2cBW removed – belongs to superchip CPU↔GPU relationship, not standalone GPU
  provenance:prov,
}
