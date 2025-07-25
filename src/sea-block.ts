/**
 * @file sea-block.ts
 *
 * Main object constructed once in main.ts.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Gui } from 'gui'
import { SETTINGS_MENU_LAYOUT } from 'gui/layouts/settings-menu-layout'
import { styleBtn } from 'gui/elements/settings-menu'
import { preloadPixelTiles } from 'gfx/2d/pixel-tiles-gfx-helper'
import type { ConfigButton, ConfigItem } from './configs/config-tree'
import { TerrainGenerator } from './generators/terrain-generator'
import type { TileGroupGfxHelper } from './gfx/3d/tile-group-gfx-helper'
import { getStyle, STYLES } from './gfx/styles/styles-list'
import type { ProcessedSubEvent } from './mouse-touch-input'
import { initMouseListeners } from './mouse-touch-input'
import { CAMERA, GRID_DETAIL, PORTRAIT_CAMERA, STEP_DURATION } from './settings'
import { randomTransition, Transition } from './gfx/transition'
import { GAME_NAMES, type GameName, type GeneratorName } from './imp-names'
import type { FlatElement, GameElement } from './games/game'
import { Game } from './games/game'
import type { LayeredViewport } from './gfx/layered-viewport'
import { StartSequenceGame } from './games/start-sequence-game'
import { freeCamGameConfig } from './configs/free-cam-game-config'
import { seaBlockConfig } from './configs/sea-block-config'
import { buildScene } from './gfx/3d/scene'
import { SphereGroup } from './core/groups/sphere-group'
import { TileGroup } from './core/groups/tile-group'
import { showDebugControls } from './util/debug-controls-gui'
import type { StyleParser } from './util/style-parser'
import { FloraGroup } from './core/groups/flora-group'
import { Tiling } from './core/grid-logic/tilings/tiling'
import { TiledGrid } from './core/grid-logic/tiled-grid'
import { gfxConfig } from './configs/gfx-config'
import { physicsConfig } from './configs/physics-config'
import { loadedImages, resetFrontLayer, updateFrontLayer } from './gfx/2d/flat-gui-gfx-helper'

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

  public isSettingsMenuVisible = false
  private settingsGui = new Gui(() => SETTINGS_MENU_LAYOUT, [styleBtn])
  public toggleMenu() {
    this.isSettingsMenuVisible = !this.isSettingsMenuVisible
    this.settingsGui.refreshLayout(this)
    resetFrontLayer()

    // clear front layer
    const { ctx, w, h } = this.layeredViewport
    ctx.clearRect(0, 0, w, h)
  }

  // properties assigned in init
  currentGeneratorName!: GeneratorName
  generator!: TerrainGenerator
  style!: StyleParser
  scene!: THREE.Scene
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

    window.camPosForTestSupport = () => {
      const { x, y, z } = this.camera.position
      return [x, y, z]
    }
    
    this.orbitControls = new OrbitControls(
      this.camera,
      this.layeredViewport.backCanvas,
    )
    this.orbitControls.enabled = false

    // Responsive resize
    window.addEventListener('resize', () => this.onResize())

    // start loading assets to populate elementsPerGame
    const allElements: Array<GameElement> = []
    for (const gameName of GAME_NAMES) {
      const gameEntry = Game._registry[gameName]
      // const layoutRectangles = parseLayoutRectangles(
      //   this.layeredViewport.screenRectangle,
      //   gameEntry.layout(this),
      // )
      allElements.push(...gameEntry.elements)
    }
    allElements.push(...this.settingsGui.elements)

    const loadPromises: Array<Promise<void>> = []
    loadPromises.push(preloadPixelTiles())
    loadPromises.push(...allElements.map(async (obj) => {
      const ge = obj as GameElement
      if ('imageFactory' in ge) {
        const flatElem = obj as FlatElement
        // const { w, h } = layoutRectangles[flatElem.layoutKey]
        const { w, h } = flatElem
        const image = flatElem.imageFactory(w, h)
        // const loadedImage: LoadedImage = { image, ...flatElem }
        loadedImages[flatElem.layoutKey] = image
        return // loadedImage
      }
      else {
        // const depthElem = obj as DepthElement
        // const mesh = await depthElem.meshLoader()
        return // { mesh, layoutKey: depthElem.layoutKey } satisfies LoadedElement
      }
    }))

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
        resetFrontLayer()
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

    // update game's camera-locked meshes
    // alignGuiGroup(cameraLockedGroup, this.camera)

    // update physics
    const nSteps = Math.round(dt / STEP_DURATION)
    terrain.update(this, nSteps)
    floraGroup.update(this, nSteps)
    sphereGroup.update(this, nSteps)

    // render scene
    this.layeredViewport.backRenderer.render(scene, camera)

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
    this.scene = buildScene(this)
    this.scene.add(cameraLockedGroup)
    if (this.didLoadAssets) {
      // for (const [_gameName, loadedElems] of Object.entries(elementsPerGame)) {
      //   for (const elem of loadedElems) {
      //     if ('mesh' in elem) {
      //       this.scene.add(elem.mesh)
      //     }
      //   }
      // }
    }
    this.tileGfx = this.terrain.gfxHelper

    // this.debugElems.refresh(this.config.flatConfig.debug)
    if (!this.game) {
      this.game = Game.create(this.currentGameName, this)
    }
    // this.game.refreshConfig()
    freeCamGameConfig.refreshConfig()
    this.game.reset(this)
    this.game.resetCamera(this)
    if (this.game.doesAllowOrbitControls(this)) {
      this.orbitControls.enabled = true
    }
    // this.game.gui.refreshLayout(this.layeredViewport)
  }

  // called when user switches games
  public onGameChange() {
    this.game = Game.create(this.config.flatConfig.game, this)
    this.showHideGameSpecificElems()
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
      // start transition
      this.transition = Transition.create('flat', this)
      this.isCovering = true
      return // wait for mid transition to actually update
    }
    else if (item.resetOnChange === 'physics') {
      // soft reset (physics)
      physicsConfig.refreshConfig()
    }
    else {
      // soft reset (graphics)
      StartSequenceGame.isColorTransformEnabled = false
      this.style = getStyle(this.config.flatConfig.style)
      scene.background = this.style.getBackgroundColor()
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
      // document.documentElement.requestFullscreen()

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
    scene.background = this.style.getBackgroundColor()

    // act as though game changed
    this.currentGameName = this.config.flatConfig.game
    this.game = Game.create(this.currentGameName, this)
    StartSequenceGame.isColorTransformEnabled = this.currentGameName === 'start-sequence'
    this.showHideGameSpecificElems()
    terrain.resetColors()

    // soft reset (graphics)
    this.style = getStyle(this.config.flatConfig.style)
    scene.background = this.style.getBackgroundColor()
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
    if (this.isSettingsMenuVisible) {
      return [
        this.settingsGui,
        this.game.gui,
      ]
    }

    return [
      this.game.gui,
    ]
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

  // allow gui layers to consume drag before orbit controls (mouse-touch-input.ts)
  public mouseMoveGuiLayers(event: ProcessedSubEvent): boolean {
    for (const gui of this.getLayeredGuis()) {
      if (gui.move(event)) {
        return true // consume event
      }
    }
    return false // pass to orbit controls
  }
}
