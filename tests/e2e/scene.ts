import { expect, type Page } from '@playwright/test'

export function collectPageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
  page.on('console', message => {
    if(message.type()==='error') errors.push(`console.error: ${message.text()}`)
  })
  return errors
}

export async function sceneHas(page: Page, testId: string): Promise<boolean> {
  return page.evaluate((id: string) => {
    const scene = (window as any).__R3F_SCENE__
    if(!scene) return false
    let found = false
    scene.traverse((object: any)=> { if(object?.userData?.testId===id) found=true })
    return found
  }, testId).catch(()=> false)
}

export async function expectSceneObject(page: Page, testId: string, timeout = 12000): Promise<void> {
  await expect.poll(()=> sceneHas(page, testId), {
    timeout,
    message:`${testId} should exist in the rendered Three.js scene`,
  }).toBe(true)
}

export async function expectSceneObjectInFrame(page: Page, testId: string, padding = 0.08): Promise<void> {
  const point = await page.evaluate((id: string) => {
    const scene = (window as any).__R3F_SCENE__
    const camera = (window as any).__R3F_CAMERA__
    let object: any = null
    scene?.traverse((candidate:any)=> { if(candidate?.userData?.testId===id) object=candidate })
    if(!object || !camera) return null
    camera.updateMatrixWorld(true)
    camera.updateProjectionMatrix()
    const world = object.position.clone()
    object.getWorldPosition(world)
    world.project(camera)
    return { x:world.x, y:world.y, z:world.z }
  }, testId)
  expect(point, `${testId} should be projectable`).not.toBeNull()
  expect(Math.abs(point!.x), `${testId} should fit horizontally`).toBeLessThanOrEqual(1-padding)
  expect(Math.abs(point!.y), `${testId} should fit vertically`).toBeLessThanOrEqual(1-padding)
  expect(point!.z, `${testId} should be in front of the camera`).toBeLessThan(1)
}

export async function sceneObjectScreenPoint(page: Page, testId: string): Promise<{x:number,y:number}> {
  const point = await page.evaluate((id:string)=>{
    const scene = (window as any).__R3F_SCENE__
    const camera = (window as any).__R3F_CAMERA__
    const canvas = document.querySelector('canvas')
    let object:any = null
    scene?.traverse((candidate:any)=> { if(candidate?.userData?.testId===id) object=candidate })
    if(!object || !camera || !canvas) return null
    camera.updateMatrixWorld(true)
    camera.updateProjectionMatrix()
    const ndc = object.position.clone()
    object.getWorldPosition(ndc)
    ndc.project(camera)
    const rect = canvas.getBoundingClientRect()
    return { x:rect.left+(ndc.x+1)*rect.width/2, y:rect.top+(1-ndc.y)*rect.height/2 }
  }, testId)
  expect(point, `${testId} should map to a canvas point`).not.toBeNull()
  return point!
}
