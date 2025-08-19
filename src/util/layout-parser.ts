/**
 * @file layout-parser.ts
 *
 * Compute rectangles relative to viewport, based on css rules.
 * Used to position flat elements and camera-locked meshes.
 */

import { typedEntries } from '../util/typed-entries'

// input named rulesets
export type CssLayout<TLayoutKey extends string = string>
  = Readonly<Partial<Record<
    TLayoutKey, CssRuleset<TLayoutKey>
  >>>

// output named rectangles
export type ComputedRects = Readonly<Partial<Record<string, Rectangle>>>

// A ruleset describing one rectangle
export type CssRuleset<TLayoutKey extends string = string> = Readonly<Partial<
  { [K in CssKey | CssKeyAtCond]: CssValue }
  & { parent: TLayoutKey }
  & { children: CssLayout<string> }
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
export type CssKeyAtCond = `${CssKey}@${AtCond}`
export type AtCond = 'portrait' | 'landscape'
export type CssValue = number | `${number}%` | 'auto'

export function parseLayoutRectangles(screenRect: Rectangle, css: CssLayout): ComputedRects {
  const glp = new GuiLayoutParser(screenRect, css)
  return glp._computedRects
}

class GuiLayoutParser<TLayoutKey extends string> {
  public readonly _computedRects: Partial<Record<TLayoutKey, Rectangle>> = {}

  private isPortrait = false
  private isLandscape = false
  private parent: Rectangle

  private _currentLayoutKey: string = ''
  private _childrenToParse: Record<string, CssLayout> = {}

  constructor(screenRect: Rectangle, css: CssLayout) {
    if (screenRect.w > screenRect.h) {
      this.isLandscape = true
    }
    else {
      this.isPortrait = true
    }
    this.parent = screenRect
    for (const [key, rules] of Object.entries(css)) {
      this.parent = screenRect
      this._currentLayoutKey = key
      this._computedRects[key] = this.floorRect(this.computeRect(rules as CssRuleset))
    }

    // parse any sub-layouts defined in 'children' properties
    const toParse = this._childrenToParse
    while (Object.keys(toParse).length > 0) {
      const parentKey = Object.keys(toParse)[0]
      const subLayout = toParse[parentKey]
      delete toParse[parentKey]
      const parentRect = this._computedRects[parentKey]
      const { _computedRects: subRects } = new GuiLayoutParser(parentRect, subLayout)
      for (const subKey in subRects) {
        this._computedRects[`${parentKey}.${subKey}`] = subRects[subKey]
      }
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
      else if (cssKey === 'children') {
        this._childrenToParse[this._currentLayoutKey] = cssVal as CssLayout
      }
      else {
      // Standard CSS rule application
        if (cssKey.includes('@')) {
          const [prefix, suffix] = cssKey.split('@')
          if (suffix === 'portrait') {
            if (this.isPortrait) {
              rect = this.applyRule(rect, prefix as CssKey, cssVal)
            }
          }
          else if (suffix === 'landscape') {
            if (this.isLandscape) {
              rect = this.applyRule(rect, prefix as CssKey, cssVal)
            }
          }
          else {
            throw new Error(`invalid @ condition suffix: '${suffix}'. expected portait or landscape.`)
          }
        }
        else {
          // csskey has no @ condition
          rect = this.applyRule(rect, cssKey as CssKey, cssVal)
        }
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
      else if (value === 'auto') {
        if (key === 'width') return px + pw - x
        if (key === 'height') return py + ph - y
        return ['left', 'right'].includes(key) ? (pw - w) / 2 : (ph - h) / 2
      }
      else if (typeof value === 'number' && value < 0) {
        if (key === 'width') return pw + value
        if (key === 'height') return ph + value
      }
      return Number(value)
    }

    // // Check for min- or max- prefixes
    const conditionDashKey = cssKey.split('-')
    if (conditionDashKey.length === 2) {
      const [cnd, key] = conditionDashKey
      let limiter: (a: number, b: number) => number

      if (cnd === 'min') {
        limiter = Math.max
      }
      else if (cnd === 'max') {
        limiter = Math.min
      }
      else {
        throw new Error('only min- or max- prefixed allowed')
      }

      if (key === 'width') {
        return { ...rect, w: limiter(w, parseVal('width', cssVal)) }
      }
      else if (key === 'height') {
        return { ...rect, h: limiter(h, parseVal('height', cssVal)) }
      }
      else {
        throw new Error('only min/max-width or -height allowed')
      }
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
        return { x: x + d, y: y + d, w: w - 2 * d, h: h - 2 * d }
      }
      default: return rect
    }
  }
}
