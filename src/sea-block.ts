/**
 * @file sea-block.ts
 *
 * Main object constructed once in main.ts.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Gui } from 'guis/gui'
import { preloadPixelTiles } from 'gfx/2d/pixel-tiles-gfx-helper'
import { isDevMode } from 'configs/top-config'
import type { ConfigButton, ConfigItem } from './configs/config-tree'
import { TerrainGenerator } from './generators/terrain-generator'
import type { TileGroupGfxHelper } from './gfx/3d/tile-group-gfx-helper'
import { getStyle, STYLES } from './gfx/styles/styles-list'
import type { ProcessedSubEvent } from './mouse-touch-input'
import { initMouseListeners } from './mouse-touch-input'
import { CAMERA, GRID_DETAIL, PORTRAIT_CAMERA, STEP_DURATION } from './settings'
import { Transition } from './gfx/transition'
import { randomTransition } from './gfx/transition'
import { GAME, GUI, type GameName, type GeneratorName } from './imp-names'
import { Game } from './games/game'
import type { LayeredViewport } from './gfx/layered-viewport'
import { StartSequenceGame } from './games/imp/start-sequence-game'
import { freeCamGameConfig } from './configs/free-cam-game-config'
import { seaBlockConfig } from './configs/sea-block-config'
import type { SeablockScene } from './gfx/3d/scene'
import { buildScene } from './gfx/3d/scene'
import { SphereGroup } from './core/groups/sphere-group'
import { TileGroup } from './core/groups/tile-group'
import { showDebugControls } from './util/debug-controls'
import type { StyleParser } from './util/style-parser'
import { FloraGroup } from './core/groups/flora-group'
import { Tiling } from './core/grid-logic/tilings/tiling'
import { TiledGrid } from './core/grid-logic/tiled-grid'
import { gfxConfig } from './configs/gfx-config'
import { physicsConfig } from './configs/physics-config'
import { updateFrontLayer } from './gfx/2d/flat-gui-gfx-helper'

// can only be constructed once
let didConstruct = false
let didInit = false

// all game-specific meshes and images, loaded once on startup
// const elementsPerGame: Record<string, Array<LoadedElement>> = {}

// container for some meshes, locked to screen instead of world
const cameraLockedGroup = new THREE.Group()

// type LoadedElement = LoadedMesh | LoadedImage

// // result of loading a DepthElement (game.ts)
// type LoadedMesh = {
//   mesh: CompositeMesh | THREE.Object3D
//   layoutKey?: string // optional, indicates camera-locked
//   clickAction?: (SeaBlock) => void
//   unclickAction?: (SeaBlock) => void
//   hotkeys?: ReadonlyArray<string>
// }

export class SeaBlock {
  public didLoadAssets = false
  public readonly config = seaBlockConfig

  // public isSettingsMenuVisible = false
  // public toggleMenu() {
  //   if (!settingsGui) {
  //     settingsGui = Gui.create('settings-menu')
  //   }
  //   settingsGui.resetElementStates()
  //   this.isSettingsMenuVisible = !this.isSettingsMenuVisible
  //   settingsGui.refreshLayout(this)
  //   resetFrontLayer()

  //   // clear front layer
  //   const { ctx, w, h } = this.layeredViewport
  //   ctx.clearRect(0, 0, w, h)
  // }

  // properties assigned in init
  currentGeneratorName!: GeneratorName
  generator!: TerrainGenerator
  style!: StyleParser
  scene!: SeablockScene
  terrain!: TileGroup
  tileGfx!: TileGroupGfxHelper
  floraGroup!: FloraGroup
  sphereGroup!: SphereGroup
  currentGameName!: GameName
  camera!: THREE.PerspectiveCamera
  orbitControls!: OrbitControls
  game!: Game // current game

  // defined only during transition sequence
  transition?: Transition

  constructor(public readonly layeredViewport: LayeredViewport) {
    if (didConstruct) {
      throw new Error('SeaBlock constructed multiple times')
    }
    didConstruct = true

    layeredViewport.init(this)
  }

  // used at natural start sequence end, to switch to free cam without transition
  setGame(game: GameName) {
    this.config.tree.children.game.value = game
    this.config.flatConfig.game = game
    this.currentGameName = game
  }

  init() {
    if (didInit) {
      throw new Error('SeaBlock initialized multiple times')
    }
    didInit = true

    // load default settings
    this.currentGameName = this.config.flatConfig.game
    // this.game = Game.create(this.currentGameName, this)
    this.currentGeneratorName = this.config.flatConfig.generator
    this.generator = TerrainGenerator.create(this.currentGeneratorName)

    // default style depends on generator
    STYLES.default = this.generator.style
    this.style = getStyle(this.config.flatConfig.style)

    // orbit camera
    this.camera = new THREE.PerspectiveCamera(
      60, // FOV
      window.innerWidth / window.innerHeight, // aspect
      0.1, // near
      1000, // far
    )

    this.orbitControls = new OrbitControls(
      this.camera,
      this.layeredViewport.backCanvas,
    )
    this.orbitControls.enabled = false

    // Responsive resize
    window.addEventListener('resize', () => this.onResize())

    const loadPromises: Array<Promise<void | Array<void>>> = []
    loadPromises.push(preloadPixelTiles(Tiling.getAllShapes()))

    // start generating images/meshes for all guis
    for (const guiName of GUI.NAMES) {
      loadPromises.push(Gui.preload(guiName, this))
    }

    // start generating meshes for all games
    for (const gameName of GAME.NAMES) {
      loadPromises.push(Game.preload(gameName, this))
    }

    Promise.all(
      Object.values(loadPromises),

      // Object.entries(loadPromises).map(async ([gameName, promises]) => {
      //   elementsPerGame[gameName] = await Promise.all(promises)
      // }),

    ).then(() => this.onFinishLoading())
  }

  public isCovering = false // true during first half of transition animation

  async animate(dt: number) {
    const { transition,
      scene, camera, terrain, sphereGroup, floraGroup,
      game,
    } = this

    if (transition) {
      transition.update(dt)
      if (this.isCovering && transition.didFinishCover) {
        // just hit mid-transition, old scene hidden
        // console.log('mid transition')
        this.isCovering = false
        await this.onMidTransition()
        // resetFrontLayer()
        transition.cleanupHide()
        // this.rebuildControls()
      }
      if (transition.didFinishUncover) {
        // console.log('finish transition')
        this.transition = undefined // transition just finished
        // this.onResize()
        // resetFrontLayer()
      }
    }
    else {
      // not in transition
      updateFrontLayer(this)
    }

    // orbit camera controls
    // if (!this.game.gui.clickedBtn) {
    //   this.orbitControls.update()
    // }

    // update game
    game.update({ seaBlock: this, dt })

    scene.update(this.orbitControls.target)

    // update game's camera-locked meshes
    // alignGuiGroup(cameraLockedGroup, this.camera)

    // update physics
    const nSteps = Math.round(dt / STEP_DURATION)
    terrain.update(this, dt, nSteps)
    floraGroup.update(this, dt, nSteps)
    sphereGroup.update(this, dt, nSteps)

    // render scene
    this.layeredViewport.backRenderer.render(scene.threeScene, camera)

    // debug
    // const dist = camera.position.distanceTo(this.orbitControls.target)
    // console.log(dist)
  }

  public startTransition() {
    this.transition = randomTransition(this)
    this.isCovering = true
    updateFrontLayer(this)
  }

  private onResize() {
    const { layeredViewport, camera } = this
    layeredViewport.handleResize(this)

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    if (this.currentGameName === 'free-cam') {
      // reset camera distance (keep scene in view for portrait phone)
      const { w, h } = this.layeredViewport
      const preset = h > w ? PORTRAIT_CAMERA : CAMERA
      this.setCameraDistance(preset.length())
    }

    // recompute visible layouts
    // this.game.gui.refreshLayout(this)
    for (const gui of this.getLayeredGuis()) {
      gui.refreshLayout(this)
    }

    // updateFrontLayer(this)
    this.transition?.cleanupHide()

    // // align camera-locked meshes
    // for (const [_gameName, elems] of Object.entries(elementsPerGame)) {
    //   for (const loaded of elems) {
    //     if ('mesh' in loaded) {
    //       // 3d object
    //       if (loaded.layoutKey) {
    //         const rect = this.game.layoutRectangles[loaded.layoutKey]
    //         alignMeshInGuiGroup(loaded.mesh, cameraLockedGroup, rect)
    //       }
    //     }
    //     else {
    //       // flat image
    //     }
    //   }
    // }
  }

  public setCameraDistance(distance: number) {
    const { camera, orbitControls: controls } = this
    const direction = camera.position.clone().sub(controls.target).normalize()
    camera.position.copy(controls.target).add(direction.multiplyScalar(distance))
    controls.update()
  }

  private onFinishLoading() {
    // console.log(`seablock onFinishLoading`)

    // listen for mouse/touch, process in 3d, pass through gui layers then orbit controls
    initMouseListeners(this)

    // listen for keyboard, pass directly to gui
    window.addEventListener('keydown', (event) => {
      this.game.gui.keydown(this, event)
    })
    window.addEventListener('keyup', (event) => {
      this.game.gui.keyup(this, event)
    })

    // finished loading meshes and images
    this.didLoadAssets = true
    // for (const [_gameName, elems] of Object.entries(elementsPerGame)) {
    //   for (const loadedElement of elems) {
    //     if ('mesh' in loadedElement) {
    //       // 3d object
    //       const { mesh, layoutKey } = loadedElement
    //       if (layoutKey) {
    //         // locked to camera
    //         cameraLockedGroup.add(mesh)
    //         const rect = this.game.gui.layoutRectangles[layoutKey]
    //         alignMeshInGuiGroup(mesh, cameraLockedGroup, rect)
    //       }
    //       else {
    //         // not locked to camera
    //         this.scene.add(mesh)
    //       }
    //     }
    //     else {
    //       // 2d flat button
    //     }
    //   }
    // }
    this.showHideGameSpecificElems()
  }

  /**
   *
   */
  public reset() {
    const tiling = Tiling.create(this.config.flatConfig.tiling)
    const grid = new TiledGrid(GRID_DETAIL, GRID_DETAIL, tiling)
    this.terrain = new TileGroup(grid, this).build()
    this.floraGroup = new FloraGroup(this.terrain).build()
    this.sphereGroup = new SphereGroup(10, this.terrain).build()

    // this.debugElems.refresh(this.config.flatConfig.debug)
    // if (!this.game) {
    this.game = Game.create(this.currentGameName, this)
    // }

    this.scene = buildScene(this)
    this.scene.setBackground(this.style.getBackgroundColor())
    this.scene.add(cameraLockedGroup)
    this.tileGfx = this.terrain.gfxHelper

    // this.game.refreshConfig()
    freeCamGameConfig.refreshConfig()
    // this.game.reset(this)
    this.game.resetCamera(this)
    if (this.game.doesAllowOrbitControls(this)) {
      this.orbitControls.enabled = true
    }
    // this.game.gui.refreshLayout(this.layeredViewport)
  }

  // called when user switches games
  public onGameChange() {
    this.scene.threeScene.remove(...this.game.meshes)
    this.game = Game.create(this.config.flatConfig.game, this)
    this.scene.threeScene.add(...this.game.meshes)
    this.showHideGameSpecificElems()
    this.layeredViewport.handleResize(this)
    this.terrain.gfxHelper.restoreTileColors() // remove chess allowed-move highlights
  }

  private showHideGameSpecificElems() {
    // for (const [gameName, elements] of Object.entries(elementsPerGame)) {
    //   const shouldBeVisible = gameName === this.currentGameName
    //   for (const loaded of elements) {
    //     if ('mesh' in loaded) {
    //       // 3d object
    //       loaded.mesh.visible = shouldBeVisible
    //     }
    //     else {
    //       // flat image
    //     }
    //   }
    // }
  }

  // called when user changes a setting
  public onCtrlChange(item: ConfigItem | ConfigButton) {
    const { generator, terrain, scene } = this

    this.config.refreshConfig()
    // debugElems.refresh(this.config.flatConfig.debug)
    gfxConfig.refreshConfig()
    generator.refreshConfig()

    for (const gui of this.getLayeredGuis()) {
      gui.resetElementStates()
    }

    // check for special case: game changed
    const newGameName = this.config.flatConfig.game
    if (newGameName !== this.currentGameName) {
      this.currentGameName = newGameName
      this.onGameChange() // do special reset
      return // skip regular settings change below
    }
    else {
      // this.game.refreshConfig() // refresh existing game
      freeCamGameConfig.refreshConfig()
      this.orbitControls.enabled = this.game.doesAllowOrbitControls(this)
    }

    // check for regular setting change
    if (item.resetOnChange === 'full') {
      if (this.config.flatConfig.transitionMode === 'skip') {
        // skip transition
        this.onMidTransition()
        return // update done with midtransition
      }
      else {
        // start transition
        this.transition = Transition.create('flat', this)
        this.isCovering = true
        return // wait for mid transition to actually update
      }
    }
    else if (item.resetOnChange === 'physics') {
      // soft reset (physics)
      physicsConfig.refreshConfig()
    }
    else {
      // soft reset (graphics)
      StartSequenceGame.isColorTransformEnabled = false
      this.style = getStyle(this.config.flatConfig.style)
      scene.setBackground(this.style.getBackgroundColor())
      terrain.resetColors()
      this.onResize()
    }

    // allow any config change to escape from special start seq colors
    StartSequenceGame.isColorTransformEnabled = this.currentGameName === 'start-sequence'
  }

  private async onMidTransition() {
    if (this.currentGameName === 'splash-screen') {
      this.currentGameName = 'free-cam'

      // special case, just clicked "launch"
      // replace back canvas and renderer
      const renderer = this.layeredViewport.backRenderer
      renderer.dispose()
      renderer.domElement.remove()
      const newCanvas = document.createElement('canvas') as HTMLCanvasElement
      newCanvas.id = 'backCanvas'
      document.body.appendChild(newCanvas)
      this.layeredViewport.backCanvas = newCanvas
      this.layeredViewport.backRenderer = new THREE.WebGLRenderer({
        canvas: this.layeredViewport.backCanvas,
        antialias: false,
      })
      this.orbitControls.domElement = newCanvas

      // fullscreen
      if (!isDevMode) { // fullscreen
        document.documentElement.requestFullscreen()
      }

      // wait two animation frames
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve()
          })
        })
      })
    }

    const { generator, terrain, scene } = this

    // if (!this.didBuildControls) {
    //   this.rebuildControls() // build for first time after user skipped start
    // }

    StartSequenceGame.isColorTransformEnabled = false
    this.config.refreshConfig()
    generator.refreshConfig()
    gfxConfig.refreshConfig()
    freeCamGameConfig.refreshConfig()
    // console.log(`mid transition refreshed game: ${this.config.flatConfig.game}`)

    // act as though generator changed
    this.currentGeneratorName = this.config.flatConfig.generator
    this.generator = TerrainGenerator.create(this.currentGeneratorName)
    STYLES.default = this.generator.style
    this.style = getStyle(this.config.flatConfig.style)

    // act as though game changed
    this.currentGameName = this.config.flatConfig.game
    // this.game = Game.create(this.currentGameName, this)
    StartSequenceGame.isColorTransformEnabled = this.currentGameName === 'start-sequence'
    // this.showHideGameSpecificElems()
    terrain.resetColors()

    // soft reset (graphics)
    this.style = getStyle(this.config.flatConfig.style)
    scene.setBackground(this.style.getBackgroundColor())
    terrain.resetColors()
    // this.onResize()

    // // reset camera
    // const { x, z } = terrain.centerXZ
    // camera.position.set(x + CAMERA.x, CAMERA.y, z + CAMERA.z)

    this.reset()
  }

  public didBuildControls = false // set to true after first build

  public rebuildControls() {
    this.didBuildControls = true
    showDebugControls(this)
  }

  // get visible guis starting with the front-most
  public getLayeredGuis(): ReadonlyArray<Gui> {
    const result = [this.game.gui]

    const { testGui } = this.config.flatConfig
    if (testGui === 'settings-menu') {
      result.unshift(Gui.create('settings-menu')) // show settings menu on top
    }
    else if (testGui === 'sprite-atlas') {
      return [Gui.create('sprite-atlas')] // show sprite atlas alone
      // result.unshift(Gui.create('sprite-atlas'))
    }

    return result
    // if (this.isSettingsMenuVisible && settingsGui) {
    //   return [
    //     settingsGui,
    //     this.game.gui,
    //   ]
    // }

    // return [
    //   this.game.gui,
    // ]
  }

  // allow gui layers to consume click/touch before orbit controls (mouse-touch-input.ts)
  public clickGuiLayers(event: ProcessedSubEvent): boolean {
    for (const gui of this.getLayeredGuis()) {
      if (gui.click(event)) {
        return true // consume event
      }
    }
    return false // pass to orbit controls
  }

  public unclickGuiLayers(event: ProcessedSubEvent) {
    for (const gui of this.getLayeredGuis()) {
      gui.unclick(event)
    }
  }

  // allow gui layers to consume drag before orbit controls (mouse-touch-input.ts)
  public mouseMoveGuiLayers(event: ProcessedSubEvent): boolean {
    document.documentElement.style.cursor = 'default'
    for (const gui of this.getLayeredGuis()) {
      if (gui.move(event)) { // may set cursor to pointer
        return true // consume event
      }
    }
    return false // pass to orbit controls
  }
}
