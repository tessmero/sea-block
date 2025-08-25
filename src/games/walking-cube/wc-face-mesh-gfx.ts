/**
 * @file wc-face-mesh-gfx.ts
 *
 * Render cube torso with added meshes on one face.
 */

import type { BufferGeometry } from 'three'
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three'
import { buildBoxEdges } from './wc-edge-gfx'
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js'

export class FaceMeshGfx {
  static getTorsoWithEyeMeshes(cube: Mesh): Group {
    const group = new Group()

    group.add(cube)

    const blackMat = new MeshBasicMaterial({ color: 'black' })

    const edgeGeom = buildBoxEdges()
    const edgeMesh = new Mesh(edgeGeom, blackMat)
    group.add(edgeMesh)

    const faceGeom = buildEyesAndMouthGeom()
    const faceMesh = new Mesh(faceGeom, blackMat)
    group.add(faceMesh)

    return group
  }
}

function buildEyesAndMouthGeom(): BufferGeometry {
  const toMerge: Array<BufferGeometry> = []

  const eyeY = 0.2
  const eyeDist = 0.3

  const mouthY = -0.1
  const mouthWidth = 0.3

  // add eyes
  toMerge.push(
    new BoxGeometry(0.15, 0.3, 0.1).translate(-eyeDist / 2, eyeY, 0.5),
  )
  toMerge.push(
    new BoxGeometry(0.15, 0.3, 0.1).translate(eyeDist / 2, eyeY, 0.5),
  )

  const mouthGeom = new BoxGeometry(mouthWidth, 0.1, 0.1).translate(0, mouthY, 0.5)
  const pos = mouthGeom.attributes.position
  let maxY = -Infinity
  for (let i = 0; i < pos.count; ++i) {
    const y = pos.getY(i)
    if (y > maxY) maxY = y
  }
  for (let i = 0; i < pos.count; ++i) {
    if (Math.abs(pos.getY(i) - maxY) < 1e-6) {
      const x = pos.getX(i)
      const delta = 0.07 * Math.sign(x)
      pos.setX(i, x + delta)
    }
  }
  pos.needsUpdate = true
  toMerge.push(
    mouthGeom,
  )

  const merged = BufferGeometryUtils.mergeGeometries(toMerge, false)
  merged.deleteAttribute('normal')
  merged.deleteAttribute('uv')
  return merged
}
