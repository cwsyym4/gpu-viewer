import { h100Spec } from './h100-sxm5'
import { b200Spec } from './b200-sxm'
import { blackwellSpec, gb200SuperchipSpec, gb200TraySpec, gb200RackSpec } from './blackwell-gb200'
import { rubinSpec, rubinSuperchipSpec, rubinRackSpec } from './rubin-r100'
import { rubinUltraSpec, rubinUltraRackSpec } from './rubin-ultra-nvl576'
import type { GPUSpec, SuperchipSpec, ComputeTraySpec, RackSpec, WorkloadKind, WorkloadImplication } from './types'
export const specs: Record<string, GPUSpec> = {
  'h100-sxm5': h100Spec, 'b200-sxm': b200Spec, 'blackwell-gb200': blackwellSpec,
  'rubin-r100': rubinSpec, 'rubin-ultra-nvl576': rubinUltraSpec,
}
export const superchips: Record<string, SuperchipSpec> = { 'gb200-superchip': gb200SuperchipSpec, 'rubin-superchip': rubinSuperchipSpec as any }
export const trays: Record<string, ComputeTraySpec> = { 'gb200-compute-tray': gb200TraySpec }
export const racks: Record<string, RackSpec> = { 'gb200-nvl72-rack': gb200RackSpec, 'rubin-nvl72-rack': rubinRackSpec as any, 'rubin-ultra-nvl576-rack': rubinUltraRackSpec }
export function getSpec(id:string): GPUSpec | undefined { return specs[id] }
export function getSpecOrThrow(id:string): GPUSpec { const s=specs[id]; if(!s) throw new Error(`Spec not found: ${id}`); return s }
export function getSpecSafe(id:string): GPUSpec | null { return specs[id] ?? null }
export const partDefs = [
  {id:"cuda-architecture",index:"01",title:"CUDA architecture (conceptual)",abbreviation:"CUDA",description:"A conceptual map of repeated processing clusters inside the physical GPU package – logical layout, not GDS floorplan.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture",view:"architecture",anchor:[0,1.32,0], semanticColorKey:'compute'},
  {id:"gpu-ram",index:"02",title:"GPU RAM",abbreviation:"HBM",description:"High-bandwidth memory (HBM) stacks beside die – count, version, total GB determine memory-bound workload pressure – conceptual placement.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/gpu-ram",view:"exterior",anchor:[-.84,1.24,-.72], semanticColorKey:'memory'},
  {id:"gpc",index:"03",title:"GPU Processing Cluster",abbreviation:"GPC",description:"Top-level cluster grouping SMs. Count per spec (e.g., H100 8 GPC, B200 8 GPC, GB200 8 GPC) – distribution illustrative unless sourced.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/graphics-processing-cluster",view:"architecture",anchor:[-.95,1.12,-.55], semanticColorKey:'compute'},
  {id:"sm",index:"04",title:"Streaming Multiprocessor",abbreviation:"SM",description:"Processor block scheduling warps of 32 threads. Total SMs official per SKU – per-GPC breakdown illustrative.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor",view:"architecture",anchor:[.55,1.22,-.52], semanticColorKey:'compute'},
  {id:"tensor-core",index:"05",title:"Tensor Core",abbreviation:"TC",description:"Matrix multiply-add accelerator – peak FP8/FP16 performance official per spec, count varies by SM.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/tensor-core",view:"architecture",anchor:[-.52,1.34,.52], semanticColorKey:'compute'},
  {id:"cuda-core",index:"06",title:"CUDA Core",abbreviation:"CC",description:"Scalar FP32/INT32 arithmetic unit inside SM.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/cuda-core",view:"architecture",anchor:[.1,1.34,.52], semanticColorKey:'compute'},
  {id:"tma",index:"07",title:"Tensor Memory Accelerator",abbreviation:"TMA",description:"Async bulk HBM→SMEM copy engine, benefits long-context KV-cache transfers.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/tensor-memory-accelerator",view:"architecture",anchor:[.76,1.34,.52], semanticColorKey:'interconnect'},
  {id:"nvlink",index:"08",title:"NVLink / NVSwitch",abbreviation:"NVL",description:"Inter-GPU scale-up interconnect. Bandwidth per GPU/superchip/rack varies: GB200 NVL72 official 130TB/s domain, Vera Rubin NVL72 260TB/s, C2C 900GB/s GB200 superchip / 1.8TB/s VR SC.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/nvlink",view:"system",anchor:[0,0.9,0], semanticColorKey:'interconnect'},
  {id:"grace-cpu",index:"09",title:"Grace / Vera CPU",abbreviation:"GRACE",description:"Host CPU companion – 72-core Neoverse V2 for Grace, Vera for Rubin. Only applicable to superchip / rack products (GB200, Rubin) – not standalone H100/B200 GPU.",glossaryUrl:"https://www.nvidia.com/en-us/data-center/grace-cpu/",view:"system",anchor:[0,0.2,0], semanticColorKey:'structure', onlyFor:['blackwell-gb200','rubin-r100','rubin-ultra-nvl576']},
  {id:"board",index:"10",title:"SXM Board / Power",abbreviation:"SXM",description:"PCB board, VRM power stages, capacitors, mounting holes. Render dims illustrative scene units – not real mm unless sourced field-provided.",glossaryUrl:"https://www.nvidia.com/en-us/data-center/",view:"exterior",anchor:[0,0.25,0], semanticColorKey:'power'},
  {id:"package",index:"11",title:"Interposer / Package",abbreviation:"CoWoS",description:"Silicon interposer connecting dies + HBM stacks. Dual-die interposer present in Blackwell/Rubin – not in H100 SXM5 single die.",glossaryUrl:"https://www.nvidia.com/en-us/data-center/",view:"exterior",anchor:[0,0.45,0], semanticColorKey:'structure', onlyFor:['b200-sxm','blackwell-gb200','rubin-r100']},
] as const
export const workloadOverlays: Record<Exclude<WorkloadKind,null>, WorkloadImplication> = {
  'dense-training': { kind:'dense-training', illuminates:['tensor-core','gpu-ram','nvlink'], bottleneck:'Compute vs memory BW', description:'Dense matmuls highlight Tensor Core + HBM BW pressure.' },
  'moe-training': { kind:'moe-training', illuminates:['sm','nvlink','grace-cpu'], bottleneck:'All-to-all expert dispatch', description:'MoE training all-to-all benefits from larger NVL72 130TB/s domain.' },
  'moe-inference': { kind:'moe-inference', illuminates:['sm','nvlink','gpu-ram'], bottleneck:'Sparse activation memory pooling', description:'MoE inference infrequent experts: HBM vs NVLink sharing.' },
  'long-context': { kind:'long-context', illuminates:['tma','gpu-ram','nvlink'], bottleneck:'KV-cache HBM capacity + TMA', description:'Long-context 1M tokens: KV-cache grows linear, HBM capacity dominant.' },
  'recsys': { kind:'recsys', illuminates:['gpu-ram','grace-cpu','tma'], bottleneck:'Embedding tables host memory', description:'Recommendation models: large embedding tables in host DDR.' },
  'memory-bound': { kind:'memory-bound', illuminates:['gpu-ram','tma'], bottleneck:'Arithmetic intensity < ridge point', description:'Low arithmetic intensity roofline memory-bound region.' },
  'comm-bound': { kind:'comm-bound', illuminates:['nvlink','grace-cpu'], bottleneck:'Scale-up domain size 72 vs 144/576', description:'Communication-bound large batch or DP all-reduce.' },
}
export { YEAR_META, GPU_ORDER } from './meta'

export function getRack(id:string){ return racks[id] }
export function getRackSafe(id:string){ if(racks[id]) return racks[id]; if(id==='rubin-r100' || id==='rubin-superchip' || id==='rubin-nvl72-rack') return racks['rubin-nvl72-rack'] ?? racks['gb200-nvl72-rack']; if(id==='blackwell-gb200' || id==='gb200-superchip') return racks['gb200-nvl72-rack']; return racks['gb200-nvl72-rack'] ?? null }
export function getSuperchip(id:string){ return superchips[id] ?? superchips['gb200-superchip'] }
export function getSuperchipSafe(id:string){
  if(superchips[id]) return superchips[id]
  if(id==='blackwell-gb200' || id==='gb200-superchip') return superchips['gb200-superchip']
  if(id==='rubin-r100' || id==='rubin-superchip') return superchips['rubin-superchip']
  return superchips['gb200-superchip'] ?? null
}
export function getTray(id:string){ return trays[id] }
export function getTraySafe(id:string){ return trays[id] ?? trays['gb200-compute-tray'] ?? null }

