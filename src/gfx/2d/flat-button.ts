/**
 * @file flat-button.ts
 *
 * Object containing images for one interactive button.
 * Drawn on the front layer in flat-ui-gfx-helper.
 */

import type { ColorRepresentation } from 'three'
import { Color } from 'three'
import type { CompositeColors, CompositeElement } from '../composite-element'

// enum
export const BUTTON_PARTS = ['background', 'border'] as const
export type ButtonPart = (typeof BUTTON_PARTS)[number]

// enum
export const BUTTON_STATES = ['default', 'hovered', 'clicked'] as const
export type ButtonState = (typeof BUTTON_STATES)[number]

export type ButtonColors = CompositeColors<ButtonPart>

type CommonParams = {
  width: number
  height: number
  styles: Record<ButtonState, ButtonColors>
  hotkeys?: string
}
export interface SimpleButtonParams extends CommonParams {
  label: string // text to draw
  font: string
}
export interface IconButtonParams extends CommonParams {
  backgroundIcon: HTMLImageElement // image assets to draw
  borderIcon: HTMLImageElement
}
export type ButtonParams = SimpleButtonParams | IconButtonParams

export class FlatButton implements CompositeElement<ButtonPart> {
  partNames = BUTTON_PARTS

  public readonly width: number
  public readonly height: number

  public readonly images: Record<ButtonState, CanvasImageSource>

  constructor(params: ButtonParams) {
    const { width, height, styles } = params
    this.width = width
    this.height = height

    if ('label' in params && 'font' in params) {
      this.images = {
        default: buildSimpleButtonImage(styles.default, params),
        hovered: buildSimpleButtonImage(styles.hovered, params),
        clicked: buildSimpleButtonImage(styles.clicked, params),
      }
    }
    else if ('backgroundIcon' in params && 'borderIcon' in params) {
      this.images = {
        default: buildIconButtonImage(styles.default, params),
        hovered: buildIconButtonImage(styles.hovered, params),
        clicked: buildIconButtonImage(styles.clicked, params),
      }
    }
    else {
      throw new Error('Flat button requires icon or label+font')
    }
  }
}

// Helper function to asynchronously load an Image
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = src
    // console.log(`loading image from ${src}`)
  })
}

// Updated loader to wait for two images concurrently
export function iconButtonLoader(
  backgroundIconSrc: string,
  borderIconSrc: string,
) {
  return async (width: number, height: number) => {
    // Load both images in parallel
    const [backgroundIcon, borderIcon] = await Promise.all([
      loadImage(backgroundIconSrc),
      loadImage(borderIconSrc),
    ])

    // Construct the FlatButton with both images
    const btn = new FlatButton({
      width,
      height,
      styles: {
        default: { background: new Color('white'), border: new Color('black') },
        hovered: { background: new Color(0xcccccc), border: new Color('black') },
        clicked: { background: new Color('black'), border: new Color('white') },
      },
      backgroundIcon,
      borderIcon,
    })
    return btn
  }
}

// helper to build imageLoader for GameElement
export function simpleButtonLoader(
  label: string, font: string = '35px "Micro5"') {
  return async (width: number, height: number) => {
    // wait for fonts from urls defined in index.html
    await document.fonts.load(font)
    await document.fonts.ready

    // wait for sounds defined in sounds.ts
    // await soundsLoaded()

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
      font,
    })
    return btn
  }
}

function _colorToString(color: Color) {
  const { r, g, b } = color
  return `rgb(${r * 255},${g * 255},${b * 255})`
}

function buildIconButtonImage(colors: ButtonColors, params: IconButtonParams): OffscreenCanvas {
  const { width, height, backgroundIcon, borderIcon } = params

  const buffer = new OffscreenCanvas(width, height)

  const ctx = buffer.getContext('2d')

  if (!ctx) {
    throw new Error('offscreen canvas ctx is null')
  }

  // draw with placeholder colors
  ctx.drawImage(getThrehsoldedIcon(backgroundIcon, 'white'),
    0, 0, backgroundIcon.width, backgroundIcon.height, // from source rectangle
    0, 0, width, height, // to destination rectangle
  )
  ctx.drawImage(getThrehsoldedIcon(borderIcon, 'black'),
    0, 0, borderIcon.width, borderIcon.height, // from source rectangle
    0, 0, width, height, // to destination rectangle
  )

  // threshold and apply style colors
  const imageData = ctx.getImageData(0, 0, width, height)
  thresholdAndStyle(imageData, colors)
  ctx.putImageData(imageData, 0, 0)

  return buffer
}

// build placeholder icon by drawing text
function buildSimpleButtonImage(colors: ButtonColors, params: SimpleButtonParams): OffscreenCanvas {
  const { width, height, font, label } = params

  const buffer = new OffscreenCanvas(width, height)

  const ctx = buffer.getContext('2d')

  if (!ctx) {
    throw new Error('offscreen canvas ctx is null')
  }

  // draw with placeholder colors
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'black'
  ctx.strokeRect(0, 0, width - 0.5, height - 0.5)

  ctx.fillStyle = 'black'
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, width / 2, height / 2)

  // threshold and apply style colors
  const imageData = ctx.getImageData(0, 0, width, height)
  thresholdAndStyle(imageData, colors)
  ctx.putImageData(imageData, 0, 0)

  return buffer
}

function getThrehsoldedIcon(icon: HTMLImageElement, color: ColorRepresentation): OffscreenCanvas {
  const { width, height } = icon

  const buffer = new OffscreenCanvas(width, height)
  const ctx = buffer.getContext('2d')
  if (!ctx) {
    throw new Error('offscreen canvas ctx is null')
  }
  ctx.drawImage(icon, 0, 0)
  const data = ctx.getImageData(0, 0, width, height)

  const colorObj = new Color(color)
  for (let i = 0; i < data.data.length; i += 4) {
    // check if pixel is transparent
    if (data.data[i + 3] < 10) {
      data.data[i + 3] = 0 // alpha (make pixel fully transparent)
    }
    else {
      colorPixel(data.data, i, colorObj)
    }
  }
  ctx.putImageData(data, 0, 0)

  return buffer
}

function thresholdAndStyle(imageData: ImageData, colors: ButtonColors) {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const oldR = data[i]
    const oldG = data[i + 1]
    const oldB = data[i + 2]
    const oldAlpha = data[i + 3]

    // check if pixel is transparent
    if (oldAlpha < 10) {
      data[i + 3] = 0 // alpha (make fully transparent)
    }

    // check if pixel is white
    else if (!(oldR === 255 && oldG === 255 && oldB === 255 && oldAlpha === 255)) {
      colorPixel(data, i, colors.border)
    }
    else {
      colorPixel(data, i, colors.background)
    }
  }
}

function colorPixel(data, i, color) {
  const { r, g, b } = color
  data[i] = r * 255
  data[i + 1] = g * 255
  data[i + 2] = b * 255
  data[i + 3] = 255 // alpha (fully opaque)
}
