import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BoxTerrain } from './box-terrain'
import { Sphere } from './sphere'
import { SphereGroup } from './sphere-group'
import { TerrainGridConfig } from './terrain-grid-config'
import {
  CAMERA, CAMERA_LOOK_AT, PIXEL_SCALE, STEP_DURATION,
} from './settings'
import { MichaelTG } from './michael-tg'
import { buildScene } from './scene'
import { Vector } from './vector'
import { NumericParam, showControls } from './controls'
import { updatePlayerMovement, initMouseListeners } from './mouse'

let grid: TerrainGridConfig
let scene: THREE.Scene
let terrain: BoxTerrain
let sphereGroup: SphereGroup
let debugPoint: THREE.Object3D
let player: Sphere
let lastPlayerPosition: Vector

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
function reset() {
  const built = buildScene(config)
  grid = built.grid
  scene = built.scene
  terrain = built.terrain
  sphereGroup = built.sphereGroup
  debugPoint = built.debugPoint

  // Create a player sphere
  player = sphereGroup.spheres[0]
  sphereGroup.setInstanceColor(0, new THREE.Color(0xff0000)) // Highlight player sphere
  lastPlayerPosition = { ...player.position }

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

function centerOnPlayer() {
  if (!player) return

  const { x, z } = player.position
  camera.position.set(
    x + (camera.position.x - lastPlayerPosition.x),
    camera.position.y, // y + (camera.position.y - lastPlayerPosition.y),
    z + (camera.position.z - lastPlayerPosition.z),
  )
  lastPlayerPosition = { ...player.position }
  controls.target.set(x, CAMERA_LOOK_AT.y, z)
  controls.update()

  const { tileX, tileZ } = grid.positionToCoord(player.position.x, player.position.z)
  terrain.panToCenter(tileX, tileZ)
}
centerOnPlayer()

// Animation loop
let lastTime = performance.now()
function animate() {
  requestAnimationFrame(animate)

  // Calculate delta time
  const currentTime = performance.now()
  const dt = Math.min(100, (currentTime - lastTime))
  const nSteps = Math.round(dt / STEP_DURATION)
  lastTime = currentTime

  centerOnPlayer()
  const pickedPoint = updatePlayerMovement(player, camera)
  if (pickedPoint) {
    debugPoint.position.copy(pickedPoint)
  }

  // update physics
  controls.update()
  for (let i = 0; i < nSteps; i++) {
    terrain.step()
    sphereGroup.step()
  }

  // update instancedmeshes and render
  terrain.updateMesh()
  sphereGroup.updateMesh()

  terrain.mesh.frustumCulled = false
  sphereGroup.mesh.frustumCulled = false

  renderer.render(scene, camera)
}
animate()
