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
    // b200 board 8.8x4.2 vs package 3.05x2.95 still fits
    expect(b200Spec.packageSize[0]).toBeLessThan(b200Spec.boardSize[0])
    expect(b200Spec.packageSize[2]).toBeLessThan(b200Spec.boardSize[2])
    expect(b200Spec.boardSize[0]).toBe(8.8)
    expect(b200Spec.boardSize[2]).toBe(4.2)
  })
  it('b200 dual-die interposer gap renders 2 die meshes', ()=>{
    expect(b200Spec.dualDie).toBe(true)
    expect(b200Spec.interposer).toBe(true)
    // dual die implies tile split 7+7 cols x10 rows =140
    const perDie = Math.floor(b200Spec.dieTileColumns/2) * b200Spec.dieTileRows
    expect(perDie).toBe(70)
    expect(perDie*2).toBe(b200Spec.dieTileColumns*b200Spec.dieTileRows)
  })
  it('b200 8 HBM positions not overlapping die', ()=>{
    const dieHalfW = b200Spec.dieSize[0]/2
    const dieHalfD = b200Spec.dieSize[2]/2
    for(const site of b200Spec.packageSites){
      // site positions in package local coords, die at 0,0 – if site within die half extents it overlaps
      const overlaps = Math.abs(site.position[0]) < dieHalfW*0.6 && Math.abs(site.position[1]) < dieHalfD*0.6
      // B200 HBM surrounds die, should not overlap centre
      expect(overlaps, `HBM at ${site.position} overlaps die`).toBe(false)
    }
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
    const perDie = Math.floor(blackwellSpec.dieTileColumns/2)*blackwellSpec.dieTileRows
    expect(perDie).toBe(96) // 8 cols per reticle *12 rows
    expect(perDie*2).toBe(192)
  })
  it('blackwell 8 HBM north/south 4+4 not overlapping die centre', ()=>{
    expect(blackwellSpec.hbm.count).toBe(8)
    expect(blackwellSpec.hbm.totalGB).toBe(192)
    expect(blackwellSpec.packageSites.length).toBe(8)
    // check layout is 4 top (z < -0.8) 4 bottom (z > 0.8) to surround interposer
    const north = blackwellSpec.packageSites.filter(s=> s.position[1] < -0.8)
    const south = blackwellSpec.packageSites.filter(s=> s.position[1] > 0.8)
    expect(north.length).toBe(4)
    expect(south.length).toBe(4)
    const dieHalfW = blackwellSpec.dieSize[0]/2
    const dieHalfD = blackwellSpec.dieSize[2]/2
    for(const site of blackwellSpec.packageSites){
      const overlaps = Math.abs(site.position[0]) < dieHalfW*0.35 && Math.abs(site.position[1]) < dieHalfD*0.35
      expect(overlaps, `GB200 HBM at ${site.position} overlaps die centre gap — should be north/south rows`).toBe(false)
    }
  })
  it('blackwell architectural truth: larger package than B200', ()=>{
    expect(blackwellSpec.packageSize[0]).toBeGreaterThan(b200Spec.packageSize[0]) // 3.6 >3.05
    expect(blackwellSpec.packageSize[2]).toBeGreaterThan(b200Spec.packageSize[2])
    expect(blackwellSpec.boardSize[0]).toBeGreaterThan(b200Spec.boardSize[0])
  })
  it('blackwell module label GB200 NVL72', ()=>{
    expect(blackwellSpec.module).toBe('GB200 NVL72 MODULE')
    expect(blackwellSpec.label.includes('GB200')).toBe(true)
  })
  it('rubin r100 forward 288GB 18x14 tiles dual-die', ()=>{
    const errs = validateSpec(rubinSpec)
    expect(errs).toEqual([])
    expect(rubinSpec.hbm.count).toBe(8)
    expect(rubinSpec.hbm.totalGB).toBe(288)
    expect(rubinSpec.hbm.gbPerStack).toBe(36)
    expect(rubinSpec.dieTileColumns * rubinSpec.dieTileRows).toBe(252)
    expect(rubinSpec.dieTileColumns).toBe(18)
    expect(rubinSpec.dieTileRows).toBe(14)
    expect(rubinSpec.dualDie).toBe(true)
    expect(rubinSpec.interposer).toBe(true)
    expect(rubinSpec.nvlink).toBe(true)
    expect(rubinSpec.boardSize[0]).toBe(9.6)
  })
  it('rubin larger than blackwell', ()=>{
    expect(rubinSpec.packageSize[0]).toBeGreaterThan(blackwellSpec.packageSize[0])
    expect(rubinSpec.boardSize[0]).toBeGreaterThan(blackwellSpec.boardSize[0])
  })
  it('rubin ultra nvl576 stub 576GB 12 HBM4e 20x16 tiles', ()=>{
    const errs = validateSpec(rubinUltraSpec)
    expect(errs).toEqual([])
    expect(rubinUltraSpec.hbm.count).toBe(12)
    expect(rubinUltraSpec.hbm.totalGB).toBe(576)
    expect(rubinUltraSpec.hbm.gbPerStack).toBe(48)
    expect(rubinUltraSpec.dieTileColumns).toBe(20)
    expect(rubinUltraSpec.dieTileRows).toBe(16)
    expect(rubinUltraSpec.dieTileColumns*rubinUltraSpec.dieTileRows).toBe(320)
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
  it('hbm3e badge cyan vs h100 lime', ()=>{
    expect(palette.hbm3e).toBe('#0ec7ff')
    expect(palette.interposer).toBeDefined()
  })
  it('grace cpu teal muted #2EE6D6 and blackwell #080b09 accents', ()=>{
    expect(palette.graceCpuHighlight).toBe('#2EE6D6')
    expect(palette.board).toBe('#080b09')
    expect(palette.nvlinkBridge).toBe('#7fee64')
  })
})

