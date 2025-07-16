/**
 * @file tile-inspector-game.ts
 *
 * Display tile normal arrow and neighbors, for picked tile.
 */

import * as THREE from 'three'
import type { SeaBlock } from '../sea-block'
import type { Tile } from '../core/tile'
import type { GameUpdateContext } from './game'
import { Game } from './game'

// extra meshes to show when debugging is enabled
class DebugElems {
  // public directionPoint: THREE.Object3D
  public center: THREE.Object3D
  public adjacent: Array<THREE.Mesh>
  public diagonal: Array<THREE.Mesh>
  public normalArrow: THREE.ArrowHelper

  constructor() {
  // small debug spheres
    const n = 10, rad = 0.5
    this.center = debugSphere(rad, 'red')
    this.adjacent = []
    this.diagonal = []
    for (let i = 0; i < n; i++) {
      this.adjacent.push(debugSphere(rad, 'yellow'))
      this.diagonal.push(debugSphere(rad, 'blue'))
    }

    // big debug sphere
    // this.directionPoint = debugSphere(3, 'red')

    // debug arrow
    this.normalArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), // direction
      new THREE.Vector3(0, 0, 0), // origin
      4, // length
      'red', // color
    )
  }

  public refresh(debug: 'none' | 'pick-direction' | 'pick-tile'): void {
    // this.directionPoint.visible = debug === 'pick-direction'

    const shouldShowNeighbors = debug === 'pick-tile'
    this.center.visible = shouldShowNeighbors
    this.adjacent.forEach((e) => {
      e.visible = e.visible && shouldShowNeighbors
    })
    this.diagonal.forEach((e) => {
      e.visible = e.visible && shouldShowNeighbors
    })

    this.normalArrow.visible = debug === 'pick-tile'
  }
}

function debugSphere(radius: number, color: THREE.ColorRepresentation): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 8, 8)
  const material = new THREE.MeshBasicMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const debugElems = new DebugElems()

export class TileInspectorGame extends Game {
  static {
    Game.register('tile-inspector', {
      factory: () => new TileInspectorGame(),
      elements: [
        { meshLoader: async () => debugElems.center },
        ...debugElems.adjacent.map(mesh => ({ meshLoader: async () => mesh })),
        ...debugElems.diagonal.map(mesh => ({ meshLoader: async () => mesh })),
        { meshLoader: async () => debugElems.normalArrow },
        // { meshLoader: async () => debugElems.directionPoint },
      ],
      layout: {},
    })
  }

  public reset(context: SeaBlock): void {
    const { camera, terrain, sphereGroup, orbitControls } = context
    const { x, z } = terrain.centerXZ
    // position camera and grid on player
    const cam = this.getCamOffset()
    camera.position.set(x + cam.x, cam.y, z + cam.z)
    orbitControls.target.x = x
    orbitControls.target.z = z
    orbitControls.update()

    // remove all spheres
    for (let i = 0; i < sphereGroup.members.length; i++) {
      sphereGroup.members[i].isVisible = false
      sphereGroup.members[i].isGhost = true
    }
  }

  public update(context: GameUpdateContext): void {
    super.update(context)
    const { seaBlock, mouseState } = context
    const { terrain } = seaBlock

    // let intersection
    let pickedTile

    if (mouseState) {
      // debugElems.directionPoint.position.copy(
      //   mouseState.intersection,
      // )

      pickedTile = mouseState.pickedTileIndex
    }

    if (pickedTile) {
      const { x, z, i: pickedMemberId } = pickedTile
      const grid = terrain.grid

      const centerTile = terrain.members[pickedMemberId]
      // console.log(`debug center tile with id ${pickedMemberId},
      // ${centerTile.position.x.toFixed(3)},${centerTile.position.z.toFixed(3)}`)
      debugTile(debugElems.center, centerTile)

      if (centerTile?.normal) {
        debugTile(debugElems.normalArrow, centerTile)
        debugElems.normalArrow.setDirection(centerTile.normal)
      }

      const adjOffsets = terrain.grid.tiling.getAdjacent(x, z)
      for (const [i, offset] of adjOffsets.entries()) {
        const adjIndex = grid.xzToIndex(x + offset.x, z + offset.z)
        if (adjIndex) {
          const adjTile = terrain.members[adjIndex.i]
          debugTile(debugElems.adjacent[i], adjTile)
        }
      }
      // for (let i = adjOffsets.length; i < debugElems.adjacent.length; i++) {
      //   debugElems.adjacent[i].visible = false
      // }

      const diagOffsets = terrain.grid.tiling.getDiagonal(x, z)
      for (const [i, offset] of diagOffsets.entries()) {
        const diagIndex = grid.xzToIndex(x + offset.x, z + offset.z)
        if (diagIndex) {
          const diagTile = terrain.members[diagIndex.i]
          debugTile(debugElems.diagonal[i], diagTile)
        }
      }
    // for (let i = diagOffsets.length; i < debugElems.diagonal.length; i++) {
    //   debugElems.diagonal[i].visible = false
    // }
    }
  }
}

function debugTile(debugElem: THREE.Object3D, tile: Tile) {
  if (!tile) {
    debugElem.position.set(0, -1000, 0)
    return
  }
  const { x, z } = tile.position
  debugElem.position.set(x, tile.height, z)
  debugElem.visible = true
}
