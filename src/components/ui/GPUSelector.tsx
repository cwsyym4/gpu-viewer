'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const items = [
  { id:'h100-sxm5', label:'H100 SXM5' },
  { id:'b200-sxm', label:'B200 SXM' },
  { id:'blackwell-gb200', label:'GB200 NVL72' },
  { id:'rubin-r100', label:'Rubin R100' },
  { id:'rubin-ultra-nvl576', label:'Rubin Ultra' },
  { id:'compare', label:'Compare', href:'/gpu/compare' },
  { id:'evolution', label:'Evolution', href:'/gpu/evolution' },
]
export function GPUSelector(){
  const pathname = usePathname() || ''
  return (
    <div className="flex flex-wrap gap-1 p-1 border-b border-[#7fee64]/10 bg-[#090f0a] text-[11px] font-mono" data-testid="gpu-selector">
      {items.map(it=>{
        const href = (it as any).href ?? `/gpu/${it.id}`
        const active = pathname.includes(it.id)
        return (
          <Link key={it.id} href={href} data-testid={`pill-${it.id}`} data-active={active}
            className={`px-2 py-0.5 rounded border transition ${active ? 'bg-[#7fee64] text-black border-[#7fee64]' : 'border-[#7fee64]/20 text-[#7fee64]/70 hover:text-white hover:border-[#7fee64]/40'}`}>
            {it.label}
          </Link>
        )
      })}
    </div>
  )
}
