import type { GPUSpec, ProvenanceEntry, SuperchipSpec, ComputeTraySpec, RackSpec } from './types'
import { h100Spec } from './h100-sxm5'

// Single Blackwell GPU (B200-derived) that lives inside GB200 Superchip
const gpuProv: ProvenanceEntry[] = [
  { level:'gpu', field:'hbm.totalGB', value:192, unit:'GB', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-03-18', notes:'Each Blackwell GPU within GB200 has 192GB HBM3e (8x24GB)' },
  { level:'gpu', field:'memoryBW', value:8, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-03-18', notes:'Per Blackwell GPU 8TB/s HBM3e BW' },
  { level:'gpu', field:'transistorsB', value:208, unit:'B', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'B200/Blackwell ~208B transistors per GPU (2 dies)' },
  { level:'gpu', field:'boardSize', value:'9.2x4.6 render units', unit:'scene-units', status:'illustrative', notes:'Module render size, not real mm' },
]

export const blackwellSpec: GPUSpec = {
  id: 'blackwell-gb200',
  label: 'GB200 Blackwell GPU', // clarified: this is single GPU inside superchip
  module: 'BLACKWELL GB200 GPU (inside Superchip)',
  boardSize: [9.2,0.28,4.6],
  packageSize: [3.6,0.42,3.4],
  packageOffset: [0,0.42,0],
  dieSize: [1.85,0.12,1.55],
  boardMm: [175, 95],
  packageMm: [75, 68],
  dieMm: [34, 26],
  dieTileColumns: 16,
  dieTileRows: 12,
  packageSites: [
    {position:[-1.32,-1.15],kind:'memory'},
    {position:[-0.44,-1.15],kind:'memory'},
    {position:[0.44,-1.15],kind:'memory'},
    {position:[1.32,-1.15],kind:'memory'},
    {position:[-1.32,1.15],kind:'memory'},
    {position:[-0.44,1.15],kind:'memory'},
    {position:[0.44,1.15],kind:'memory'},
    {position:[1.32,1.15],kind:'memory'},
  ],
  mountingHoles: h100Spec.mountingHoles,
  leftPowerStages: h100Spec.leftPowerStages,
  rightPowerStages: h100Spec.rightPowerStages,
  topClampPositions: h100Spec.topClampPositions,
  sideContacts: h100Spec.sideContacts,
  hbm: { count:8, version:'hbm3e', gbPerStack:24, totalGB:192, rawGB:192, usableGB:192 },
  dualDie: true,
  nvlink: true,
  interposer: true,
  transistorsB: 208,
  smCount: 160, // per GPU estimate? NV Blackwell ~160 SMs per die? keep illustrative
  tdpW: 1200,
  memoryBW_TBs: 8,
  nvlinkBW_TBs: 1.8,
  c2cBW_GBs: 900,
  provenance: gpuProv,
}

export const blackwellTiles = 16*12 // 192

// Official Superchip: 1 Grace + 2 Blackwell GPUs
export const gb200SuperchipSpec: SuperchipSpec = {
  id: 'gb200-superchip',
  label: 'GB200 Grace Blackwell Superchip',
  level: 'superchip',
  gpuIds: ['blackwell-gb200','blackwell-gb200'],
  cpu: { model: 'Grace 72-core Neoverse V2', count:1, coresPerCpu:72, totalCores:72 },
  gpus: { count:2, perGpu: 'blackwell-gb200' },
  hbm: { count:16, version:'hbm3e', gbPerStack:24, totalGB:384, usableGB:372, rawGB:384 }, // NVIDIA lists 384GB raw, 372GB usable after ECC? review says 372
  memoryBW_TBs: 16, // 8 TB/s per GPU x2
  nvlinkBW_TBs: 3.6, // NVLink 5 per superchip? combined? Official: 3.6 TB/s NVLink total per superchip (1.8 per GPU *2) + C2C 900GB/s
  c2cBW_GBs: 900,
  tdpW: 2700, // tray level? single superchip ~1200W GPUs + Grace 500W ~2700?
  transistorsB: 416, // 208*2 + Grace ~ manual
  provenance: [
    { level:'superchip', field:'gpus', value:'2 Blackwell GPUs + 1 Grace CPU', unit:'count', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'NVIDIA GB200 Superchip = 1 Grace +2 Blackwell' },
    { level:'superchip', field:'hbm.totalGB', value:384, unit:'GB', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'Raw 384GB (16x24GB), usable 372GB listed in NVIDIA calculator Nov 2024 – we keep both with provenance' },
    { level:'superchip', field:'memoryBW', value:16, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'8TB/s per GPU ×2 =16TB/s' },
    { level:'superchip', field:'nvlinkBW', value:3.6, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'NVLink 5 1.8TB/s per GPU ×2 =3.6TB/s intra-superchip' },
    { level:'superchip', field:'c2c', value:900, unit:'GB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'NVLink-C2C 900GB/s Grace<->Blackwell' },
    { level:'superchip', field:'tdp', value:2700, unit:'W', status:'derived', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'Per tray 2× Grace +4 Blackwell ~5400W, so superchip ~2700W est.' },
  ],
  contains: { gpus:['blackwell-gb200','blackwell-gb200'], cpus:['grace-cpu'] },
}

// Trays and Rack
export const gb200TraySpec: ComputeTraySpec = {
  id: 'gb200-compute-tray',
  label: 'GB200 NVL72 Compute Tray',
  level: 'tray',
  superchipIds: ['gb200-superchip','gb200-superchip'], // 2 superchips = 2 Grace+4 Blackwell per tray
  trayCountInRack: 18,
  gpusPerTray: 4,
  cpusPerTray: 2,
  provenance: [
    { level:'tray', field:'gpusPerTray', value:4, unit:'GPUs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'18 trays ×4 Blackwell =72 GPUs' },
    { level:'tray', field:'cpusPerTray', value:2, unit:'CPUs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'18 trays ×2 Grace =36 CPUs' },
  ]
}

export const gb200RackSpec: RackSpec = {
  id: 'gb200-nvl72-rack',
  label: 'GB200 NVL72 Rack',
  level: 'rack',
  traySpecId: 'gb200-compute-tray',
  trayCount: 18,
  totalGPUs: 72,
  totalCPUs: 36,
  nvlinkDomain_TBs: 130, // review says 130TB/s fully NVLink domain
  nvlinkVersion: 'NVLink 5 / NVLink Switch 72-rail',
  c2cPerSuperchip_GBs: 900,
  provenance: [
    { level:'rack', field:'totalGPUs', value:72, unit:'GPUs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'NVL72 = 36 Grace +72 Blackwell' },
    { level:'rack', field:'totalCPUs', value:36, unit:'CPUs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
    { level:'rack', field:'nvlinkDomain', value:130, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18', notes:'Full NVLink domain 130TB/s low-latency' },
    { level:'rack', field:'c2c', value:900, unit:'GB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/gb200-nvl72/', asOf:'2024-11-18' },
  ],
  workloadImplications: 'Rack-scale MoE inference benefits from 130TB/s all-to-all; Grace CPU memory coherency reduces host offload stalls.'
}

// alias for backwards compat
export const gb200Superchip = gb200SuperchipSpec
export const gb200Tray = gb200TraySpec
export const gb200Rack = gb200RackSpec
