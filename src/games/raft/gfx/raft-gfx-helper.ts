/**
 * @file raft-gfx-helper.ts
 *
 * Helper build meshes for raft builder.
 */

import { Box3, DoubleSide, Matrix4 } from 'three'
import type { GameElement } from 'games/game'
import type { BufferGeometry } from 'three'
import { Vector3 } from 'three'
import { InstancedMesh, Float32BufferAttribute } from 'three'

import { Mesh, BoxGeometry, MeshLambertMaterial } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { PieceName, PlaceablePieceName } from '../raft-enums'
import { PIECE_NAMES } from '../raft-enums'
import { getThrusterDirection } from '../raft-auto-thrusters'
import { type Raft } from '../raft'
import { buildBoxEdges } from 'games/walking-cube/wc-edge-gfx'
import { getMesh } from 'gfx/3d/mesh-asset-loader'

const maxInstances = 50 // maximum number visible for each instanced piece type

export type UniquePiece = {
  readonly raft: Raft
  readonly mesh: Mesh
  type: PieceName
  tile: TileIndex
}
export type InstancedPiece = {
  readonly raft: Raft
  readonly instancedMesh: InstancedMesh
  readonly index: number
  type: PieceName
  tile: TileIndex
}
export type RenderablePiece = UniquePiece | InstancedPiece

const box = (x, y, z) => new BoxGeometry(x, y, z)
const mat = pars => new MeshLambertMaterial(pars)

// PIECE_MODELS now returns functions that create InstancedMesh objects for each piece type
const PIECE_MODELS: Record<PieceName, () => InstancedMesh> = {
  cockpit: () => new InstancedMesh(
    box(0.1, 0.1, 0.1),
    mat({ color: 0xffffff }),
    maxInstances,
  ),
  floor: () => {
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
    const frameMat = new MeshLambertMaterial({ color: 0x000000 })

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
  },
  button: () => new InstancedMesh(
    box(0.9, 1, 0.9).translate(0, 0.05, 0),
    mat({ color: 0xffffff }),
    maxInstances,
  ),
  thruster: () => {
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
    return new InstancedMesh(
      geo,
      mat({ color: 0xffffff, side: DoubleSide }),
      maxInstances,
    )
  },
}

interface InstancedPieceElement extends GameElement {
  pieceName: PieceName
}

// preload instanced meshes for each piece type
export const instancedPieceMeshes = {} as Record<PieceName, InstancedMesh>
export const instancedPieceElements: Array<InstancedPieceElement>
  = PIECE_NAMES.map(pieceName => ({
    pieceName,
    // isPickable: true,
    // clickAction: (_e) => {
    //   // clickUnfocusedRaftMesh(e)
    // },
    meshLoader: async () => {
      const mesh = PIECE_MODELS[pieceName]()
      mesh.scale.set(1, 1, 1)
      instancedPieceMeshes[pieceName] = mesh
      return mesh
    },
  }))

export let cockpitMesh: Mesh
export const cockpitElement: GameElement = {
  isPickable: true,
  clickAction: () => {
    // clickDistantRaftMesh(e)
    // console.log('click cockpit')
  },
  meshLoader: async () => {
    // For cockpit, return a single Mesh (not InstancedMesh)
    cockpitMesh = new Mesh(
      box(0.1, 0.1, 0.1),
      mat({ color: 0x2196f3 }),
    )
    cockpitMesh.scale.set(1.2, 1.2, 1.2)
    return cockpitMesh
  },
}

// export const buildingRaftGroup = new Group()
// // add mesh to debug group position
// buildingRaftGroup.add(new Mesh(
//   new BoxGeometry(1, 10, 1),
//   new MeshBasicMaterial({ color: 'green' })))
// export const buildingRaftGroupElement: GameElement = {
//   // isPickable: true,
//   // clickAction: (event) => { clickRaft(event) },
//   meshLoader: async () => {
//     // buildingRaftGroup.add(cockpitMesh)
//     return buildingRaftGroup
//   },
// }

export function registerInstancedPiece(raft: Raft, pieceName: PlaceablePieceName, tile: TileIndex): RenderablePiece {
  const mesh = instancedPieceMeshes[pieceName]
  if (!mesh) {
    throw new Error(`missing piece mesh for ${pieceName}`)
  }

  const instancedMesh = mesh as InstancedMesh
  const index = instancedMesh.count
  instancedMesh.count++
  instancedMesh.visible = true

  return { raft, instancedMesh, index, tile, type: pieceName }
}

export function setPiecePosition(piece: RenderablePiece, position: Vector3): void {
  // console.log(`setpiecepos ${position.x.toFixed(2)}, ${position.z.toFixed(2)}`)

  if ('instancedMesh' in piece) {
    setInstancePosition(piece, position)
  }
  else {
    // set unique piece position
    piece.mesh.position.copy(position)
  }
}

function setInstancePosition(piece: InstancedPiece, position: Vector3): void {
  const { instancedMesh, index } = piece
  const { x, y, z } = position

  let m4 = new Matrix4()
  if (piece.type === 'thruster') {
    m4 = getThrusterRotationMatrix(piece)
  }
  m4.setPosition(x, y, z)
  instancedMesh.setMatrixAt(index, m4)

  // const posArray = instancedMesh.instanceMatrix.array
  // let offset = index * 16 + 12
  // posArray[offset++] = x
  // posArray[offset++] = y
  // posArray[offset++] = z

  // instancedMesh.setColorAt(index, piece.isEnemy ? enemyColor : friendColor )
  instancedMesh.instanceMatrix.needsUpdate = true
  instancedMesh.frustumCulled = false
}

// Returns a rotation matrix for the thruster mesh instance based on adjacent piece
function getThrusterRotationMatrix(piece: RenderablePiece): Matrix4 {
  const dir = getThrusterDirection(piece)
  const m = new Matrix4()
  switch (dir) {
    case 'up':
      m.makeRotationZ(Math.PI / 2)
      break
    case 'down':
      m.makeRotationZ(-Math.PI / 2)
      break
    case 'right':
      m.makeRotationX(-Math.PI / 2)
      break
    case 'left':
      m.makeRotationX(Math.PI / 2)
      break
    default:
      // Default: Down (legacy fallback)
      m.makeRotationX(Math.PI / 2).multiply(new Matrix4().makeRotationY(Math.PI / 2))
      break
  }
  return m
}
