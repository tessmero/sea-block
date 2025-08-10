/**
 * @file free-chess-game.ts
 *
 * Open-world chess game mode, similar to free-cam.
 * Chess piece auto-moves to valid tile nearest to center.
 */

import type { PieceName } from 'games/chess/chess-enums'
import type { GameElement, GameUpdateContext } from 'games/game'
import { Game } from 'games/game'
import { getMesh } from 'gfx/3d/mesh-asset-loader'
import type { SeaBlock } from 'sea-block'
import { Mesh, MeshLambertMaterial, Vector3, type Group } from 'three'
import { randChoice } from 'util/rng'
import type { FreeCamGame } from './free-cam-game'
import { ChessMoveAnim } from 'games/chess/chess-move-anim'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import { getAllowedMoves } from 'games/chess/chess-rules'

const chessPieceMaterial = new MeshLambertMaterial({ color: 'orange' })

const startPiece = randChoice(['rook', 'bishop']) as PieceName
let chessPieceMesh: Group
const chessPieceElement: GameElement = {
  meshLoader: async () => {
    chessPieceMesh = getMesh(`chess/${startPiece}.obj`).clone()
    chessPieceMesh.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = chessPieceMaterial
      }
    })
    return chessPieceMesh
  },
}

export class FreeChessGame extends Game {
  static {
    Game.register('free-chess', {
      factory: () => new FreeChessGame(),
      guiName: 'free-cam',
      elements: [
        chessPieceElement, // chess piece that auto-moves with camera
      ],
    })
  }

  // assigned in reset
  private freeCam!: FreeCamGame
  private currentTile!: TileIndex

  // assigned during move animation
  private currentMove?: ChessMoveAnim

  public reset(context: SeaBlock): void {
    this.freeCam = Game.create('free-cam', context) as FreeCamGame
    this.freeCam.reset(context)
    this.currentTile = this.getCenterTile(context)
  }

  public update(context: GameUpdateContext): void {
    this.freeCam.update(context)
    const { seaBlock, dt } = context

    if (this.currentMove) {
      const isFinished = this.currentMove.update(dt)
      chessPieceMesh.position.copy(this.currentMove.getLivePosition())
      if (isFinished) {
        this.currentTile = this.currentMove.endTile
        this.currentMove = undefined
      }
    }

    if (!this.currentMove) {
      // check if should start new move

      const center = this.getCenterTile(seaBlock)
      if (center.i !== this.currentTile.i) {
        // // start move to center tile
        // this.currentMove = new ChessMoveAnim(
        //   this.getPosOnTile(seaBlock, this.currentTile).clone(),
        //   this.getPosOnTile(seaBlock, center).clone(),
        //   center,
        // )

        // find best move towards center
        const candidates = [
          this.currentTile,
          ...getAllowedMoves({
            terrain: seaBlock.terrain,
            boardTiles: seaBlock.terrain.grid.tileIndices.map(({ i }) => i),
            type: 'knight',
            tile: this.currentTile,
          }),
        ]

        console.log(`${candidates.length} candidates`)

        if (candidates.length === 0) {
          return // no valid moves
        }
        const best = this.pickNearestToCenter(candidates, center)
        if (best.i === this.currentTile.i) {
          return // no productive valid moves
        }

        // start best move towards center
        console.log(`startign mvoe with delta ${best.x - this.currentTile.x},${best.z - this.currentTile.z}`)
        this.currentMove = new ChessMoveAnim(
          chessPieceMesh.position.clone(), // this.getPosOnTile(seaBlock, this.currentTile).clone(),
          this.getPosOnTile(seaBlock, best).clone(),
          best,
        )
      }
    }
  }

  private pickNearestToCenter(candidates: Array<TileIndex>, center: TileIndex): TileIndex {
    let nearestCandidate = candidates[Math.random() * candidates.length]
    let nearestDistance = Infinity

    for (const candidate of candidates) {
      const dx = candidate.x - center.x
      const dz = candidate.z - center.z
      const distSq = dx * dx + dz * dz
      if (distSq < nearestDistance) {
        nearestDistance = distSq
        nearestCandidate = candidate
      }
    }

    return nearestCandidate
  }

  private getCenterTile(seaBlock: SeaBlock): TileIndex {
    // find center tile based on camera target
    const { orbitControls, terrain } = seaBlock
    const { target } = orbitControls
    const { x, z } = target
    const coord = terrain.grid.positionToCoord(x, z)
    const center = terrain.grid.xzToIndex(coord.x, coord.z)
    if (!center) {
      throw new Error(`could not find center tile at position ${x.toFixed(2)},${z.toFixed(2)}`)
    }
    return center
  }

  public getPosOnTile(seaBlock: SeaBlock, tile: TileIndex, target?: Vector3): Vector3 {
    const { x, z } = seaBlock.terrain.grid.indexToPosition(tile)
    const height = seaBlock.terrain.generatedTiles[tile.i]?.liveHeight

    const writeTo = target || positionDummy
    writeTo.set(x + 0.2, (height || 13) + 1, z + 0.2)

    return writeTo
  }
}

const positionDummy = new Vector3()
