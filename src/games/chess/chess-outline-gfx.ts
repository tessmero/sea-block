/**
 * @file chess-outline-gfx.ts
 *
 * Used to build outlines for meshes by overlapping scaled/dilated copies.
 */

import { BackSide, BufferAttribute, Mesh, MeshBasicMaterial, type Group } from 'three'

const outlineMat = new MeshBasicMaterial({
  color: 0x000000,
  side: BackSide,
  depthTest: false,
})

export function getOutlinedMesh(group: Group, params?: { scale: number, dilate: number }) {
  const { scale = 1.05, dilate = -0.1 } = params || {}
  group.traverse((child) => {
    if (child instanceof Mesh) {
      child.geometry = child.geometry.clone()
      child.renderOrder = 99 // on top

      // add scaled black copy as outline
      if (scale < 1) { throw new Error('scale should not be less than one') }
      if (scale > 1) {
        const scaledOutlineMesh = child.clone();// new Mesh(child.geometry, outlineMat)
        (scaledOutlineMesh as any).isOutline = true
        scaledOutlineMesh.material = outlineMat
        scaledOutlineMesh.scale.multiplyScalar(scale)
        group.add(scaledOutlineMesh)
        scaledOutlineMesh.renderOrder = 98 // just behind
      }

      // add dilated black copy as outline
      const outlineMesh = child.clone();// new Mesh(child.geometry, outlineMat)
      (outlineMesh as any).isOutline = true
      outlineMesh.material = outlineMat
      // outlineMesh.scale.multiplyScalar(1.1)
      if (dilate > 0) {
        outlineMesh.geometry = dilateGeometry(outlineMesh.geometry.clone(), dilate)
      }
      else if (dilate < 0) {
        child.geometry = dilateGeometry(child.geometry.clone(), dilate)
      }
      group.add(outlineMesh)
      outlineMesh.renderOrder = 98 // just behind
    }
  })
  return group
}

function dilateGeometry(geometry, dilationAmount = 0.1) {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry.clone()

  // Merge vertices to weld shared vertices
  // geo = BufferGeometryUtils.mergeVertices(geo, 1)

  // Compute vertex normals if missing
  if (!geo.attributes.normal) {
    geo.computeVertexNormals()
  }

  const position = geo.attributes.position
  const normal = geo.attributes.normal
  const newPos = position.array.slice()

  for (let i = 0; i < position.count; i++) {
    newPos[i * 3 + 0] += normal.getX(i) * dilationAmount
    newPos[i * 3 + 1] += normal.getY(i) * dilationAmount
    newPos[i * 3 + 2] += normal.getZ(i) * dilationAmount
  }

  geo.setAttribute('position', new BufferAttribute(new Float32Array(newPos), 3))
  geo.attributes.position.needsUpdate = true
  geo.computeVertexNormals() // Recompute after dilation

  return geo
}
