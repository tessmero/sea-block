/**
 * @file flat-button.ts
 *
 * Button.
 */

import { Color } from 'three'
import type { CompositeElement, CompositeStyle } from '../composite-element'
import { soundsLoaded } from '../../sounds'

// enum
export const BUTTON_PARTS = ['background', 'border'] as const
export type ButtonPart = (typeof BUTTON_PARTS)[number]

// enum
export const BUTTON_STATES = ['default', 'hovered', 'clicked'] as const
export type ButtonState = (typeof BUTTON_STATES)[number]

export type ButtonStyle = CompositeStyle<ButtonPart>

export type ButtonParams = {
  width: number
  height: number
  styles: Record<ButtonState, ButtonStyle>
  label: string
}

const simpleButtonFont = '25px "Micro5"'

// helper to build imageLoader for GameElement
export function simpleButtonLoader(width: number, height: number, label: string) {
  return async () => {
    // wait for fonts from urls defined in index.html
    await document.fonts.load(simpleButtonFont)
    await document.fonts.ready

    // wait for sounds defined in sounds.ts
    await soundsLoaded()

    // emulate slowness
    // await new Promise(resolve => setTimeout(resolve, 1000))

    // build 3 images for default,hovered,clicked button
    const btn = new FlatButton({
      width, height, label,
      styles: {
        default: { background: new Color('white'), border: new Color('black') },
        hovered: { background: new Color(0xcccccc), border: new Color('black') },
        clicked: { background: new Color('black'), border: new Color('white') },
      },
    })
    return btn
  }
}

export class FlatButton implements CompositeElement<ButtonPart> {
  partNames = BUTTON_PARTS

  public readonly width: number
  public readonly height: number
  public readonly label: string

  public readonly images: Record<ButtonState, OffscreenCanvas>

  constructor(params: ButtonParams) {
    const { width, height, label, styles } = params
    this.width = width
    this.height = height
    this.label = label

    this.images = {
      default: this.buildButtonImage(styles.default),
      hovered: this.buildButtonImage(styles.hovered),
      clicked: this.buildButtonImage(styles.clicked),
    }
  }

  private buildButtonImage(style: ButtonStyle): OffscreenCanvas {
    const { width, height, label } = this
    const buffer = new OffscreenCanvas(width, height)

    const ctx = buffer.getContext('2d')

    if (!ctx) {
      throw new Error('offscreen canvas ctx is null')
    }

    // draw with placeholder colors
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'black'
    ctx.strokeRect(0, 0, width, height)

    ctx.fillStyle = 'black'
    ctx.font = simpleButtonFont
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, width / 2, height / 2)

    // threshold and apply style colors
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // check if pixel is white
      if (!(r === 255 && g === 255 && b === 255 && a === 255)) {
        const { r, g, b } = style.border
        data[i] = r * 255
        data[i + 1] = g * 255 // G
        data[i + 2] = b * 255 // B
        data[i + 3] = 255 // alpha (fully opaque)
      }
      else {
        const { r, g, b } = style.background
        data[i] = r * 255
        data[i + 1] = g * 255 // G
        data[i + 2] = b * 255 // B
        data[i + 3] = 255 // alpha (fully opaque)
      }
    }

    ctx.putImageData(imageData, 0, 0)

    return buffer
  }
}

function _colorToString(color: Color) {
  const { r, g, b } = color
  return `rgb(${r * 255},${g * 255},${b * 255})`
}
