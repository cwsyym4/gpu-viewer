import { getSpecSafe, specs } from '@/lib/definitions'
import ClientWrapper from './ClientWrapper'
import { notFound } from 'next/navigation'
export const dynamic = 'force-static'
export function generateStaticParams(){ return Object.keys(specs).map(id=>({id})) }
export default async function GPUPage({ params }:{ params: Promise<{id:string}> }){
  const { id } = await params
  const spec = getSpecSafe(id)
  if(!spec){ notFound() }
  return <ClientWrapper specId={spec!.id} />
}
export async function generateMetadata({params}:{params: Promise<{id:string}>}){
  const { id } = await params
  const spec = getSpecSafe(id)
  if(!spec) return { title: `GPU not found — GPU Viewer` }
  return { title: `${spec.label} — GPU Viewer` }
}
