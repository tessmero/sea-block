/**
 * @file styles-list.ts
 *
 * Named color themes. .
 */

import { StyleParser, type CssStyle } from '../../util/style-parser'
import { getRandomHueStyle } from './hue-style'

// placeholder for style pasted by user.
export const customStyle = {
  css: {}, // set when user clicks paste style
}

export const STYLES = {
  'default': {}, // replaced when terrain generator is selected
  'black-and-white': {
    'background': { value: '#fff' },
    'top': { value: '#fff' },
    'sides': { value: '#000' },
    'top@land': { saturation: 0 },
  },
  'tron': {
    'background': { value: '#000' },
    'top@land': { saturation: 0 },
    'sides@land': { saturation: 0, lightness: '-0.2' },
    'top@sea': { value: '#000' },
    'sides@sea': { value: '#6ee2ff' },
  },
  'pastel': {
    'background': { value: '#ddd' },
    'top@land': { saturation: 0.2, lightness: '+.2' },
    'sides@land': { saturation: 0.2, lightness: '+.1' },
    'top@sea': { saturation: 0.5, lightness: 0.6 },
    'sides@sea': { saturation: 0.5, lightness: 0.5 },
  },
  '???': getRandomHueStyle(), // randomized hue rotation
  'custom': {}, // replaced when user clicks "paste style"
} satisfies Record<string, CssStyle>

export function getStyle(name: string): StyleParser {
  return new StyleParser(STYLES[name])
}
