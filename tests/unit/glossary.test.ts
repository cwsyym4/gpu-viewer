import { describe, it, expect } from 'vitest'
import { partDefs } from '@/lib/definitions'

describe('glossary links exact match original modal.com', ()=>{
  it('has exactly 07 parts', ()=>{ expect(partDefs.length).toBe(7) })
  it('glossary URLs match modal.com device-hardware slugs', ()=>{
    const expected = [
      'https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture',
      'https://modal.com/gpu-glossary/device-hardware/gpu-ram',
      'https://modal.com/gpu-glossary/device-hardware/graphics-processing-cluster',
      'https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor',
      'https://modal.com/gpu-glossary/device-hardware/tensor-core',
      'https://modal.com/gpu-glossary/device-hardware/cuda-core',
      'https://modal.com/gpu-glossary/device-hardware/tensor-memory-accelerator',
    ]
    expect(partDefs.map(p=>p.glossaryUrl)).toEqual(expected)
  })
  it('titles match original wording', ()=>{
    expect(partDefs[0].title).toBe('CUDA architecture (conceptual)')
    expect(partDefs[1].title).toBe('GPU RAM')
    expect(partDefs[1].description).toBe('High-bandwidth memory placed beside the GPU die to keep its processors fed with data.')
    expect(partDefs[2].title).toBe('GPU Processing Cluster')
    expect(partDefs[6].title).toBe('Tensor Memory Accelerator')
  })
  it('no extra 08/09 nvlink/grace parts', ()=>{
    const ids = partDefs.map(p=>p.id)
    expect(ids).not.toContain('nvlink')
    expect(ids).not.toContain('grace-cpu')
  })
  it('descriptions exact original per 448 chunk', ()=>{
    const map:any = Object.fromEntries(partDefs.map(p=>[p.id,p.description]))
    expect(map['cuda-architecture']).toBe('A conceptual map of the repeated processing units inside the physical GH100 package.')
    expect(map['gpc']).toBe('A top-level cluster that groups texture and streaming multiprocessor resources.')
    expect(map['sm']).toBe('The repeating processor that schedules and executes groups of GPU threads.')
    expect(map['tensor-core']).toBe('Specialized compute hardware for the matrix operations used heavily in machine learning.')
    expect(map['cuda-core']).toBe('A scalar arithmetic unit inside an SM used for general GPU computation.')
    expect(map['tma']).toBe('Hardware that moves multidimensional tensor data between memory spaces.')
  })
  it('grid colors exact', async ()=>{
    const { palette } = await import('@/lib/materials/palette')
    expect(palette.gridMinor).toBe('#173214')
    expect(palette.gridMajor).toBe('#315e2a')
    expect(palette.lime).toBe('#7fee64')
    expect(palette.ground).toBe('#0d180a')
  })
})
