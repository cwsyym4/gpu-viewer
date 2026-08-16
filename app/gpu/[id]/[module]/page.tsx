import { getSpec } from '@/lib/definitions'
import ModuleClient from './ModuleClient'

export const dynamic = 'force-static'
export async function generateStaticParams(){
  // stub: no module precompile heavy, return empty to skip
  return []
}
export default async function ModPage({ params }:{ params: Promise<{id:string, module:string}>}){
  const { id, module } = await params
  const spec = getSpec(id)
  return <ModuleClient specId={spec.id} moduleId={module} />
}
