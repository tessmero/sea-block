/**
 * @file main.ts
 *
 * Entry point and main loop.
 */

import * as THREE from 'three'
import { Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GridLayout } from './grid-logic/grid-layout'
import { TileGroup } from './groups/tile-group'
import { SphereGroup } from './groups/sphere-group'
import { Sphere } from './sphere'
import { PIXEL_SCALE, CAMERA, CAMERA_LOOK_AT, STEP_DURATION } from './settings'
import { physicsConfig } from './configs/physics-config'
import { MichaelTG } from './generators/michael-tg'
import { buildScene, DebugElems } from './scene'
import { showControls } from './ui/controls-gui'
import { initMouseListeners, processMouse } from './ui/mouse-input'
import { getStyle } from './gfx/styles/styles-list'
import { CssStyle } from './gfx/styles/css-style'
import { ConfigItem } from './configs/config'
import { gridConfig } from './configs/grid-config'

export let style: CssStyle = getStyle(gridConfig.params.style.value)

let grid: GridLayout
let scene: THREE.Scene
let terrain: TileGroup
let sphereGroup: SphereGroup
let debugElems: DebugElems
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
const controls = new OrbitControls(
  camera,
  renderer.domElement,
)

const config = { params: {
  // grid: gridConfig,
  ...gridConfig.params,
  terrainGenerator: MichaelTG.getDefaultConfig(),
  physics: physicsConfig,
} }

/**
 *
 */
function reset() {
  const built = buildScene(config.params.terrainGenerator)

  grid = built.grid
  scene = built.scene
  terrain = built.terrain
  sphereGroup = built.sphereGroup
  debugElems = built.debugElems

  // Create a player sphere
  player = sphereGroup.members[0]
  sphereGroup.setInstanceColor(
    0,
    new THREE.Color(0xff0000),
  ) // Highlight player sphere
  lastPlayerPosition = player.position.clone()

  camera.position.set(
    lastPlayerPosition.x + CAMERA.x,
    CAMERA.y,
    lastPlayerPosition.z + CAMERA.z,
  )
}
reset()

function onCtrlChange(param: ConfigItem) {
  if (param.resetOnChange === 'full') {
    reset() // complete reset
  }
  else if (param.resetOnChange === 'physics') {
    sphereGroup.sim.resetParams()
    terrain.sim.resetParams()
  }
  else {
    // soft reset
    style = getStyle(gridConfig.params.style.value)
    scene.background = style.background
    terrain.resetColors()
    debugElems.refresh()
  }
}
showControls(
  config,
  onCtrlChange,
)

// Responsive resize
window.addEventListener(
  'resize',
  () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(
      window.innerWidth,
      window.innerHeight,
    )
  },
)

// listen for directional mouse/touch input
initMouseListeners(renderer.domElement)

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
  controls.target.set(x, CAMERA_LOOK_AT.y, z,
  )
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
  const dt = Math.min(50, currentTime - lastTime)
  const nSteps = Math.round(dt / STEP_DURATION)
  lastTime = currentTime

  controls.update() // orbit controls
  centerOnPlayer()
  processMouse({ terrain, player, camera, debugElems })

  // update physics
  terrain.update(nSteps)
  sphereGroup.update(nSteps)

  // render scene
  renderer.render(scene, camera)
}
animate()
