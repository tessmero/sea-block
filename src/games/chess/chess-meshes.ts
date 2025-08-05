/**
 * @file chess-meshes.ts
 *
 * Defines chess pieces as game elements whos
 * meshes should be pre-loaded on startup.
 */
import type { BufferGeometry, Group, InstancedMesh } from 'three'
import { CanvasTexture, Mesh, MeshLambertMaterial } from 'three'
import type { GameElement } from 'games/game'
import { getMesh } from 'gfx/3d/mesh-asset-loader'
import type { PieceName } from './chess-enums'
import { PIECE_NAMES } from './chess-enums'
import { getImage } from 'gfx/2d/image-asset-loader'
import { ColoredInstancedMesh } from 'gfx/3d/colored-instanced-mesh'

// loaded meshes
export const chessPieceMeshes: Partial<Record<PieceName, InstancedMesh>> = {}
export let treasureChestMesh: Group

export const treasureChestElement = {
  meshLoader: async () => {
    treasureChestMesh = getMesh('kenney/chest.obj')

    const chestMat = new MeshLambertMaterial({
      map: new CanvasTexture(getImage('textures/kenney-colormap.png')),
      color: 0xaaaaaa,
    })
    treasureChestMesh.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = chestMat
        child.position.set(0, 16.5, 0)

        // if (child.name === 'lid') {
        //   child.rotation.x = Math.PI / 2
        // }
      }
    })
    const scale = 0.7
    treasureChestMesh.scale.set(scale, scale, scale)

    return treasureChestMesh
  },
} as const satisfies GameElement

// elements to register -> pre-load mesh for each piece type
export const chessPieceElements: Array<GameElement>
  = PIECE_NAMES.map(pieceType => ({
    meshLoader: async () => {
      const group = getMesh(`chess/${pieceType}.obj`)
      if (group.children.length !== 1) {
        throw new Error(`group has ${group.children.length} children (expected 1)`)
      }
      const child = group.children[0]
      if (!(child instanceof Mesh)) {
        throw new Error(`child is ${group.children} (expected Mesh)`)
      }
      const geom = child.geometry as BufferGeometry
      geom.center()
      const scale = 0.3
      geom.scale(scale, scale, scale)
      const im = new ColoredInstancedMesh(geom, child.material, 16)
      im.count = 0
      chessPieceMeshes[pieceType] = im

      return im
    },
  }))
