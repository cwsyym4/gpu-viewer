import GPUModuleClient from './ModuleClient'

export default async function ModulePage({ params }:{ params: Promise<{id:string, module:string}> }){
  const { id, module } = await params
  return <GPUModuleClient id={id} moduleId={module} />
}
