/**
 * @file default-style.ts
 *
 * Style provided by terrain generator.
 */
import type { Css } from './css-style'
import { CssStyle } from './css-style'

export class DefaultStyle extends CssStyle {
  static css = {}

  // called when terrain generator is selected
  public static setDefaultCss(css: Css) {
    DefaultStyle.css = css
  }

  // called when colors are refreshed in default style
  constructor() {
    super(DefaultStyle.css)
  }
}
