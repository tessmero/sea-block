/**
 * @file styles-list.ts
 *
 * Named color themes as css.
 */

import { CssStyle } from './css-style'
import { CustomStyle } from './custom-style'
import { HueStyle } from './hue-style'

export const allStyles = {
  'default': {
    sides: { lightness: '50%' },
  },
  'tron': {
    'background': { value: '#000' },
    'top@land': { saturation: 0 },
    'sides@land': { saturation: 0, lightness: -0.2 },
    'top@sea': { value: '#000' },
    'sides@sea': { value: '#6ee2ff' },
  },
  'pastel': {
    'background': { value: '#ddd' },
    'top@land': { saturation: 0.2, lightness: '+.2' },
    'sides@land': { saturation: 0.2, lightness: '+.1' },
    'top@sea': { saturation: 0.5 },
    'sides@sea': { saturation: 0.5, lightness: -0.05 },
  },
  '???': HueStyle, // random hue rotation
  'custom': CustomStyle, // style pasted by user
}

export function getStyle(name: string): CssStyle {
  const classOrCss = allStyles[name]
  if (typeof classOrCss === 'function') {
    return new classOrCss()
  }
  return new CssStyle(classOrCss)
}
