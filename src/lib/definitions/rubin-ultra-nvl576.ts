import type { GPUSpec } from './types'
import { h100Spec } from './h100-sxm5'

// Rubin Ultra NVL576 — rack-scale evolution of Rubin
// NVL144 first (36*4), NVL576 144*4? Future leaks point to NVL576 domain 1PB/s class
// Board-level still Superchip but denser: 12 HBM4e 48GB = 576GB, 20x16 tiles = 320 total (160 per die)

export const rubinUltraSpec: GPUSpec = {
  id: 'rubin-ultra-nvl576',
  label: 'Rubin Ultra NVL576',
  module: 'RUBIN ULTRA NVL576 MODULE',
  boardSize: [10.2,0.36,5.2],
  packageSize: [4.8,0.55,4.4],
  packageOffset: [0,0.52,0],
  dieSize: [2.25,0.14,1.95],
  dieTileColumns: 20,
  dieTileRows: 16,
  packageSites: [
    {position:[-1.58,-1.18],kind:'memory'},
    {position:[-0.52,-1.18],kind:'memory'},
    {position:[0.52,-1.18],kind:'memory'},
    {position:[1.58,-1.18],kind:'memory'},
    {position:[-1.58,-0.32],kind:'memory'},
    {position:[1.58,-0.32],kind:'memory'},
    {position:[-1.58,0.52],kind:'memory'},
    {position:[-0.52,0.52],kind:'memory'},
    {position:[0.52,0.52],kind:'memory'},
    {position:[1.58,0.52],kind:'memory'},
    {position:[-0.52,1.22],kind:'memory'},
    {position:[0.52,1.22],kind:'memory'},
  ],
  mountingHoles: h100Spec.mountingHoles,
  leftPowerStages: h100Spec.leftPowerStages,
  rightPowerStages: h100Spec.rightPowerStages,
  topClampPositions: h100Spec.topClampPositions,
  sideContacts: h100Spec.sideContacts,
  hbm: { count:12, version:'hbm4e' as any, gbPerStack:48, totalGB:576 },
  dualDie: true,
  nvlink: true,
  interposer: true,
} as GPUSpec

export const rubinUltraTiles = 20*16 // 320

// Alias for shorter route if needed
export const ultraSpec = rubinUltraSpec
