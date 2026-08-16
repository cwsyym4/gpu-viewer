import { h100Spec } from './h100-sxm5'
import { b200Spec } from './b200-sxm'
import { blackwellSpec } from './blackwell-gb200'
import type { GPUSpec } from './types'

export const specs: Record<string,GPUSpec> = {
  'h100-sxm5': h100Spec,
  'b200-sxm': b200Spec,
  'blackwell-gb200': blackwellSpec,
}

export function getSpec(id:string): GPUSpec {
  return specs[id] ?? h100Spec
}

export const partDefs = [
  {id:"cuda-architecture",index:"01",title:"CUDA architecture (conceptual)",abbreviation:"CUDA",description:"A conceptual map of the repeated processing units inside the physical GH100 package.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/cuda-device-architecture",view:"exterior",anchor:[0,1.32,0]},
  {id:"gpu-ram",index:"02",title:"GPU RAM",abbreviation:"HBM3",description:"High-bandwidth memory placed beside the GPU die to keep its processors fed with data.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/gpu-ram",view:"exterior",anchor:[-.84,1.24,-.72]},
  {id:"gpc",index:"03",title:"GPU Processing Cluster",abbreviation:"GPC",description:"A top-level cluster that groups texture and streaming multiprocessor resources.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/graphics-processing-cluster",view:"architecture",anchor:[-.95,1.12,-.55]},
  {id:"sm",index:"04",title:"Streaming Multiprocessor",abbreviation:"SM",description:"The repeating processor that schedules and executes groups of GPU threads.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/streaming-multiprocessor",view:"architecture",anchor:[.55,1.22,-.52]},
  {id:"tensor-core",index:"05",title:"Tensor Core",description:"Specialized compute hardware for the matrix operations used heavily in machine learning.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/tensor-core",view:"architecture",anchor:[-.52,1.34,.52]},
  {id:"cuda-core",index:"06",title:"CUDA Core",description:"A scalar arithmetic unit inside an SM used for general GPU computation.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/cuda-core",view:"architecture",anchor:[.1,1.34,.52]},
  {id:"tma",index:"07",title:"Tensor Memory Accelerator",abbreviation:"TMA",description:"Hardware that moves multidimensional tensor data between memory spaces.",glossaryUrl:"https://modal.com/gpu-glossary/device-hardware/tensor-memory-accelerator",view:"architecture",anchor:[.76,1.34,.52]}
] as const
