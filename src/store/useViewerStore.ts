import { create } from 'zustand'
export type ViewMode = 'exterior' | 'architecture' | 'system'
export type GPUPartId = 'cuda-architecture'|'gpu-ram'|'gpc'|`gpc-${number}`|'sm'|`sm-${number}-${number}`|'tensor-core'|'cuda-core'|'tma'|'nvlink'|'grace-cpu'|'board'|'package'|'power'|'interconnect'|'structure'|null
export type WorkloadKind = 'dense-training' | 'moe-training' | 'moe-inference' | 'long-context' | 'recsys' | 'memory-bound' | 'comm-bound' | null
type Store = {
  view: ViewMode; rackView: boolean; viewMode: 'module'|'rack'; hovered: GPUPartId; selected: GPUPartId;
  userInteracted: boolean; currentGPU: string; helpOpen: boolean; resetToken: number; workload: WorkloadKind; drawerOpen: boolean;
  setView: (v: ViewMode)=>void; setRackView: (b:boolean)=>void; setViewMode: (m:'module'|'rack')=>void;
  setHovered: (p: GPUPartId)=>void; setSelected: (p: GPUPartId)=>void; setCurrentGPU: (id:string)=>void; setHelp: (o:boolean)=>void;
  setUserInteracted: (b:boolean)=>void; setWorkload: (w:WorkloadKind)=>void; setDrawerOpen: (b:boolean)=>void;
  reset: ()=>void; clearSelection: ()=>void
}
export const useViewerStore = create<Store>((set)=>({
  view:'exterior', rackView:false, viewMode:'module', hovered:null, selected:null, userInteracted:false, currentGPU:'h100-sxm5', helpOpen:false, resetToken:0, workload:null, drawerOpen:false,
  setView:(view)=> set({view, userInteracted:true}),
  setRackView:(rackView)=> set({rackView, viewMode: rackView ? 'rack':'module', userInteracted:true}),
  setViewMode:(viewMode)=> set({viewMode, rackView: viewMode==='rack'}),
  setHovered:(hovered)=> set({hovered}),
  setSelected:(selected)=> set({selected, userInteracted:true}),
  setCurrentGPU:(currentGPU)=> set({currentGPU}),
  setHelp:(helpOpen)=> set({helpOpen}),
  setUserInteracted:(userInteracted)=> set({userInteracted}),
  setWorkload:(workload)=> set({workload}),
  setDrawerOpen:(drawerOpen)=> set({drawerOpen}),
  reset:()=> set(s=>({selected:null, hovered:null, userInteracted:false, resetToken:s.resetToken+1, helpOpen:false, rackView:false, viewMode:'module'})),
  clearSelection:()=> set({selected:null, hovered:null, userInteracted:false}),
}))
