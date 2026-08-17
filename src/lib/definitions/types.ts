export type Vec3 = [number, number, number]
export type Vec2 = [number, number]
export type HBMKind = 'memory' | 'structural'
export interface PackageSite { position: Vec2; kind: HBMKind }
export type ProvenanceLevel = 'gpu' | 'superchip' | 'tray' | 'rack' | 'die'
export type ProvenanceStatus = 'official' | 'official preliminary' | 'derived' | 'estimated' | 'illustrative' | 'speculative'
export interface ProvenanceEntry {
  level: ProvenanceLevel
  field: string
  value: string | number
  unit?: string
  status: ProvenanceStatus
  sourceUrl?: string
  asOf?: string
  notes?: string
}
export interface RenderDims { boardSize: Vec3; packageSize: Vec3; packageOffset: Vec3; dieSize: Vec3 }
export interface RealDimsMm { boardMm?: [number, number]; packageMm?: [number, number]; dieMm?: [number, number] }
export interface GPUSpec extends RenderDims, RealDimsMm {
  id: string; label: string; module: string
  dieTileColumns: number; dieTileRows: number
  gpcCount?: number
  smPerGpc?: number
  smCountsPerGpc?: number[] // per GPC SM counts for accurate H100 132 case
  packageSites: PackageSite[]; mountingHoles: Vec2[]; leftPowerStages: Vec2[]; rightPowerStages: Vec2[]; topClampPositions: number[]; sideContacts: number[]
  hbm: { count: number; version: 'hbm3'|'hbm3e'|'hbm4'|'hbm4e'; gbPerStack: number; totalGB: number; rawGB?: number; usableGB?: number }
  dualDie?: boolean; nvlink?: boolean; interposer?: boolean
  transistorsB?: number; smCount?: number; tdpW?: number; memoryBW_TBs?: number; nvlinkBW_TBs?: number; c2cBW_GBs?: number
  fp8_TFLOPS?: number; fp16_TFLOPS?: number // for Rubin correction
  provenance?: ProvenanceEntry[]
  speculative?: boolean
}
export interface SuperchipSpec {
  id: string; label: string; level: 'superchip'
  gpuIds: string[]; cpu?: { model: string; count: number; coresPerCpu: number; totalCores: number }
  gpus: { count: number; perGpu: string }
  hbm: { count: number; version: GPUSpec['hbm']['version']; gbPerStack: number; totalGB: number; usableGB?: number; rawGB?: number }
  memoryBW_TBs: number; nvlinkBW_TBs: number; c2cBW_GBs: number; tdpW?: number; transistorsB?: number
  provenance: ProvenanceEntry[]; contains: { gpus: string[]; cpus: string[] }
}
export interface ComputeTraySpec { id: string; label: string; level: 'tray'; superchipIds: string[]; trayCountInRack: number; gpusPerTray: number; cpusPerTray: number; provenance: ProvenanceEntry[] }
export interface RackSpec { id: string; label: string; level: 'rack'; traySpecId: string; trayCount: number; totalGPUs: number; totalCPUs: number; nvlinkDomain_TBs: number; nvlinkVersion: string; c2cPerSuperchip_GBs: number; provenance: ProvenanceEntry[]; workloadImplications?: string; speculative?: boolean }
export type GPUPartId = 'cuda-architecture'|'gpu-ram'|'gpc'|`gpc-${number}`|'sm'|`sm-${number}-${number}`|'tensor-core'|'cuda-core'|'tma'|'nvlink'|'grace-cpu'|'board'|'package'|'power'|'interconnect'|'structure'
export interface PartDef { id: GPUPartId; index: string; title: string; abbreviation?: string; description: string; glossaryUrl: string; view: 'exterior'|'architecture'|'system'; anchor: Vec3; onlyFor?: string[]; semanticColorKey?: 'compute'|'memory'|'interconnect'|'power'|'structure'|'interaction' }
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
  const usable = spec.hbm.usableGB ?? spec.hbm.totalGB
  if(totalCalc !== spec.hbm.totalGB && totalCalc !== (spec.hbm.rawGB ?? spec.hbm.totalGB)) { if(Math.abs(totalCalc - usable) > 1) errs.push('totalGB mismatch') }
  if(spec.smCount && spec.gpcCount && spec.smPerGpc) {
    const implied = spec.gpcCount * spec.smPerGpc
    // allow disabled SMs case e.g. 8*18=144 vs 132 enabled; but warn if too far
    if(spec.smCountsPerGpc) {
      const sum = spec.smCountsPerGpc.reduce((a,b)=>a+b,0)
      if(sum !== spec.smCount) errs.push(`smCountsPerGpc sum ${sum} != smCount ${spec.smCount}`)
    }
  }
  return errs
}
export type WorkloadKind = 'dense-training'|'moe-training'|'moe-inference'|'long-context'|'recsys'|'memory-bound'|'comm-bound'|null
export interface WorkloadImplication { kind: WorkloadKind; illuminates: GPUPartId[]; bottleneck: string; description: string }
