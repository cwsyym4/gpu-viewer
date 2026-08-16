import { getSpec, specs } from '@/lib/definitions'
import ClientWrapper from './ClientWrapper'

export function generateStaticParams(){
  return Object.keys(specs).map(id=>({id}))
}

export default async function GPUPage({ params }:{ params: Promise<{id:string}> }){
  const { id } = await params
  const spec = getSpec(id)
  return <ClientWrapper specId={spec.id} />
}

export async function generateMetadata({params}:{params: Promise<{id:string}>}){
  const { id } = await params
  const spec = getSpec(id)
  return { title: `${spec.label} — GPU Viewer` }
}
