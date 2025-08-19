/**
 * @file zoom-transition.ts
 *
 * Transition where one gui element expands until one of
 * its pixels covers the screen.
 */

import type { SeaBlock } from 'sea-block'
import { Transition } from '../transition'
import type { GuiElement } from 'guis/gui'
import type { Rectangle } from 'util/layout-parser'
import type { TransitionName } from 'imp-names'
import { randChoice } from 'util/rng'

export class ZoomTransition extends Transition {
  static { Transition.register('zoom', () => new ZoomTransition()) }

  private hideTarget!: GuiElement
  private startRect!: Rectangle
  private endRect!: Rectangle

  private hideImage!: OffscreenCanvas

  private zoomShow!: Transition
  public static target?: GuiElement

  public cleanupHide(): void {
    super.cleanupHide()

    // avoid leaving target assigned since it may not be in next gui
    ZoomTransition.target = undefined
  }

  protected reset(context: SeaBlock): void {
    this.hideTarget = ZoomTransition.target || Object.values(context.game.gui.elements)[0] as GuiElement
    const start = context.game.gui.layoutRectangles[this.hideTarget.layoutKey]
    const image = this.hideTarget.display.imageset?.pressed
    if (!start) {
      throw new Error('hide target not in layout')
    }
    if (!image) {
      throw new Error('hide target has no pressed image')
    }
    this.startRect = start
    this.hideImage = image

    // find black pixel nearest to center, or center
    const w = image.width
    const h = image.height
    const ctx = image.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const cx = Math.floor(w / 2)
    const cy = Math.floor(h / 2)
    let minDist = Infinity
    let targetX = cx, targetY = cy
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const idx = (y * w + x) * 4
        const r = data[idx], g = data[idx + 1], b = data[idx + 2]
        // Consider pixel black if all channels < 32
        if (r < 32 && g < 32 && b < 32) {
          const dist = (x - cx) * (x - cx) + (y - cy) * (y - cy)
          if (dist < minDist) {
            minDist = dist
            targetX = x
            targetY = y
          }
        }
      }
    }

    // // Color the target pixel red for debugging
    // const targetIdx = (targetY * w + targetX) * 4
    // data[targetIdx] = 255
    // data[targetIdx + 1] = 0
    // data[targetIdx + 2] = 0
    // ctx.putImageData(imageData, 0, 0)

    // Compute endRect so that the target pixel covers the whole screen
    const screenRect = this.layeredViewport.screenRectangle

    // The scale needed so that 1 pixel covers the whole screen
    const scaleX = screenRect.w
    const scaleY = screenRect.h

    // Center the target pixel on the screen
    this.endRect = {
      x: screenRect.x - targetX * scaleX,
      y: screenRect.y - targetY * scaleY,
      w: w * scaleX,
      h: h * scaleY,
    }

    // delegate to another transition for show
    const showType: TransitionName = Transition.isFirstUncover
      ? 'ss'
      : randChoice(['ss', 'flat'] as const)
    this.zoomShow = Transition.create(showType, context)
  }

  public _hide(t0: number, t1: number): void {
    const ctx = this.layeredViewport.frontCtx

    // Disable antialiasing (image smoothing)
    ctx.imageSmoothingEnabled = false

    const { width, height } = this.hideImage
    // Ease-in: accelerate (quadratic)
    const easedT = Math.pow(t1, 5) * 1.2
    const { x, y, w, h } = lerpRects(this.startRect, this.endRect, easedT)

    ctx.drawImage(this.hideImage,
      0, 0, width, height, // from hide image
      x, y, w, h, // to screen
    )
  }

  public _show(t0: number, t1: number): void {
    this.zoomShow._show(t0, t1)
  }
}

function lerpRects(r0: Rectangle, r1: Rectangle, alpha: number): Rectangle {
  // Linear interpolation for each property
  return {
    x: r0.x + (r1.x - r0.x) * alpha,
    y: r0.y + (r1.y - r0.y) * alpha,
    w: r0.w + (r1.w - r0.w) * alpha,
    h: r0.h + (r1.h - r0.h) * alpha,
  }
}
