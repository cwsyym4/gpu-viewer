'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const primary = [
  { id:'h100-sxm5', label:'H100 SXM5' },
  { id:'b200-sxm', label:'B200 SXM' },
  { id:'blackwell-gb200', label:'GB200 NVL72' },
  { id:'rubin-r100', label:'Rubin R100' },
]
const concepts = [
  { id:'rubin-ultra-nvl576', label:'Rubin Ultra NVL576', badge:'speculative' },
]
const tools = [
  { id:'compare', label:'Compare', href:'/gpu/compare' },
  { id:'evolution', label:'Evolution', href:'/gpu/evolution' },
]
export function GPUSelector(){
  const pathname = usePathname() || ''
  return (
    <div className="flex flex-col gap-1 p-1 border-b border-[#7fee64]/10 bg-[#090f0a] text-[11px] font-mono" data-testid="gpu-selector">
      {/* Production */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] text-white/40 uppercase tracking-widest mr-1">Production</span>
        {primary.map(it=>{
          const href = `/gpu/${it.id}`
          const active = pathname.includes(it.id)
          return (
            <Link key={it.id} href={href} data-testid={`pill-${it.id}`} data-active={active}
              className={`px-2 py-0.5 rounded border transition ${active ? 'bg-[#7fee64] text-black border-[#7fee64]' : 'border-[#7fee64]/20 text-[#7fee64]/70 hover:text-white hover:border-[#7fee64]/40'}`}>
              {it.label}
            </Link>
          )
        })}
      </div>
      {/* Concepts – separate section */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] text-amber-300/60 uppercase tracking-widest mr-1">Concepts</span>
        {concepts.map(it=>{
          const href = `/gpu/${it.id}`
          const active = pathname.includes(it.id)
          return (
            <Link key={it.id} href={href} data-testid={`pill-${it.id}`} data-speculative="true" data-active={active}
              className={`px-2 py-0.5 rounded border border-dashed transition ${active ? 'bg-amber-200 text-black border-amber-200' : 'border-amber-300/30 text-amber-200/70 hover:text-amber-100 hover:border-amber-200/50'}`}>
              {it.label} <span className="text-[9px] ml-1 opacity-70">[{it.badge}]</span>
            </Link>
          )
        })}
        <span className="text-[10px] text-white/30 ml-2">Compare/Evolution:</span>
        {tools.map(it=>{
          const active = pathname===it.href
          return (
            <Link key={it.id} href={it.href!} data-testid={`pill-${it.id}`} data-active={active}
              className={`px-2 py-0.5 rounded border transition ${active ? 'bg-[#0ec7ff] text-black border-[#0ec7ff]' : 'border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'}`}>
              {it.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
