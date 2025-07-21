/**
 * @file layout-parser.ts
 *
 * Compute rectangles relative to viewport, based on css rules.
 *
 * Used to position flat elements and camera-locked meshes.
 */

import { typedEntries } from '../util/typed-entries'

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

type BasicKey = 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'
type ConditionalKey = `min-${BasicKey}` | `max-${BasicKey}`
export type CssKey = BasicKey | ConditionalKey | 'margin'
export type CssValue = number | `${number}%` | 'auto'

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
    let rect: Rectangle = { ...this.parent }

    for (const [cssKey, cssVal] of typedEntries(css)) {
      if (cssKey === 'parent') {
        if (!(cssVal in this._computedRects)) {
          throw new Error(`layout parent '${cssVal}' not defined by any previous rulesets`)
        }
        this.parent = this._computedRects[cssVal] // rectangle of array of rectangles
        rect = { ...this.parent }
      }
      else {
      // Standard CSS rule application
        rect = this.applyRule(rect, cssKey as CssKey, cssVal)
      }
    }

    return { x: rect.x, y: rect.y, w: rect.w, h: rect.h }
  }

  private applyRule(
    rect: Rectangle,
    cssKey: CssKey,
    cssVal: CssValue,
  ): Rectangle {
    const { x, y, w, h } = rect
    const { x: px, y: py, w: pw, h: ph } = this.parent

    const parseVal = (key: string, value: CssValue): number => {
      if (typeof value === 'string' && value.endsWith('%')) {
        const pct = parseFloat(value) / 100
        return ['left', 'right', 'width', 'margin'].includes(key) ? pw * pct : ph * pct
      }
      if (value === 'auto') {
        if (key === 'width') return px + pw - x
        if (key === 'height') return py + ph - y
        return ['left', 'right'].includes(key) ? (pw - w) / 2 : (ph - h) / 2
      }
      return Number(value)
    }

    // // Check for min- or max- prefixes
    const isConditionalKey = (key: CssKey): key is ConditionalKey => key.startsWith('min-') || key.startsWith('max-')
    // const applyConditional = (
    //   condition: 'min' | 'max',
    //   prop: BasicKey,
    //   value: number,
    // ): Rectangle => {
    //   switch (prop) {
    //     case 'width':
    //       return { x, y, w: condition === 'min' ? Math.max(w, value) : Math.min(w, value), h }
    //     case 'height':
    //       return { x, y, w, h: condition === 'min' ? Math.max(h, value) : Math.min(h, value) }
    //     case 'left':
    //       const newLeft = px + value
    //       return { x: condition === 'min' ? Math.max(x, newLeft) : Math.min(x, newLeft), y, w, h }
    //     case 'right':
    //       const newRight = px + pw - w - value
    //       return { x: condition === 'min' ? Math.min(x, newRight) : Math.max(x, newRight), y, w, h }
    //     case 'top':
    //       const newTop = py + value
    //       return { x, y: condition === 'min' ? Math.max(y, newTop) : Math.min(y, newTop), w, h }
    //     case 'bottom':
    //       const newBottom = py + ph - h - value
    //       return { x, y: condition === 'min' ? Math.min(y, newBottom) : Math.max(y, newBottom), w, h }
    //     default:
    //       return rect
    //   }
    // }

    if (isConditionalKey(cssKey)) {
      throw new Error('min- and max- prefixes not supported')
      // const [prefix, rawKey] = cssKey.split('-') as ['min' | 'max', BasicKey]
      // const value = parseVal(cssKey, cssVal)
      // return applyConditional(prefix, rawKey, value)
    }

    // Handle basic keys and margin
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
