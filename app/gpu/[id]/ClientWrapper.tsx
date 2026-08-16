'use client'
import dynamic from 'next/dynamic'
const GPUClient = dynamic(() => import('./GPUClient'), { ssr: false })
export default function ClientWrapper({ specId }: { specId: string }){
  return <GPUClient specId={specId} />
}
