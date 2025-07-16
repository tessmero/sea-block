/**
 * @file sea-block.ts
 *
 * Main configurable object used in main.ts.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { ConfigButton, ConfigItem } from './configs/config-tree'
import { TerrainGenerator } from './generators/terrain-generator'
import type { TileGroupGfxHelper } from './gfx/3d/tile-group-gfx-helper'
import { getStyle, STYLES } from './gfx/styles/styles-list'
import { initMouseListeners, processMouse } from './mouse-input'
import { GRID_DETAIL, STEP_DURATION } from './settings'
import type { CompositeMesh } from './gfx/3d/composite-mesh'
import { Transition } from './gfx/transition'
import { GAME_NAMES, type GameName, type GeneratorName } from './imp-names'
import type { DepthElement, FlatElement, GameElement } from './games/game'
import { Game } from './games/game'
import type { LayeredViewport } from './gfx/layered-viewport'
import type { ButtonState, FlatButton } from './gfx/2d/flat-button'
import { StartSequenceGame } from './games/start-sequence-game'
import { freeCamGameConfig } from './configs/free-cam-game-config'
import { seaBlockConfig } from './configs/sea-block-config'
import { buildScene } from './gfx/3d/scene'
import { SphereGroup } from './core/groups/sphere-group'
import { TileGroup } from './core/groups/tile-group'
import { alignMeshInGuiGroup } from './gfx/3d/camera-locked-gfx-helper'
import { showControls as showDebugControls } from './util/debug-controls-gui'
import type { StyleParser } from './util/style-parser'
import { FloraGroup } from './core/groups/flora-group'
import { Tiling } from './core/grid-logic/tilings/tiling'
import { TiledGrid } from './core/grid-logic/tiled-grid'
import { gfxConfig } from './configs/gfx-config'
import { physicsConfig } from './configs/physics-config'
import { playSound } from './sounds'

// can only be constructed once
let didConstruct = false
let didInit = false
let didLoadAssets = false

// all game-specific meshes and images, loaded once on startup
const elementsPerGame: Record<string, Array<LoadedElement>> = {}

// container for some meshes, locked to screen instead of world
const cameraLockedGroup = new THREE.Group()

type LoadedElement = LoadedMesh | LoadedImage

// result of loading a DepthElement (game.ts)
type LoadedMesh = {
  mesh: CompositeMesh | THREE.Object3D
  layoutKey?: string // optional, indicates camera-locked
  clickAction?: (SeaBlock) => void
  hotkey?: string
}

// result of loading a FlatElement (game.ts)
type LoadedImage = {
  image: FlatButton// OffscreenCanvas
  layoutKey: string // required
  clickAction?: (SeaBlock) => void
  hotkey?: string
}

export class SeaBlock {
  public readonly config = seaBlockConfig

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
  game!: Game // current game
  camera!: THREE.PerspectiveCamera
  orbitControls!: OrbitControls

  // defined only during transition sequence
  transition?: Transition

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
      this.layeredViewport.frontCanvas,
    )
    this.orbitControls.enabled = false

    // Responsive resize
    window.addEventListener('resize', () => this.onResize())

    // listen for directional mouse/touch input
    initMouseListeners(this.layeredViewport, {
      click: (_mousePos) => { // mousedown click
        const mouseState = processMouse(this)
        if (mouseState && didLoadAssets) {
          this.game.flatUi.click(this, mouseState)
        }
        else {
          // console.log('no mouse state after click')
        }
      },
      unclick: () => { // mouseup unclick
        const mouseState = processMouse(this)
        this.game.flatUi.unclick(this, mouseState)
      },
    })

    window.addEventListener('keydown', (event) => {
      if (!didLoadAssets) {
        return
      }
      const elems = elementsPerGame[this.currentGameName]
      for (const { hotkey, clickAction, layoutKey } of elems) {
        if (hotkey === event.key && clickAction) {
          clickAction(this)
          if (layoutKey) {
            // display button as pressed
            this.repaintButton(layoutKey, 'clicked')
            playSound('click')
          }
        }
      }
    })

    // start loading assets to populate elementsPerGame
    const loadPromises: Record<string, Array<Promise<LoadedElement>>> = {}
    for (const gameName of GAME_NAMES) {
      loadPromises[gameName] = Game._registry[gameName].elements.map(async (obj) => {
        const ge = obj as GameElement
        if ('imageLoader' in ge) {
          const flatElem = obj as FlatElement
          const image = await flatElem.imageLoader()
          return { image, ...flatElem } satisfies LoadedElement
        }
        else {
          const depthElem = obj as DepthElement
          const mesh = await depthElem.meshLoader()
          return { mesh, layoutKey: depthElem.layoutKey } satisfies LoadedElement
        }
      })
    }
    Promise.all(
      Object.entries(loadPromises).map(async ([gameName, promises]) => {
        elementsPerGame[gameName] = await Promise.all(promises)
      }),
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
        // console.log('mid transition')
        this.isCovering = false

        // old scene just hidden from view
        await this.onMidTransition()
        transition.cleanupCover()
        // this.rebuildControls()
      }
      if (transition.didFinishUncover) {
        // console.log('finish transition')
        this.transition = undefined // transition just finished
        this.updateFrontCanvas()
      }
    }

    // orbit camera controls
    // if (!this.game.flatUi.clickedBtn) {
    //   this.orbitControls.update()
    // }

    // update game
    const mouseState = processMouse(this)
    game.update({ seaBlock: this, dt, mouseState })

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

  private onResize() {
    this.layeredViewport.handleResize()

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.game.flatUi.refreshLayout(this.layeredViewport)
    this.updateFrontCanvas()
    this.transition?.cleanupCover()

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

  private onFinishLoading() {
    // finished loading meshes and images
    didLoadAssets = true
    for (const [_gameName, elems] of Object.entries(elementsPerGame)) {
      for (const loadedElement of elems) {
        if ('mesh' in loadedElement) {
          // 3d object
          const { mesh, layoutKey } = loadedElement
          if (layoutKey) {
            // locked to camera
            cameraLockedGroup.add(mesh)
            const rect = this.game.flatUi.layoutRectangles[layoutKey]
            alignMeshInGuiGroup(mesh, cameraLockedGroup, rect)
          }
          else {
            // not locked to camera
            this.scene.add(mesh)
          }
        }
        else {
          // 2d flat button
        }
      }
    }
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
    if (didLoadAssets) {
      for (const [_gameName, loadedElems] of Object.entries(elementsPerGame)) {
        for (const elem of loadedElems) {
          if ('mesh' in elem) {
            this.scene.add(elem.mesh)
          }
        }
      }
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
    if (this.game.enableOrbitControls()) {
      this.orbitControls.enabled = true
    }
    // this.game.flatUi.refreshLayout(this.layeredViewport)
  }

  // called when user switches games
  public onGameChange() {
    this.game = Game.create(this.config.flatConfig.game, this)
    this.showHideGameSpecificElems()
  }

  private showHideGameSpecificElems() {
    const frontImages: Array<LoadedImage> = []
    for (const [gameName, elements] of Object.entries(elementsPerGame)) {
      const shouldBeVisible = gameName === this.currentGameName
      for (const loaded of elements) {
        if ('mesh' in loaded) {
          // 3d object
          loaded.mesh.visible = shouldBeVisible
        }
        else {
          // flat image
          if (shouldBeVisible) {
            frontImages.push(loaded)
          }
        }
      }
    }
    this.updateFrontCanvas(frontImages)
  }

  public clickButton(layoutKey: string) {
    if (this.transition) {
      return // disable clicking during transition
    }
    const match = elementsPerGame[this.currentGameName].find(e => e.layoutKey === layoutKey)
    if (match && ('clickAction' in match) && match.clickAction) {
      match.clickAction(this)
    }
  }

  public repaintButton(layoutKey: string, state: ButtonState) {
    const match = this._frontImages.find(img => img.layoutKey === layoutKey)
    if (!match) {
      // maybe race condition fluke
      // console.log(`cannot repaint button. layout key missing from _frontImages: ${layoutKey}`)
      return
    }

    const rect = this.game.flatUi.layoutRectangles[layoutKey]
    if (!rect) {
      throw new Error(`cannot repaint button. layout key missing from layoutRectangles: ${layoutKey}`)
    }

    const { ctx } = this.layeredViewport
    const buffer = match.image.images[state]
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(buffer, rect.x, rect.y)
  }

  private _frontImages: Array<LoadedImage> = []
  private updateFrontCanvas(frontImages?: Array<LoadedImage>) {
    if (frontImages) {
      // console.log('change frontImages')
      this._frontImages = frontImages
    }

    const { ctx, w, h } = this.layeredViewport

    ctx.clearRect(0, 0, w, h)
    for (const { image, layoutKey } of this._frontImages) {
      const rect = this.game.flatUi.layoutRectangles[layoutKey]
      if (!rect) {
        throw new Error(`missing layout key '${layoutKey}'`)
      }

      // user may have already hovered on button position
      const stateToDraw: ButtonState = this.game.flatUi.hoveredButton === layoutKey ? 'hovered' : 'default'
      ctx?.drawImage(image.images[stateToDraw], rect.x, rect.y)
    }
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
    }

    // check for regular setting change
    if (item.resetOnChange === 'full') {
      // start transition
      this.transition = Transition.create('flat', this.layeredViewport)
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
      // just clicked "launch"
      document.documentElement.requestFullscreen()

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
      this.layeredViewport.handleResize()

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

    if (!this.didBuildControls) {
      this.rebuildControls() // build for first time after user skipped start
    }

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
}
