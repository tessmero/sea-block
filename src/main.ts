/**
 * @file main.ts
 *
 * Entry point and main loop.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TileGroup } from './groups/tile-group'
import { SphereGroup } from './groups/sphere-group'
import { physicsConfig } from './configs/physics-config'
import { buildScene, DebugElems } from './scene'
import { showControls } from './ui/controls-gui'
import { initMouseListeners, processMouse } from './ui/mouse-input'
import { getStyle } from './gfx/styles/styles-list'
import { CssStyle } from './gfx/styles/css-style'
import { ConfigChildren, ConfigItem, ConfigTree } from './configs/config-tree'
import { gridConfig } from './configs/grid-config'
import { TerrainGenerator } from './generators/terrain-generator'
import { getGenerator } from './generators/generators-list'
import { gfxConfig, gfxConfigTree } from './configs/gfx-config'
import { SphereGame, sphereGameConfig } from './games/sphere-game'
import { STEP_DURATION } from './settings'

// load default settings
export let generator: TerrainGenerator<ConfigTree>
export let style: CssStyle
let scene: THREE.Scene
let terrain: TileGroup
let sphereGroup: SphereGroup
let debugElems: DebugElems
const game = new SphereGame()

let generatorName = gridConfig.children.generator.value
generator = getGenerator(generatorName)
style = getStyle(gfxConfig.flatValues.style) // default style depends on generator

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(1 / gfxConfig.flatValues.pixelScale)
document.body.appendChild(renderer.domElement)

// orbit camera
const camera = new THREE.PerspectiveCamera(
  60, // FOV
  window.innerWidth / window.innerHeight, // aspect
  0.1, // near
  1000, // far
)
// const camera = new THREE.OrthographicCamera(
//   window.innerWidth / - 2, window.innerWidth / 2,
//   window.innerHeight / 2, window.innerHeight / - 2,
//   1, // near
//   1000, //far
// );
const controls = new OrbitControls(
  camera,
  renderer.domElement,
)

/**
 *
 */
function reset() {
  const built = buildScene()

  scene = built.scene
  terrain = built.terrain
  sphereGroup = built.sphereGroup
  debugElems = built.debugElems

  game.refreshConfig()
  game.reset({ terrain, sphereGroup, camera, controls })
}

reset()

// called when user switches terrain generators
function onGeneratorChange() {
  // get TerrainGenerator instance
  generator = getGenerator(generatorName)

  // reload style in case default is selected, changes with generator
  style = getStyle(gfxConfig.flatValues.style)

  renderer.setPixelRatio(1 / gfxConfig.flatValues.pixelScale)
  reset() // full reset
  rebuildControls() // show new generator controls
}

// called when user changes a setting
function onCtrlChange(item: ConfigItem) {
  gfxConfig.updateFlatValues()

  // check for special case: generator changed
  const newGenName = gridConfig.children.generator.value
  if (newGenName !== generatorName) {
    generatorName = newGenName
    onGeneratorChange() // do special reset
    return // skip regular setting change below
  }

  // check for regular setting change
  if (item.resetOnChange === 'full') {
    reset() // hard reset
  }
  else if (item.resetOnChange === 'physics') {
    // soft reset (physics)
    game.refreshConfig()
    sphereGroup.sim.refreshConfig()
    terrain.sim.refreshConfig()
  }
  else {
    // soft reset (graphics)
    style = getStyle(gfxConfig.flatValues.style)
    renderer.setPixelRatio(1 / gfxConfig.flatValues.pixelScale)
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
    ...gridConfig.children,
    ...sphereGameConfig.children,
    gfxConfigTree,
    physicsConfig,
  }

  if (generator.config) {
    displayTree.generatorConfig = generator.config
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

  controls.update() // orbit camera controls
  const mouseState = processMouse({ terrain, camera, debugElems })
  game.update({ terrain, sphereGroup, camera, controls, mouseState, dt })

  // update physics
  terrain.update(nSteps)
  sphereGroup.update(nSteps)

  // render scene
  renderer.render(scene, camera)
}
animate()
