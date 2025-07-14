/**
 * @file flat-game-ui.ts
 *
 * Used in game.ts to help with buttons that
 * appear on the front layer and can be hovered and clicked.
 */

import type { Vector2 } from 'three'
import type { GameUpdateContext, MouseState } from '../games/game'
import type { FlatButton } from '../gfx/2d/flat-button'
import type { LayeredViewport } from '../gfx/layered-viewport'
import type { ComputedRects, CssLayout } from '../gui-layout-parser'
import { parseLayoutRectangles } from '../gui-layout-parser'
import type { SeaBlock } from '../sea-block'
import { playSound } from '../sounds'

export class FlatGameUi {
  public layoutRectangles: ComputedRects = {}
  public layoutButtons: Record<string, FlatButton> = {}

  constructor(public readonly guiLayout: CssLayout) {}

  public refreshLayout(layeredViewport: LayeredViewport): void {
    const screen = {
      x: 0,
      y: 0,
      w: layeredViewport.w,
      h: layeredViewport.h,
    }
    this.layoutRectangles = parseLayoutRectangles(screen, this.guiLayout)

    // console.log(`parsed gui layout for game
    //       screen: ${JSON.stringify(screen)}
    //       ${JSON.stringify(this.layoutRectangles)}`)
  }

  protected pickButtonAtPoint(p: Vector2): string | undefined {
    // console.log(`picking button at point ${p.x}, ${p.y}`)
    for (const name in this.guiLayout) {
      const { x, y, w, h } = this.layoutRectangles[name]
      if ((p.x > x) && (p.x < (x + w)) && (p.y > y) && (p.y < (y + h))) {
        // console.log(`picked button: ${name}`)
        return name
      }
    }
    // console.log('picked no button ')
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
      playSound('unHover')
    }

    if (this.hoveredButton && didChange
      && this.hoveredButton !== this.clickedBtn) {
      seaBlock.repaintButton(this.hoveredButton, 'hovered')
      playSound('hover')
    }
  }

  public click(seaBlock: SeaBlock, mouseState: MouseState) {
    if (seaBlock.isCovering) {
      return // disable click during first half of transition
    }

    this.clickedBtn = this.pickButtonAtPoint(mouseState.lvPos)
    if (this.clickedBtn) {
      seaBlock.repaintButton(this.clickedBtn, 'clicked')

      playSound('click')

      seaBlock.clickButton(this.clickedBtn)
      seaBlock.orbitControls.enabled = false
    }
  }

  public clickedBtn?: string

  public unclick(seaBlock: SeaBlock, mouseState?: MouseState) {
    if (seaBlock.isCovering) {
      return // disable unclick during first half of transition
    }

    if (this.clickedBtn) {
      let hoveredBtn: string | undefined
      if (mouseState) {
        hoveredBtn = this.pickButtonAtPoint(mouseState.lvPos)
      }
      seaBlock.repaintButton(this.clickedBtn,
        this.clickedBtn === hoveredBtn ? 'hovered' : 'default',
      )
      this.clickedBtn = undefined
    }
    seaBlock.orbitControls.enabled = true
  }
}
