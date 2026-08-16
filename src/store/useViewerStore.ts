import { create } from 'zustand'

export type ViewMode = 'exterior' | 'architecture'
export type GPUPartId = 'cuda-architecture'|'gpu-ram'|'gpc'|'sm'|'tensor-core'|'cuda-core'|'tma'|'nvlink'|'grace-cpu'|null

type Store = {
  view: ViewMode
  rackView: boolean
  hovered: GPUPartId
  selected: GPUPartId
  userInteracted: boolean
  currentGPU: string
  helpOpen: boolean
  resetToken: number
  setView: (v: ViewMode)=>void
  setRackView: (b:boolean)=>void
  setHovered: (p: GPUPartId)=>void
  setSelected: (p: GPUPartId)=>void
  setCurrentGPU: (id:string)=>void
  setHelp: (o:boolean)=>void
  reset: ()=>void
}

export const useViewerStore = create<Store>(set=>({
  view: 'exterior',
  rackView: false,
  hovered: null,
  selected: null,
  userInteracted: false,
  currentGPU: 'h100-sxm5',
  helpOpen: false,
  resetToken: 0,
  setView: (view)=> set({view}),
  setRackView: (rackView)=> set({rackView, userInteracted: true}),
  setHovered: (hovered)=> set({hovered}),
  setSelected: (selected)=> set(s=>({selected, view: selected ? (typeof window !== 'undefined' ? s.view : s.view) : s.view, userInteracted: true})),
  setCurrentGPU: (currentGPU)=> set({currentGPU}),
  setHelp: (helpOpen)=> set({helpOpen}),
  reset: ()=> set(s=>({selected:null, hovered:null, userInteracted:false, resetToken: s.resetToken+1, helpOpen:false, rackView:false})),
}))
