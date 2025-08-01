/**
 * @file sprite-atlas.ts
 *
 * Complete list of images in memory, and
 * helpers to draw them in sprite-atlas-gui.
 */

const atlas: Array<AtlasEntry> = []
type AtlasEntry = {
  image: CanvasImageSource
  y0: number
  y1: number
}

// called by image loaders/generators
export function addToSpriteAtlas(image: HTMLImageElement | OffscreenCanvas) {
  const atlasHeight = getAtlasHeight()
  atlas.push({
    image,
    y0: atlasHeight,
    y1: atlasHeight + image.height,
  })
}

// params passed from sprite-atlas-gui
type DrawAtlasParams = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  yFraction: number // y coordinate in atlas to draw at y=0 on ctx
  viewHeight: number
}

export function getAtlasHeight(): number {
  return (atlas.length === 0) ? 0 : (atlas.at(-1) as AtlasEntry).y1
}

export function drawAtlasEntries(params: DrawAtlasParams) {
  const { ctx, yFraction, viewHeight } = params
  const atlasHeight = getAtlasHeight()
  if (atlasHeight === 0) {
    return // no images loaded
  }

  const y0 = Math.round((atlasHeight - viewHeight) * yFraction)
  const y1 = y0 + viewHeight
  const entries = getAtlasEntries(y0, y1)

  for (const entry of entries) {
    // Draw the full image at the corresponding y offset
    // The image is drawn at y = entry.y0 - y0 so that y0 in the atlas aligns with y=0 on ctx
    ctx.drawImage(entry.image, 0, entry.y0 - y0)
  }
}

function getAtlasEntries(y0: number, y1: number): Array<AtlasEntry> {
  if (atlas.length === 0) {
    return []
  }

  const result: Array<AtlasEntry> = []
  for (const entry of atlas) {
    if (entry.y0 > y1) {
      continue // entry is below view
    }
    if (entry.y1 < y0) {
      continue // entry is above view
    }
    result.push(entry)
  }
  return result
}
