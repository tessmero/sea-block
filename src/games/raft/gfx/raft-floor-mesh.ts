/**
 * @file raft-floor-mesh.ts
 *
 * Outlined cube mesh to represent raft floor tile.
 */

import { buildBoxEdges } from 'games/walking-cube/wc-edge-gfx'
import type { BufferGeometry } from 'three'
import { Box3, BoxGeometry, Float32BufferAttribute, InstancedMesh,
  MeshBasicMaterial, MeshLambertMaterial, Vector3 } from 'three'

export function buildRaftFloorMesh(maxInstances: number): InstancedMesh {
  // Only inner box and frame
  const innerSize = 1
  const innerBox = new BoxGeometry(innerSize, innerSize, innerSize)

  const frameSize = 1
  const frame: BufferGeometry = buildBoxEdges({
    box: new Box3(
      new Vector3(-frameSize / 2, -frameSize / 2, -frameSize / 2),
      new Vector3(frameSize / 2, frameSize / 2, frameSize / 2),
    ),
    thickness: 0.02,
  })

  const colorMat = new MeshLambertMaterial({ color: '#b47a3d' })
  const frameMat = new MeshBasicMaterial({ color: 0x000000 })

  // Merge geometry manually (BufferGeometryUtils is not imported, so do it inline)
  const merged = innerBox.clone()
  // Offset frame attributes
  const ix = merged.attributes.position.count
  // Merge frame positions
  const posArray = Array.from((merged.attributes.position.array as Float32Array))
  const framePos = frame.attributes.position.array as Float32Array
  for (let i = 0; i < framePos.length; ++i) posArray.push(framePos[i])
  // Merge normals
  const normArray = Array.from((merged.attributes.normal.array as Float32Array))
  // Merge frame normals (if present, else fill with zeros)
  if (frame.attributes.normal) {
    const frameNorm = frame.attributes.normal.array as Float32Array
    for (let i = 0; i < frameNorm.length; ++i) normArray.push(frameNorm[i])
  }
  else {
    // If frame has no normals, fill with zeros
    for (let i = 0; i < framePos.length; i += 3) {
      normArray.push(0, 0, 0)
    }
  }
  // Merge indices
  const idxArray = Array.from((merged.index!.array as Uint16Array))
  // Merge frame indices
  const frameIx = ix
  if (frame.index) {
    const frameIdx = frame.index.array as Uint16Array
    for (let i = 0; i < frameIdx.length; ++i) idxArray.push(frameIdx[i] + frameIx)
  }
  else {
    // If frame is non-indexed, add sequential indices
    for (let i = 0; i < framePos.length / 3; ++i) idxArray.push(frameIx + i)
  }
  // Set merged attributes
  merged.setAttribute('position', new Float32BufferAttribute(posArray, 3))
  merged.setAttribute('normal', new Float32BufferAttribute(normArray, 3))
  merged.setIndex(idxArray)
  // Set groups for materials
  merged.clearGroups()
  // Add inner box group
  merged.addGroup(0, innerBox.index!.count, 0)
  // Add group for frame geometry (black)
  const frameStart = innerBox.index!.count
  let frameCount = 0
  if (frame.index) {
    frameCount = (frame.index.array as Uint16Array).length
  }
  else {
    frameCount = framePos.length / 3
  }
  merged.addGroup(frameStart, frameCount, 1)
  return new InstancedMesh(
    merged,
    [colorMat, frameMat],
    maxInstances,
  )
}
