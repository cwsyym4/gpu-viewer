import { describe, it, expect } from 'vitest'
import { h100Spec } from '@/lib/definitions/h100-sxm5'
import { b200Spec } from '@/lib/definitions/b200-sxm'
import { blackwellSpec } from '@/lib/definitions/blackwell-gb200'
import { validateSpec } from '@/lib/definitions/types'

describe('Board procedural guarantee', ()=>{
  it('spec has no GLB leakage - package fits board logic H100', ()=>{
    expect(h100Spec.boardSize[0]).toBe(8.6)
    expect(h100Spec.packageSize[0]).toBeLessThan(h100Spec.boardSize[0])
    const errs = validateSpec(h100Spec)
    expect(errs).toEqual([])
  })
  it('B200 still fits', ()=>{
    expect(b200Spec.packageSize[0]).toBeLessThan(b200Spec.boardSize[0])
    expect(b200Spec.boardSize[0]).toBe(8.8)
  })
  it('GB200 larger board no GLB procedural only', ()=>{
    expect(blackwellSpec.boardSize[0]).toBe(9.2)
    expect(blackwellSpec.packageSize[0]).toBeLessThan(blackwellSpec.boardSize[0])
    expect(blackwellSpec.dieTileColumns*blackwellSpec.dieTileRows).toBe(192)
  })
})
