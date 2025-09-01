/**
 * @file freecam-pickable-meshes.ts
 *
 * Unique meshes that appear on terrain in free-cam mode,
 * Clicking them opens a prompt to start a game.
 */

import { playSound } from 'audio/sound-effect-player'
import { getOutlinedMesh } from 'games/chess/gfx/chess-outline-gfx'
import type { GameElement } from 'games/game'
import { setMaterial } from 'gfx/3d/gui-3d-gfx-helper'
import { getMesh } from 'gfx/3d/mesh-asset-loader'
import type { ElementEvent } from 'guis/gui'
import type { SeaBlock } from 'sea-block'
import type { Object3D } from 'three'
import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three'
import { grabbedMeshElements, updateGrabbedMeshDiagram } from './freecam-grabbed-mesh-dialog'
import type { ImageAssetUrl } from 'gfx/2d/image-asset-urls'
import { allPickableParams } from './freecam-pickables'
import type { MeshAssetUrl } from 'gfx/3d/mesh-asset-urls'

export const PICKABLE_NAMES = ['rook', 'thruster'] as const
export type PickableName = (typeof PICKABLE_NAMES)[number]

// params for one pickable
export type PickableParams = {
  model: MeshAssetUrl
  position: Vector3
  icon: ImageAssetUrl
  iconOffset: [number, number]
  title: string
  subtitle: string
  playAction: (seaBlock: SeaBlock) => void
}

const flashSpeed = 5e-3 // ~ 1/ms
const pickableFlashColors = [new Color(0x555555), new Color(0xaaaaaa)] as const
const pickableMat = new MeshBasicMaterial({ color: pickableFlashColors[0] })
const hoveredMat = new MeshBasicMaterial({ color: 0xaaaaaa })

// always-in-front material when locked to gui
const grabbedMat = new MeshBasicMaterial({
  color: 0xdddddd,
  depthTest: false,
})

let grabbedMeshName: PickableName | undefined = undefined
let hasGrabbedMeshReachedTarget = true
const posDummy = new Vector3()

const quatDummy = new Quaternion()

export function initFreecamPickables(_context: SeaBlock) {
  // const { x, y, z } = context.orbitControls.target
  // if (!hasSetOriginalPickablePos) {
  //   hasSetOriginalPickablePos = true
  //   originalTargetMeshPosition.set(x, y + 2, z)
  // }

  for (const name of PICKABLE_NAMES) {
    const pickablePieceMesh = freecamPickableElements[name].mesh
    const targetMesh = targetElements[name].mesh

    if (!pickablePieceMesh) {
      throw new Error('missing pickablePieceMesh for freecam pickable')
    }
    if (!targetMesh) {
      throw new Error('missing targetMesh for freecam pickable')
    }
    targetMesh.position.copy(allPickableParams[name].position)
    pickablePieceMesh.position.copy(targetMesh.position)
  }
}

export function updateFreecamPickables(dt: number) {
  // flashing animation
  pickableMat.color.lerpColors(...pickableFlashColors,
    0.5 + 0.5 * Math.sin(performance.now() * flashSpeed))

  for (const name of PICKABLE_NAMES) {
    const pickablePieceMesh = freecamPickableElements[name].mesh
    const targetMesh = targetElements[name].mesh

    if (!pickablePieceMesh) {
      throw new Error('missing pickablePieceMesh for freecam pickable')
    }
    if (!targetMesh) {
      throw new Error('missing targetMesh for freecam pickable')
    }

    targetMesh.getWorldPosition(posDummy)
    targetMesh.getWorldQuaternion(quatDummy)
    if (hasGrabbedMeshReachedTarget) {
    // fixed at point on screen
      pickablePieceMesh.position.copy(posDummy)
      pickablePieceMesh.quaternion.copy(quatDummy)
    }
    else {
    // move towards point on screen
      pickablePieceMesh.position.lerp(posDummy, 0.01 * dt)
      pickablePieceMesh.quaternion.slerp(quatDummy, 0.01 * dt)
      if (name === grabbedMeshName
        && posDummy
          .subVectors(posDummy, pickablePieceMesh.position)
          .lengthSq() < 1e-2
      ) {
        hasGrabbedMeshReachedTarget = true // reached target point on screen
      }
    }
  }
}

const resultPosDummy = new Vector3()
export function getNearestFreecamPickable(targetPos: Vector3):
{ name: PickableName, pos: Vector3, distSq: number } {
  const result = {
    name: PICKABLE_NAMES[0] as PickableName,
    pos: resultPosDummy,
    distSq: Infinity,
  }

  for (const [name, { mesh }] of Object.entries(freecamPickableElements)) {
    if (!mesh) continue

    // check distance considering x and z only
    const d2 = posDummy.copy(mesh.position).sub(targetPos).setY(0).lengthSq()
    if (d2 < result.distSq) {
      result.name = name as PickableName
      result.pos.copy(mesh.position)
      result.distSq = d2
    }
  }

  return result
}

export function getPickablePieceMeshPosition(name: PickableName): Vector3 | undefined {
  const pickablePieceMesh = freecamPickableElements[name].mesh
  if (!pickablePieceMesh) return undefined
  return pickablePieceMesh.getWorldPosition(new Vector3())
}
// let outlineMesh: Mesh

export const freecamPickableElements = Object.fromEntries(
  PICKABLE_NAMES.map(name => [
    name,
    _buildPickableElement(name, allPickableParams[name]),
  ]),
) as Record<PickableName, GameElement>

// element to include in free-cam-game
function _buildPickableElement(name: PickableName, params: PickableParams): GameElement {
  return {
    meshLoader: async () => {
      return _buildPickableMesh(name, params)
    },
    defaultMat: pickableMat,
    hoverMat: hoveredMat,
    clickAction: e => _pickableClicked(e, name, params),
  }
}

function _buildPickableMesh(name: PickableName, params: PickableParams): Object3D {
  let pickablePieceMesh = getMesh(params.model).clone()

  pickablePieceMesh.traverse((child) => {
    if (child instanceof Mesh) {
      child.geometry = child.geometry.clone()
      child.geometry.center()
      child.geometry.rotateY(Math.PI * 0.5) // make thruster look good
    }
  })

  const scale = 1
  pickablePieceMesh.scale.set(scale, scale, scale)

  // add black outline effect
  pickablePieceMesh = getOutlinedMesh(pickablePieceMesh)

  setMaterial(pickablePieceMesh, pickableMat)

  return pickablePieceMesh
}

function _pickableClicked(
  { seaBlock }: ElementEvent,
  pickableName: PickableName,
  _params: PickableParams,
) {
  playSound('click')
  if (targetElements[pickableName].layoutKey === 'grabbedMesh') {
    _ungrabPickable(seaBlock)
    return
  }

  // ungrab any existing
  _ungrabPickable(seaBlock)

  // start moving picked mesh to camera
  targetElements[pickableName].layoutKey = 'grabbedMesh'

  // set materials
  const elem = freecamPickableElements[pickableName]
  elem.defaultMat = grabbedMat
  elem.hoverMat = grabbedMat
  setMaterial(elem, grabbedMat)
  // outlineMesh.material = outlineMat

  grabbedMeshName = pickableName
  hasGrabbedMeshReachedTarget = false // start smooth lerp

  // show chess game launch prompt
  grabbedMeshElements.forEach(({ display }) => {
    display.isVisible = true
    display.needsUpdate = true
  })

  // show relevant diagram
  updateGrabbedMeshDiagram(grabbedMeshName)
}

export function cancelClicked({ seaBlock }: ElementEvent) {
  // restore original mesh position

  playSound('click')
  _ungrabPickable(seaBlock)
}

// user clicked a pickable then clicked 'play'
export function playClicked({ seaBlock }: ElementEvent) {
  playSound('click')

  const name = grabbedMeshName

  // restore original mesh position
  _ungrabPickable(seaBlock)
  // targetElement.layoutKey = undefined
  // targetMesh.position.copy(originalTargetMeshPosition)

  // FreeCamGame.hasGrabbedMeshReachedTarget = false // start smooth lerp

  // // close display
  // for (const { display } of grabbedMeshElements) {
  //   display.isVisible = false
  // }

  // to pickable-specific action
  if (name) {
    allPickableParams[name].playAction(seaBlock)
  }
}

function _ungrabPickable(seaBlock: SeaBlock) {
  // if (targetElement.layoutKey === undefined) {
  //   return
  // }

  for (const [name, elem] of Object.entries(targetElements)) {
    elem.layoutKey = undefined
    if (elem.mesh) {
      const params = allPickableParams[name as PickableName]
      elem.mesh.position.copy(params.position)
    }
  }

  // restore default materials
  for (const elem of Object.values(freecamPickableElements)) {
    elem.defaultMat = pickableMat
    elem.hoverMat = hoveredMat
    setMaterial(elem, pickableMat)
  }
  // outlineMesh.material = outlineMat

  hasGrabbedMeshReachedTarget = false // start smooth lerp

  for (const { display } of grabbedMeshElements) {
    display.isVisible = false
  }
  seaBlock.layeredViewport.handleResize(seaBlock)
}

// targets that instantly jump from terrain to gui
export const targetElements = Object.fromEntries(PICKABLE_NAMES.map(name => [
  name,
  _buildTargetElement(name, allPickableParams[name]),
])) as Record<PickableName, GameElement>

function _buildTargetElement(name: PickableName, params: PickableParams): GameElement {
  const targetElement: GameElement = {

    meshLoader: async () => {
      const targetMesh = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshBasicMaterial({ color: 0xff0000 }),
      )
      targetMesh.position.copy(params.position)
      targetMesh.visible = false
      return targetMesh
    },
  }
  return targetElement
}
