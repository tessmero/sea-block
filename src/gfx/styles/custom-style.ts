/**
 * @file custom-style.ts
 *
 * Style pasted by user.
 */
import { CssStyle } from './css-style'

export class CustomStyle extends CssStyle {
  static css = {}

  // called when user clicks paste style
  public static setCustomCss(css: string) {
    CustomStyle.css = JSON.parse(css)
  }

  // called when colors are refreshed in custom style
  constructor() {
    super(CustomStyle.css)
  }
}
