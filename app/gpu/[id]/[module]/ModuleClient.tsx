'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { getSpecSafe, partDefs } from '@/lib/definitions'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useViewerStore } from '@/store/useViewerStore'

const GPUClientIsolated = dynamic(() => import('../GPUClient'), { ssr: false, loading: () => <div className="p-6 font-mono text-[12px] text-[#7fee64]/60">Loading isolated module…</div> })

export default function ModuleClient({ specId, moduleId }: { specId:string, moduleId:string }){
  const spec = getSpecSafe(specId)
  if(!spec) notFound()
  const part = partDefs.find(p=> p.id===moduleId || p.index===moduleId || moduleId.includes(p.id))
  const effectiveId = spec!.id
  const setSelected = useViewerStore(s=> s.setSelected)
  const setView = useViewerStore(s=> s.setView)

  useEffect(()=>{
    if(part){
      setSelected(part.id as any)
      setView(part.view as any)
      // ESC handler not here – GPUClient handles
    }else{
      setSelected(moduleId as any)
    }
  },[part, moduleId])

  return (
    <div className="min-h-screen bg-[#0d180a] content-scroll">
      <div className="content-scroll-inner p-2 space-y-2">
        <div className="flex items-center gap-2">
          <Link href={`/gpu/${effectiveId}`} data-testid="back-link" className="text-[12px] font-mono text-[#7fee64]/70 underline hover:text-[#7fee64]">← back to {effectiveId}</Link>
          {part && <span className="text-[12px] font-mono text-white/60">{part.view} view – {part.title}</span>}
        </div>
        {part ? (
          <div className="border border-[#7fee64]/30 rounded overflow-hidden bg-[#080b09]">
            <div className="px-2 py-1 text-[12px] font-mono text-[#7fee64] bg-[#0d180a] border-b border-[#7fee64]/15">{part.index} – {part.title} – {part.description} – <a href={part.glossaryUrl} target="_blank" className="underline" rel="noreferrer">glossary↗</a></div>
            <div className="p-1 text-[11px] font-mono text-white/60">Isolated: dimming others (0.15) illuminating active 1.0 emissive. Use ESC to clear. Query ?view={part.view}&module={part.id} ensures deep link.</div>
            <GPUClientIsolated specId={effectiveId} />
          </div>
        ) : (
          <>
            <div className="text-[12px] font-mono text-amber-200 border border-amber-500/20 p-2 rounded bg-black/50">Module {moduleId} not found – showing full viewer with selection attempt {moduleId}. Valid: {partDefs.map(p=>p.id).join(', ')}</div>
            <GPUClientIsolated specId={effectiveId} />
          </>
        )}
        <div className="flex flex-wrap gap-1 pt-2">
          {spec!.provenance?.map((p:any,i:number)=>(
            <a key={i} href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-white/50 hover:text-[#7fee64] underline px-1 py-0.5 border border-white/10 rounded pointer-events-auto">provenance {p.field} {p.value}{p.unit?` ${p.unit}`:''} {p.status} {p.asOf} src↗</a>
          ))}
        </div>
      </div>
    </div>
  )
}
