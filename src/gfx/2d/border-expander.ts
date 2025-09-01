/**
 * @file border-expander.ts
 *
 * Draw panels and buttons of various sizes by expanding square images
 * and maintaining the corner and edge shapes.
 */

const corner = 8 // thickness of edges and corners in pixels

export function drawExpandedBorder(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  rawBorder: HTMLImageElement,
  width: number, height: number,
) {
  if (rawBorder.width === width && rawBorder.height === height) {
    ctx.drawImage(rawBorder, 0, 0)
    // console.log('unstretched border')
    return
  }

  // Corner sizes
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
  ctx.imageSmoothingEnabled = false
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
