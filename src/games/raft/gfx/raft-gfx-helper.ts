/**
 * @file raft-gfx-helper.ts
 *
 * Helper build meshes for raft builder.
 */

import { Matrix4 } from 'three'
import type { GameElement } from 'games/game'
import type { Vector3 } from 'three'
import { InstancedMesh } from 'three'

import { Mesh, BoxGeometry, MeshLambertMaterial } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { PieceName, PlaceablePieceName } from '../raft-enums'
import { PIECE_NAMES } from '../raft-enums'
import { getThrusterDirection } from '../raft-auto-thrusters'
import { type Raft } from '../raft'
import { buildRaftFloorMesh } from './raft-floor-mesh'
import { buildRaftThrusterMesh } from './raft-thruster-mesh'
import { buildRaftButtonMesh } from './raft-button-mesh'

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
    box(0.1, 0.1, 0.1), // hidden in center of floor
    mat({ color: 0xffffff }),
    maxInstances,
  ),
  button: () => buildRaftButtonMesh(maxInstances),
  floor: () => buildRaftFloorMesh(maxInstances),
  thruster: () => buildRaftThrusterMesh(maxInstances),
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
    m4 = getThrusterRotationMatrix(getThrusterDirection(piece))
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
type Direction = 'up' | 'down' | 'left' | 'right'
export function getThrusterRotationMatrix(dir: Direction): Matrix4 {
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
