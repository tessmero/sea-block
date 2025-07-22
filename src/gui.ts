/**
 * @file gui.ts
 *
 * Object that keeps track of layout and hovered/clicked state for some elements.
 * Hover, click, and unclick methods are called in mouse-touch-input.
 */

import type { Vector2 } from 'three'
import type { InputId, KeyCode } from 'input-id'
import type { GameElement } from './games/game'
import type { ProcessedSubEvent } from './mouse-touch-input'
import type { SeaBlock } from './sea-block'
import { parseLayoutRectangles, type ComputedRects, type CssLayout } from './util/layout-parser'
import type { ButtonState } from './gfx/2d/flat-button'

export class Gui {
  public guiLayout?: CssLayout // rules for computing rectangles
  public layoutRectangles: ComputedRects = {}

  // elements that can be hovered or held down
  private readonly pickable: Record<string, GameElement> = {}

  // elements that are currently held down
  private readonly held: Record<string, InputId> = {}

  // element that is currently hovered by mouse
  private hovered?: string

  public getElementState(name: string): ButtonState {
    if (name in this.held) {
      return 'clicked'
    }
    if (name === this.hovered) {
      return 'hovered'
    }
    return 'default'
  }

  constructor(
    private readonly layoutFactory: (context: SeaBlock) => CssLayout,
    private readonly elements: ReadonlyArray<GameElement>,
  ) {
    for (const elem of elements) {
      if (elem.layoutKey) {
        this.pickable[elem.layoutKey] = elem
      }
    }
  }

  // recompute gui element rectangles based on css layout
  public refreshLayout(context: SeaBlock): void {
    const { screenRectangle } = context.layeredViewport
    this.guiLayout = this.layoutFactory(context)
    this.layoutRectangles = parseLayoutRectangles(screenRectangle, this.guiLayout)

    // console.log(`parsed gui layout for game
    //       screen: ${JSON.stringify(screen)}
    //       ${JSON.stringify(this.layoutRectangles)}`)
  }

  protected pickElementAtPoint(p: Vector2): string | undefined {
    // console.log(`picking button at point ${p.x}, ${p.y}`)
    for (const name in this.pickable) {
      const rectangle = this.layoutRectangles[name]
      if (!rectangle) {
        continue // element is not visible
      }
      const { x, y, w, h } = rectangle
      if ((p.x > x) && (p.x < (x + w)) && (p.y > y) && (p.y < (y + h))) {
        // console.log(`picked element: ${name}`)
        document.documentElement.style.cursor = 'pointer'
        return name
      }
    }
    // console.log('picked no element ')
    document.documentElement.style.cursor = 'default'
    return undefined
  }

  // mousemove in mouse-touch-input.ts
  public move(event: ProcessedSubEvent): boolean {
    // const previouslyHovered = this.hovered

    // check if this event id is ongoing drag on pixel gui element
    if (Object.values(this.held).includes(event.inputId)) {
      return true // consume event
    }

    if (event.event.type.startsWith('mouse')) {
      this.hovered = this.pickElementAtPoint(event.lvPos)
    }

    return false // don't consume event, pass through to orbit controls

    // const didChange = previouslyHovered !== this.hovered

    // if (previouslyHovered && didChange
    //   && previouslyHovered !== this.clickedBtn) {
    //   // seaBlock.repaintButton(previouslyHovered, 'default')
    //   playSound('unhover')
    // }

    // if (this.hovered && didChange
    //   && this.hovered !== this.clickedBtn) {
    //   // seaBlock.repaintButton(this.hoveredButton, 'hovered')
    //   playSound('hover')
    // }
  }

  public click(pse: ProcessedSubEvent): boolean {
    // if (seaBlock.isCovering) {
    //   return // disable click during first half of transition
    // }

    const { seaBlock, lvPos, inputId: touchId, event } = pse
    const { held } = this

    //setDebugText(`click ${event.type} ${touchId}`)

    for (const key in held) {
      if (held[key] === touchId) {
        delete held[key]
      }
    }

    const clickedElem = this.pickElementAtPoint(lvPos)
    if (clickedElem) {
      this._click(seaBlock, clickedElem, touchId)
      return true // consume event
    }

    return false // pass through to orbit controls
  }

  public unclick(pse: ProcessedSubEvent) {
    const { seaBlock, inputId: touchId, event } = pse
    //setDebugText(`unclick ${event.type} ${touchId}`)
    this._unclick(seaBlock, touchId)
    // if (seaBlock.isCovering) {
    //   return // disable unclick during first half of transition
    // }

    // if (this.clickedBtn) {
    //   let hoveredBtn: string | undefined
    //   if (mouseState) {
    //     hoveredBtn = this.pickButtonAtPoint(mouseState.lvPos)
    //   }
    //   if (event.type === 'touchend') {
    //     hoveredBtn = undefined
    //   }
    //   seaBlock.repaintButton(this.clickedBtn,
    //     this.clickedBtn === hoveredBtn ? 'hovered' : 'default',
    //   )
    //   playSound('unclick')
    //   seaBlock.unclickButton(this.clickedBtn)
    //   this.clickedBtn = undefined
    // }
    // if (seaBlock.game.doesAllowOrbitControls(seaBlock)) {
    //   seaBlock.orbitControls.enabled = true
    // }
  }

  private _click(seaBlock: SeaBlock, layoutKey: string, touchId: InputId) {
    this.held[layoutKey] = touchId

    const { clickAction } = this.pickable[layoutKey]
    if (clickAction) {
      clickAction(seaBlock)
    }
  }

  private _unclick(seaBlock, touchId) {
    const { held } = this
    for (const key in held) {
      if (held[key] === touchId) {
        const { unclickAction } = this.pickable[key]
        if (unclickAction) {
          unclickAction(seaBlock)
        }

        delete held[key]
      }
    }
  }

  public keydown(seaBlock: SeaBlock, event: KeyboardEvent) {
    const { held } = this
    const touchId = event.code as KeyCode// use key code as touchId

    for (const key in held) {
      if (held[key] === touchId) {
        delete held[key]
      }
    }

    for (const { hotkeys, layoutKey } of this.elements) {
      if (hotkeys?.includes(event.code as KeyCode) && layoutKey) {
        this._click(seaBlock, layoutKey, touchId)
      }
    }
  }

  public keyup(seaBlock: SeaBlock, event: KeyboardEvent) {
    this._unclick(seaBlock, event.code) // use key code as touchId
  }
}