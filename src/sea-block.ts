/**
 * @file sea-block.ts
 *
 * Main configurable object used in main.ts.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildScene } from './scene'
import type { ConfigItem } from './configs/config-tree'
import { TerrainGenerator } from './generators/terrain-generator'
import type { CssStyle } from './gfx/styles/css-style'
import type { TileGroupGfxHelper } from './gfx/3d/tile-group-gfx-helper'
import type { SphereGroup } from './groups/sphere-group'
import type { TileGroup } from './groups/tile-group'
import type { DebugElems } from './scene'
import { getStyle } from './gfx/styles/styles-list'
import { initMouseListeners, processMouse } from './ui/mouse-input'
import { STEP_DURATION } from './settings'
import { showControls } from './ui/controls-gui'
import { alignMeshInGuiGroup } from './gfx/3d/ui-gfx-helper'
import type { CompositeMesh } from './gfx/3d/composite-mesh'
import { Transition } from './gfx/transition'
import { GAME_NAMES, type GameName, type GeneratorName } from './imp-names'
import type { DepthElement, FlatElement, GameElement } from './games/game'
import { Game } from './games/game'
import type { LayeredViewport } from './gfx/layered-viewport'
import { DefaultStyle } from './gfx/styles/default-style'
import type { ButtonState, FlatButton } from './gfx/2d/flat-button'
import { StartSequenceGame } from './games/start-sequence-game'
import { freeCamGameConfig } from './configs/free-cam-game-config'
import { seaBlockConfig } from './configs/sea-block-config'

// can only be constructed once
let didConstruct = false
let didInit = false
let didLoadAssets = false

// prepare to detect changed terrain generator or game
let lastGeneratorName: GeneratorName
let lastGameName: GameName

// all game-specific meshes and images, loaded once on startup
const elementsPerGame: Record<string, Array<LoadedElement>> = {}

// container for some meshes, locked to screen instead of world
const cameraLockedGroup = new THREE.Group()

type LoadedElement = LoadedMesh | LoadedImage

// result of loading a DepthElement (game.ts)
type LoadedMesh = {
  mesh: CompositeMesh
  layoutKey?: string // optional, indicates camera-locked
}

// result of loading a FlatElement (game.ts)
type LoadedImage = {
  image: FlatButton// OffscreenCanvas
  layoutKey: string // required
  clickAction?: (SeaBlock) => void
}

export class SeaBlock {
  public readonly config = seaBlockConfig

  // properties assigned in init
  generator!: TerrainGenerator
  style!: CssStyle
  scene!: THREE.Scene
  terrain!: TileGroup
  tileRenderer!: TileGroupGfxHelper
  sphereGroup!: SphereGroup
  debugElems!: DebugElems
  game!: Game // current game
  camera!: THREE.PerspectiveCamera
  orbitControls!: OrbitControls

  // defined only during transition sequence
  transition?: Transition

  public readonly renderer: THREE.WebGLRenderer
  constructor(public readonly layeredViewport: LayeredViewport) {
    this.renderer = this.layeredViewport.backRenderer

    if (didConstruct) {
      throw new Error('SeaBlock constructed multiple times')
    }
    didConstruct = true
  }

  // used at natural start sequence end, to switch to free cam without transition
  setGame(game: GameName) {
    this.config.tree.children.game.value = game
    this.config.flatConfig.game = game
    lastGameName = game
  }

  init() {
    if (didInit) {
      throw new Error('SeaBlock initialized multiple times')
    }
    didInit = true

    // load default settings
    lastGameName = this.config.flatConfig.game
    // this.game = Game.create(lastGameName, this)
    lastGeneratorName = this.config.flatConfig.generator
    this.generator = TerrainGenerator.create(lastGeneratorName)
    DefaultStyle.setDefaultCss(this.generator.style)
    this.style = getStyle(this.config.flatConfig.style) // default style depends on generator

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

    // Responsive resize
    window.addEventListener('resize', () => this.onResize())

    // listen for directional mouse/touch input
    initMouseListeners(this.layeredViewport,
      (_mousePos) => { // mousedown click
        const mouseState = processMouse(this)
        if (mouseState && didLoadAssets) {
          this.game.flatUi.click(this, mouseState)
        }
        else {
          // console.log('no mouse state after click')
        }
      },
      () => { // mouseup unclick
        const mouseState = processMouse(this)
        this.game.flatUi.unclick(this, mouseState)
      },
    )

    // start loading assets to populate elementsPerGame
    const loadPromises: Record<string, Array<Promise<LoadedElement>>> = {}
    for (const gameName of GAME_NAMES) {
      loadPromises[gameName] = Game._registry[gameName].elements.map(async (obj) => {
        const ge = obj as GameElement
        if ('imageLoader' in ge) {
          const flatElem = obj as FlatElement
          const image = await flatElem.imageLoader()
          return { image,
            layoutKey: flatElem.layoutKey,
            clickAction: flatElem.clickAction,
          }
        }
        else {
          const depthElem = obj as DepthElement
          const mesh = await depthElem.meshLoader()
          return { mesh, layoutKey: depthElem.layoutKey }
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

  animate(dt: number) {
    const { layeredViewport, transition, game,
      renderer, scene, terrain, camera,
      debugElems, sphereGroup,
    } = this

    if (transition) {
      transition.update(dt)
      if (this.isCovering && transition.didFinishCover) {
        // console.log('mid transition')
        this.isCovering = false

        // old scene just hidden from view
        this.onMidTransition()
        transition.cleanupCover()
        // this.rebuildControls()
      }
      if (transition.didFinishUncover) {
        // console.log('finish transition')
        this.transition = undefined // transition just finished
      }
    }

    // orbit camera controls
    // if (!this.game.flatUi.clickedBtn) {
    //   this.orbitControls.update()
    // }

    // update game
    const mouseState = processMouse({ terrain, camera, debugElems, layeredViewport })
    game.update({ seaBlock: this, dt, mouseState })

    // update game's camera-locked meshes
    // alignGuiGroup(cameraLockedGroup, this.camera)

    // update physics
    const nSteps = Math.round(dt / STEP_DURATION)
    terrain.update(this, nSteps)
    sphereGroup.update(this, nSteps)

    // render scene
    renderer.render(scene, camera)
  }

  private onResize() {
    this.layeredViewport.handleResize()

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.game.flatUi.refreshLayout(this.layeredViewport)
    this.updateFrontCanvas()

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
          // 2d image
        }
      }
    }
    this.showHideGameSpecificElems()
  }

  /**
   *
   */
  public reset() {
    const built = buildScene(this)

    this.scene = built.scene
    this.scene.add(cameraLockedGroup)
    this.terrain = built.terrain
    this.tileRenderer = this.terrain.tileGroupRenderer
    this.sphereGroup = built.sphereGroup
    this.debugElems = built.debugElems

    this.debugElems.refresh(this.config.flatConfig.debug)
    if (!this.game) {
      this.game = Game.create(lastGameName, this)
    }
    // this.game.refreshConfig()
    freeCamGameConfig.refreshConfig()
    this.game.reset(this)
    this.game.resetCamera(this)
    this.game.flatUi.refreshLayout(this.layeredViewport)
  }

  // called when user switches games
  public onGameChange() {
    this.game = Game.create(this.config.flatConfig.game, this)
    this.showHideGameSpecificElems()
  }

  private showHideGameSpecificElems() {
    const frontImages: Array<LoadedImage> = []
    for (const [gameName, elements] of Object.entries(elementsPerGame)) {
      const shouldBeVisible = gameName === this.config.flatConfig.game
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
    const match = elementsPerGame[lastGameName].find(e => e.layoutKey === layoutKey)
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

  // called when user switches terrain generators
  private onGeneratorChange() {
    // console.log(`on generator change ${this.config.flatConfig.generator}`)

    this.generator = TerrainGenerator.create(this.config.flatConfig.generator)

    // reload style in case default is selected, changes with generator
    DefaultStyle.setDefaultCss(this.generator.style)
    // this.style = getStyle(this.config.flatConfig.style)

    // this.renderer.setPixelRatio(1 / this.config.flatConfig.pixelScale)
    // this.reset() // full reset
    // this.rebuildControls() // show new generator controls
  }

  // called when user changes a setting
  public onCtrlChange(item: ConfigItem) {
    const { generator, tileRenderer, terrain, sphereGroup, renderer, scene, debugElems } = this

    this.config.refreshConfig()
    debugElems.refresh(this.config.flatConfig.debug)
    tileRenderer.config.refreshConfig()
    generator.refreshConfig()

    // check for special case: game changed
    const newGameName = this.config.flatConfig.game
    if (newGameName !== lastGameName) {
      lastGameName = newGameName
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
      sphereGroup.sim.config.refreshConfig()
      terrain.sim.config.refreshConfig()
    }
    else {
      // soft reset (graphics)
      StartSequenceGame.isColorTransformEnabled = false
      this.style = getStyle(this.config.flatConfig.style)
      renderer.setPixelRatio(1 / this.config.flatConfig.pixelScale)
      scene.background = this.style.background
      terrain.resetColors()
    }

    // allow any config change to escape from special start seq colors
    StartSequenceGame.isColorTransformEnabled = lastGameName === 'start-sequence'
  }

  private onMidTransition() {
    const { generator, tileRenderer, terrain, renderer, scene } = this

    if (!this.didBuildControls) {
      this.rebuildControls() // build for first time after user skipped start
    }

    StartSequenceGame.isColorTransformEnabled = false
    this.config.refreshConfig()
    generator.refreshConfig()
    tileRenderer.config.refreshConfig()
    freeCamGameConfig.refreshConfig()
    // console.log(`mid transition refreshed game: ${this.config.flatConfig.game}`)

    const newGenName = this.config.flatConfig.generator
    if (newGenName !== lastGeneratorName) {
      lastGeneratorName = newGenName
      this.onGeneratorChange() // do special reset
    }

    // check for special case: game changed
    const newGameName = this.config.flatConfig.game
    if (newGameName !== lastGameName) {
      StartSequenceGame.isColorTransformEnabled = newGameName === 'start-sequence'

      // maintain special color if  start sequcne was interrupted with skip button
      if (StartSequenceGame.wasSkipped) {
        StartSequenceGame.isColorTransformEnabled = true
      }

      // console.log('special case: game changed')
      lastGameName = newGameName
      this.onGameChange() // do special reset
      terrain.resetColors()
      return // skip regular settings change below
    }

    // soft reset (graphics)
    this.style = getStyle(this.config.flatConfig.style)
    renderer.setPixelRatio(1 / this.config.flatConfig.pixelScale)
    scene.background = this.style.background
    terrain.resetColors()

    this.reset()
  }

  public didBuildControls = false // set to true after first build

  public rebuildControls() {
    this.didBuildControls = true
    showControls(
      this.config.tree,
      item => this.onCtrlChange(item),
    )
  }
}
