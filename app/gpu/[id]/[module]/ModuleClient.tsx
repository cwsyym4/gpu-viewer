'use client'
import { getSpecSafe, partDefs } from '@/lib/definitions'
import GPUClient from '@/app/gpu/[id]/GPUClient'
import { notFound } from 'next/navigation'
export default function ModuleClient({ specId, moduleId }: { specId:string, moduleId:string }){
  const spec = getSpecSafe(specId)
  if(!spec) notFound()
  const part = partDefs.find(p=> p.id===moduleId || p.index===moduleId || moduleId.includes(p.id))
  const effectiveId = spec!.id
  return (
    <div className="space-y-2">
      <a href={`/gpu/${effectiveId}`} data-testid="back-link" className="text-[11px] font-mono text-[#7fee64]/60 underline">← back to {effectiveId}</a>
      <GPUClient specId={effectiveId} />
      {part && <div className="text-[11px] text-white/60">Part {part.title} view isolate {part.view}</div>}
      <div className="flex flex-wrap gap-1">{spec!.provenance?.map((p,i)=><a key={i} href={p.sourceUrl} className="text-[9px] text-white/40 underline">{p.field} {p.status} {p.asOf}</a>)}</div>
    </div>
  )
}
