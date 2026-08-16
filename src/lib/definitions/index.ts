import { h100Spec } from './h100-sxm5'
import { b200Spec } from './b200-sxm'
import { blackwellSpec, gb200SuperchipSpec, gb200TraySpec, gb200RackSpec } from './blackwell-gb200'
import { rubinSpec } from './rubin-r100'
import { rubinUltraSpec, rubinUltraRackSpec } from './rubin-ultra-nvl576'
import type { GPUSpec, SuperchipSpec, ComputeTraySpec, RackSpec, WorkloadKind, WorkloadImplication } from './types'

export const specs: Record<string, GPUSpec> = {
  'h100-sxm5': h100Spec,
  'b200-sxm': b200Spec,
  'blackwell-gb200': blackwellSpec,
  'rubin-r100': rubinSpec,
  'rubin-ultra-nvl576': rubinUltraSpec,
}

export const superchips: Record<string, SuperchipSpec> = {
  'gb200-superchip': gb200SuperchipSpec,
}

export const trays: Record<string, ComputeTraySpec> = {
  'gb200-compute-tray': gb200TraySpec,
}

export const racks: Record<string, RackSpec> = {
  'gb200-nvl72-rack': gb200RackSpec,
  'rubin-ultra-nvl576-rack': rubinUltraRackSpec,
}

export function getSpec(id:string): GPUSpec | undefined {
  return specs[id]
}
export function getSpecOrThrow(id:string): GPUSpec {
  const s = specs[id]
  if(!s) {
    // throw to trigger Next.js notFound via caller? We'll let caller handle
    throw new Error(`Spec not found: ${id}`)
  }
  return s
}
export function getSpecSafe(id:string): GPUSpec | null {
  return specs[id] ?? null
}

export const partDefs = [
  {id:"cuda-architecture",index:"01",title:"CUDA architecture (conceptual)",abbreviation:"CUDA",description:"A conceptual map of the repeated processing units inside the physical GH100 package.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture",view:"architecture",anchor:[0,1.32,0], semanticColorKey:'compute'},
  {id:"gpu-ram",index:"02",title:"GPU RAM",abbreviation:"HBM",description:"High-bandwidth memory placed beside the GPU die to keep processors fed. HBM count, version, capacity determine memory-bound workload pressure.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/gpu-ram",view:"exterior",anchor:[-.84,1.24,-.72], semanticColorKey:'memory'},
  {id:"gpc",index:"03",title:"GPU Processing Cluster",abbreviation:"GPC",description:"Top-level cluster grouping TPCs/SMs and texture units. Blackwell 8 GPC per die, Rubin more for FP4.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/graphics-processing-cluster",view:"architecture",anchor:[-.95,1.12,-.55], semanticColorKey:'compute'},
  {id:"sm",index:"04",title:"Streaming Multiprocessor",abbreviation:"SM",description:"Repeating processor scheduling warps of 32 threads. Site of Tensor Core, CUDA Core, TMA, Tensor Memory.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor",view:"architecture",anchor:[.55,1.22,-.52], semanticColorKey:'compute'},
  {id:"tensor-core",index:"05",title:"Tensor Core",abbreviation:"TC",description:"Specialized matrix multiply-add for FP8/FP4/ FP16. Dense training bottleneck when compute-bound.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/tensor-core",view:"architecture",anchor:[-.52,1.34,.52], semanticColorKey:'compute'},
  {id:"cuda-core",index:"06",title:"CUDA Core",abbreviation:"CC",description:"Scalar arithmetic inside SM. MoE routing and recsys embedding ops can be CUDA-heavy.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/cuda-core",view:"architecture",anchor:[.1,1.34,.52], semanticColorKey:'compute'},
  {id:"tma",index:"07",title:"Tensor Memory Accelerator",abbreviation:"TMA",description:"Async bulk tensor copy HBM→SMEM. Long-context inference relies on TMA to hide latency.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/tensor-memory-accelerator",view:"architecture",anchor:[.76,1.34,.52], semanticColorKey:'interconnect'},
  {id:"nvlink",index:"08",title:"NVLink / NVSwitch",abbreviation:"NVL",description:"GPU-to-GPU scale-up. GB200 Superchip 900GB/s C2C per link, 3.6TB/s per superchip, NVL72 domain 130TB/s. Rubin NVLink6 3.6TB/s per GPU, NVL144/576 vision 1PB/s class.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/nvlink",view:"system",anchor:[0,0.9,0], semanticColorKey:'interconnect'},
  {id:"grace-cpu",index:"09",title:"Grace CPU",abbreviation:"GRACE",description:"72-core Neoverse V2 host, 900GB/s C2C to Blackwell (GB200), 1.8TB/s C2C to Rubin. Large host memory pool for recommendation tables.",glossaryUrl:"https://www.nvidia.com/en-us/data-center/grace-cpu/",view:"system",anchor:[0,0.2,0], semanticColorKey:'structure'},
  {id:"board",index:"10",title:"SXM Board / Power Delivery",abbreviation:"SXM",description:"Physical PCB, VRM power stages, capacitors, mounting holes. TDP defines cooling & power-bound workloads.",glossaryUrl:"https://www.nvidia.com/en-us/data-center/",view:"exterior",anchor:[0,0.25,0], semanticColorKey:'power'},
  {id:"package",index:"11",title:"CoWoS Package / Interposer",abbreviation:"CoWoS",description:"Silicon interposer connects 2 dies + 8 HBM stacks. Interposer stitching enables reticle-limit breakthrough (B200→Blackwell→Rubin).",glossaryUrl:"https://www.nvidia.com/en-us/data-center/",view:"exterior",anchor:[0,0.45,0], semanticColorKey:'structure'},
] as const

export const workloadOverlays: Record<Exclude<WorkloadKind,null>, WorkloadImplication> = {
  'dense-training': { kind:'dense-training', illuminates:['tensor-core','gpu-ram','nvlink'], bottleneck:'Compute vs memory BW: HBM 3.35→8→16TB/s scaling improves arithmetic intensity headroom; NVLink domain size affects DP all-reduce.', description:'Dense matmuls highlight Tensor Core utilization + HBM BW pressure. Longer tokens = quadratic attention NVLink pressure.' },
  'moe-training': { kind:'moe-training', illuminates:['sm','nvlink','grace-cpu'], bottleneck:'All-to-all expert dispatch communication-bound, benefits from larger NVL72 130TB/s domain.', description:'MoE training all-to-all between experts – scale-up domain cuts latency, Grace host buffers routing metadata.' },
  'moe-inference': { kind:'moe-inference', illuminates:['sm','nvlink','gpu-ram'], bottleneck:'Sparse activation memory pooling across GPUs – HBM capacity per GPU vs NVLink sharing.', description:'MoE inference infrequent experts: HBM capacity to hold experts vs pulling across NVLink.' },
  'long-context': { kind:'long-context', illuminates:['tma','gpu-ram','nvlink'], bottleneck:'KV-cache HBM capacity + TMA async copy hiding. 1M ctx → HBM pressure 288GB ideal (Rubin).', description:'Long-context 1M tokens: KV-cache grows linear, HBM capacity dominant, TMA reduces copy stalls.' },
  'recsys': { kind:'recsys', illuminates:['gpu-ram','grace-cpu','tma'], bottleneck:'Embedding tables host memory → Grace 1.8TB/s C2C vs NVLink 900GB/s bottleneck. Host capacity matters.', description:'Recommendation models: large embedding tables in host DDR, TMA moves to SM, C2C BW critical.' },
  'memory-bound': { kind:'memory-bound', illuminates:['gpu-ram','tma'], bottleneck:'Arithmetic intensity < ridge point 295 ops/byte H100 vs 206 H200; HBM BW dominates.', description:'Low arithmetic intensity < ridge point – roofline memory-bound region, proportional to HBM BW 22TB/s Rubin win.' },
  'comm-bound': { kind:'comm-bound', illuminates:['nvlink','grace-cpu'], bottleneck:'Scale-up domain size 72 vs 144/576 changes all-reduce latency, benefits Rubin NVLink6 3.6TB/s.', description:'Communication-bound large batch or DP all-reduce: NVLink domain size & BW wins, NVL72 130TB/s vs NVL576 1PB/s vision.' },
}

export { YEAR_META, GPU_ORDER } from './meta'
