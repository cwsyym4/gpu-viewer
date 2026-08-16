'use client'
import GPUClient from './GPUClient'
export default function ClientWrapper({ specId }: { specId:string }){ return <GPUClient specId={specId} /> }
