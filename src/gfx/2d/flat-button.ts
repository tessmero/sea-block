/**
 * @file flat-button.ts
 *
 * Object containing images for one interactive button.
 * Drawn on the front layer in flat-ui-gfx-helper.
 */

import { Color } from 'three'
// import { fonts, renderPixels } from 'js-pixel-fonts'
import type { CompositeColors, CompositeElement } from '../composite-element'
import type { ImageAssetUrl } from './image-loader'
import { getImage } from './image-loader'

// enum
export const BUTTON_PARTS = ['background', 'border'] as const
export type ButtonPart = (typeof BUTTON_PARTS)[number]

// enum
export const BUTTON_STATES = ['default', 'hovered', 'pressed'] as const
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
}
export interface IconButtonParams extends CommonParams {
  icon: HTMLImageElement // image to draw
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

    if ('label' in params) {
      this.images = {
        default: buildSimpleButtonImage(styles.default, params),
        hovered: buildSimpleButtonImage(styles.hovered, params),
        pressed: buildSimpleButtonImage(styles.pressed, params),
      }
    }
    else if ('icon' in params) {
      this.images = {
        default: buildIconButtonImage('default', params),
        hovered: buildIconButtonImage('hovered', params),
        pressed: buildIconButtonImage('pressed', params),
      }
    }
    else {
      throw new Error('Flat button requires icon or label+font')
    }
  }
}

// Updated loader to wait for two images concurrently
export function iconButton(width: number, height: number, iconSrc: ImageAssetUrl) {
  // Load both images in parallel
  const icon = getImage(iconSrc)

  // Construct the FlatButton with both images
  const btn = new FlatButton({
    width, height, icon,
    styles: {
      default: { background: new Color('white'), border: new Color('black') },
      hovered: { background: new Color(0xcccccc), border: new Color('black') },
      pressed: { background: new Color('black'), border: new Color('white') },
    },
  })
  return btn
}

// helper to build imageLoader for GameElement
export function simpleButton(width: number, height: number, label: string) {
  // console.log(`build simple button with label ${label}`)
  const btn = new FlatButton({
    width, height, label,
    styles: {
      default: { background: new Color('white'), border: new Color('black') },
      hovered: { background: new Color(0xcccccc), border: new Color('black') },
      pressed: { background: new Color('black'), border: new Color('white') },
    },
  })
  return btn
}

function _colorToString(color: Color) {
  const { r, g, b } = color
  return `rgb(${r * 255},${g * 255},${b * 255})`
}

function buildIconButtonImage(state: ButtonState, params: IconButtonParams): OffscreenCanvas {
  const { width, height, icon } = params

  const buffer = new OffscreenCanvas(width, height)

  const ctx = buffer.getContext('2d')

  if (!ctx) {
    throw new Error('offscreen canvas ctx is null')
  }

  // // draw with placeholder colors
  // ctx.drawImage(getThrehsoldedIcon(backgroundIcon, 'white'),
  //   0, 0, backgroundIcon.width, backgroundIcon.height, // from source rectangle
  //   0, 0, width, height, // to destination rectangle
  // )
  // ctx.drawImage(getThrehsoldedIcon(borderIcon, 'black'),
  //   0, 0, borderIcon.width, borderIcon.height, // from source rectangle
  //   0, 0, width, height, // to destination rectangle
  // )

  const borderSrc: ImageAssetUrl = `icons/16x16-btn-${state}.png`
  const rawBorder = getImage(borderSrc)

  drawBorder(rawBorder, ctx, width, height)
  ctx.drawImage(icon, 0, 0)

  // threshold and apply style colors
  // const imageData = ctx.getImageData(0, 0, width, height)
  // thresholdAndStyle(imageData, colors)
  // ctx.putImageData(imageData, 0, 0)

  return buffer
}

async function drawBorder(rawBorder, ctx, width, height) {
  // Corner sizes
  const corner = 8
  // Draw corners
  // Top-left
  ctx.drawImage(rawBorder, 0, 0, corner, corner, 0, 0, corner, corner)
  // Top-right
  ctx.drawImage(rawBorder, 16 - corner, 0, corner, corner, width - corner, 0, corner, corner)
  // Bottom-left
  ctx.drawImage(rawBorder, 0, 16 - corner, corner, corner, 0, height - corner, corner, corner)
  // Bottom-right
  ctx.drawImage(rawBorder, 16 - corner, 16 - corner, corner, corner, width - corner, height - corner, corner, corner)

  // Edges (repeat/stretch 1px slice)
  // Top
  ctx.drawImage(rawBorder, corner, 0, 1, corner, corner, 0, width - 2 * corner, corner)
  // Bottom
  ctx.drawImage(rawBorder, corner, 16 - corner, 1, corner, corner, height - corner, width - 2 * corner, corner)
  // Left
  ctx.drawImage(rawBorder, 0, corner, corner, 1, 0, corner, corner, height - 2 * corner)
  // Right
  ctx.drawImage(rawBorder, 16 - corner, corner, corner, 1, width - corner, corner, corner, height - 2 * corner)

  // Fill the center region by stretching the 1x1-pixel center
  ctx.drawImage(rawBorder, corner, corner, 1, 1, corner, corner, width - 2 * corner, height - 2 * corner)
}

// build placeholder icon by drawing text
function buildSimpleButtonImage(colors: ButtonColors, params: SimpleButtonParams): OffscreenCanvas {
  const { width, height } = params

  const buffer = new OffscreenCanvas(width, height)

  const ctx = buffer.getContext('2d')

  if (!ctx) {
    throw new Error('offscreen canvas ctx is null')
  }

  // ctx.fillStyle = 'black'
  // const textPixels = renderPixels(label)
  // const x0 = Math.floor(width / 2 - textPixels[0].length / 2)
  // const y0 = Math.floor(height / 2 - textPixels.length / 2)
  // for (const [y, row] of textPixels.entries()) {
  //   for (const [x, value] of row.entries()) {
  //     if (value === 1) {
  //       ctx.fillRect(x0 + x, y0 + y, 1, 1)
  //     }
  //   }
  // }

  // ctx.fillStyle = 'black'
  // ctx.font = font
  // ctx.textAlign = 'center'
  // ctx.textBaseline = 'middle'
  // ctx.fillText(label, width / 2, height / 2)

  // threshold and apply style colors
  const imageData = ctx.getImageData(0, 0, width, height)
  thresholdAndStyle(imageData, colors)
  ctx.putImageData(imageData, 0, 0)

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
