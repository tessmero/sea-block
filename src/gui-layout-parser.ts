/**
 * @file gui-layout-parser.ts
 *
 * Compute rectangles relative to viewport, based on css rules.
 *
 * Used to align games' gui elements with the camera.
 */

import { typedEntries } from './typed-entries'

// input named rulesets
export type CssLayout = Readonly<Record<string, CssRuleset>>

// output named rectangles
export type ComputedRects = Readonly<Record<string, Rectangle>>

// A ruleset describing one rectangle
export type CssRuleset = Readonly<Partial<
  { [K in CssKey]: CssValue }
  & { parent: string }
>>

// parsed output for one rectangle
export type Rectangle = Readonly<{
  x: number // top
  y: number // left
  w: number // width
  h: number // height
}>

export type CssValue = number | `${number}%` | 'auto'
const _CSS_KEYS = ['left', 'top', 'right', 'bottom', 'width', 'height', 'margin'] as const
export type CssKey = (typeof _CSS_KEYS)[number]

export function parseLayoutRectangles(screenRect: Rectangle, css: CssLayout): ComputedRects {
  const glp = new GuiLayoutParser(screenRect, css)
  return glp._computedRects
}

class GuiLayoutParser {
  public readonly _computedRects: Record<string, Rectangle> = {}

  private parent: Rectangle

  constructor(screenRect: Rectangle, css: CssLayout) {
    this.parent = screenRect
    for (const [key, rules] of Object.entries(css)) {
      this._computedRects[key] = this.floorRect(this.computeRect(rules))
    }
  }

  private floorRect(rect: Rectangle): Rectangle {
    const { x, y, w, h } = rect
    return {
      x: Math.floor(x),
      y: Math.floor(y),
      w: Math.floor(w),
      h: Math.floor(h),
    }
  }

  private computeRect(css: CssRuleset): Rectangle {
    const { parent } = this
    let rect: Rectangle = { ...parent }

    for (const [cssKey, cssVal] of typedEntries(css)) {
      if (cssKey === 'parent') {
        if (!(cssVal in this._computedRects)) {
          throw new Error(`layout parent '${cssVal}' not defined by any previous rulesets`)
        }
        this.parent = this._computedRects[cssVal] // rectangle of array of rectangles
      }
      else {
      // Standard CSS rule application
        rect = this.applyRule(parent, rect, cssKey as keyof CssRuleset, cssVal)
      }
    }

    return { x: rect.x, y: rect.y, w: rect.w, h: rect.h }
  }

  private applyRule(
    parent: Rectangle,
    rect: Rectangle,
    cssKey: keyof CssRuleset,
    cssVal: CssValue,
  ): Rectangle {
    const { x, y, w, h } = rect
    const { x: px, y: py, w: pw, h: ph } = parent

    const parseVal = (key: string, value: CssValue): number => {
      if (typeof value === 'string' && value.endsWith('%')) {
        const pct = parseFloat(value) / 100
        return ['left', 'right', 'width', 'margin'].includes(key) ? pw * pct : ph * pct
      }
      if (value === 'auto') {
        if (key === 'width') return px + pw - x
        if (key === 'height') return py + ph - y
        return ['left', 'right'].includes(key) ? pw / 2 : ph / 2
      }
      return Number(value)
    }

    switch (cssKey) {
      case 'left': return { x: px + parseVal('left', cssVal), y, w, h }
      case 'right': return { x: px + pw - w - parseVal('right', cssVal), y, w, h }
      case 'top': return { x, y: py + parseVal('top', cssVal), w, h }
      case 'bottom': return { x, y: py + ph - h - parseVal('bottom', cssVal), w, h }
      case 'width': return { x, y, w: parseVal('width', cssVal), h }
      case 'height': return { x, y, w, h: parseVal('height', cssVal) }
      case 'margin': {
        const d = parseVal('margin', cssVal)
        return { x: x - d, y: y - d, w: w + 2 * d, h: h + 2 * d }
      }
      default: return rect
    }
  }
}
