/**
 * @file game.ts
 *
 * Base class for minigames/animations.
 * Games are focused on high-level scripted logic.
 *
 * Games delegate to the tile grid and physics simulations
 * through the terrain (TileGroup with TileSim)
 * and sphereGroup (with SphereSim).
 *
 * Game subclasses register static arrays of game-specific
 * visual elements, used to preload assets on startup.
 */

import { type Object3D, type Vector3 } from 'three'
import type { GameName, GuiName } from '../imp-names'
import type { SeaBlock } from '../sea-block'

import { CAMERA, CAMERA_LOOK_AT, PORTRAIT_CAMERA } from '../settings'
import type { ElementEvent } from '../guis/gui'
import { Gui } from '../guis/gui'

export type GameElement = {
  readonly meshLoader: () => Promise<Object3D>
  clickAction?: (event: ElementEvent) => void
  layoutKey?: string // only for camera-locked mesh

  mesh?: Object3D // set after loading
}

// parameters for update each frame
export interface GameUpdateContext {
  seaBlock: SeaBlock
  dt: number // (ms) delta-time since last frame
}

export abstract class Game {
  public gui!: Gui // assigned in create

  public abstract reset(context: SeaBlock): void
  public resetCamera(_context: SeaBlock): void {}

  public elements: Array<GameElement> = [] // mesh specifications

  public meshes: Array<Object3D> = [] // all loaded game-specific meshes
  public pickableMeshes: Array<Object3D> = [] // subset that can be hovered/clicked

  protected getCamOffset(context: SeaBlock): Vector3 {
    const { w, h } = context.layeredViewport
    return h > w ? PORTRAIT_CAMERA : CAMERA
  }

  protected getCamTargetOffset(): Vector3 { return CAMERA_LOOK_AT }
  public doesAllowOrbitControls(_context: SeaBlock): boolean {
    return true
  }

  public doesAllow3DRender(): boolean {
    return true
  }

  public update(_context: GameUpdateContext): void {
    // od nothing
  }

  // static registry pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _registry: Record <GameName, RegisteredGame> = {} as any
  static _preloaded: Partial<Record <GameName, Game>> = {}

  protected constructor() {}

  static register(name: GameName, rg: RegisteredGame): void {
    if (name in this._registry) {
      throw new Error(`Game already registered: '${name}'`)
    }
    this._registry[name] = rg
  }

  static preload(name: GameName, context: SeaBlock): Promise<Array<void>> {
    const { factory, guiName, elements = [] } = this._registry[name]

    // Games are singletons
    // one-time construction
    const instance = factory()
    this._preloaded[name] = instance

    // Game
    // post-construction setup
    instance.elements = elements
    if (context) {
      instance.gui = Gui.create(guiName)
    }

    // // preload all meshes
    return Promise.all(elements.map(async (elem) => {
      const mesh = await elem.meshLoader()
      elem.mesh = mesh
      instance.meshes.push(mesh)
      if (elem.clickAction) {
        mesh.traverse((child) => {
          // checked in moust-touch-input.ts
          (child as any).clickAction = elem.clickAction
        })
        instance.pickableMeshes.push(mesh)
      }
    }))
  }

  static create(name: GameName, context: SeaBlock): Game {
    const instance = this._preloaded[name]
    if (!instance) {
      throw new Error(`game '${name}' was not preloaded`)
    }

    instance.reset(context)
    instance.gui.refreshLayout(context)

    return instance
  }
}

// object that subclassese should pass to Game.register()
interface RegisteredGame {
  readonly factory: () => Game
  readonly guiName: GuiName
  readonly elements?: Array<GameElement>
}
