import type { GPUSpec, ProvenanceEntry, SuperchipSpec, ComputeTraySpec, RackSpec } from './types'
import { h100Spec } from './h100-sxm5'
const gpuProv: ProvenanceEntry[] = [
  { level:'gpu', field:'hbm.totalGB', value:192, unit:'GB', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-03-18', notes:'Each Blackwell GPU 192GB HBM3e single' },
  { level:'gpu', field:'memoryBW', value:8, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-03-18' },
  { level:'gpu', field:'transistorsB', value:208, unit:'B', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
  { level:'gpu', field:'gpcCount', value:8, unit:'GPCs', status:'derived', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
]
export const blackwellSpec: GPUSpec = {
  id:'blackwell-gb200', label:'GB200 Blackwell GPU', module:'BLACKWELL GB200 GPU (inside Superchip)',
  boardSize:[9.2,0.28,4.6], packageSize:[3.6,0.42,3.4], packageOffset:[0,0.42,0], dieSize:[1.85,0.12,1.55],
  boardMm:[175,95], packageMm:[75,68], dieMm:[34,26],
  dieTileColumns:16, dieTileRows:12,
  gpcCount:8, smPerGpc:20, smCountsPerGpc:[20,20,20,20,20,20,20,20],
  packageSites:[{position:[-1.32,-1.15],kind:'memory'},{position:[-0.44,-1.15],kind:'memory'},{position:[0.44,-1.15],kind:'memory'},{position:[1.32,-1.15],kind:'memory'},{position:[-1.32,1.15],kind:'memory'},{position:[-0.44,1.15],kind:'memory'},{position:[0.44,1.15],kind:'memory'},{position:[1.32,1.15],kind:'memory'}],
  mountingHoles:h100Spec.mountingHoles, leftPowerStages:h100Spec.leftPowerStages, rightPowerStages:h100Spec.rightPowerStages, topClampPositions:h100Spec.topClampPositions, sideContacts:h100Spec.sideContacts,
  hbm:{count:8, version:'hbm3e', gbPerStack:24, totalGB:192}, dualDie:true, nvlink:true, interposer:true,
  transistorsB:208, smCount:160, tdpW:1200, memoryBW_TBs:8, nvlinkBW_TBs:1.8,
  provenance:gpuProv,
}
export const blackwellTiles=16*12
export const gb200SuperchipSpec: SuperchipSpec = {
  id:'gb200-superchip', label:'GB200 Grace Blackwell Superchip', level:'superchip',
  gpuIds:['blackwell-gb200','blackwell-gb200'], cpu:{model:'Grace 72-core Neoverse V2', count:1, coresPerCpu:72, totalCores:72},
  gpus:{count:2, perGpu:'blackwell-gb200'},
  hbm:{count:16, version:'hbm3e', gbPerStack:24, totalGB:384, usableGB:372, rawGB:384},
  memoryBW_TBs:16, nvlinkBW_TBs:3.6, c2cBW_GBs:900, tdpW:2700, transistorsB:416,
  provenance:[
    { level:'superchip', field:'gpus', value:'2 Blackwell GPUs + 1 Grace CPU', unit:'count', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
    { level:'superchip', field:'hbm.totalGB', value:384, unit:'GB', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'Raw 384GB usable 372GB (ECC/spare)' },
    { level:'superchip', field:'memoryBW', value:16, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
    { level:'superchip', field:'nvlinkBW', value:3.6, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
    { level:'superchip', field:'c2c', value:900, unit:'GB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
    { level:'superchip', field:'boardSize', value:'illustrative', status:'illustrative', notes:'Render dims ≠ real mm' },
  ],
  contains:{gpus:['blackwell-gb200','blackwell-gb200'], cpus:['grace-cpu']},
}
export const gb200TraySpec: ComputeTraySpec = {
  id:'gb200-compute-tray', label:'GB200 NVL72 Compute Tray', level:'tray',
  superchipIds:['gb200-superchip','gb200-superchip'], trayCountInRack:18, gpusPerTray:4, cpusPerTray:2,
  provenance:[
    { level:'tray', field:'gpusPerTray', value:4, unit:'GPUs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
    { level:'tray', field:'cpusPerTray', value:2, unit:'CPUs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
  ]
}
export const gb200RackSpec: RackSpec & { switchTrayCount:number, powerShelfCount:number } = {
  // @ts-ignore extended for topology clarity
  switchTrayCount:9, powerShelfCount:6,
  id:'gb200-nvl72-rack', label:'GB200 NVL72 Rack', level:'rack',
  traySpecId:'gb200-compute-tray', trayCount:18, totalGPUs:72, totalCPUs:36, nvlinkDomain_TBs:130, nvlinkVersion:'NVLink 5 / NVLink Switch 9 switch trays (not on every compute tray per https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html) + 18 compute trays (2 Grace +4 Blackwell)', c2cPerSuperchip_GBs:900, // GB200 NVL72: 18 compute trays + 9 NVSwitch trays + power shelves per official DGX GB200 user guide hardware
  provenance:[
    { level:'rack', field:'totalGPUs', value:72, unit:'GPUs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
    { level:'rack', field:'totalCPUs', value:36, unit:'CPUs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
    { level:'rack', field:'nvlinkDomain', value:130, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
  ],
  workloadImplications:'MoE inference benefits from 130TB/s all-to-all; Grace host buffers routing metadata.'
}
export const gb200Superchip=gb200SuperchipSpec; export const gb200Tray=gb200TraySpec; export const gb200Rack=gb200RackSpec
