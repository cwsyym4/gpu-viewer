import { describe, it, expect } from 'vitest'
import { h100Spec } from '@/lib/definitions/h100-sxm5'
import { b200Spec } from '@/lib/definitions/b200-sxm'
import { blackwellSpec } from '@/lib/definitions/blackwell-gb200'
import { rubinSpec } from '@/lib/definitions/rubin-r100'
import { rubinUltraSpec } from '@/lib/definitions/rubin-ultra-nvl576'
import { validateSpec } from '@/lib/definitions/types'
import { useViewerStore } from '@/store/useViewerStore'

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
  it('Rubin forward larger 252 tiles procedural', ()=>{
    expect(rubinSpec.boardSize[0]).toBe(9.6)
    expect(rubinSpec.packageSize[0]).toBeLessThan(rubinSpec.boardSize[0])
    expect(rubinSpec.dieTileColumns*rubinSpec.dieTileRows).toBe(252)
    const errs = validateSpec(rubinSpec)
    expect(errs).toEqual([])
  })
  it('Rubin Ultra 320 tiles', ()=>{
    expect(rubinUltraSpec.dieTileColumns*rubinUltraSpec.dieTileRows).toBe(320)
    expect(rubinUltraSpec.boardSize[0]).toBe(10.2)
  })
})

describe('Viewer store rack toggle', ()=>{
  it('defaults module view not rack', ()=>{
    useViewerStore.getState().reset()
    const s = useViewerStore.getState()
    expect(s.rackView).toBe(false)
    expect(s.viewMode).toBe('module')
  })
  it('can set rack view', ()=>{
    useViewerStore.getState().reset()
    useViewerStore.getState().setRackView(true)
    let s = useViewerStore.getState()
    expect(s.rackView).toBe(true)
    expect(s.viewMode).toBe('rack')
    expect(s.userInteracted).toBe(true)
    useViewerStore.getState().setViewMode('module')
    s = useViewerStore.getState()
    expect(s.rackView).toBe(false)
    expect(s.viewMode).toBe('module')
  })
  it('RackStats string exists', async ()=>{
    // Avoid importing R3F Canvas in jsdom – just check file exists
    const fs = await import('fs')
    const exists = fs.existsSync('src/components/rack/NVL72Rack.tsx')
    expect(exists).toBe(true)
  })
})
