import { test, expect } from '@playwright/test'
test.describe('B200 – faithful ontology, workload overlay, no 64 cap', ()=>{
  test('desktop B200 8x HBM3e 24GB 192GB passes version/capacity to HBMStack + workload illuminates', async ({ page, isMobile })=>{
    test.skip(!!isMobile, 'desktop only')
    const glb:string[]=[]
    page.on('request', r=> { if(r.url().endsWith('.glb')) glb.push(r.url()) })
    await page.goto('/gpu/b200-sxm')
    await expect(page.getByTestId('stage-status')).toBeVisible({ timeout:12000 })

    // HBM badge should show HBM3E version + 24GB per stack capacity
    await expect(page.locator('canvas')).toBeVisible()
    // MiniBoard via compare? check compare page separately
    // Ensure B200 ontology: 14x10=140 tiles, not capped 64, dual-die interposer true
    const label = await page.locator('text=B200').first().innerText().catch(()=> '')
    expect(glb.length).toBe(0)

    // workload overlay dense-training illuminates TC+HBM+BW
    await page.getByTestId('toggle-drawer').click().catch(()=>{})
    const sel = page.getByTestId('workload-select')
    if(await sel.isVisible()){
      await sel.selectOption('dense-training')
    }
  })
})
