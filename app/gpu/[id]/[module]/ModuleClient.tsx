'use client'
import Link from 'next/link'
import { getSpecSafe, partDefs } from '@/lib/definitions'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'

const GPUClient = dynamic(() => import('../GPUClient'), { ssr: false, loading: () => <div className="p-6 font-mono text-[12px] text-[#7fee64]/60">Loading 3D module…</div> })

export default function ModuleClient({ specId, moduleId }: { specId:string, moduleId:string }){
  const spec = getSpecSafe(specId)
  if(!spec) notFound()
  const part = partDefs.find(p=> p.id===moduleId || p.index===moduleId || moduleId.includes(p.id))
  const effectiveId = spec!.id
  return (
    <div className="space-y-2">
      <Link href={`/gpu/${effectiveId}`} data-testid="back-link" className="text-[11px] font-mono text-[#7fee64]/60 underline">← back to {effectiveId}</Link>
      <GPUClient specId={effectiveId} />
      {part && <div className="text-[11px] text-white/60">Part {part.title} view isolate {part.view}</div>}
      <div className="flex flex-wrap gap-1">{spec!.provenance?.map((p,i)=><a key={i} href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-[9px] text-white/40 underline">{p.field} {p.status} {p.asOf}</a>)}</div>
    </div>
  )
}
