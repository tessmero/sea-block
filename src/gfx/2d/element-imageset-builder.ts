/**
 * @file element-imageset-builder.ts
 *
 * Builds images for gui elements and avoids rebuilding images for elements
 * that look identical.
 */

import { BUTTON_STATES, type ButtonState } from 'guis/gui'
import type { ImageAssetUrl } from './image-asset-loader'
import { getImage } from './image-asset-loader'
import type { FontVariant, TextAlign } from './text-gfx-helper'
import { drawText } from './text-gfx-helper'
import { addToSpriteAtlas } from './sprite-atlas'

export type ElementType
  = 'button' | 'panel' | 'label'
    | 'diagram' // buffer to draw on
    | 'joy-region' // special button, clear region behind element
    | 'sprite-atlas' // special case, atlas buffer excluded from atlas

export type BorderVariant
  = '16x16-btn-shiny' | '16x16-btn-square' | '16x16-btn-sm'
//   | '48x48-joy-region' | '24x24-joy-slider'

// parameters that define unique generated imageset
export type BlankParams = {
  w: number
  h: number
  type: ElementType
  border?: BorderVariant
  font?: FontVariant
  color?: string
  textAlign?: TextAlign
}

// an imageset may have a label or an icon, but not both
interface IconParams extends BlankParams {
  icon: ImageAssetUrl
}
interface LabelParams extends BlankParams {
  label: string
}
export type ElementImagesetParams = BlankParams | IconParams | LabelParams

function getHash(params: ElementImagesetParams): string {
  const { w, h, type, border, font, textAlign } = params
  const icon = 'icon' in params ? params.icon : 'null'
  const label = 'label' in params ? params.label : 'null'
  return JSON.stringify([w, h, type, border, font, textAlign, icon, label])
}

const cache: Record<string, ElementImageset> = {}

export type ElementImageset
  = Partial<Record<ButtonState, OffscreenCanvas>>
  // & { default: OffscreenCanvas }

export function getElementImageset(rawParams: ElementImagesetParams): ElementImageset {
  const params: ElementImagesetParams = {
    border: '16x16-btn-shiny', font: 'default', textAlign: 'center',
    ...rawParams,
  }
  const key = getHash(params)
  if (!Object.hasOwn(cache, key)) {
    // console.log(`building element imageset for hash ${key}`)
    cache[key] = buildImageset(params)
  }
  return cache[key]
}

const imagesetBuilders: Record<
    ElementType,
    (params: ElementImagesetParams) => ElementImageset
  > = {
    'button': _buildButtonImageset,
    'label': _buildLabelImageset,
    'panel': _buildPanelImageset,
    'joy-region': _buildJoyRegionImageset,
    'diagram': _buildDiagramImageset,
    'sprite-atlas': _buildAtlasImageset,
  }

function buildImageset(params: ElementImagesetParams): ElementImageset {
  const { type } = params
  const builder = imagesetBuilders[type]
  const result = builder(params)

  if (type !== 'sprite-atlas') { // don't include atlas buffer in atlas
    // add new images to atlas
    const uniqueImages = new Set(Object.values(result))
    for (const img of uniqueImages) {
      addToSpriteAtlas(img)
    }
  }

  return result
}

function _buildDiagramImageset(params: ElementImagesetParams): ElementImageset {
  const { w, h } = params
  const image = new OffscreenCanvas(w, h)
  return {
    default: image,
  }
}

function _buildAtlasImageset(_params: ElementImagesetParams): ElementImageset {
  const image = new OffscreenCanvas(500, 500)
  return {
    default: image,
  }
}

function _buildJoyRegionImageset(params: ElementImagesetParams): ElementImageset {
  const imageset = _buildButtonImageset(params)

  // For each image in the imageset, process transparency
  for (const state of Object.keys(imageset) as Array<ButtonState>) {
    const canvas = imageset[state] as OffscreenCanvas
    const ctx = canvas.getContext('2d')
    if (!ctx) continue

    // Get the RGB value at (6,6)
    const pixel = ctx.getImageData(6, 6, 1, 1).data
    const [r, g, b] = pixel

    // Get all pixels and replace matching RGB with fully transparent
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === r && data[i + 1] === g && data[i + 2] === b) {
        data[i + 3] = 0 // Set alpha to 0
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }
  return imageset
}

function _buildPanelImageset(params: ElementImagesetParams): ElementImageset {
  let image

  const borderSrc: ImageAssetUrl = `borders/16x16-panel.png`

  if ('label' in params) {
    image = buildSimpleButtonImage(borderSrc, params)
  }
  else if ('icon' in params) {
    image = buildIconButtonImage(borderSrc, params)
  }
  else {
    // empty panel
    const blankLabelParams = { ...params, label: '' }
    image = buildSimpleButtonImage(borderSrc, blankLabelParams)
  }
  return {
    default: image,
  }
}

function _buildLabelImageset(params: ElementImagesetParams): ElementImageset {
  const { w: width, h: height } = params

  const buffer = new OffscreenCanvas(width, height)

  const ctx = buffer.getContext('2d')

  if (!ctx) {
    throw new Error('offscreen canvas ctx is null')
  }

  if ('label' in params) {
    drawText(ctx, {
      width, height,
      label: params.label,
      font: params.font,
      color: params.color,
      textAlign: params.textAlign,
    })
  }
  else if ('icon' in params) {
    const iconImage = getImage(params.icon)
    const xOff = Math.floor((width - iconImage.width) / 2)
    const yOff = Math.floor((height - iconImage.height) / 2)
    ctx.drawImage(iconImage, xOff, yOff)
  }

  return { default: buffer, pressed: buffer, hovered: buffer }
}

function _buildButtonImageset(params: ElementImagesetParams): ElementImageset {
  const result = {}
  for (const state of BUTTON_STATES) {
    let image

    // border must have been explicit or filled in with default
    const border = params.border as BorderVariant
    const borderSrc: ImageAssetUrl = `borders/${border}-${state}.png`

    if ('label' in params) {
      image = buildSimpleButtonImage(borderSrc, params)
    }
    else if ('icon' in params) {
      image = buildIconButtonImage(borderSrc, params)
    }
    else {
      // empty button
      const blankLabelParams = { ...params, label: '' }
      image = buildSimpleButtonImage(borderSrc, blankLabelParams)
    }
    result[state] = image
  }
  return result
}

function buildIconButtonImage(borderSrc: ImageAssetUrl, params: IconParams): OffscreenCanvas {
  const { w: width, h: height, icon } = params

  // console.log('borderSrc', borderSrc)

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

  const rawBorder = getImage(borderSrc)

  drawBorder(rawBorder, ctx, width, height)

  const iconImage = getImage(icon)
  const xOff = Math.floor((width - iconImage.width) / 2)
  const yOff = Math.floor((height - iconImage.height) / 2)
  ctx.drawImage(iconImage, xOff, yOff)

  // threshold and apply style colors
  // const imageData = ctx.getImageData(0, 0, width, height)
  // thresholdAndStyle(imageData, colors)
  // ctx.putImageData(imageData, 0, 0)

  return buffer
}

async function drawBorder(rawBorder, ctx, width, height) {
  if (rawBorder.width === width && rawBorder.height === height) {
    ctx.drawImage(rawBorder, 0, 0)
    // console.log('unstretched border')
    return
  }

  // console.log('stretched border')

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
function buildSimpleButtonImage(borderSrc: ImageAssetUrl, params: LabelParams): OffscreenCanvas {
  const { w: width, h: height } = params

  const buffer = new OffscreenCanvas(width, height)

  const ctx = buffer.getContext('2d')

  if (!ctx) {
    throw new Error('offscreen canvas ctx is null')
  }

  // ctx.fillStyle = 'black'
  // ctx.font = font
  // ctx.textAlign = 'center'
  // ctx.textBaseline = 'middle'
  // ctx.fillText(label, width / 2, height / 2)

  // // threshold and apply style colors
  // const imageData = ctx.getImageData(0, 0, width, height)
  // thresholdAndStyle(imageData, colors)
  // ctx.putImageData(imageData, 0, 0)

  const rawBorder = getImage(borderSrc)

  drawBorder(rawBorder, ctx, width, height)
  // ctx.drawImage(icon, 0, 0)

  drawText(ctx, {
    width, height,
    label: params.label,
    font: params.font,
    color: params.color,
    textAlign: params.textAlign,
  })

  // threshold and apply style colors
  // const imageData = ctx.getImageData(0, 0, width, height)
  // thresholdAndStyle(imageData, colors)
  // ctx.putImageData(imageData, 0, 0)

  return buffer
}
