import { describe, it, expect } from 'vitest'
import { h100Spec } from '@/lib/definitions/h100-sxm5'
import { b200Spec } from '@/lib/definitions/b200-sxm'
import { blackwellSpec } from '@/lib/definitions/blackwell-gb200'
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
  it('blackwell dual die nvlink', ()=>{
    expect(blackwellSpec.dualDie).toBe(true)
    expect(blackwellSpec.nvlink).toBe(true)
    const errs = validateSpec(blackwellSpec)
    expect(errs).toEqual([])
  })
})

describe('palette exact colors prevent regression', ()=>{
  it('lime must be exact #7fee64 per Kyle match', ()=>{
    expect(palette.lime).toBe('#7fee64')
    const errs = validatePalette()
    expect(errs).toEqual([])
  })
  it('gridMinor must be #133315 exact', ()=>{
    expect(palette.gridMinor).toBe('#133315')
  })
  it('mountingHole muted not orange', ()=>{
    expect(palette.mountingHole).toBe('#1a1a1a') // fixes #dc6d42 bug
    expect(palette.mountingHole).not.toBe('#dc6d42')
  })
  it('contact shadow opacity fixed 0.32', ()=>{
    expect(palette.contactShadowOpacity).toBeCloseTo(0.32)
  })
  it('ambient 0.65 dir 2.2 as fixed after bright bug', ()=>{
    expect(palette.ambientIntensity).toBe(0.65)
    expect(palette.dirIntensity).toBe(2.2)
  })
})
