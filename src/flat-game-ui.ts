/**
 * @file flat-game-ui.ts
 *
 * Used in game.ts to help with buttons that
 * appear on the front layer and can be hovered and clicked.
 */

import type { Vector2 } from 'three'
import type { ComputedRects, CssLayout } from './util/layout-parser'
import { parseLayoutRectangles } from './util/layout-parser'
import type { LayeredViewport } from './gfx/layered-viewport'
import type { GameElement, GameUpdateContext, MouseState } from './games/game'
import { playSound } from './sounds'
import type { SeaBlock } from './sea-block'

export class FlatGameUi {
  public layoutRectangles: ComputedRects = {}
  public lastDrawnState: Record<string, string> = {}
  private readonly pickableKeys: ReadonlyArray<string>

  constructor(
    public readonly guiLayout: CssLayout,
    elements: ReadonlyArray<GameElement>,
  ) {
    // only pick rectangles that were actually used for elements
    this.pickableKeys = elements.flatMap(
      elem => elem.layoutKey ? [elem.layoutKey] : [],
    )
  }

  public refreshLayout(layeredViewport: LayeredViewport): void {
    this.layoutRectangles = parseLayoutRectangles(layeredViewport.screenRectangle, this.guiLayout)

    // console.log(`parsed gui layout for game
    //       screen: ${JSON.stringify(screen)}
    //       ${JSON.stringify(this.layoutRectangles)}`)
  }

  protected pickButtonAtPoint(p: Vector2): string | undefined {
    // console.log(`picking button at point ${p.x}, ${p.y}`)
    for (const name of this.pickableKeys) {
      const { x, y, w, h } = this.layoutRectangles[name]
      if ((p.x > x) && (p.x < (x + w)) && (p.y > y) && (p.y < (y + h))) {
        // console.log(`picked button: ${name}`)
        document.documentElement.style.cursor = 'pointer'
        return name
      }
    }
    // console.log('picked no button ')
    document.documentElement.style.cursor = 'default'
    return undefined
  }

  public hoveredButton?: string

  public update(context: GameUpdateContext): void {
    const { mouseState, seaBlock } = context

    if (seaBlock.isCovering) {
      return // don't update ui during first half of transition
    }

    const previouslyHovered = this.hoveredButton

    if (mouseState) {
      this.hoveredButton = this.pickButtonAtPoint(mouseState.lvPos)
    }
    else {
      this.hoveredButton = undefined
    }

    const didChange = previouslyHovered !== this.hoveredButton

    if (previouslyHovered && didChange
      && previouslyHovered !== this.clickedBtn) {
      seaBlock.repaintButton(previouslyHovered, 'default')
      // playSound('unHover')
    }

    if (this.hoveredButton && didChange
      && this.hoveredButton !== this.clickedBtn) {
      seaBlock.repaintButton(this.hoveredButton, 'hovered')
      playSound('hover')
    }
  }

  public click(event: Event, seaBlock: SeaBlock, mouseState: MouseState) {
    if (seaBlock.isCovering) {
      return // disable click during first half of transition
    }
    const previouslyClicked = this.clickedBtn
    this.clickedBtn = this.pickButtonAtPoint(mouseState.lvPos)
    if (this.clickedBtn) {
      // if (event.type === 'mousedown') seaBlock.orbitControls.enabled = false
      seaBlock.orbitControls.enabled = false
      seaBlock.clickButton(this.clickedBtn)
    }
    else {
      if (event.type === 'touchstart' && previouslyClicked) {
        seaBlock.repaintButton(previouslyClicked, 'default')
        seaBlock.unclickButton(previouslyClicked)
      }
    }
  }

  public clickedBtn?: string

  public unclick(event: Event, seaBlock: SeaBlock, mouseState?: MouseState) {
    if (seaBlock.isCovering) {
      return // disable unclick during first half of transition
    }

    if (this.clickedBtn) {
      let hoveredBtn: string | undefined
      if (mouseState) {
        hoveredBtn = this.pickButtonAtPoint(mouseState.lvPos)
      }
      if (event.type === 'touchend') {
        hoveredBtn = undefined
      }
      seaBlock.repaintButton(this.clickedBtn,
        this.clickedBtn === hoveredBtn ? 'hovered' : 'default',
      )
      playSound('unclick')
      seaBlock.unclickButton(this.clickedBtn)
      this.clickedBtn = undefined
    }
    if (seaBlock.game.enableOrbitControls()) {
      seaBlock.orbitControls.enabled = true
    }
  }
}
