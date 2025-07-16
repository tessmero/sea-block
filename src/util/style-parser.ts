/**
 * @file style-parser.ts
 *
 * Parse css rulesets invloving rgb / hsl to transform
 * background and tile colors.
 */

import { Color } from 'three'
import type { TilePart } from '../gfx/3d/tile-mesh'
import type { TileColoringParams, TileColors } from '../gfx/styles/style'
import { StartSequenceGame } from '../games/start-sequence-game'
import { typedEntries } from './typed-entries'

export type CssStyle = Partial<Record<Selector, CssRuleset>>

const defaultBackground = new Color(0xaaccff) // base background color

export class StyleParser {
  constructor(public readonly css: CssStyle) {}

  // overrid backgrond (no @conditions allowed)
  public getBackgroundColor(): Color {
    return applyRuleset(defaultBackground, this.css.background)
  }

  // override non-background colors
  public getTileColors(params: TileColoringParams): TileColors {
    // get base color from generator
    const result = {
      top: params.generatedTile.color.clone(),
      sides: params.generatedTile.color.clone(),
    }

    // apply transformations
    for (const [rawSelector, ruleset] of typedEntries(this.css)) {
      const selector = parseSelector(rawSelector)
      const { key } = selector
      if (key !== 'background') {
        let shouldParse = true
        if ('atCondition' in selector) {
          shouldParse = checkIfShouldParse(selector.atCondition, params)
        }
        if (shouldParse) {
          result[key] = applyRuleset(result[key], ruleset, params)
        }
      }
    }

    // check for special case
    if (StartSequenceGame.isColorTransformEnabled) {
      // apply start sequence transformation
      const anim = StartSequenceGame.colorTransformAnim
      const lMult = Math.pow(0.2 + 0.8 * anim, -1) // lightness multiplier
      for (const key in result) {
      // result[key] = ruleHandlers['saturation'](result[key], StartSequenceGame.saturationPct)
        const color = result[key] as Color
        color.getHSL(hsl)
        if (key === 'top') {
          hsl.l *= lMult
        }
        hsl.h -= 0.95 * (1 - anim) // rotate hues
        color.setHSL(hsl.h, hsl.s, hsl.l)
      }
    }

    return result
  }
}

 // top level keys in css object
 type RulesetSelectorKey = 'background' | TilePart
 type AtCondition = 'land' | 'sea'
 type Selector = RulesetSelectorKey | `${TilePart}@${AtCondition}`
interface SimpleParsedSelector {
  key: RulesetSelectorKey
}
interface ConditionalParsedSelector {
  key: TilePart // only tile tile parts can have at conditions
  atCondition: AtCondition
}
 type ParsedSelector = SimpleParsedSelector | ConditionalParsedSelector

// types for css rules keys
const CSS_KEYS = ['value', 'red', 'green', 'blue', 'hue', 'saturation', 'lightness'] as const
 type CssKey = (typeof CSS_KEYS)[number]
function isCssKey(key: string): key is CssKey {
  return (CSS_KEYS as ReadonlyArray<string>).includes(key)
}
 type RuleKey = CssKey | `${CssKey}@${AtCondition}`
export type CssValue = string | number
export type CssRuleset = Partial<Record<RuleKey, CssValue>>
interface ParsedRuleKey {
  key: CssKey // any css key can have at condition
  atCondition?: AtCondition
}

// transform given color based on rules and tile-specific params
export function applyRuleset(
  color: Color,
  ruleset: CssRuleset | undefined,
  params?: TileColoringParams,
): Color {
  if (!ruleset) {
    return color
  }
  for (const [rawKey, value] of Object.entries(ruleset)) {
    const { key, atCondition } = parseRuleKey(rawKey)
    if (checkIfShouldParse(atCondition, params)) {
      color = ruleHandlers[key](color, value)
    }
  }
  return color
}

function parseSelector(selector: Selector): ParsedSelector {
  const [key, rawAt] = selector.split('@')
  const atCondition = parseAtCondition(rawAt)
  if (key === 'background') {
    if (atCondition) {
      throw new Error('@ condition not allowed for background')
    }
    return { key }
  }
  if (key === 'top' || key === 'sides') {
    if (atCondition) {
      return { key, atCondition }
    }
    return { key }
  }

  throw new Error(`unrecognized selector ${selector}`)
}

function parseRuleKey(ruleKey: string): ParsedRuleKey {
  const [key, rawAt] = ruleKey.split('@') as [string, string?]
  if (!isCssKey(key)) {
    throw new Error(`Unrecognized CSS key: ${key}`)
  }
  const atCondition = parseAtCondition(rawAt)
  if (atCondition) {
    return { key, atCondition }
  }
  return { key }
}

function parseAtCondition(raw: string | undefined): AtCondition | undefined {
  if (raw === 'land' || raw === 'sea') return raw
  if (typeof raw === 'string') {
    throw new Error(`unreconized @ condition "${raw}"`)
  }
  return undefined
}

function checkIfShouldParse(
  atCondition: AtCondition | undefined,
  params: TileColoringParams | undefined,
): boolean {
  if (!atCondition || !params) {
    return true
  }

  return params[atCondition] ?? false
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
