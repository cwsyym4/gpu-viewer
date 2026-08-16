export type Vec3 = [number, number, number]
export type Vec2 = [number, number]

export type HBMKind = 'memory' | 'structural'

export interface PackageSite { position: Vec2; kind: HBMKind }

export type ProvenanceLevel = 'gpu' | 'superchip' | 'tray' | 'rack' | 'die'
export type ProvenanceStatus = 'official' | 'derived' | 'estimated' | 'illustrative'

export interface ProvenanceEntry {
  level: ProvenanceLevel
  field: string // which metric this entry describes, e.g. 'hbm.totalGB'
  value: string | number
  unit?: string // GB, TB/s, W, B transistors, mm, etc
  status: ProvenanceStatus
  sourceUrl?: string
  asOf?: string // ISO date
  notes?: string
}

// True hardware dimensions vs render scene units
export interface RenderDims {
  // scene units – convenient for Three.js (original 8.6 etc)
  boardSize: Vec3
  packageSize: Vec3
  packageOffset: Vec3
  dieSize: Vec3
}
export interface RealDimsMm {
  boardMm?: [number, number] // width x depth
  packageMm?: [number, number]
  dieMm?: [number, number]
}

export interface GPUSpec extends RenderDims, RealDimsMm {
  id: string
  label: string
  module: string
  dieTileColumns: number
  dieTileRows: number
  packageSites: PackageSite[]
  mountingHoles: Vec2[]
  leftPowerStages: Vec2[]
  rightPowerStages: Vec2[]
  topClampPositions: number[]
  sideContacts: number[]
  hbm: { count: number; version: 'hbm3' | 'hbm3e' | 'hbm4' | 'hbm4e'; gbPerStack: number; totalGB: number; rawGB?: number; usableGB?: number }
  dualDie?: boolean
  nvlink?: boolean
  interposer?: boolean
  // expanded ontology
  transistorsB?: number // e.g. 80 for 80B
  smCount?: number
  tdpW?: number
  memoryBW_TBs?: number
  nvlinkBW_TBs?: number
  c2cBW_GBs?: number
  provenance?: ProvenanceEntry[]
}

export interface SuperchipSpec {
  id: string // e.g. 'gb200-superchip'
  label: string
  level: 'superchip'
  gpuIds: string[] // 2 Blackwell GPUs
  cpu?: { model: string; count: number; coresPerCpu: number; totalCores: number }
  gpus: { count: number; perGpu: string } // 2x blackwell-gb200-gpu
  hbm: { count: number; version: GPUSpec['hbm']['version']; gbPerStack: number; totalGB: number; usableGB?: number; rawGB?: number }
  memoryBW_TBs: number // total
  nvlinkBW_TBs: number // per superchip NVLink 5 total
  c2cBW_GBs: number // per superchip 900 GB/s
  tdpW?: number
  transistorsB?: number
  provenance: ProvenanceEntry[]
  // references
  contains: { gpus: string[]; cpus: string[] }
}

export interface ComputeTraySpec {
  id: string
  label: string
  level: 'tray'
  superchipIds: string[] // e.g. 2 superchips per tray? Actually GB200 tray is 2 Grace +4 Blackwell = 2 superchips? Need 2x Grace +4 Blackwell = 2 superchips (each 1+2)
  trayCountInRack: number
  gpusPerTray: number
  cpusPerTray: number
  provenance: ProvenanceEntry[]
}

export interface RackSpec {
  id: string
  label: string
  level: 'rack'
  traySpecId: string
  trayCount: number
  totalGPUs: number
  totalCPUs: number
  nvlinkDomain_TBs: number // 130TB/s for NVL72
  nvlinkVersion: string
  c2cPerSuperchip_GBs: number
  provenance: ProvenanceEntry[]
  workloadImplications?: string
}

export type GPUPartId = 'cuda-architecture' | 'gpu-ram' | 'gpc' | 'sm' | 'tensor-core' | 'cuda-core' | 'tma' | 'nvlink' | 'grace-cpu' | 'board' | 'package' | 'power' | 'interconnect' | 'structure'

export interface PartDef {
  id: GPUPartId
  index: string
  title: string
  abbreviation?: string
  description: string
  glossaryUrl: string
  view: 'exterior' | 'architecture' | 'system'
  anchor: Vec3
  onlyFor?: string[] // optional GPU ids
  semanticColorKey?: 'compute' | 'memory' | 'interconnect' | 'power' | 'structure' | 'interaction'
}

export function validateSpec(spec: GPUSpec): string[] {
  const errs:string[]=[]
  if(spec.boardSize.length!==3) errs.push('boardSize must length 3')
  if(spec.packageSize.length!==3) errs.push('packageSize')
  if(spec.packageSize[0] > spec.boardSize[0]) errs.push('package wider than board')
  if(spec.packageSize[2] > spec.boardSize[2]) errs.push('package deeper than board')
  if(spec.dieTileColumns*spec.dieTileRows <=0) errs.push('die tiles invalid')
  const memCount = spec.packageSites.filter(s=>s.kind==='memory').length
  if(memCount !== spec.hbm.count) errs.push(`hbm count ${spec.hbm.count} vs packageSites ${memCount}`)
  const totalCalc = spec.hbm.count * spec.hbm.gbPerStack
  // allow raw vs usable mismatch
  const usable = spec.hbm.usableGB ?? spec.hbm.totalGB
  if(totalCalc !== spec.hbm.totalGB && totalCalc !== (spec.hbm.rawGB ?? spec.hbm.totalGB)) {
    // tolerate rawGB differing due to usable 372 vs raw 384
    if(Math.abs(totalCalc - usable) > 1) errs.push('totalGB mismatch')
  }
  return errs
}

// workload overlays
export type WorkloadKind = 'dense-training' | 'moe-training' | 'moe-inference' | 'long-context' | 'recsys' | 'memory-bound' | 'comm-bound' | null
export interface WorkloadImplication {
  kind: WorkloadKind
  illuminates: GPUPartId[] // which parts light up
  bottleneck: string
  description: string
}
