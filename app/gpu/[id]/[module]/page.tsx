import { getSpecSafe } from '@/lib/definitions'
import ModuleClient from './ModuleClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
export async function generateStaticParams(){
  // No pre-render all modules – keep empty but allow on-demand
  return []
}
export default async function ModPage({ params }:{ params: Promise<{id:string, module:string}>}){
  const { id, module } = await params
  const spec = getSpecSafe(id)
  if(!spec){
    notFound()
  }
  // unify prop name specId
  return <ModuleClient specId={spec.id} moduleId={module} id={spec.id} />
}
