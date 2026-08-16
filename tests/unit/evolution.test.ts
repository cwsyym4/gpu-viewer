import { describe, it, expect } from 'vitest'
import { specs } from '@/lib/definitions'
import { specsSortedByYear } from '@/components/comparison/GPUSpecTable'
import { YEAR_META } from '@/lib/definitions/meta'
import { generationDeltas } from '@/components/comparison/DiffHighlight'

describe('Evolution sorting and forward progress', ()=>{
  it('specs sorted by year 2023->2028', ()=>{
    const sorted = specsSortedByYear()
    // first must be h100 2023, last ultra 2027
    expect(sorted[0]).toBe('h100-sxm5')
    expect(sorted[sorted.length-1]).toBe('rubin-ultra-nvl576')
    const years = sorted.map(id=> YEAR_META[id].year)
    // strictly non-decreasing
    for(let i=1;i<years.length;i++) expect(years[i]).toBeGreaterThanOrEqual(years[i-1])
  })
  it('compare table selects 3 logic non-empty intersection not required', ()=>{
    const all = Object.keys(specs)
    const sel = all.slice(0,3)
    expect(sel.length).toBe(3)
    expect(sel.includes('h100-sxm5')).toBe(true)
  })
  it('generation deltas tiles increasing (non-negative) mem non-decreasing', ()=>{
    const deltas = generationDeltas()
    // @ts-ignore
    for(const d of deltas){
      if(!d) continue
      expect(d.tilesDelta).toBeGreaterThanOrEqual(0)
      expect(d.memUp).toBe(true) // spec totalGB non-decreasing 80->192->192->288->576
      expect(d.bwUp).toBe(true)
    }
    expect(deltas.length).toBe(4) // 5 GPUs 4 edges
  })
  it('bandwidth trend increasing envelope', ()=>{
    const order = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576']
    const bws = order.map(id=> {
      const m = YEAR_META[id]
      // parse numeric approx TB/s: take first number in bw string
      const num = parseFloat(m.bw.replace('~','').split('TB')[0] || '0')
      return num
    })
    for(let i=1;i<bws.length;i++){
      expect(bws[i]).toBeGreaterThanOrEqual(bws[i-1])
    }
  })
  it('tiles counts 108->140->192->252->320 monotonic', ()=>{
    const order = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576']
    const tiles = order.map(id=> specs[id].dieTileColumns*specs[id].dieTileRows)
    expect(tiles).toEqual([108,140,192,252,320])
    for(let i=1;i<tiles.length;i++) expect(tiles[i]).toBeGreaterThan(tiles[i-1])
  })
  it('HBM totalGB envelope monotonic non-decreasing', ()=>{
    const order = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576']
    const gbs = order.map(id=> specs[id].hbm.totalGB)
    expect(gbs).toEqual([80,192,192,288,576])
    for(let i=1;i<gbs.length;i++) expect(gbs[i]).toBeGreaterThanOrEqual(gbs[i-1])
  })
})
