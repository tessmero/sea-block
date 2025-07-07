/**
 * @file sea-block.ts
 *
 * Main configurable object used in main.ts.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildScene } from './scene'
import type { ConfigItem, ConfigTree } from './configs/config-tree'
import { seaBlockConfig } from './configs/sea-block-config'
import { Configurable } from './configurable'
import type { Game } from './games/game'
import type { TerrainGenerator } from './generators/terrain-generator'
import type { CssStyle } from './gfx/styles/css-style'
import type { TileGroupRenderer } from './gfx/tile-group-renderer'
import type { SphereGroup } from './groups/sphere-group'
import type { TileGroup } from './groups/tile-group'
import type { DebugElems } from './scene'
import { allGames } from './games/games-list'
import type { allGenerators } from './generators/generators-list'
import { getGenerator } from './generators/generators-list'
import { getStyle } from './gfx/styles/styles-list'
import { initMouseListeners, processMouse } from './ui/mouse-input'
import { STEP_DURATION } from './settings'
import { showControls } from './ui/controls-gui'

let didConstruct = false
let didInit = false
let lastGeneratorName: keyof typeof allGenerators
let lastGameName: keyof typeof allGames

export class SeaBlock extends Configurable<typeof seaBlockConfig> {
  config = seaBlockConfig

  generator: TerrainGenerator<ConfigTree>
  style: CssStyle
  scene: THREE.Scene
  terrain: TileGroup
  tileRenderer: TileGroupRenderer
  sphereGroup: SphereGroup
  debugElems: DebugElems
  game: Game<ConfigTree>

  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  controls: OrbitControls

  constructor() {
    super()

    if (didConstruct) {
      throw new Error('SeaBlock constructed multiple times')
    }
    didConstruct = true
  }

  setGame(game: keyof typeof allGames) {
    this.flatConfig.game = game
    lastGameName = game
  }

  init() {
    if (didInit) {
      throw new Error('SeaBlock initialized multiple times')
    }
    didInit = true

    // load default settings
    lastGameName = this.flatConfig.game
    this.game = allGames[lastGameName]
    lastGeneratorName = this.flatConfig.generator
    this.generator = getGenerator(lastGeneratorName)
    this.style = getStyle(this.flatConfig.style) // default style depends on generator

    // Renderer
    const threeCanvas = document.getElementById('threeCanvas') as HTMLCanvasElement
    this.renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: false })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(1 / this.flatConfig.pixelScale)
    // document.body.appendChild(this.renderer.domElement)

    // orbit camera
    this.camera = new THREE.PerspectiveCamera(
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
    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    )

    // Responsive resize
    window.addEventListener(
      'resize',
      () => {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(
          window.innerWidth,
          window.innerHeight,
        )
      },
    )

    // listen for directional mouse/touch input
    initMouseListeners(this.renderer.domElement)
  }

  animate(dt: number) {
    const { renderer, scene, controls, terrain, camera, debugElems, sphereGroup, game } = this

    this.controls.update() // orbit camera controls
    const mouseState = processMouse({ terrain, camera, debugElems })
    game.update({ terrain, sphereGroup, camera, controls, mouseState, dt })

    // update physics
    const nSteps = Math.round(dt / STEP_DURATION)
    terrain.update(nSteps)
    sphereGroup.update(nSteps)

    // render scene
    renderer.render(scene, camera)
  }

  /**
   *
   */
  public reset() {
    const built = buildScene(this)

    this.scene = built.scene
    this.terrain = built.terrain
    this.tileRenderer = this.terrain.tileGroupRenderer
    this.sphereGroup = built.sphereGroup
    this.debugElems = built.debugElems

    this.debugElems.refresh(this.flatConfig.debug)
    this.game.refreshConfig()
    this.game.reset(this)
    this.game.resetCamera(this)
  }

  // called when user switches games
  public onGameChange() {
    this.game = allGames[this.flatConfig.game]

    this.game.refreshConfig()

    const { terrain, sphereGroup, camera, controls } = this
    this.game.reset({ terrain, sphereGroup, camera, controls })
  }

  // called when user switches terrain generators
  private onGeneratorChange() {
    this.generator = getGenerator(this.flatConfig.generator)

    // reload style in case default is selected, changes with generator
    this.style = getStyle(this.flatConfig.style)

    this.renderer.setPixelRatio(1 / this.flatConfig.pixelScale)
    this.reset() // full reset
    this.rebuildControls() // show new generator controls
  }

  // called when user changes a setting
  public onCtrlChange(item: ConfigItem) {
    const { tileRenderer, terrain, sphereGroup, renderer, scene, debugElems } = this

    this.refreshConfig()
    debugElems.refresh(this.flatConfig.debug)
    tileRenderer.refreshConfig()

    // check for special case: game changed
    const newGameName = this.flatConfig.game
    if (newGameName !== lastGameName) {
      lastGameName = newGameName
      this.onGameChange() // do special reset
      return // skip regular settings change below
    }
    else {
      this.game.refreshConfig() // refresh existing game
    }

    // check for special case: generator changed
    const newGenName = this.flatConfig.generator
    if (newGenName !== lastGeneratorName) {
      lastGeneratorName = newGenName
      this.onGeneratorChange() // do special reset
      return // skip regular setting change below
    }

    // check for regular setting change
    if (item.resetOnChange === 'full') {
      this.reset() // hard reset
    }
    else if (item.resetOnChange === 'physics') {
    // soft reset (physics)
      sphereGroup.sim.refreshConfig()
      terrain.sim.refreshConfig()
    }
    else {
    // soft reset (graphics)
      this.style = getStyle(this.flatConfig.style)
      renderer.setPixelRatio(1 / this.flatConfig.pixelScale)
      scene.background = this.style.background
      terrain.resetColors()
    }
  }

  public rebuildControls() {
    showControls(
      this.config,
      item => this.onCtrlChange(item),
    )
  }
}
