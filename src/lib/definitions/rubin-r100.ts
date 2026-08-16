import type { GPUSpec } from './types'
import { h100Spec } from './h100-sxm5'

// Rubin R100 — next-gen after Blackwell GB200
// Rumor/roadmap: 2x reticle? HBM4 288GB (8*36GB or 12*24GB), tile count 18x14 = 252 total across interposer (126 per die)
// C2C 1.8TB/s doubling GB200's 900GB/s, NVLink 6 maybe, NVL144 first.

export const rubinSpec: GPUSpec = {
  id: 'rubin-r100',
  label: 'R100 Rubin',
  module: 'R100 RUBIN MODULE',
  boardSize: [9.6,0.32,4.8],
  packageSize: [4.1,0.45,3.9],
  packageOffset: [0,0.45,0],
  dieSize: [2.05,0.13,1.75],
  dieTileColumns: 18,
  dieTileRows: 14,
  // 8 HBM4 stacks — 4+4 north/south surrounding interposer, 36GB each = 288GB
  packageSites: [
    {position:[-1.32,-1.04],kind:'memory'},
    {position:[0,-1.04],kind:'memory'},
    {position:[1.32,-1.04],kind:'memory'},
    {position:[-1.32,-0.18],kind:'memory'},
    {position:[1.32,-0.18],kind:'memory'},
    {position:[-1.32,0.84],kind:'memory'},
    {position:[0,0.84],kind:'memory'},
    {position:[1.32,0.84],kind:'memory'},
  ],
  mountingHoles: h100Spec.mountingHoles,
  leftPowerStages: h100Spec.leftPowerStages,
  rightPowerStages: h100Spec.rightPowerStages,
  topClampPositions: h100Spec.topClampPositions,
  sideContacts: h100Spec.sideContacts,
  hbm: { count:8, version:'hbm4' as any, gbPerStack:36, totalGB:288 },
  dualDie: true,
  nvlink: true,
  interposer: true,
  // extended meta for Rubin (not in base type but allowed via index signature or extra)
  c2c: '1.8TB/s',
} as GPUSpec & { c2c?: string }

export const rubinTiles = 18*14 // 252 total, 126 per die
