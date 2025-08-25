/**
 * @file wc-face-mesh-gfx.ts
 *
 * Render cube torso with added meshes on one face.
 */

import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three'

export class FaceMeshGfx {
  static getTorsoWithEyeMeshes(cube: Mesh): Group {
    const group = new Group()

    const rodThickness = 0.1
    const rodLength = 1 + rodThickness
    const rodColor = 'black'
    function addRod(p1: [number, number, number], p2: [number, number, number]) {
      const dx = p2[0] - p1[0]
      const dy = p2[1] - p1[1]
      const dz = p2[2] - p1[2]
      const len = rodLength// Math.sqrt(dx * dx + dy * dy + dz * dz)
      const geom = new BoxGeometry(
        Math.abs(dx) > 0 ? len : rodThickness,
        Math.abs(dy) > 0 ? len : rodThickness,
        Math.abs(dz) > 0 ? len : rodThickness,
      )
      // Center at midpoint
      const mx = (p1[0] + p2[0]) / 2
      const my = (p1[1] + p2[1]) / 2
      const mz = (p1[2] + p2[2]) / 2
      geom.translate(mx, my, mz)
      group.add(new Mesh(geom, new MeshBasicMaterial({ color: rodColor })))
    }
    // Vertices of a unit cube centered at (0,0,0)
    const v: Array<[number, number, number]> = [
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [0.5, 0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
      [-0.5, 0.5, 0.5],
    ]
    // 12 edges as pairs of vertex indices
    const edges: Array<[number, number]> = [
      [0, 1], [1, 2], [2, 3], [3, 0], // bottom
      [4, 5], [5, 6], [6, 7], [7, 4], // top
      [0, 4], [1, 5], [2, 6], [3, 7], // sides
    ]
    for (const [i, j] of edges) {
      addRod(v[i], v[j])
    }

    const eyeY = 0.2
    const eyeDist = 0.3

    const mouthY = -0.1
    const mouthWidth = 0.3

    group.add(cube)

    // add eyes
    group.add(new Mesh(
      new BoxGeometry(0.15, 0.3, 0.1).translate(-eyeDist / 2, eyeY, 0.5),
      new MeshBasicMaterial({ color: 'black' }),
    ))
    group.add(new Mesh(
      new BoxGeometry(0.15, 0.3, 0.1).translate(eyeDist / 2, eyeY, 0.5),
      new MeshBasicMaterial({ color: 'black' }),
    ))

    // add mouth (trapezoidal prism)
    const mouthGeom = new BoxGeometry(mouthWidth, 0.1, 0.1).translate(0, mouthY, 0.5)
    // Find the four vertices with the lowest y-value (bottom face)
    // BoxGeometry vertices are in .attributes.position (BufferAttribute)
    const pos = mouthGeom.attributes.position
    // Find min y
    let maxY = -Infinity
    for (let i = 0; i < pos.count; ++i) {
      const y = pos.getY(i)
      if (y > maxY) maxY = y
    }
    // Move the four lowest-y vertices outward in x to make a trapezoid
    for (let i = 0; i < pos.count; ++i) {
      if (Math.abs(pos.getY(i) - maxY) < 1e-6) {
        // exaggerate the trapezoid: move x further out
        const x = pos.getX(i)
        // Move x outward by 0.07 (arbitrary, tweak as needed)
        const delta = 0.07 * Math.sign(x)
        pos.setX(i, x + delta)
        // Optionally, move z slightly for a more 3D effect (optional)
        // pos.setZ(i, z + 0.02 * Math.sign(x))
      }
    }
    pos.needsUpdate = true
    group.add(new Mesh(
      mouthGeom,
      new MeshBasicMaterial({ color: 'black' }),
    ))

    return group
  }
}
