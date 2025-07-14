/**
 * @file colored-instanced-mesh.ts
 *
 * InstancedMesh with per-instance colors.
 */

import { Color, InstancedBufferAttribute, InstancedMesh } from 'three'

export class ColoredMesh extends InstancedMesh {
  public readonly colors: Float32Array = initMeshColors(this)

  setInstanceColor(index: number, color: Color) {
    this.colors[index * 3 + 0] = color.r
    this.colors[index * 3 + 1] = color.g
    this.colors[index * 3 + 2] = color.b
    this.instanceColor!.needsUpdate = true
  }
}

function initMeshColors(threeMesh: InstancedMesh): Float32Array {
  const n = threeMesh.count
  const colors = new Float32Array(3 * n)
  threeMesh.instanceColor = new InstancedBufferAttribute(colors, 3)

  const defaultColor = new Color(0xffffff)
  for (let i = 0; i < n; i++) {
    colors[i * 3 + 0] = defaultColor.r
    colors[i * 3 + 1] = defaultColor.g
    colors[i * 3 + 2] = defaultColor.b
  }
  threeMesh.instanceColor.needsUpdate = true

  return colors
}
