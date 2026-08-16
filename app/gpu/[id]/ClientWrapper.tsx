'use client'
import dynamic from 'next/dynamic'
const GPUClient = dynamic(() => import('./GPUClient'), { ssr: false, loading: () => <div className="p-6 font-mono text-[12px] text-[#7fee64]/60">Loading 3D viewer…</div> })
export default function ClientWrapper({ specId }: { specId:string }){ return <GPUClient specId={specId} /> }
