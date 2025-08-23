/**
 * @file raft-gfx-helper.ts
 *
 * Helper build meshes for raft builder.
 */

import type { GameElement } from 'games/game'
import type { Vector3 } from 'three'
import { Group, InstancedMesh, MeshBasicMaterial } from 'three'
import { Mesh, BoxGeometry, MeshLambertMaterial } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { PieceName, PlaceablePieceName } from './raft-enums'
import { PIECE_NAMES } from './raft-enums'

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

// Color codes for each raft element
const PIECE_COLORS: Record<PieceName, number> = {
  cockpit: 0x2196f3, // blue
  floor: 0x8bc34a, // green
  thruster: 0xff9800, // orange
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
    clickAction: () => { console.log('clicked piece instancedPieceElement') },
    meshLoader: async () => {
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshLambertMaterial({ color: PIECE_COLORS[pieceName] })
      const mesh = new InstancedMesh(geometry, material, 25)
      mesh.scale.set(1, 1, 1)
      instancedPieceMeshes[pieceName] = mesh
      return mesh
    },
  }))

export let cockpitMesh: Mesh
export const cockpitElement: GameElement = {
  isPickable: true,
  clickAction: () => { console.log('click cockpit') },
  meshLoader: async () => {
    cockpitMesh = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshLambertMaterial({ color: PIECE_COLORS.cockpit }),
    )
    cockpitMesh.scale.set(1.2, 1.2, 1.2)
    return cockpitMesh
  },
}

export const buildingRaftGroup = new Group()
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
  console.log(`setpiecepos ${position.x.toFixed(2)}, ${position.z.toFixed(2)}`)

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
  const posArray = instancedMesh.instanceMatrix.array

  // start of position in meshes arrays
  let offset = index * 16 + 12

  const { x, y, z } = position
  posArray[offset++] = x
  posArray[offset++] = y
  posArray[offset++] = z
  // instancedMesh.setColorAt(index, piece.isEnemy ? enemyColor : friendColor )
  instancedMesh.instanceMatrix.needsUpdate = true
  instancedMesh.frustumCulled = false
}
