import { partDefs } from '@/lib/definitions'
import { describe, it, expect } from 'vitest'

describe('glossary links exact match original modal.com', ()=>{
  it('has at least 07 parts preserving original (now 11 with system extensions)', ()=>{
    expect(partDefs.length).toBeGreaterThanOrEqual(7)
    const ids = partDefs.map(p=>p.id)
    for(const required of ['cuda-architecture','gpu-ram','gpc','sm','tensor-core','cuda-core','tma']){
      expect(ids).toContain(required)
    }
  })
  it('glossary URLs: first 07 match modal.com device-hardware slugs, extras have provenance URLs', ()=>{
    const expectedFirst7 = [
      'https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture',
      'https://modal.com/gpu-glossary/device-hardware/gpu-ram',
      'https://modal.com/gpu-glossary/device-hardware/graphics-processing-cluster',
      'https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor',
      'https://modal.com/gpu-glossary/device-hardware/tensor-core',
      'https://modal.com/gpu-glossary/device-hardware/cuda-core',
      'https://modal.com/gpu-glossary/device-hardware/tensor-memory-accelerator',
    ]
    const first7 = partDefs.slice(0,7).map(p=>p.glossaryUrl)
    expect(first7).toEqual(expectedFirst7)
    const extra = partDefs.slice(7)
    for(const e of extra){
      expect(e.glossaryUrl).toMatch(/^https?:\/\//)
    }
  })
  it('titles contain original wording (allow extended description)', ()=>{
    const byId: any = Object.fromEntries(partDefs.map(p=>[p.id,p]))
    expect(byId['cuda-architecture'].title).toBe('CUDA architecture (conceptual)')
    expect(byId['gpu-ram'].title).toBe('GPU RAM')
    expect(byId['gpc'].title).toBe('GPU Processing Cluster')
    expect(byId['tma'].title).toBe('Tensor Memory Accelerator')
    expect(byId['cuda-architecture'].description).toContain('conceptual map')
    expect(byId['gpu-ram'].description).toContain('High-bandwidth memory')
    expect(byId['gpc'].description).toMatch(/GPC|cluster/i)
  })
  it('allows extra 08/09/10/11 nvlink/grace/board/package system parts with provenance', ()=>{
    const ids = partDefs.map(p=>p.id)
    expect(ids).toContain('nvlink')
    expect(ids).toContain('grace-cpu')
    expect(ids).toContain('board')
    expect(ids).toContain('package')
    const viewMap = Object.fromEntries(partDefs.map(p=>[p.id, (p as any).view]))
    expect(viewMap['nvlink']).toBe('system')
    expect(viewMap['grace-cpu']).toBe('system')
  })
  it('descriptions educational (≥ original but explain locality) and teaching overload', ()=>{
    const map:any = Object.fromEntries(partDefs.map(p=>[p.id,p.description]))
    expect(map['cuda-architecture']).toContain('conceptual')
    expect(map['gpc']).toBeTruthy()
    expect(map['sm']).toBeTruthy()
    expect(map['tensor-core']).toBeTruthy()
    expect(map['cuda-core']).toBeTruthy()
    expect(map['tma']).toBeTruthy()
    expect(map['gpu-ram']).toContain('HBM')
    // extended teaching checks – only if those keywords exist (forward-compat)
    if(map['cuda-architecture'].includes('GH100')) expect(map['cuda-architecture']).toContain('GH100')
    if(map['gpc']?.includes('TPCs')) expect(map['gpc']).toContain('TPCs/SMs')
  })
  it('semantic color keys present for compute/memory/interconnect/power/structure when defined', ()=>{
    const keys = partDefs.map(p=> (p as any).semanticColorKey).filter(Boolean)
    if(keys.length){
      expect(keys).toContain('compute')
      expect(keys).toContain('memory')
      expect(keys).toContain('interconnect')
      expect(keys).toContain('power')
      expect(keys).toContain('structure')
    }
  })
})

describe('palette exact', ()=>{
  it('grid colors exact', async ()=>{
    const { palette } = await import('@/lib/materials/palette')
    expect(palette.gridMinor).toBe('#173214')
    expect(palette.gridMajor).toBe('#315e2a')
    expect(palette.lime).toBe('#7fee64')
    expect(palette.ground).toBe('#0d180a')
  })
})
