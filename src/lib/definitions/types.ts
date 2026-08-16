export type Vec3 = [number, number, number]
export type Vec2 = [number, number]

export type HBMKind = 'memory' | 'structural'

export interface PackageSite { position: Vec2; kind: HBMKind }

export interface GPUSpec {
  id: string
  label: string
  module: string
  boardSize: Vec3
  packageSize: Vec3
  packageOffset: Vec3
  dieSize: Vec3
  dieTileColumns: number
  dieTileRows: number
  packageSites: PackageSite[]
  mountingHoles: Vec2[]
  leftPowerStages: Vec2[]
  rightPowerStages: Vec2[]
  topClampPositions: number[]
  sideContacts: number[]
  hbm: { count: number; version: 'hbm3' | 'hbm3e'; gbPerStack: number; totalGB: number }
  dualDie?: boolean
  nvlink?: boolean
  interposer?: boolean
}

export type GPUPartId = 'cuda-architecture' | 'gpu-ram' | 'gpc' | 'sm' | 'tensor-core' | 'cuda-core' | 'tma'

export interface PartDef {
  id: GPUPartId
  index: string
  title: string
  abbreviation?: string
  description: string
  glossaryUrl: string
  view: 'exterior' | 'architecture'
  anchor: Vec3
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
  if(totalCalc !== spec.hbm.totalGB) errs.push('totalGB mismatch')
  return errs
}
