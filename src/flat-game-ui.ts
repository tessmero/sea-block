/**
 * @file flat-game-ui.ts
 *
 * Used in game.ts to help with buttons that
 * appear on the front layer and can be hovered and clicked.
 */

import type { Vector2 } from 'three'
import type { ComputedRects, CssLayout } from './util/layout-parser'
import { parseLayoutRectangles } from './util/layout-parser'
import type { GameElement, GameUpdateContext } from './games/game'
import type { SeaBlock } from './sea-block'
import { playSound } from './sound/sound-effects'
import type { MouseState } from './mouse-input'

export class FlatGameUi {
  public layoutRectangles: ComputedRects = {}
  public lastDrawnState: Record<string, string> = {}
  private readonly pickableKeys: ReadonlyArray<string>
  public guiLayout?: CssLayout

  constructor(
    private readonly layoutFactory: (context: SeaBlock) => CssLayout,
    elements: ReadonlyArray<GameElement>,
  ) {
    // only pick rectangles that were actually used for elements
    this.pickableKeys = elements.flatMap(
      elem => elem.layoutKey ? [elem.layoutKey] : [],
    )
  }

  public refreshLayout(context: SeaBlock): void {
    const { screenRectangle } = context.layeredViewport
    this.guiLayout = this.layoutFactory(context)
    this.layoutRectangles = parseLayoutRectangles(screenRectangle, this.guiLayout)

    // console.log(`parsed gui layout for game
    //       screen: ${JSON.stringify(screen)}
    //       ${JSON.stringify(this.layoutRectangles)}`)
  }

  protected pickButtonAtPoint(p: Vector2): string | undefined {
    // console.log(`picking button at point ${p.x}, ${p.y}`)
    for (const name of this.pickableKeys) {
      const rectangle = this.layoutRectangles[name]
      if (!rectangle) {
        continue
      }
      const { x, y, w, h } = rectangle
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
    const { seaBlock } = context
    const { mouseState } = seaBlock

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
      playSound('unhover')
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

  public unclick(event: Event, seaBlock: SeaBlock) {
    if (seaBlock.isCovering) {
      return // disable unclick during first half of transition
    }
    const { mouseState } = seaBlock

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
    if (seaBlock.game.doesAllowOrbitControls(seaBlock)) {
      seaBlock.orbitControls.enabled = true
    }
  }
}
