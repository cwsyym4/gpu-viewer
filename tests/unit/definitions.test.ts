import { describe, it, expect } from 'vitest'
import { h100Spec } from '@/lib/definitions/h100-sxm5'
import { b200Spec } from '@/lib/definitions/b200-sxm'
import { blackwellSpec } from '@/lib/definitions/blackwell-gb200'
import { rubinSpec } from '@/lib/definitions/rubin-r100'
import { rubinUltraSpec } from '@/lib/definitions/rubin-ultra-nvl576'
import { validateSpec } from '@/lib/definitions/types'
import { palette, validatePalette } from '@/lib/materials/palette'

describe('GPUSpec validation', ()=>{
  it('h100 board/package fits', ()=>{
    const errs = validateSpec(h100Spec)
    expect(errs).toEqual([])
    expect(h100Spec.boardSize.length).toBe(3)
    expect(h100Spec.dieTileColumns * h100Spec.dieTileRows).toBe(108)
    expect(h100Spec.hbm.count).toBe(5)
  })
  it('b200 8 HBM 192GB', ()=>{
    const errs = validateSpec(b200Spec)
    expect(errs).toEqual([])
    expect(b200Spec.hbm.count).toBe(8)
    expect(b200Spec.hbm.totalGB).toBe(192)
    expect(b200Spec.dieTileColumns * b200Spec.dieTileRows).toBe(140)
  })
  it('b200 package fits larger board', ()=>{
    expect(b200Spec.packageSize[0]).toBeLessThan(b200Spec.boardSize[0])
    expect(b200Spec.packageSize[2]).toBeLessThan(b200Spec.boardSize[2])
    expect(b200Spec.boardSize[0]).toBe(8.8)
    expect(b200Spec.boardSize[2]).toBe(4.2)
  })
  it('b200 dual-die interposer gap renders 2 die meshes', ()=>{
    expect(b200Spec.dualDie).toBe(true)
    expect(b200Spec.interposer).toBe(true)
    const perDie = Math.floor(b200Spec.dieTileColumns/2) * b200Spec.dieTileRows
    expect(perDie).toBe(70)
    expect(perDie*2).toBe(b200Spec.dieTileColumns*b200Spec.dieTileRows)
  })
  it('blackwell dual die nvlink', ()=>{
    expect(blackwellSpec.dualDie).toBe(true)
    expect(blackwellSpec.nvlink).toBe(true)
    expect(blackwellSpec.interposer).toBe(true)
    const errs = validateSpec(blackwellSpec)
    expect(errs).toEqual([])
  })
  it('blackwell 16x12 total 192 tiles across interposer 96 per die', ()=>{
    expect(blackwellSpec.dieTileColumns).toBe(16)
    expect(blackwellSpec.dieTileRows).toBe(12)
    expect(blackwellSpec.dieTileColumns*blackwellSpec.dieTileRows).toBe(192)
  })
  it('rubin r100 forward 288GB 18x14 tiles dual-die', ()=>{
    const errs = validateSpec(rubinSpec)
    expect(errs).toEqual([])
    expect(rubinSpec.hbm.totalGB).toBe(288)
    expect(rubinSpec.dieTileColumns * rubinSpec.dieTileRows).toBe(252)
  })
  it('rubin ultra nvl576 stub 576GB', ()=>{
    const errs = validateSpec(rubinUltraSpec)
    expect(errs).toEqual([])
    expect(rubinUltraSpec.hbm.totalGB).toBe(576)
  })
})

describe('palette exact colors prevent regression — restored to original Kyle fidelity', ()=>{
  it('lime must be exact #7fee64 per Kyle match', ()=>{
    expect(palette.lime).toBe('#7fee64')
    const errs = validatePalette()
    expect(errs).toEqual([])
  })
  it('grid original Kyle 448 chunk: minor #173214 major #315e2a', ()=>{
    expect(palette.gridMinor).toBe('#173214')
    expect(palette.gridMajor).toBe('#315e2a')
  })
  it('mounting hole outer orange #dc6d42 per original 448 (8 holes)', ()=>{
    expect(palette.mountingHole).toBe('#dc6d42')
    expect(palette.mountingHoleRing).toBe('#dc6d42')
    expect(palette.mountingHoleCore).toBe('#020302')
  })
  it('contact shadows original opacity .7 scale 11 blur 2.5 fog 24/42', ()=>{
    expect(palette.contactShadowOpacity).toBeCloseTo(0.7)
    expect(palette.contactShadowBlur).toBeCloseTo(2.5)
    expect(palette.contactShadowScale).toBe(11)
    expect(palette.fogNear).toBe(24)
    expect(palette.fogFar).toBe(42)
  })
  it('ambient .9 dir 2.8 dir2 1.6 point 4 as original kyle', ()=>{
    expect(palette.ambientIntensity).toBe(0.9)
    expect(palette.dirIntensity).toBe(2.8)
    expect(palette.dir2Intensity).toBe(1.6)
    expect(palette.pointIntensity).toBe(4)
  })
})
