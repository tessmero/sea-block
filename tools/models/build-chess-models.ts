/**
 * @file build-chess-models.ts
 *
 * Standardize geometries for different chess pieces from
 * https://sketchfab.com/robie1/collections/low-poly-chess-set
 * manually download in tools/models/chess
 * final output in public/obj/chess.
 */
import path from 'path'
const src = piece => path.join(__dirname, `raw-chess-models/${piece}/scene.gltf`)
const out = piece => path.join(__dirname, `../../public/obj/chess/${piece}.obj`)

import { writeFileSync } from 'fs'
import { BufferGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { GLTFLoader } from 'node-three-gltf'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { PIECE_NAMES } from '../../src/games/chess/chess-enums'

const loader = new GLTFLoader()
const exporter = new OBJExporter()

async function main() {
  for (const pieceName of PIECE_NAMES) {
    const sourceUrl = src(pieceName)

    loader.load(sourceUrl, ({ scene }) => {
      const geometry = getPieceGeometry(scene)

      // sit on xz plane
      geometry.rotateX(-Math.PI / 2)

      if (pieceName === 'king') {
        geometry.scale(1, 0.5, 1) // fix king stretched
      }

      if (pieceName === 'knight') {
        geometry.rotateY(Math.PI / 2) // match flat icon
      }
      if (pieceName === 'bishop') {
        geometry.rotateY(Math.PI) // match flat icon
      }

      // 2. Center geometry horizontally (x/z)
      geometry.computeBoundingBox()
      if (!geometry.boundingBox) throw new Error('No bounding box after computeBoundingBox')
      const bbox = geometry.boundingBox
      const centerXZ = bbox.getCenter(new Vector3())
      geometry.translate(-centerXZ.x, 0, -centerXZ.z)

      // 5. rescale to have common base radius
      const baseRadius = getBaseRadius(geometry)
      const scale = 1 / baseRadius
      geometry.scale(scale, scale, scale)

      // 6. Recompute bounding box and shift so minY = 0 (sit flat)
      geometry.computeBoundingBox()
      if (!geometry.boundingBox) throw new Error('No bounding box after scaling')
      const minY2 = geometry.boundingBox.min.y
      geometry.translate(0, minY2, 0)

      const outPath = out(pieceName)
      writeGeometryToFile(geometry, outPath)
    })
  }
}
main()

function getBaseRadius(geometry: BufferGeometry) {
  // 3. Find max y (bottom)
  const pos = geometry.getAttribute('position')
  let minY = Infinity
  for (let i = 0; i < pos.count; ++i) {
    const y = pos.getY(i)
    if (y < minY) minY = y
  }

  // 4. Find max xz radius for vertices at bottom (within epsilon)
  const EPS = 1e-4
  let maxRadius = 0
  for (let i = 0; i < pos.count; ++i) {
    if (Math.abs(pos.getY(i) - minY) < EPS) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const r = Math.sqrt(x * x + z * z)
      if (r > maxRadius) maxRadius = r
    }
  }
  return maxRadius
}

function writeGeometryToFile(geometry: BufferGeometry, outPath: string) {
  const objString = exporter.parse(new Mesh(geometry, new MeshBasicMaterial()))
  writeFileSync(outPath, `
# https://sketchfab.com/robie1/collections/low-poly-chess-set
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
  object3D.traverse((child) => {
    if (child instanceof Mesh) {
      const geo = child.geometry.clone()
      // console.log( 'before', geo.getAttribute("position").count )
      // geo = BufferGeometryUtils.mergeVertices(geo, 1)
      // console.log( 'after', geo.getAttribute("position").count )
      child.updateMatrixWorld()
      geo.applyMatrix4(child.matrixWorld)
      geometries.push(geo)
    }
  })

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

  mergedGeometry.center()

  return mergedGeometry
}
