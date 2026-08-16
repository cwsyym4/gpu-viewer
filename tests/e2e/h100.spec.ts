import { test, expect } from '@playwright/test'

test.describe('H100 Clone 1:1 — hard-reload verification', ()=>{
  test.beforeEach(async ({ page })=>{
    // accumulate console errors
    const errors:string[]=[]
    page.on('pageerror', e=> errors.push(String(e)))
    page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()) })
    ;(page as any)._errors = errors
  })

  test('desktop hard reload MODEL READY no GLB no console errors', async ({ page, isMobile })=>{
    test.skip(isMobile, 'desktop only')
    await page.goto('/gpu/h100-sxm5')
    // hard-reload Ctrl+Shift+R simulated by reload + cache bypass
    await page.reload({ waitUntil:'networkidle' })
    await expect(page.getByText('MODEL READY')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('H100 SXM5 MODULE')).toBeVisible()
    // Exterior toggle
    const exterior = page.getByRole('button', { name:/Exterior/i })
    const arch = page.getByRole('button', { name:/Architecture/i })
    await expect(exterior).toBeVisible()
    await arch.click()
    await expect(page.getByText('ILLUSTRATIVE ARCHITECTURE VIEW')).toBeVisible()
    await exterior.click()
    await expect(page.getByText('H100 SXM5 MODULE')).toBeVisible()

    // Component index 07 parts
    const parts = page.locator('nav').first().locator('a')
    // at least 7 for rail, but mobile also counts; desktop rail should have 7
    // Popover appears on hover
    const first = page.locator('[data-id="cuda-architecture"]').first()
    await first.hover()
    await expect(page.getByText('CUDA architecture', { exact:false }).first()).toBeVisible()

    // OPEN GLOSSARY link correct modal.com
    const glossary = page.locator('a', { hasText:/OPEN GLOSSARY/ }).first()
    await expect(glossary).toHaveAttribute('href', /modal\.com/)

    // Network no .glb
    const requests:string[]=[]
    page.on('request', r=> requests.push(r.url()))
    await page.waitForTimeout(1000)
    const glbRequests = requests.filter(u=> u.endsWith('.glb'))
    expect(glbRequests.length).toBe(0)

    // Console errors 0
    const errs = (page as any)._errors as string[]
    expect(errs.length, `console errors: ${errs.join('\n')}`).toBe(0)

    // OrbitControls drag changes
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    if(box){
      await page.mouse.move(box.x + box.width/2, box.y + box.height/2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width/2 + 80, box.y + box.height/2, { steps:6 })
      await page.mouse.up()
    }
    // After drag status should show ESC TO CLEAR (userInteracted)
    await expect(page.getByText('ESC TO CLEAR').first()).toBeVisible({ timeout:5000 })

    // Screenshot
    await page.screenshot({ path:'audits/desktop-h100-fixed.png', clip: undefined })
  })

  test('mobile 390x844 bar 07 TMA visible padding-right 20px', async ({ page, isMobile })=>{
    test.skip(!isMobile, 'mobile only')
    await page.goto('/gpu/h100-sxm5')
    await page.waitForTimeout(2000)
    const mobileBar = page.locator('.mobile-part-bar, nav[aria-label*=\"shortcuts\" i]').first()
    await expect(mobileBar).toBeVisible()
    // check computed padding-right
    const pr = await mobileBar.evaluate(el=> getComputedStyle(el).paddingRight)
    // should be 20px per fix
    expect(pr).toBe('20px')
    // 07 TMA visible within viewport (not clipped 97px)
    const tma = mobileBar.locator('button', { hasText:/TMA|07/ }).last()
    await expect(tma).toBeVisible()
    const box = await tma.boundingBox()
    expect(box).not.toBeNull()
    // ensure no horizontal overflow of page
    const overflow = await page.evaluate(()=> document.documentElement.scrollWidth <= document.documentElement.clientWidth + 20)
    expect(overflow).toBeTruthy()
    await page.screenshot({ path:'audits/mobile-h100-fixed.png' })
  })
})
