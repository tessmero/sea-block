/**
 * @file build-raft-models.ts
 *
 * Load gltf from sketchfab
 * https://sketchfab.com/3d-models/lowpoly-sci-fi-thruster
 * manually download in tools/models
 * final output in public/obj/raft.
 */
const srcUrl = 'https://sketchfab.com/robie1/collections/lowpoly-sci-fi-thruster'

import path from 'path'
const src = piece => path.join(__dirname, `raw-raft-models/${piece}/scene.gltf`)
const out = piece => path.join(__dirname, `../../public/obj/raft/${piece}.obj`)

import { writeFileSync } from 'fs'
import { BufferGeometry, Group, Matrix4, Mesh, MeshBasicMaterial } from 'three'
import { GLTFLoader } from 'node-three-gltf'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { lerp } from 'three/src/math/MathUtils.js'

const loader = new GLTFLoader()
const exporter = new OBJExporter()

async function main() {
  for (const pieceName of (['thruster'])) {
    const sourceUrl = src(pieceName)

    loader.load(sourceUrl, ({ scene }) => {
      let geometry = getPieceGeometry(scene)

      // remove plinth from bottom
      const [minY, maxY] = getYRange(geometry)
      const yCutoff = lerp(minY, maxY, 0.12)
      geometry = cutoffBelowY(geometry, yCutoff)

      // center
      geometry.center()

      // shrink
      const s = 1e-2
      geometry.scale(s, s, s)

      const outPath = out(pieceName)
      writeGeometryToFile(geometry, outPath)
    })
  }
}
main()

function writeGeometryToFile(geometry: BufferGeometry, outPath: string) {
  const objString = exporter.parse(new Mesh(geometry, new MeshBasicMaterial()))
  writeFileSync(outPath, `
# ${srcUrl}
${objString}
  `)
  console.log(`Saved ${outPath}`)
}

function getPieceGeometry(scene: Group): BufferGeometry {
  // let found: Object3D | null = null
  // scene.traverse(function (child) {
  //   if (child.name === nameInSource) {
  //     found = child
  //   }
  // })
  // if (!found) throw new Error(`could not find source node named ${nameInSource}`)
  // return simplifyGeometry(mergeObjectGeometries(found))

  return mergeObjectGeometries(scene)
}

function mergeObjectGeometries(object3D) {
  const geometries: Array<BufferGeometry> = []
  const targetName = 'Thruster_T1_colors_0'
  let done = false
  object3D.traverse((child) => {
    if (done) return
    if (child instanceof Mesh) {
      if (child.name !== targetName) return
      const geo = child.geometry.clone()
      // console.log( 'before', geo.getAttribute("position").count )
      // geo = BufferGeometryUtils.mergeVertices(geo, 1)
      // console.log( 'after', geo.getAttribute("position").count )
      child.updateMatrixWorld()
      geo.applyMatrix4(child.matrixWorld)
      geometries.push(geo)

      // finish after first hit
      done = true
    }
  })

  if (!done) {
    throw new Error(`could not find descendant with name ${targetName}`)
  }

  if (geometries.length === 0) {
    throw new Error('no geometries')
  }

  geometries.forEach((geo) => {
    // console.log(Object.keys(geo.attributes))
    geo.deleteAttribute('normal')
    geo.deleteAttribute('uv')
    geo.deleteAttribute('uv2')
    // geo.center()
  })

  // Merge all collected geometries
  const mergedGeometry = mergeGeometries(geometries)
  console.log(`merged ${geometries.length} geometries`)

  // Apply the provided matrix
  const matrixArr = [
    92.71837500545408,
    2.7755573498046545e-15,
    -37.46066484286071,
    0.0,
    -37.46066484286021,
    -1.629206671840146e-05,
    -92.71837500545284,
    0.0,
    -6.103117439204553e-06,
    99.99999999999868,
    -1.510574181295965e-05,
    0.0,
    1.4901161193847656e-06,
    111.40992736816406,
    -5.39456844329834,
    1.0,
  ]
  const mat = new Matrix4()
  mat.fromArray(matrixArr)
  mergedGeometry.applyMatrix4(mat)

  mergedGeometry.center()

  return mergedGeometry
}

/**
 * Returns [minY, maxY] of all vertices in the geometry.
 */
function getYRange(geometry: BufferGeometry): [number, number] {
  const pos = geometry.getAttribute('position')
  let minY = Infinity, maxY = -Infinity
  for (let i = 0; i < pos.count; ++i) {
    const y = pos.getY(i)
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return [minY, maxY]
}

/**
 * Returns a new BufferGeometry with all triangles below yCutoff removed.
 */
function cutoffBelowY(geometry: BufferGeometry, yCutoff: number): BufferGeometry {
  const pos = geometry.getAttribute('position')
  const index = geometry.getIndex()
  if (!index) throw new Error('geometry must be indexed')
  const indices = index.array
  const keepTris: Array<number> = []
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i], b = indices[i + 1], c = indices[i + 2]
    const ya = pos.getY(a), yb = pos.getY(b), yc = pos.getY(c)
    if (ya >= yCutoff && yb >= yCutoff && yc >= yCutoff) {
      keepTris.push(a, b, c)
    }
  }
  if (keepTris.length === 0) throw new Error('all triangles removed by cutoff')
  const newGeom = geometry.clone()
  newGeom.setIndex(keepTris)
  // Remove unreferenced vertices
  return mergeVertices(newGeom)
}
