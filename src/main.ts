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
import { buildScene, DebugElems } from './scene'
import { showControls } from './ui/controls-gui'
import { initMouseListeners, processMouse } from './ui/mouse-input'
import { getStyle } from './gfx/styles/styles-list'
import { CssStyle } from './gfx/styles/css-style'
import { ConfigChildren, ConfigItem } from './configs/config-tree'
import { gridConfig } from './configs/grid-config'
import { TerrainGenerator } from './generators/terrain-generator'
import { getGenerator } from './generators/generators-list'

export let generator: TerrainGenerator
export let style: CssStyle
let grid: GridLayout
let scene: THREE.Scene
let terrain: TileGroup
let sphereGroup: SphereGroup
let debugElems: DebugElems
let player: Sphere
let lastPlayerPosition: Vector3

let generatorName = gridConfig.flatValues.generator
generator = getGenerator(generatorName)
style = getStyle(gridConfig.flatValues.style) // default style depends on generator

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(1 / PIXEL_SCALE)
document.body.appendChild(renderer.domElement)

// orbit camera
const camera = new THREE.PerspectiveCamera(
  60, // FOV
  window.innerWidth / window.innerHeight, // aspect
  0.1, // near
  1000, // far
)
const controls = new OrbitControls(
  camera,
  renderer.domElement,
)

/**
 *
 */
function reset() {
  const built = buildScene()

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

// called when user switches terrain generators
function onGeneratorChange(generatorName: string) {
  // get TerrainGenerator instance
  generator = getGenerator(generatorName)

  // reload style in case default is selected, changes with generator
  style = getStyle(gridConfig.flatValues.style)

  reset() // full reset
  rebuildControls() // show new generator controls
}

// called when user changes a setting
function onCtrlChange(param: ConfigItem) {
  // check for special case: generator changed
  gridConfig.updateFlatValues()
  const newGenName = gridConfig.flatValues.generator
  if (newGenName !== generatorName) {
    generatorName = newGenName
    onGeneratorChange(generatorName) // do special reset
    return // skip regular setting change below
  }

  // check for regular setting change
  if (param.resetOnChange === 'full') {
    reset() // hard reset
  }
  else if (param.resetOnChange === 'physics') {
    // soft reset (physics)
    physicsConfig.updateFlatValues()
  }
  else {
    // default soft reset (graphics)
    style = getStyle(gridConfig.flatValues.style)
    scene.background = style.background
    terrain.resetColors()
    debugElems.refresh()
  }
}

function rebuildControls() {
  const topLinks: ConfigChildren = {
    firstLink: { // link to this repo
      label: 'tessmero/sea-block (Viewer)',
      action: () => { window.open('https://github.com/tessmero/sea-block', '_blank') },
      noEffect: true, // doesn't effect seablock
    },
    secondLink: { // link to terrain generator
      label: generator.label,
      action: () => { window.open(generator.url, '_blank') },
      noEffect: true,
    },
  }

  const displayTree: ConfigChildren = {
    ...topLinks, // buttons
    ...gridConfig.tree.children, // unpack grid/style controls at top level
    physics: physicsConfig.tree,
  }

  if (generator.config) {
    displayTree.terrainGenerator = generator.config.tree
  }

  showControls(
    { children: displayTree },
    onCtrlChange,
  )
}
rebuildControls()

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
