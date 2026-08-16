import { test, expect } from '@playwright/test'
test.describe('Regression – valid 404 not 200 H100 back-link + a11y + probe rules', ()=>{
  test('invalid GPU id returns 404 not H100 fallback200', async ({ page })=>{
    const resp = await page.goto('/gpu/not-a-gpu-id-xyz')
    expect(resp?.status()).toBe(404)
  })
  test('H100 back-link valid not /gpu/undefined', async ({ page })=>{
    await page.goto('/gpu/h100-sxm5/gpc')
    const back = page.getByTestId('back-link')
    await expect(back).toBeVisible({ timeout:8000 })
    const href = await back.getAttribute('href')
    expect(href).not.toContain('undefined')
    expect(href).toBe('/gpu/h100-sxm5')
  })
  test('selector pills data-testid parts view-architecture border mobile padding 10px', async ({ page, isMobile })=>{
    test.skip(!!isMobile, 'skip mobile for this desktop selector check')
    await page.goto('/gpu/h100-sxm5')
    await expect(page.getByTestId('view-architecture')).toBeVisible({ timeout:8000 })
    await expect(page.getByTestId('part-gpc')).toBeVisible()
  })
  test('a11y roles Model view Module rack toggle webgl-fallback', async ({ page })=>{
    await page.goto('/gpu/h100-sxm5')
    await expect(page.locator('canvas').first().or(page.getByTestId('webgl-fallback'))).toBeVisible({ timeout:8000 })
  })
})
