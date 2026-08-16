export const YEAR_META: Record<string,{year:number, process:string, transistors:string, tdp:string, bw:string, fp8:string, nvlink:string}> = {
  'h100-sxm5': { year:2023, process:'4N TSMC', transistors:'80B', tdp:'700W', bw:'3.35TB/s', fp8:'989 TFLOPS (est)', nvlink:'900GB/s' },
  'b200-sxm': { year:2024, process:'4NP TSMC', transistors:'~208B', tdp:'~1000W', bw:'~8TB/s', fp8:'~1.9 PFLOPS', nvlink:'1.8TB/s' },
  'blackwell-gb200': { year:2025, process:'4NP 2× reticle', transistors:'208B×2 + Grace', tdp:'~1200W (mod) / 2700W tray', bw:'8TB/s per GPU, 13.5TB per NVL72', fp8:'~2.5 PFLOPS per GPU', nvlink:'NVLink 5 1.8TB/s + C2C 900GB/s, 130TB/s NVL72' },
  'rubin-r100': { year:2026, process:'3nm + CoWoS-L', transistors:'~300B×2 (envelope)', tdp:'~1400W', bw:'~12TB/s HBM4', fp8:'~4 PFLOPS (env)', nvlink:'NVLink 6 1.8TB/s x2, C2C 1.8TB/s' },
  'rubin-ultra-nvl576': { year:2027, process:'3nm + 3D', transistors:'~400B×2 (env)', tdp:'~1800W', bw:'~16TB/s HBM4e', fp8:'~6 PFLOPS (env)', nvlink:'NVL144/576 1PB/s class (vision)' },
}

export const GPU_ORDER = ['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576'] as const
