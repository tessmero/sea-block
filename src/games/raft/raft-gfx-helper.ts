/**
 * @file raft-gfx-helper.ts
 *
 * Helper build meshes for raft builder.
 */

import { Box3, DoubleSide, Matrix4 } from 'three'
import type { GameElement } from 'games/game'
import { Vector3 } from 'three'
import { ConeGeometry, InstancedMesh, MeshBasicMaterial } from 'three'
import type { BufferGeometry } from 'three'
import { Mesh, BoxGeometry, MeshLambertMaterial } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { PieceName, PlaceablePieceName } from './raft-enums'
import { PIECE_NAMES } from './raft-enums'
import { clickUnfocusedRaftMesh } from './raft-drive-helper'
import type { AutoThruster } from './raft-auto-thrusters'
import { getThrusterDirection } from './raft-auto-thrusters'
import { raft, type Raft } from './raft'
import type { RaftButton } from './raft-buttons'
import { buildBoxEdges } from 'games/walking-cube/wc-edge-gfx'

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

// Geometry and color for each raft element (now with a single 'thruster' type)
const PIECE_MODELS: Record<PieceName,
      { geometry: () => BufferGeometry, material: () => MeshLambertMaterial }
> = {
  cockpit: {
    geometry: () => box(0.1, 0.1, 0.1), // hidden in center of floor tile
    material: () => mat({ color: 0x2196f3 }), // blue
  },
  floor: {
    geometry: () => box(1, 1, 1),
    material: () => mat({ color: 0x8bc34a }), // green
  },
  button: {
    geometry: () => box(0.9, 1, 0.9).translate(0, 0.05, 0), // on top of floor tile
    material: () => mat({ color: 0xaaaaff }), // light blue
  },
  thruster: {
    geometry: () => {
      const geo = new ConeGeometry(1, 3, 6, 1, true)
      // const geo = new CylinderGeometry(1, 1, .5, 6, 1, true)
      const pos = geo.attributes.position
      const off = 7
      for (let i = 0; i < 7; ++i) {
        const y = (i % 2 === 0) ? 0.2 : -0.2
        pos.setY(i + off, pos.getY(i + off) + y)
      }
      geo.computeVertexNormals()
      return geo.scale(0.5, 0.5, 0.5)
    },
    material: () => mat({
      color: 0x555555,
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
    // isPickable: true,
    // clickAction: (_e) => {
    //   // clickUnfocusedRaftMesh(e)
    // },
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

// thick cube frame showing hovered tile in raft grid
const s = 1.2
const cursorBox = new Box3(new Vector3(-s / 2, -s / 2, -s / 2), new Vector3(s / 2, s / 2, s / 2))
export const cursorMesh = new Mesh(
  buildBoxEdges({ box: cursorBox }),
  // new BoxGeometry(1.2, 1.2, 1.2),
  new MeshBasicMaterial({ color: 'white' }),
)
type CursorMode = 'default' | 'buildable'
const cursorMats: Record<CursorMode, MeshBasicMaterial> = {
  default: new MeshBasicMaterial({ color: 'white' }),
  buildable: new MeshBasicMaterial({ color: 'green' }),
}
type XZ = { x: number, z: number }
export function putCursorOnTile(tile: XZ, mode: CursorMode = 'default') {
  cursorMesh.position.x = tile.x
  cursorMesh.position.z = tile.z
  cursorMesh.visible = true
  cursorMesh.material = cursorMats[mode]
  cursorMesh.frustumCulled = false
}
export function resetCursorMode() {
  cursorMesh.material = cursorMats['default']
}
// instanced mesh to visualize buildable tiles
const buildableMat = new MeshBasicMaterial({ color: 'white', depthTest: false, depthWrite: false })
export const buildablesMesh: InstancedMesh
    = new InstancedMesh(new BoxGeometry(1, 1, 1).scale(0.1, 0.1, 0.1), buildableMat, 100)
buildablesMesh.renderOrder = 999 // on top
buildablesMesh.count = 0
let buildableY = 0
export function showRaftBuildables() {
  buildablesMesh.count = 0
  buildableY = raft.currentPhase === 'place-button' ? 0.5 : 0 // indicate buttons on top of surface
  for (const i of raft.hlTiles.buildable) {
    _registerBuildable(raft.grid.tileIndices[i])
  }
  buildablesMesh.instanceMatrix.needsUpdate = true
}
export function hideRaftBuildables() {
  buildablesMesh.count = 0
}
function _registerBuildable(tile: TileIndex) {
  const m4 = new Matrix4()
  const { x, z } = raft.getPosOnTile(tile)
  m4.setPosition(x - 0.5, buildableY, z - 0.5)
  const index = buildablesMesh.count++
  buildablesMesh.setMatrixAt(index, m4)
}

// instanced mesh to visualize connections between buttons and thrusters
const wireMat = new MeshBasicMaterial({ color: 'white', depthTest: false, depthWrite: false })
export const wiresMesh: InstancedMesh = new InstancedMesh(new BoxGeometry(1, 1, 1), wireMat, 100)
wiresMesh.renderOrder = 999 // on top
wiresMesh.count = 0
// export const wiresElement: GameElement = {
//   meshLoader: async () => { return wiresMesh },
// }
export function showRaftWires(onlyFor?: RaftButton) {
  wiresMesh.count = 0
  if (onlyFor) {
    for (const thruster of onlyFor.triggers) {
      _registerWire(onlyFor, thruster)
    }
  }
  else {
    for (const button of raft.buttons) {
      for (const thruster of button.triggers) {
        _registerWire(button, thruster)
      }
    }
  }
  wiresMesh.instanceMatrix.needsUpdate = true
}
export function hideRaftWires() {
  wiresMesh.count = 0
}
function _registerWire(button: RaftButton, thruster: AutoThruster) {
  const posA = new Vector3().copy(raft.centerPos)
  posA.y = 0.5
  posA.x += button.dx - 0.5
  posA.z += button.dz - 0.5

  const posB = new Vector3().copy(raft.centerPos)
  posB.y = 0
  posB.x += thruster.dx - 0.5
  posB.z += thruster.dz - 0.5

  // Compute midpoint and direction
  const mid = new Vector3().addVectors(posA, posB).multiplyScalar(0.5)
  const dir = new Vector3().subVectors(posB, posA)
  const length = dir.length()
  if (length < 1e-6) return // skip degenerate wires

  // Default box is 1x1x1, so scale z to length, rotate to align with dir
  const m4 = new Matrix4()
  // Align Z axis to dir
  const zAxis = dir.clone().normalize()
  // Find rotation axis and angle from (0,0,1) to zAxis
  let axis: Vector3 | undefined
  let angle: number | undefined
  const ref = new Vector3(0, 0, 1)
  if (ref.clone().normalize().angleTo(zAxis) >= 1e-6) {
    axis = new Vector3().crossVectors(ref, zAxis).normalize()
    angle = Math.acos(ref.dot(zAxis))
    if (axis.lengthSq() >= 1e-6 && angle !== undefined) {
      m4.makeRotationAxis(axis, angle)
    }
  }
  m4.scale(new Vector3(0.08, 0.08, length))
  m4.setPosition(mid.x, mid.y, mid.z)

  const index = wiresMesh.count++
  wiresMesh.setMatrixAt(index, m4)
}

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
