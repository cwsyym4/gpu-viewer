'use client'
import { GPUSelector } from '@/components/ui/GPUSelector'
import Link from 'next/link'
export default function GPUHub(){
  return (
    <div className="min-h-screen bg-[#0d180a] text-[#7fee64]/80 font-mono">
      <GPUSelector />
      <div className="p-6 space-y-2">
        <h1 className="text-[16px] text-[#d8f9d9]">GPU Viewer — H100 → Rubin Ultra</h1>
        <div className="flex flex-wrap gap-2">
          {['h100-sxm5','b200-sxm','blackwell-gb200','rubin-r100','rubin-ultra-nvl576'].map(id=><Link key={id} href={`/gpu/${id}`} className="px-3 py-1 border border-[#7fee64]/30 rounded text-[12px]">{id}</Link>)}
        </div>
        <div className="text-[11px] text-white/40">Ontology: GPU→Superchip(1 Grace+2 Blackwell 372/384 usable 16TB/s 3.6TB/s NVL 900GB/s C2C)→Tray(2 Grace+4 Blackwell)×18→Rack 72 GPU 36 Grace NVL72 130TB/s. Rubin 336B 224 SMs 288GB 22TB/s 3.6TB/s NVLink6 1.8TB/s C2C official July 15 2026.</div>
      </div>
    </div>
  )
}
