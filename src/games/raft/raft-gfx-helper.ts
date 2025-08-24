/**
 * @file raft-gfx-helper.ts
 *
 * Helper build meshes for raft builder.
 */

import { DoubleSide, Matrix4 } from 'three'
import type { GameElement } from 'games/game'
import type { Vector3 } from 'three'
import { ConeGeometry, Group, InstancedMesh, MeshBasicMaterial } from 'three'
import type { BufferGeometry } from 'three'
import { Mesh, BoxGeometry, MeshLambertMaterial } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { PieceName, PlaceablePieceName } from './raft-enums'
import { PIECE_NAMES } from './raft-enums'
import { clickUnfocusedRaftMesh } from './raft-drive-helper'
import { getThrusterDirection } from './raft-auto-thrusters'

export type UniquePiece = {
  readonly mesh: Mesh
  type: PieceName
  tile: TileIndex
}
export type InstancedPiece = {
  readonly instancedMesh: InstancedMesh
  readonly index: number
  type: PieceName
  tile: TileIndex
}
export type RenderablePiece = UniquePiece | InstancedPiece

// Geometry and color for each raft element (now with a single 'thruster' type)
const PIECE_MODELS: Record<PieceName,
      { geometry: () => BufferGeometry, material: () => MeshLambertMaterial }
> = {
  cockpit: {
    geometry: () => new BoxGeometry(1, 1, 1),
    material: () => new MeshLambertMaterial({ color: 0x2196f3 }), // blue
  },
  floor: {
    geometry: () => new BoxGeometry(1, 1, 1),
    material: () => new MeshLambertMaterial({ color: 0x8bc34a }), // green
  },
  thruster: {
    geometry: () => {
      return new ConeGeometry(1, 1, 3, 1, true)
    },
    material: () => new MeshLambertMaterial({
      color: 0xff9800, // orange
      side: DoubleSide,
    }),
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
    isPickable: true,
    clickAction: (e) => { clickUnfocusedRaftMesh(e) },
    meshLoader: async () => {
      const { geometry, material } = PIECE_MODELS[pieceName]
      const mesh = new InstancedMesh(geometry(), material(), 25)
      mesh.scale.set(1, 1, 1)
      instancedPieceMeshes[pieceName] = mesh
      return mesh
    },
  }))

export let cockpitMesh: Mesh
export const cockpitElement: GameElement = {
  isPickable: true,
  clickAction: (e) => {
    clickUnfocusedRaftMesh(e)
    // console.log('click cockpit')
  },
  meshLoader: async () => {
    const { geometry, material } = PIECE_MODELS.cockpit
    cockpitMesh = new Mesh(
      geometry(), material(),
    )
    cockpitMesh.scale.set(1.2, 1.2, 1.2)
    return cockpitMesh
  },
}

export const buildingRaftGroup = new Group()

// add mesh to debug group position
buildingRaftGroup.add(new Mesh(
  new BoxGeometry(1, 10, 1),
  new MeshBasicMaterial({ color: 'green' })))
export const buildingRaftGroupElement: GameElement = {
  // isPickable: true,
  // clickAction: (event) => { clickRaft(event) },
  meshLoader: async () => {
    // buildingRaftGroup.add(cockpitMesh)
    return buildingRaftGroup
  },
}

export function registerInstancedPiece(pieceName: PlaceablePieceName, tile: TileIndex): RenderablePiece {
  const mesh = instancedPieceMeshes[pieceName]
  if (!mesh) {
    throw new Error(`missing piece mesh for ${pieceName}`)
  }

  const instancedMesh = mesh as InstancedMesh
  const index = instancedMesh.count
  instancedMesh.count++
  instancedMesh.visible = true

  return { instancedMesh, index, tile, type: pieceName }
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
    m4 = getThrusterRotationMatrix(piece.tile)
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
function getThrusterRotationMatrix(tile: TileIndex): Matrix4 {
  const dir = getThrusterDirection(tile)
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
