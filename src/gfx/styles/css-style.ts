/**
 * @file css-style.ts
 *
 * Transform/replace colors in from default style based on css rules.
 */

import { Color } from 'three'
import { BaseStyle } from './base-style'
import { TileParams, TileStyle } from './style'

export type CssKey = 'value' | 'red' | 'green' | 'blue' | 'hue' | 'saturation' | 'lightness'
export type CssValue = string | number
export type CssRuleset = Partial<Record<CssKey, CssValue>>

export type Css = {
  background?: CssRuleset
  top?: CssRuleset
  sides?: CssRuleset
}

export class CssStyle extends BaseStyle {
  constructor(public readonly css: Css) { super() }

  // overrid backgrond (no @conditions allowed)
  public background: Color = applyRuleset(this.background, this.css.background)

  // override non-background colors
  public getTileStyle(params: TileParams): TileStyle {
    const result = super.getTileStyle(params)
    for (const [selector, ruleset] of Object.entries(this.css)) {
      const [key, atCondition] = selector.split('@')
      if (key !== 'background' && shouldParse(atCondition, params)) {
        result[key] = applyRuleset(result[key], ruleset, params)
      }
    }
    return result
  }
}

function applyRuleset(color: Color, ruleset?: CssRuleset, params?: TileParams): Color {
  if (!ruleset) {
    return color
  }
  for (const [rawKey, value] of Object.entries(ruleset)) {
    const [cssKey, atCondition] = rawKey.split('@')
    if (shouldParse(atCondition, params)) {
      color = ruleHandlers[cssKey](color, value)
    }
  }
  return color
}

function shouldParse(atCondition: string, params?: TileParams): boolean {
  if (!atCondition || !params) {
    return true
  }

  return params[atCondition]
}

// function that parses one css value and updates color
type RuleHandler = (color: Color, val: CssValue) => Color

// functions for each css key
const ruleHandlers: Record<CssKey, RuleHandler> = {
  red: rgbHandler('r'),
  green: rgbHandler('g'),
  blue: rgbHandler('b'),
  hue: hslHandler('h'),
  saturation: hslHandler('s'),
  lightness: hslHandler('l'),
  value: (color, val) => {
    const offset = getAsOffset(val)
    if (typeof offset === 'number') {
      return color.addScalar(offset)
    }
    const pct = getAsPercentage(val)
    if (typeof pct === 'number') {
      return color.multiplyScalar(pct)
    }
    if (typeof val === 'number') {
      return color.setRGB(val, val, val)
    }
    return new Color(val)
  },
}

const hsl = { h: 0, s: 0, l: 0 }
function hslHandler(channel: 'h' | 's' | 'l'): RuleHandler {
  return (color, val) => {
    color.getHSL(hsl)

    // attempt to parse as +/- offset
    const offset = getAsOffset(val)
    if (typeof offset === 'number') {
      if (channel === 'h') {
        // hue wraps in a circle
        hsl[channel] = (hsl[channel] + offset + 1) % 1
      }
      else {
        // other channels do not wrap
        hsl[channel] = hsl[channel] + offset
      }
      return color.setHSL(hsl.h, hsl.s, hsl.l)
    }

    // attempt to parse as percentage
    const pct = getAsPercentage(val)
    if (typeof pct === 'number') {
      hsl[channel] = (hsl[channel] * pct + 1) % 1 // multiply by percentage and wrap to 0-1
      return color.setHSL(hsl.h, hsl.s, hsl.l)
    }
    else if (typeof val === 'number') {
      hsl[channel] = val // absolute value
      return color.setHSL(hsl.h, hsl.s, hsl.l)
    }
    else {
      throw new Error('channel value must be offset, value, or percentage')
    }
  }
}

function rgbHandler(channel: 'r' | 'g' | 'b'): RuleHandler {
  return (color, val) => {
    const offset = getAsOffset(val)
    if (typeof offset === 'number') {
      color[channel] += offset
      return color
    }
    const pct = getAsPercentage(val)
    if (typeof pct === 'number') {
      color[channel] *= pct
      return color
    }
    if (typeof val === 'number') {
      color[channel] = val
      return color
    }
    else {
      throw new Error('channel value must be offset, value, or percentage')
    }
  }
}

function getAsOffset(val: CssValue): number | null {
  if (typeof val === 'string' && (val.startsWith('-') || val.startsWith('+'))) {
    return parseFloat(val) // val has explicit + or -
  }
  if (typeof val === 'number' && val < 0) {
    return val // val is negative
  }
  return null // val is not an offset
}

function getAsPercentage(val: CssValue): number | null {
  if (typeof val === 'string' && val.endsWith('%')) {
    return parseFloat(val.slice(0, -1)) / 100 // return percentage as fraction of 1
  }
  return null // not a percentage
}
