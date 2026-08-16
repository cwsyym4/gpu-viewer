'use client'
import { getSpecSafe, partDefs } from '@/lib/definitions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Accepts both id and specId for backwards compat – unified to specId internally
export default function GPUModuleClient({ id, moduleId, specId }: { id?:string, moduleId:string, specId?:string }){
  const effectiveId = specId ?? id ?? ''
  const spec = getSpecSafe(effectiveId)
  if(!spec){
    notFound()
  }
  const part = partDefs.find(p=>p.id===moduleId)
  return (
    <main className="min-h-screen bg-[#0d180a] text-[#7fee64] p-6 font-mono" data-testid="module-page">
      <Link href={`/gpu/${effectiveId}`} className="text-[#7fee64]/60 text-[12px]" data-testid="back-link">← Back to {spec.label} (level GPU/superchip/tray/rack)</Link>
      <div className="mt-2 text-[10px] flex gap-1 flex-wrap">
        {(spec.provenance ?? []).map((p:any,i:number)=> <span key={i} className="border px-1 rounded border-[#7fee64]/20">{p.field} {p.value}{p.unit?` ${p.unit}`:''} · {p.status} · <a href={p.sourceUrl} target="_blank" className="underline">{p.sourceUrl?.slice(8,32)}</a> · asOf {p.asOf}</span>)}
      </div>
      <h1 className="mt-4 text-[22px] text-[#d8f9d9]" data-testid="module-title">{part?.title ?? moduleId} — {part?.index ?? ''}</h1>
      <p className="mt-2 text-[13px] max-w-2xl text-[#7fee64]/80">{part?.description ?? 'Deep module drill — isolated 3D scene.'}</p>
      <div className="mt-6 border border-dashed border-[#7fee64]/30 p-4 text-[12px]" data-testid="module-stub">
        Isolated SceneViewport for {moduleId} in {spec.label}. Future: GPC→SM leaf shading shows containment {spec.dieTileColumns}×{spec.dieTileRows} tiles, HBM stacks {spec.hbm.count}×{spec.hbm.version}.
      </div>
    </main>
  )
}
