'use client'
import { getSpec, partDefs } from '@/lib/definitions'
import Link from 'next/link'

export default function GPUModuleClient({ id, moduleId }:{ id:string, moduleId:string }){
  const spec = getSpec(id)
  const part = partDefs.find(p=>p.id===moduleId)
  return (
    <main className="min-h-screen bg-[#0d180a] text-[#7fee64] p-6 font-mono">
      <Link href={`/gpu/${id}`} className="text-[#7fee64]/60 text-[12px]">← Back to {spec.label}</Link>
      <h1 className="mt-4 text-[28px] text-[#d8f9d9]">{part?.title ?? moduleId}</h1>
      <p className="mt-2 text-[13px] max-w-2xl text-[#7fee64]/80">{part?.description ?? 'Deep module drill — will load focused 3D scene isolating this component.'}</p>
      <div className="mt-6 border border-dashed border-[#7fee64]/30 p-4 text-[12px]">Stub: focused SceneViewport with isolate for {moduleId}. Future: rack, NVLink, exploded memory.</div>
    </main>
  )
}
