/**
 * @file gui.ts
 *
 * Object that keeps track of layout and hovered/clicked state for some elements.
 * Hover, click, and unclick methods are called in mouse-touch-input.
 */

import type { Rectangle } from 'util/layout-parser'
import { parseLayoutRectangles, type ComputedRects, type CssLayout } from 'util/layout-parser'
import type { Vector2 } from 'three'
import { type InputId, type KeyCode } from 'input-id'
import type { ProcessedSubEvent } from 'mouse-touch-input'
import type { SeaBlock } from 'sea-block'
import type { GuiName } from 'imp-names'
import type { BorderVariant, ElementType } from 'gfx/2d/element-imageset-builder'
import { getElementImageset } from 'gfx/2d/element-imageset-builder'
import { resetLastDrawnStates } from 'gfx/2d/flat-gui-gfx-helper'
import type { ImageAssetUrl } from 'gfx/2d/image-asset-loader'
import type { FontVariant, TextAlign } from 'gfx/2d/pixel-text-gfx-helper'
import { getElementDims } from './layouts/layout-helper'

export type GuiElement = {
  display: ElementDisplayParams
  layoutKey: string // must have layout rectangle
  slideIn?: string // slide within outer rectangle
  clickAction?: (event: ElementEvent) => void
  dragAction?: (event: ElementEvent) => void
  unclickAction?: (event: ElementEvent) => void
  isSticky?: boolean
  hotkeys?: ReadonlyArray<KeyCode> // bound keyboard keys
}

// sliders define "slideIn" property pointing to a layout key
export type Slider = GuiElement & { slideIn: string }

// event passed to clickAction and other callbacks
export type ElementEvent = {
  seaBlock: SeaBlock
  inputEvent: ProcessedSubEvent | KeyboardEvent // mouse/touch/key
  sliderState?: SliderState // only for sliders
}

// state of a slider inside its container
export type SliderState = {
  slider: Rectangle
  container: Rectangle
}

// display settings for an element
export type ElementDisplayParams = {
  readonly type: ElementType
  readonly border?: BorderVariant
  readonly icon?: ImageAssetUrl
  readonly label?: string
  readonly font?: FontVariant
  readonly textAlign?: TextAlign

  isVisible?: boolean
  needsUpdate?: boolean // request repaint
  forcedState?: ButtonState
}

export const BUTTON_STATES = ['default', 'pressed', 'hovered'] as const
export type ButtonState = (typeof BUTTON_STATES)[number]

// element uid
export type ElementId = `_${number}` // not parse-able as number
let nextElementId = 0

export class Gui {
  public guiLayout?: CssLayout // rules for computing rectangles
  public layoutRectangles: ComputedRects = {}
  public overrideLayoutRectangles: Record<string, Rectangle> = {}
  // public elementOcclusions: Record<ElementId, Set<ElementId>> = {}

  public elements: Record<ElementId, GuiElement> = {}
  public reversedIds!: ReadonlyArray<ElementId> // assigned in init

  // subset of elements that are currently held down by a mouse/touch/key
  private held: Record<ElementId, InputId> = {}

  // pickable element ID -> layout key
  private readonly pickable: Record<ElementId, string> = {} // subset that interact with mouse
  private readonly panels: Set<ElementId> = new Set() // subset that only consume events
  private readonly stuckDown: Set<ElementId> = new Set() // subset of elements
  private readonly hidden: Set<ElementId> = new Set() // subset of elements
  private hovered?: ElementId // element hovered by mouse

  public resetElementStates() {
    resetLastDrawnStates(this)
    this.stuckDown.clear()
    this.hovered = undefined
    this.held = {}
  }

  public getElementState(id: ElementId): ButtonState {
    // if( this.panels.has(name) ){
    //   return 'default'
    // }
    if (this.stuckDown.has(id)) {
      return 'pressed'
    }
    if (id in this.held) {
      return 'pressed'
    }
    if (id === this.hovered) {
      return 'hovered'
    }
    return 'default'
  }

  // assigned in create -> init
  private layoutFactory!: (context: SeaBlock) => CssLayout

  // called in create
  init(
    layoutFactory: (context: SeaBlock) => CssLayout,
    elements: ReadonlyArray<GuiElement>,
  ) {
    this.layoutFactory = layoutFactory
    for (const elem of elements) {
      // const index = elements.length - 1 - revIndex
      const id: ElementId = `_${nextElementId++}` // shouldn't be parse-able as number
      // console.log(`assigning element ID ${id}`)
      this.elements[id] = elem
      if (
        'display' in elem
        && (['panel']).includes(elem.display.type)
        && !elem.clickAction && !elem.dragAction
      ) {
        this.panels.add(id) // element does nothing but consume events
      }
    }

    this.reversedIds = ([...Object.keys(this.elements)]).reverse() as Array<ElementId>
    for (const id of this.reversedIds) {
      const elem = this.elements[id]
      if (elem.layoutKey
      // && (['panel', 'button', 'joyRegion']).includes(elem.display.type)
      ) {
        this.pickable[id] = elem.slideIn || elem.layoutKey
      }
    }
  }

  // recompute gui element rectangles based on css layout
  public refreshLayout(context: SeaBlock): void {
    const { screenRectangle } = context.layeredViewport
    this.guiLayout = this.layoutFactory(context)
    this.layoutRectangles = parseLayoutRectangles(screenRectangle, this.guiLayout)

    // this.elementOcclusions = computeElementOcclusions(this.elements, this.layoutRectangles)

    // console.log(`parsed gui layout for game
    //       screen: ${JSON.stringify(screen)}
    //       ${JSON.stringify(this.layoutRectangles)}`)
  }

  protected pickElementAtPoint(p: Vector2): ElementId | undefined {
    // console.log(`picking button at point ${p.x}, ${p.y}: ${JSON.stringify(this.pickable)}`)
    for (const id in this.pickable) {
      // console.log(`gui ${this.constructor.name} try picking ${id} at ${this.pickable[id]}}`)
      const layoutKey = this.pickable[id]
      const rectangle = this.overrideLayoutRectangles[layoutKey] || this.layoutRectangles[layoutKey]
      if (!rectangle) {
        continue // element is not pickable
      }
      const { x, y, w, h } = rectangle
      if ((p.x > x) && (p.x < (x + w)) && (p.y > y) && (p.y < (y + h))) {
        // console.log(`picked element: ${id} in ${this.pickable[id]}`)
        // document.documentElement.style.cursor = 'pointer'
        return id as ElementId
      }
    }
    // console.log('picked no element ')
    // document.documentElement.style.cursor = 'default'
    return undefined
  }

  // mousemove in mouse-touch-input.ts
  public move(inputEvent: ProcessedSubEvent): boolean {
    // const previouslyHovered = this.hovered

    // console.log(`gui move ${this.constructor.name}`)

    if (inputEvent.event.type.startsWith('mouse')) {
      this.hovered = this.pickElementAtPoint(inputEvent.lvPos)
      if (this.hovered && !this.panels.has(this.hovered)) {
        document.documentElement.style.cursor = 'pointer'
      }
    }

    // check if this event id is ongoing drag of gui element
    const held = Object.entries(this.held).find(([_key, val]) => val === inputEvent.inputId)
    if (held) {
      const [elementId, _inputId] = held
      const elem = this.elements[elementId] as GuiElement

      let sliderState: SliderState | undefined = undefined

      if (elem.slideIn) {
        sliderState = this._slide(elem as Slider, inputEvent.lvPos) // dragging slider
      }

      if (elem.dragAction) {
        elem.dragAction({ seaBlock: inputEvent.seaBlock, inputEvent, sliderState })
      }
      return true // consume event
    }

    return false // pass through to next gui layer or orbit controls
  }

  public click(inputEvent: ProcessedSubEvent): boolean {
    // if (seaBlock.isCovering) {
    //   return // disable click during first half of transition
    // }

    const { seaBlock, lvPos, inputId: touchId } = inputEvent
    const { held } = this

    // setDebugText(`click ${event.type} ${touchId}`)

    for (const key in held) {
      if (held[key] === touchId) {
        delete held[key]
      }
    }

    const clickedElem = this.pickElementAtPoint(lvPos)
    if (clickedElem) {
      if (!this.panels.has(clickedElem)) {
        // element is not just a panel - may have further interaction with mouse
        this._click({ seaBlock, inputEvent }, clickedElem)
      }

      return true // consume event
    }

    return false // pass through to next gui layer or orbit controls
  }

  public unclick(pse: ProcessedSubEvent) {
    const { seaBlock, inputId: touchId } = pse
    // setDebugText(`unclick ${event.type} ${touchId}`)
    this._unclick(seaBlock, touchId)
  }

  private _click(
    event: ElementEvent,
    elementId: ElementId) {
    // console.log(`gui _click on ${layoutKey}`)

    const { inputEvent } = event
    const { lvPos } = inputEvent as ProcessedSubEvent
    const inputId = inputEvent instanceof KeyboardEvent ? inputEvent.code as KeyCode : inputEvent.inputId
    this.held[elementId] = inputId

    const elem = this.elements[elementId]
    const { slideIn, isSticky, clickAction } = elem

    if (lvPos && slideIn) {
      event.sliderState = this._slide(elem as Slider, lvPos)
    }

    if (isSticky) {
      this.stuckDown.add(elementId)
    }
    if (clickAction) {
      clickAction(event)
    }
  }

  private _slide(elem: Slider, lvPos: Vector2): SliderState | undefined {
    const { layoutKey, slideIn } = elem
    const sliderRect = this.layoutRectangles[layoutKey]
    const { w, h } = sliderRect // maintain original dimensions
    const desiredRect = { x: lvPos.x - w / 2, y: lvPos.y - h / 2, w, h } // centered at mouse
    const container = this.layoutRectangles[slideIn]
    const restrictedRect = fitRectangleInContainer(desiredRect, container)// restricted to container
    if (!restrictedRect) {
      return // doesn't fit in container
    }
    this.overrideLayoutRectangles[layoutKey] = restrictedRect // set new position
    // console.log(`set new position for ${layoutKey}: ${JSON.stringify(restrictedRect)}`)
    elem.display.needsUpdate = true

    return {
      slider: restrictedRect,
      container,
    }
  }

  private _unclick(seaBlock, touchId) {
    const { held } = this
    for (const id in held) {
      // reset dragged slider
      const elem = this.elements[id]
      const { layoutKey } = elem
      const { overrideLayoutRectangles } = this
      delete overrideLayoutRectangles[layoutKey]

      if (held[id] === touchId) {
        const { unclickAction } = this.elements[id]
        if (unclickAction) {
          unclickAction(seaBlock)
        }

        delete held[id]
      }
    }
  }

  public keydown(seaBlock: SeaBlock, inputEvent: KeyboardEvent) {
    const { held } = this
    const touchId = inputEvent.code as KeyCode// use key code as touchId

    for (const key in held) {
      if (held[key] === touchId) {
        delete held[key]
      }
    }

    for (const id in this.elements) {
      const { hotkeys } = this.elements[id]
      if (hotkeys?.includes(inputEvent.code as KeyCode)) {
        this._click({ seaBlock, inputEvent }, id as ElementId)
      }
    }
  }

  public keyup(seaBlock: SeaBlock, event: KeyboardEvent) {
    this._unclick(seaBlock, event.code) // use key code as touchId
  }

  // static registry pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static _registry: Record <GuiName, RegisteredGui> = {} as any
  static _preloaded: Partial<Record <GuiName, Gui>> = {}

  protected constructor() {}

  static register(name: GuiName, rg: RegisteredGui): void {
    if (name in this._registry) {
      throw new Error(`Game already registered: '${name}'`)
    }
    this._registry[name] = rg
  }

  static preload(name: GuiName, context: SeaBlock): Promise<Array<void>> {
    const { factory, layoutFactory, elements, allLayouts } = this._registry[name]

    // Gui
    // one-time singleton construction
    const instance = factory()

    // Gui
    // post-construction setup
    instance.init(layoutFactory, elements)

    this._preloaded[name] = instance

    // // preload all element imagesets
    const layouts = allLayouts || [layoutFactory(context)]
    const elementDims = getElementDims(elements, layouts)
    return Promise.all(elements.map(async (elem) => {
      const { w, h } = elementDims[elem.layoutKey]
      getElementImageset({ ...elem.display, w, h })
      // const imageset = getElementImageset({ ...elem.display, w, h })
      // loadedImagesets[elem] = imageset // flat-gui-gfx-helper.ts
      return
    }))
  }

  static create(name: GuiName): Gui {
    if (name in Gui._preloaded) {
      return Gui._preloaded[name] as Gui
    }
    throw new Error(`gui '${name}' was not preloaded`)
  }
}

type RegisteredGui = {
  factory: () => Gui
  layoutFactory: (context: SeaBlock) => CssLayout
  allLayouts?: Array<CssLayout> // only necessary if multiple layouts
  elements: Array<GuiElement>
}

function fitRectangleInContainer(desired: Rectangle, container: Rectangle): Rectangle | undefined {
  let { x, y } = desired
  const { w, h } = desired

  // // Adjust width and height if larger than container
  // if (w > container.w) w = container.w
  // if (h > container.h) h = container.h

  if (w > container.w || h > container.h) {
    return
  }

  // Adjust x position
  if (x < container.x) {
    x = container.x
  }
  else if (x + w > container.x + container.w) {
    x = container.x + container.w - w
  }

  // Adjust y position
  if (y < container.y) {
    y = container.y
  }
  else if (y + h > container.y + container.h) {
    y = container.y + container.h - h
  }

  return { x, y, w, h }
}
