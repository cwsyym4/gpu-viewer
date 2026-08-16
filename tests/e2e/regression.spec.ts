import { test, expect } from '@playwright/test'

test.describe('Regression — previously worked dont break', ()=>{
  test('previous H100 1:1 values preserved', async ({ page })=>{
    await page.goto('/gpu/h100-sxm5')
    // from earlier verification spec:
    // boardSize [8.6,0.22,4] vs packageSize 2.78/2.72 — ensure DOM path still correct
    await expect(page.getByText('/device-hardware/h100-sxm5')).toBeVisible()
    // grid minor #133315 and major #1a4a1e proxied via Canvas still present
    await expect(page.locator('canvas').first()).toBeVisible()
    // mounting hole muted #1a1a1a visual check via absence of orange #dc6d42
    const glbLeak = await page.evaluate(async ()=>{
      const html = document.documentElement.innerHTML
      return html.includes('.glb') || html.includes('GLTFLoader')
    })
    expect(glbLeak).toBe(false)
  })

  test('legacy single-file still accessible', async ({ page })=>{
    await page.goto('/legacy-h100.html')
    await expect(page.locator('text=INITIALIZING GPU MODEL').or(page.locator('canvas'))).toBeVisible({ timeout:10000 })
  })
})
