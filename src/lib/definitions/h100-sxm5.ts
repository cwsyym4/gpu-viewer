import type { GPUSpec, ProvenanceEntry } from './types'
const mkPowerLeft = (): [number,number][] => { const a=[-3.88,-3.52,-3.16], b=[-1.38,-.92,-.46,0,.46,.92,1.38]; return b.flatMap(z=>a.map(x=>[x,z] as [number,number])) }
const mkPowerRight = (): [number,number][] => { const a=[2.7,3.08,3.46,3.84], b=[-1.1,-.64,-.18,.28,.74,1.2]; return b.flatMap(z=>a.map(x=>[x,z] as [number,number])) }
const prov: ProvenanceEntry[] = [
  { level:'gpu', field:'hbm.totalGB', value:80, unit:'GB', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/h100/', asOf:'2023-03-21', notes:'5x HBM3 16GB' },
  { level:'gpu', field:'memoryBW', value:3.35, unit:'TB/s', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/h100/', asOf:'2023-03-21' },
  { level:'gpu', field:'transistorsB', value:80, unit:'B', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/h100/', asOf:'2023-03-21' },
  { level:'gpu', field:'tdpW', value:700, unit:'W', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/h100/', asOf:'2023-03-21', notes:'SXM5 700W' },
  { level:'gpu', field:'smCount', value:132, unit:'SMs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/hopper/', asOf:'2023-03-21', notes:'Full GH100=144 SMs, H100 SXM5 enabled=132 (12 disabled for yield)' },
  { level:'gpu', field:'gpcCount', value:8, unit:'GPCs', status:'official', sourceUrl:'https://www.nvidia.com/en-us/data-center/hopper/', asOf:'2023-03-21', notes:'GH100/H100 architecture 8 GPCs, 18 SM per GPC max => 144 total; 132 active implies avg 16.5 enabled' },
  { level:'gpu', field:'boardSize', value:'8.6x4.0 render units', unit:'scene-units', status:'illustrative', notes:'Render dims ≠ real mm; real SXM5 ~166×86mm; illustrative for visualization' },
]
export const h100Spec: GPUSpec = {
  id:'h100-sxm5', label:'H100 SXM5', module:'H100 SXM5 MODULE',
  boardSize:[8.6,0.22,4], packageSize:[2.78,0.34,2.72], packageOffset:[0,0.35,0], dieSize:[1.42,0.1,1.18],
  boardMm:[166,86], packageMm:[62.5,55], dieMm:[26,19],
  dieTileColumns:12, dieTileRows:9,
  gpcCount:8, smPerGpc:18, smCountsPerGpc:[18,18,18,18,16,16,16,12], // sums to 132 official SXM5
  packageSites:[{position:[-.84,-.72],kind:'memory'},{position:[0,-.72],kind:'memory'},{position:[.84,-.72],kind:'memory'},{position:[-.84,.72],kind:'memory'},{position:[0,.72],kind:'memory'},{position:[.84,.72],kind:'structural'}],
  mountingHoles:[[-2.72,-1.58],[-2.18,-1.58],[2.2,-1.58],[2.74,-1.58],[-2.72,1.58],[-2.18,1.58],[2.2,1.58],[2.74,1.58]],
  leftPowerStages: mkPowerLeft(), rightPowerStages: mkPowerRight(),
  topClampPositions:[-1.65,-.56,.56,1.65], sideContacts:[-1.54,-1.26,-.98,-.7,-.42,-.14,.14,.42,.7,.98,1.26,1.54],
  hbm:{count:5, version:'hbm3', gbPerStack:16, totalGB:80, rawGB:80, usableGB:80},
  transistorsB:80, smCount:132, tdpW:700, memoryBW_TBs:3.35, nvlinkBW_TBs:0.9,
  provenance:prov,
}
export const h100Tiles=12*9
