/**
 * @file chess-gfx-helper.ts
 *
 * Helpers for rendering 3D chess pieces and
 * terrain tiles beings used as chess board.
 */
import type { BufferGeometry, Group } from 'three'
import { Box3, InstancedMesh } from 'three'
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
import type { Pipeline } from 'gfx/3d/tile-render-pipeline/pipeline'
import { chessBoardPipeline } from 'gfx/3d/tile-render-pipeline/chess-board-pipeline'
import { freeCamPipeline } from 'gfx/3d/tile-render-pipeline/free-cam-pipeline'
import type { SeaBlock } from 'sea-block'

const LANDSCAPE_CAMERA = new Vector3(0, 5, 4)
const PORTRAIT_CAMERA = LANDSCAPE_CAMERA.clone().multiplyScalar(1.5)
export function getChessCamOffset(seaBlock: SeaBlock) {
  const { w, h } = seaBlock.layeredViewport
  return h > w ? PORTRAIT_CAMERA : LANDSCAPE_CAMERA
}

// replace pipeline for certain tiles
export function getChessPipeline(chess: Chess, tile: TileIndex): Pipeline {
  if (chess && chess.boardTiles.includes(tile.i)) {
    return chessBoardPipeline
  }
  return freeCamPipeline
}

// visible chess piece in world
export type RenderablePiece = {
  readonly instancedMesh: InstancedMesh
  readonly index: number
  type: PieceName
  tile: TileIndex
  isEnemy: boolean
}
const enemyColor = new Color(0xff0000)

// loaded meshes
export const chessPieceMeshes: Partial<Record<PieceName, InstancedMesh>> = {}
export let treasureChestMesh: Group

export const treasureChestElement: GameElement = {
  meshLoader: async () => {
    treasureChestMesh = getMesh('kenney/chest.obj').clone()

    const chestMat = new MeshLambertMaterial({
      map: new CanvasTexture(getImage('textures/kenney-colormap.png')),
      color: 0xaaaaaa,
    })
    const aabb = new Box3()
    aabb.setFromObject(treasureChestMesh)

    treasureChestMesh.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = chestMat
        // child.position.set(0, 0, 0)

        // sit on y=0
        child.geometry.translate(0, -aabb.min.y, 0)

        // if (child.name === 'lid') {
        //   child.rotation.x = Math.PI / 2
        // }
      }
    })
    const scale = 0.7
    treasureChestMesh.scale.set(scale, scale, scale)

    return treasureChestMesh
  },
}

// preload instanced meshes for each piece type
export const chessPieceElements: Array<GameElement>
  = PIECE_NAMES.map(pieceType => ({
    meshLoader: async () => {
      const group = getMesh(`chess/${pieceType}.obj`).clone()
      if (group.children.length !== 1) {
        throw new Error(`group has ${group.children.length} children (expected 1)`)
      }
      const child = group.children[0]
      if (!(child instanceof Mesh)) {
        throw new Error(`child is ${group.children} (expected Mesh)`)
      }
      const geom = child.geometry as BufferGeometry

      // center and sit on y=0
      geom.center()
      geom.computeBoundingBox()
      const min = (geom.boundingBox as Box3).min
      geom.translate(0, -min.y, 0)

      const scale = 0.3
      geom.scale(scale, scale, scale)
      const im = new InstancedMesh(geom, child.material, 16)
      im.count = 0
      chessPieceMeshes[pieceType] = im

      return im
    },
  }))

export function setPiecePosition(mesh: RenderablePiece, position: Vector3): void {
  // console.log(`setpiecepos ${position.x.toFixed(2)}, ${position.z.toFixed(2)}`)

  const { instancedMesh, index } = mesh
  const posArray = instancedMesh.instanceMatrix.array

  // start of position in meshes arrays
  let offset = index * 16 + 12

  const { x, y, z } = position
  posArray[offset++] = x
  posArray[offset++] = y
  posArray[offset++] = z
  instancedMesh.instanceMatrix.needsUpdate = true
  instancedMesh.frustumCulled = false
}

const positionDummy = new Vector3()

export function getPiecePosition(mesh: RenderablePiece, target?: Vector3): Vector3 {
  const { instancedMesh, index } = mesh
  const posArray = instancedMesh.instanceMatrix.array

  const writeTo = target || positionDummy

  // start of position in meshes arrays
  let offset = index * 16 + 12
  writeTo.set(
    posArray[offset++],
    posArray[offset++],
    posArray[offset++],
  )
  return writeTo
}

export function updateMeshes(chess: Chess) {
  const { player, pawns, enemies, goalTile } = chess
  for (const piece of ([player, ...pawns, ...enemies])) {
    setPiecePosition(piece, chess.getPosOnTile(piece.tile))
  }
  treasureChestMesh.position.copy(chess.getPosOnTile(goalTile))
}

export function resetMeshes(chess: Chess,
  playerPieceType: PieceName, playerTile: TileIndex,
  enemies: Array<{ type: PieceName, tile: TileIndex }>,
) {
  chess.enemies.length = 0 // clear existing registered enemy meshes
  const mat = new MeshLambertMaterial({ color: 0x333333 })
  for (const pieceType in chessPieceMeshes) {
    const mesh = chessPieceMeshes[pieceType] as InstancedMesh
    mesh.count = 0
    mesh.visible = true
    mesh.material = mat
    if (pieceType === playerPieceType) {
      // register player
      chess.player = chess.registerPiece(pieceType as PieceName, playerTile, false)
      showCurrentPiece(pieceType as PieceName)
    }
    // register enemies for this type of chess piece
    chess.enemies.push(...enemies
      .filter(nme => nme.type === pieceType)
      .map(({ type, tile }) => chess.registerPiece(type, tile, true)),
    )
  }
  if (!chess.player) {
    throw new Error('no player piece mesh')
  }

  // set positions for visible mesh instances
  setPiecePosition(chess.player, chess.getPosOnTile(chess.player.tile))
  for (const nme of chess.enemies) {
    setPiecePosition(nme, chess.getPosOnTile(nme.tile))
    nme.instancedMesh.setColorAt(nme.index, enemyColor)
  }
}
