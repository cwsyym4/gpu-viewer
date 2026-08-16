import { getSpecSafe, specs } from '@/lib/definitions'
import ModuleClient from './ModuleClient'
import { notFound } from 'next/navigation'
export const dynamic = 'force-static'
export function generateStaticParams(){
  const mods = ['gpc','sm','tensor-core','gpu-ram','hbm','hbm-stack','mounting-hole','board']
  return Object.keys(specs).flatMap(id=> mods.map(mod=>({id, module:mod})))
}
export default async function ModPage({ params }:{ params: Promise<{id:string, module:string}> }){
  const { id, module } = await params
  const spec = getSpecSafe(id)
  if(!spec) notFound()
  return <ModuleClient specId={spec!.id} moduleId={module} />
}
