/**
 * @file main.ts
 *
 * Entry point and main loop.
 */

import * as THREE from 'three'
import { Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TerrainGridIndex } from './grid-logic/terrain-grid-index'
import { TileGroup } from './groups/tile-group'
import { SphereGroup } from './groups/sphere-group'
import { Sphere } from './sphere'
import { PIXEL_SCALE, CAMERA, CAMERA_LOOK_AT, STEP_DURATION } from './settings'
import { MichaelTG } from './generators/michael-tg'
import { buildScene } from './scene'
import { NumericParam, showControls } from './ui/controls-gui'
import { initMouseListeners, updatePlayerMovement } from './ui/mouse-input'

let grid: TerrainGridIndex
let scene: THREE.Scene
let terrain: TileGroup
let sphereGroup: SphereGroup
let debugPoint: THREE.Object3D
let player: Sphere
let lastPlayerPosition: Vector3

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(1 / PIXEL_SCALE)
document.body.appendChild(renderer.domElement)

// orbit camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)
const controls = new OrbitControls(camera, renderer.domElement)

const config = MichaelTG.getDefaultConfig()
/**
 *
 */
function reset() {
  const built = buildScene(config)
  grid = built.grid
  scene = built.scene
  terrain = built.terrain
  sphereGroup = built.sphereGroup
  debugPoint = built.debugPoint

  // Create a player sphere
  player = sphereGroup.members[0]
  sphereGroup.setInstanceColor(0, new THREE.Color(0xff0000)) // Highlight player sphere
  lastPlayerPosition = player.position.clone()

  camera.position.set(
    lastPlayerPosition.x + CAMERA.x,
    CAMERA.y,
    lastPlayerPosition.z + CAMERA.z)
}
reset()

function onCtrlChange(param: NumericParam) {
  if (param.graphical) {
    terrain.resetColors() // only reset colors
  }
  else {
    reset() // complete reset
  }
}
showControls(config, onCtrlChange)

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// listen for directional mouse/touch input
initMouseListeners()

// // listen for mouse clicks to hit tiles
// const mouse = new THREE.Vector2()
// const raycaster = new THREE.Raycaster()
// window.addEventListener('click', (event) => {
//   // pick tile on terrain
//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1
//   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
//   raycaster.setFromCamera(mouse, camera)
//   terrain.mesh.computeBoundingSphere()
//   const intersects = raycaster.intersectObject(terrain.mesh)
//   const instanceId = intersects[0]?.instanceId

//   if (instanceId) {
//     const { x, z } = grid.indexToXZ(instanceId)
//     console.log(x, z)
//   }
//   else {
//     console.log('No tile hit')
//   }
// })

/**
 *
 */
function centerOnPlayer() {
  if (!player) return

  const { x, z } = player.position
  camera.position.set(
    x + (camera.position.x - lastPlayerPosition.x),
    camera.position.y, // y + (camera.position.y - lastPlayerPosition.y),
    z + (camera.position.z - lastPlayerPosition.z),
  )
  lastPlayerPosition = player.position.clone()
  controls.target.set(x, CAMERA_LOOK_AT.y, z)
  controls.update()

  const { tileX, tileZ } = grid.positionToCoord(player.position.x, player.position.z)
  terrain.panToCenter(tileX, tileZ)
}
centerOnPlayer()

// Animation loop
let lastTime = performance.now()
/**
 *
 */
function animate() {
  requestAnimationFrame(animate)

  // Calculate delta time
  const currentTime = performance.now()
  const dt = Math.min(50, (currentTime - lastTime))
  const nSteps = Math.round(dt / STEP_DURATION)
  lastTime = currentTime

  controls.update()
  centerOnPlayer()
  const pickedPoint = updatePlayerMovement(player, camera)
  if (pickedPoint) {
    debugPoint.position.copy(pickedPoint)
  }

  // update physics
  terrain.update(nSteps)
  sphereGroup.update(nSteps)

  // update instancedmeshes
  terrain.updateMesh()
  sphereGroup.updateMesh()
  terrain.mesh.frustumCulled = false
  sphereGroup.mesh.frustumCulled = false

  // render scene
  renderer.render(scene, camera)
}
animate()
