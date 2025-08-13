/**
 * @file chess-3d-gfx-helper.ts
 *
 * Helpers for rendering 3D chess pieces and
 * terrain tiles beings used as chess board.
 */
import type { BufferGeometry, Box3, Material } from 'three'
import { Group } from 'three'
import { InstancedMesh } from 'three'
import { Color, Vector3 } from 'three'
import { CanvasTexture, Mesh, MeshLambertMaterial } from 'three'
import type { GameElement } from 'games/game'
import { getMesh } from 'gfx/3d/mesh-asset-loader'
import type { PieceName } from './chess-enums'
import { PIECE_NAMES } from './chess-enums'
import { getImage } from 'gfx/2d/image-asset-loader'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { Chess } from './chess-helper'
import { showCurrentPiece } from './gui/chess-hud-elements'
import type { Pipeline } from 'gfx/3d/pipelines/pipeline'
import { chessBoardPipeline } from 'gfx/3d/pipelines/chess-board-pipeline'
import { freeCamPipeline } from 'gfx/3d/pipelines/free-cam-pipeline'
import type { SeaBlock } from 'sea-block'
import { getOutlinedMesh } from './chess-outline-gfx'
import { setMaterial } from 'gfx/3d/gui-3d-gfx-helper'

// default camera angles
const LANDSCAPE_CAMERAS = [
  new Vector3(0, 5, 4),
  new Vector3(1, 5, 4),
  new Vector3(4, 6, 4),
]

// portrait view is zoomed out extra
const PORTRAIT_CAMERAS = LANDSCAPE_CAMERAS.map(v => v.clone().multiplyScalar(1.6))

export function getChessCamOffset(seaBlock: SeaBlock) {
  const { w, h } = seaBlock.layeredViewport
  const arr = h > w ? PORTRAIT_CAMERAS : LANDSCAPE_CAMERAS
  return arr[Math.floor(Math.random() * arr.length)]
}

export function resetChessCamera(context: SeaBlock): void {
  // console.log('reset chess camera')
  const { x, z } = context.terrain.centerXZ
  const cam = getChessCamOffset(context)
  const { y } = context.orbitControls.target
  context.camera.position.set(x + cam.x, y + cam.y, z + cam.z)
}

// replace pipeline for certain tiles
export function getChessPipeline(chess: Chess, tile: TileIndex): Pipeline {
  if (chess && chess.boardTiles.includes(tile.i)) {
    return chessBoardPipeline
  }
  return freeCamPipeline
}

// visible chess piece in world
export type UniquePiece = {
  readonly mesh: Group
  type: PieceName
  tile: TileIndex
  isEnemy: boolean
}
export type InstancedPiece = {
  readonly instancedMesh: InstancedMesh
  readonly index: number
  type: PieceName
  tile: TileIndex
  isEnemy: boolean
}
export type RenderablePiece = UniquePiece | InstancedPiece
const enemyColor = new Color(0xff0000)
const friendColor = new Color(0x333333)

// loaded meshes
export const instancedPieceMeshes: Partial<Record<PieceName, InstancedMesh>> = {}
export const outlinedPieceMeshes: Partial<Record<PieceName, Group>> = {}
export let treasureChestMesh: Group
export let chestMat: Material

export const treasureChestElement: GameElement = {

  isPickable: true, // clickAction: () => {},
  meshLoader: async () => {
    treasureChestMesh = getMesh('kenney/chest.obj').clone()

    chestMat = new MeshLambertMaterial({
      map: new CanvasTexture(getImage('textures/kenney-colormap.png')),
      color: 0xaaaaaa,
    })
    const hoveredChestMat = new MeshLambertMaterial({
      map: new CanvasTexture(getImage('textures/kenney-colormap.png')),
      color: 0xffffff,
    })
    treasureChestElement.defaultMat = chestMat
    treasureChestElement.hoverMat = hoveredChestMat

    treasureChestMesh = getOutlinedMesh(treasureChestMesh, { scale: 1.1, dilate: -0.04 })

    setMaterial(treasureChestMesh, chestMat)
    treasureChestMesh.scale.multiplyScalar(0.5)

    return treasureChestMesh
  },
}

// preload outlined meshes for each piece type
export const outlinedPieceElements: Array<GameElement>
= PIECE_NAMES.map(pieceType => ({
  isPickable: true,

  // preload instanced meshes for each piece type
  meshLoader: async () => {
    const group = getMesh(`chess/${pieceType}.obj`).clone()
    if (group.children.length !== 1) {
      throw new Error(`group has ${group.children.length} children (expected 1)`)
    }
    const child = group.children[0]
    if (!(child instanceof Mesh)) {
      throw new Error(`child is ${group.children} (expected Mesh)`)
    }
    const geom = (child.geometry as BufferGeometry).clone()

    // center and sit on y=0
    geom.center()
    geom.computeBoundingBox()
    const { min } = geom.boundingBox as Box3
    // geom.translate(0, -min.y, 0)

    const scale = 0.3
    geom.scale(scale, scale, scale)
    let result = new Group().add(new Mesh(geom, child.material))

    result = getOutlinedMesh(result, { scale: 1.1, dilate: -0.04 })
    result.children.forEach((child) => {
      child.position.y -= min.y
    })

    result.visible = false
    outlinedPieceMeshes[pieceType] = result
    // (im as any).gameElement = chessPieceElements[pieceType] // checked in mouse-touch-input.ts

    return result
  },
}))

interface InstancedPieceElement extends GameElement {
  pieceType: PieceName
}

// preload instanced meshes for each piece type
export const instancedPieceElements: Array<InstancedPieceElement>
  = PIECE_NAMES.map(pieceType => ({
    pieceType,
    isPickable: true,
    // // clicking chess piece instance counts as clicking its tile
    // clickAction: ({ inputEvent, seaBlock }) => {
    //   const { instanceId } = (inputEvent as ProcessedSubEvent).rawPick as Intersection

    //   // console.log(`clicked chess piece ${pieceType}, index ${instanceId}`)

    //   if (typeof instanceId !== 'number') {
    //     return
    //   }

    //   const chess = (seaBlock.game as ChessGame).chess
    //   const piece = chess.identifyPiece(pieceType, instanceId)

    //   if (!piece) {
    //     return
    //   }

    //   fullClickTile(chess, piece.tile)
    // },

    meshLoader: async () => {
      const group = getMesh(`chess/${pieceType}.obj`).clone()
      if (group.children.length !== 1) {
        throw new Error(`group has ${group.children.length} children (expected 1)`)
      }
      const child = group.children[0]
      if (!(child instanceof Mesh)) {
        throw new Error(`child is ${group.children} (expected Mesh)`)
      }
      const geom = (child.geometry as BufferGeometry).clone()

      // center and sit on y=0
      geom.center()
      geom.computeBoundingBox()
      const min = (geom.boundingBox as Box3).min
      geom.translate(0, -min.y, 0)

      const scale = 0.3
      geom.scale(scale, scale, scale)
      const im = new InstancedMesh(geom, child.material, 16)
      im.setColorAt(0, new Color()) // init color buffer
      im.count = 0
      instancedPieceMeshes[pieceType] = im

      return im
    },
  }))

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

const positionDummy = new Vector3()

export function getPiecePosition(piece: RenderablePiece, target?: Vector3): Vector3 {
  const writeTo = target || positionDummy

  if ('instancedMesh' in piece) {
    getInstancePosition(piece, writeTo)
  }
  else {
    // get unique piece position
    writeTo.copy(piece.mesh.position)
  }
  return writeTo
}
function getInstancePosition(piece: InstancedPiece, writeTo: Vector3) {
  const { instancedMesh, index } = piece
  const posArray = instancedMesh.instanceMatrix.array

  // start of position in meshes arrays
  let offset = index * 16 + 12
  writeTo.set(
    posArray[offset++],
    posArray[offset++],
    posArray[offset++],
  )
}

export function updateMeshes(chess: Chess) {
  const { player, pawns, enemies, goalTile } = chess
  for (const piece of ([player, ...pawns, ...enemies])) {
    setPiecePosition(piece, chess.getPosOnTile(piece.tile))
  }
  treasureChestMesh.position.copy(chess.getPosOnTile(goalTile))

  for (const im of Object.values(instancedPieceMeshes)) {
    im.computeBoundingSphere()
  }
}

export function registerInstancedPiece(type: PieceName, tile: TileIndex, isEnemy: boolean): RenderablePiece {
  const instancedMesh = instancedPieceMeshes[type]
  if (!instancedMesh) {
    throw new Error(`missing mesh for ches piece ${type}`)
  }
  const index = instancedMesh.count
  instancedMesh.count++
  instancedMesh.visible = true

  const color = isEnemy ? enemyColor : friendColor
  instancedMesh.setColorAt(index, color)
  instancedMesh.instanceColor!.needsUpdate = true
  // console.log(`registered ${type} piece at index ${index}, isEnemy = ${isEnemy}, color ${color.getStyle()}`)
  return { instancedMesh, index, tile, type, isEnemy }
}

export function resetMeshes(chess: Chess,
  player: { type: PieceName, tile: TileIndex },
  pawns: Array<{ type: PieceName, tile: TileIndex }>,
  enemies: Array<{ type: PieceName, tile: TileIndex }>,
) {
  // set flag for hud display
  showCurrentPiece(player.type)

  // clear existing registered mesh instances
  chess.enemies.length = 0
  chess.pawns.length = 0

  // reset instanced meshes
  // const mat = new MeshLambertMaterial({ color: 0xaaaaaa })
  for (const pieceType in instancedPieceMeshes) {
    const mesh = instancedPieceMeshes[pieceType] as InstancedMesh
    mesh.count = 0
    mesh.visible = true
    // mesh.material = mat
  }

  // player has unique mesh
  chess.player = {
    isEnemy: false,
    mesh: outlinedPieceMeshes[player.type] as Group,
    tile: player.tile,
    type: player.type,
  }
  chess.playerElement = outlinedPieceElements[PIECE_NAMES.indexOf(player.type)]

  // only player's unique mesh is visible
  for (const mesh of Object.values(outlinedPieceMeshes)) {
    mesh.visible = false
  }
  chess.player.mesh.visible = true

  // pawns and enemies are instnaced
  chess.pawns.push(...pawns
    .map(({ type, tile }) => registerInstancedPiece(type, tile, false)),
  )
  chess.enemies.push(...enemies
    .map(({ type, tile }) => registerInstancedPiece(type, tile, true)),
  )

  if (!chess.player) {
    throw new Error('no player piece mesh')
  }

  // set positions for visible mesh instances
  setPiecePosition(chess.player, chess.getPosOnTile(chess.player.tile))
  for (const nme of chess.enemies) {
    setPiecePosition(nme, chess.getPosOnTile(nme.tile))
    // setPieceColor(nme, enemyColor)
  }
}
