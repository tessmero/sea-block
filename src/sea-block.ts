/**
 * @file sea-block.ts
 *
 * Main object constructed once in main.ts.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Gui } from 'guis/gui'
import { preloadPixelTiles } from 'gfx/2d/pixel-tiles-gfx-helper'
import type { ConfigButton, ConfigItem } from './configs/config-tree'
import { TerrainGenerator } from './generators/terrain-generator'
import type { TileGroupGfxHelper } from './gfx/3d/tile-group-gfx-helper'
import { getStyle, STYLES } from './gfx/styles/styles-list'
import type { ProcessedSubEvent } from './input/mouse-touch-input'
import { initMouseListeners } from './input/mouse-touch-input'
import { GRID_DETAIL, STEP_DURATION } from './settings'
import { GAME, GUI, type GameName, type GeneratorName } from './imp-names'
import { Game } from './games/game'
import type { LayeredViewport } from './gfx/layered-viewport'
import { seaBlockConfig } from './configs/imp/sea-block-config'
import type { SeablockScene } from './gfx/3d/scene'
import { buildScene } from './gfx/3d/scene'
import { SphereGroup } from './core/groups/sphere-group'
import { TileGroup } from './core/groups/tile-group'
import { showDebugControls } from './util/debug-controls'
import type { StyleParser } from './util/style-parser'
import { FloraGroup } from './core/groups/flora-group'
import { Tiling } from './core/grid-logic/tilings/tiling'
import { TiledGrid } from './core/grid-logic/tiled-grid'
import { resetFrontLayer, updateFrontLayer } from './gfx/2d/flat-gui-gfx-helper'
import { alignGuiGroup, alignMeshInGuiGroup } from 'gfx/3d/gui-3d-gfx-helper'
import type { Transition } from 'gfx/transitions/transition'
import { randomTransition } from 'gfx/transitions/transition'
import { preloadChessSprites } from 'games/chess/gfx/chess-2d-gfx-helper'
import { gfxConfig } from 'configs/imp/gfx-config'
import { physicsConfig } from 'configs/imp/physics-config'
import { freeCamGameConfig } from 'configs/imp/free-cam-game-config'
import { preloadChessRewardHelpDiagrams } from 'games/chess/gui/chess-reward-help-elements'
import { Chess } from 'games/chess/chess-helper'
import { pollGamepadInput } from 'input/gamepad-input'
import type { KeyCode } from 'input/input-id'
import { preloadGrabbedMeshDiagrams } from 'games/free-cam/freecam-grabbed-mesh-dialog'
import { isDevMode } from 'configs/imp/top-config'
import { releaseGgui, updateGamepadGui } from 'input/ggui-nav-wasd'
import { playSound } from 'audio/sound-effect-player'
import { hideGguiCursor } from 'gfx/3d/ggui-3d-cursor'
import { drawGamepadPrompts } from 'gfx/2d/gamepad-btn-prompts'

// can only be constructed once
let didConstruct = false
let didInit = false

// container for some meshes, locked to screen instead of world
const cameraLockedGroup = new THREE.Group()

export const emptyScene = new THREE.Scene()

export class SeaBlock {
  public didLoadAssets = false
  public readonly config = seaBlockConfig

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

  // latch set on first gamepad input
  hasConnectedGamepad: null | 'xbox' | 'playstation' = null

  // set to true on any gamepad input, false on any mouse/touch
  isUsingGamepad = false

  // defined only during transition sequence
  transition?: Transition
  midTransitionCallback?: () => void

  public isShowingSettingsMenu = false

  public toggleSettings() {
    this.isShowingSettingsMenu = !this.isShowingSettingsMenu
    if (this.isShowingSettingsMenu) {
      playSound('settingsOpen')
      // release gamepad cursor, now only settings can be navigated
      releaseGgui() // 2d
      hideGguiCursor() // 3d

      // updateGamepadGui({ seaBlock: this, dt: 0 })
    }
    else {
      playSound('settingsClose')
    }
    Gui.create('settings-menu').resetElementStates(this)
    this.onResize()
  }

  constructor(public readonly layeredViewport: LayeredViewport) {
    if (didConstruct) {
      throw new Error('SeaBlock constructed multiple times')
    }
    didConstruct = true
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
    this.orbitControls.maxPolarAngle = Math.PI / 2
    this.orbitControls.minDistance = 4
    this.orbitControls.maxDistance = 60

    // update layout and graphics on resize
    window.addEventListener('resize', () => this.onResize())

    // start polling gamepad when connected or first used
    window.addEventListener('gamepadconnected', (e) => {
      const gp = navigator.getGamepads()[e.gamepad.index] as Gamepad
      const id = gp.id.toLowerCase()
      if (id.includes('playstation') || id.includes('dualshock') || id.includes('dual sense')) {
        this.hasConnectedGamepad = 'playstation' // display "X" button prompts
      }
      this.hasConnectedGamepad = 'xbox' // display "A" button prompts
    })

    const loadPromises: Array<Promise<void | Array<void>>> = []
    loadPromises.push(preloadPixelTiles(Tiling.getAllShapes()))
    loadPromises.push(preloadChessSprites())
    loadPromises.push(preloadChessRewardHelpDiagrams())
    loadPromises.push(preloadGrabbedMeshDiagrams())

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
    ).then(() => this.onFinishLoading())
  }

  public isCovering = false // true during first half of transition animation

  async update(dt: number) {
    const { transition,
      scene, terrain, sphereGroup, floraGroup,
      game, camera,
    } = this

    if (this.hasConnectedGamepad) {
      pollGamepadInput(this)
      if (this.isUsingGamepad) {
        // hide mouse cursor until next mousemove
        document.documentElement.style.cursor = 'none'
      }
      // show or clear overlays
      drawGamepadPrompts(this)
      updateGamepadGui({ seaBlock: this, dt })
    }

    // update camera-locked
    this.alignGuiMeshes()

    if (transition) {
      transition.update(dt)
      if (this.isCovering && transition.didFinishCover) {
        // just hit mid-transition, old scene hidden
        // console.log('sea-block.ts detected mid transition')
        this.isCovering = false

        if (this.midTransitionCallback) {
          this.midTransitionCallback()
          this.midTransitionCallback = undefined
        }
        if (transition.doesAllowMidTransitionReset) {
          await this.onMidTransition()
        }
        // resetFrontLayer()
        transition.cleanupHide()
        // this.rebuildControls()
      }
      if (transition.didFinishUncover) {
        // console.log('sea-block.ts detected end of transition')
        // console.log('finish transition')
        transition?.cleanupShow()
        this.transition = undefined // transition just finished
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

    // update game's camera-locked meshes
    alignGuiGroup(cameraLockedGroup,
      this.camera, this.layeredViewport.screenRectangle)

    // update game
    game.update({ seaBlock: this, dt })

    scene.update(this.orbitControls.target)

    // update physics
    const nSteps = Math.round(dt / STEP_DURATION)
    terrain.update(this, dt, nSteps)
    floraGroup.update(this, dt, nSteps)
    sphereGroup.update(this, dt, nSteps)

    // render scene
    if (this.game.doesAllow3DRender()) {
      this.layeredViewport.backRenderer.render(scene.threeScene, camera)
    }
    else {
      this.layeredViewport.backRenderer.render(emptyScene, camera)
    }

    // debug
    // const dist = camera.position.distanceTo(this.orbitControls.target)
    // console.log(dist)
  }

  public startTransition(
    params: {
      transition?: Transition
      callback?: () => void
    } = {},
  ) {
    const { transition, callback } = params
    this.transition = transition || randomTransition(this)
    this.isCovering = true
    this.midTransitionCallback = callback
    updateFrontLayer(this)
  }

  public onResize() {
    const { layeredViewport, camera } = this
    layeredViewport.handleResize(this)

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    this.setCameraDistance(this.game.getCamOffset(this).length())
    // if (this.currentGameName === 'free-cam') {
    //   // reset camera distance (keep scene in view for portrait phone)
    //   const { w, h } = this.layeredViewport
    //   const preset = h > w ? PORTRAIT_CAMERA : CAMERA
    //   this.setCameraDistance(preset.length())
    // }

    // recompute visible layouts
    // this.game.gui.refreshLayout(this)
    for (const gui of this.getLayeredGuis()) {
      gui.refreshLayout(this)
    }

    // updateFrontLayer(this)
    this.transition?.cleanupHide()

    // // align camera-locked meshes
    this.alignGuiMeshes()
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
      this.game.gui.keydown(this, event.code as KeyCode)
    })
    window.addEventListener('keyup', (event) => {
      this.game.gui.keyup(this, event.code as KeyCode)
    })

    // finished loading meshes and images
    this.didLoadAssets = true
  }

  private alignGuiMeshes() {
    for (const { layoutKey, mesh } of this.game.elements) {
      if (mesh) {
        if (layoutKey) {
          this.scene.threeScene.remove(mesh)
          cameraLockedGroup.add(mesh)
          const rect = this.game.gui.layoutRectangles[layoutKey]
          if (rect) {
            alignMeshInGuiGroup(mesh, cameraLockedGroup, this.layeredViewport.screenRectangle, rect)
          }
        }
        else {
          this.scene.threeScene.add(mesh)
          cameraLockedGroup.remove(mesh)
        }
      }
    }
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
    // freeCamGameConfig.refreshConfig()
    // this.game.reset(this)
    this.game.resetCamera(this)
    if (this.game.doesAllowOrbitControls(this)) {
      this.orbitControls.enabled = true
    }
    // this.game.gui.refreshLayout(this.layeredViewport)
  }

  // called when user switches games
  public onGameChange() {
    hideGguiCursor()

    this.scene.threeScene.remove(...this.game.meshes)
    this.game = Game.create(this.config.flatConfig.game, this)
    for (const mesh of this.game.meshes) {
      if (mesh.parent) {
        // mesh handled by game
      }
      else {
        this.scene.threeScene.add(mesh)
      }
    }
    // this.scene.threeScene.add(...this.game.meshes)
    this.layeredViewport.handleResize(this)
    // this.terrain.gfxHelper.restoreTileColors() // remove chess allowed-move highlights
  }

  // called when user changes a setting
  public onCtrlChange(item: ConfigItem | ConfigButton) {
    const { generator, terrain, scene } = this

    this.config.refreshConfig()
    // debugElems.refresh(this.config.flatConfig.debug)
    gfxConfig.refreshConfig()
    generator.refreshConfig()

    for (const gui of this.getLayeredGuis()) {
      gui.resetElementStates(this)
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
      // if (this.config.flatConfig.transitionMode === 'skip') {
      // skip transition
      this.onMidTransition()
      return // update done with midtransition
      // }
      // else {
      //   // start transition
      //   this.transition = Transition.create('flat', this)
      //   this.isCovering = true
      //   return // wait for mid transition to actually update
      // }
    }
    else if (item.resetOnChange === 'physics') {
      // soft reset (physics)
      physicsConfig.refreshConfig()
    }
    else {
      // soft reset (graphics)
      // StartSequenceGame.isColorTransformEnabled = false
      this.style = getStyle(this.config.flatConfig.style)
      scene.setBackground(this.style.getBackgroundColor())
      terrain.resetColors()
      this.onResize()
    }

    // allow any config change to escape from special start seq colors
    // StartSequenceGame.isColorTransformEnabled = this.currentGameName === 'start-sequence'
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
            this.onResize()
            resolve()
          })
        })
      })
    }

    const { generator, scene } = this

    // if (!this.didBuildControls) {
    //   this.rebuildControls() // build for first time after user skipped start
    // }

    // StartSequenceGame.isColorTransformEnabled = false
    this.config.refreshConfig()
    generator.refreshConfig()
    // gfxConfig.refreshConfig()
    // freeCamGameConfig.refreshConfig()
    // console.log(`mid transition refreshed game: ${this.config.flatConfig.game}`)

    // act as though generator changed
    this.currentGeneratorName = this.config.flatConfig.generator
    this.generator = TerrainGenerator.create(this.currentGeneratorName)
    STYLES.default = this.generator.style
    this.style = getStyle(this.config.flatConfig.style)

    // act as though game changed
    this.currentGameName = this.config.flatConfig.game
    // this.game = Game.create(this.currentGameName, this)
    // StartSequenceGame.isColorTransformEnabled = this.currentGameName === 'start-sequence'
    // soft reset (graphics)
    this.style = getStyle(this.config.flatConfig.style)
    scene.setBackground(this.style.getBackgroundColor())
    // this.onResize()

    // // reset camera
    // const { x, z } = terrain.centerXZ
    // camera.position.set(x + CAMERA.x, CAMERA.y, z + CAMERA.z)

    this.reset()

    // this.game.gui.refreshLayout(this)

    const { x, y, w, h } = this.layeredViewport.screenRectangle
    this.layeredViewport.ctx.clearRect(x, y, w, h)
    // console.log('clear mid layer')
    // this.layeredViewport.ctx.fillStyle = 'red'
    // this.layeredViewport.ctx.fillRect( 20,20,20,20 )
    this.onResize()

    resetFrontLayer(this)
    updateFrontLayer(this)
    // this.onResize()

    Chess.queueHltUpdate()
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
    if (testGui === 'sprite-atlas') {
      return [Gui.create('sprite-atlas')] // show sprite atlas alone
      // result.unshift(Gui.create('sprite-atlas'))
    }

    if (this.isShowingSettingsMenu) {
      result.unshift(Gui.create('settings-menu')) // show settings menu on top
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
