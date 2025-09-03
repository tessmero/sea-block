/**
 * @file raft-thruster-mesh.ts
 *
 * Outlined turbine mesh to represent thruster on side of raft.
 */

import { dilateGeometry } from 'games/chess/gfx/chess-outline-gfx'
import { getMesh } from 'gfx/3d/mesh-asset-loader'
import { DoubleSide, InstancedMesh, MeshBasicMaterial, Float32BufferAttribute } from 'three'
import type { Mesh } from 'three'

export function buildRaftThrusterMesh(maxInstances: number): InstancedMesh {
  // const geo = new ConeGeometry(1, 3, 6, 1, true)
  // const pos = geo.attributes.position
  // const off = 7
  // for (let i = 0; i < 7; ++i) {
  //   const y = (i % 2 === 0) ? 0.2 : -0.2
  //   pos.setY(i + off, pos.getY(i + off) + y)
  // }
  // geo.computeVertexNormals()
  // geo.scale(0.5, 0.5, 0.5)

  const geo = (getMesh('raft/thruster.obj').children[0] as Mesh).geometry
  geo.rotateY(Math.PI / 2)
  geo.rotateZ(-Math.PI / 2)
  const s = 0.5
  geo.scale(s, s, s)

  // Create dilated geometry for outline
  const dilated = dilateGeometry(geo.clone(), 0.05)

  // Ensure geo is indexed
  if (!geo.index) {
    // If not indexed, create a default index
    const vertCount = geo.attributes.position.count
    const defaultIdx: Array<number> = []
    for (let i = 0; i < vertCount; ++i) defaultIdx.push(i)
    geo.setIndex(defaultIdx)
  }

  // Merge geo and dilated into a single BufferGeometry with two material groups (manual merge)
  const merged = geo.clone()
  // Offset for dilated attributes
  const ix = merged.attributes.position.count
  // Merge positions
  const posArray = Array.from((merged.attributes.position.array as Float32Array))
  const dilatedPos = dilated.attributes.position.array as Float32Array
  for (let i = 0; i < dilatedPos.length; ++i) posArray.push(dilatedPos[i])
  // Merge normals
  const normArray = Array.from((merged.attributes.normal.array as Float32Array))
  if (dilated.attributes.normal) {
    const dilatedNorm = dilated.attributes.normal.array as Float32Array
    for (let i = 0; i < dilatedNorm.length; ++i) normArray.push(dilatedNorm[i])
  }
  else {
    for (let i = 0; i < dilatedPos.length; i += 3) normArray.push(0, 0, 0)
  }
  // Ensure merged geometry is indexed
  if (!merged.index) {
    // If not indexed, create a default index
    const vertCount = merged.attributes.position.count
    const defaultIdx: Array<number> = []
    for (let i = 0; i < vertCount; ++i) defaultIdx.push(i)
    merged.setIndex(defaultIdx)
  }
  // Merge indices
  const idxArray = merged.index ? Array.from((merged.index.array as Uint16Array)) : []
  const dilatedIx = ix
  if (dilated.index) {
    const dilatedIdx = dilated.index.array as Uint16Array
    for (let i = 0; i < dilatedIdx.length; ++i) idxArray.push(dilatedIdx[i] + dilatedIx)
  }
  else {
    for (let i = 0; i < dilatedPos.length / 3; ++i) idxArray.push(dilatedIx + i)
  }
  // Set merged attributes
  merged.setAttribute('position', new Float32BufferAttribute(posArray, 3))
  merged.setAttribute('normal', new Float32BufferAttribute(normArray, 3))
  merged.setIndex(idxArray)
  // Set groups for materials
  merged.clearGroups()
  // Add group for original geo (white)
  merged.addGroup(0, geo.index!.count, 0)
  // Add group for dilated geo (black, BackSide)
  const dilatedStart = geo.index!.count
  let dilatedCount = 0
  if (dilated.index) {
    dilatedCount = (dilated.index.array as Uint16Array).length
  }
  else {
    dilatedCount = dilatedPos.length / 3
  }
  merged.addGroup(dilatedStart, dilatedCount, 1)

  const colorMat = new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide })
  const outlineMat = new MeshBasicMaterial({ color: 0x000000, side: 1 /* BackSide */ })

  return new InstancedMesh(
    merged,
    [colorMat, outlineMat],
    // [outlineMat, colorMat],
    maxInstances,
  )
}
