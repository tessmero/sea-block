/**
 * @file tile-group-color-buffer.ts
 *
 * Stores rgb for each tile part for a grid of terrain tiles.
 *
 * Also, extra copies to support temporary
 * fading effects like highlight for hovered chess tile.
 */

import { GRID_DETAIL } from 'settings'
import { TILE_PARTS } from './tile-mesh'
import { Color } from 'three'
import type { TileIndex } from 'core/grid-logic/indexed-grid'
import type { TileColors } from 'gfx/styles/style'

const nChannels = 3 // r,g,b
const nParts = TILE_PARTS.length // top,sides
const nCells = GRID_DETAIL * GRID_DETAIL // width*height
const bufferSize = nCells * nChannels * nParts

// original color to restore after temp effect ends e.g. checkered black and white
const originalBuffer = new Float32Array(bufferSize)

// target color e.g. green highlight for valid move tile
const targetBuffer = new Float32Array(bufferSize)

// live color (lerps towards target color)
const liveBuffer = new Float32Array(bufferSize)

export function setOriginalTileColors(index: TileIndex, colors: TileColors, force = false) {
  _set(originalBuffer, index, colors)
  if (force) {
    _set(targetBuffer, index, colors)
    _set(liveBuffer, index, colors)
  }
}

export function setTargetTileColors(index: TileIndex, colors: TileColors) {
  _set(targetBuffer, index, colors)
}

export function restoreTileColors(index: TileIndex) {
  const start = index.i * nParts * nChannels
  const stop = (index.i + 1) * nParts * nChannels
  for (let i = start; i < stop; i++) {
    targetBuffer[i] = originalBuffer[i]
  }
}

function _set(buffer: Float32Array, index: TileIndex, colors: TileColors) {
  const i = index.i * nParts * nChannels
  for (const [partIndex, partName] of TILE_PARTS.entries()) {
    let j = i + partIndex * nChannels
    const { r, g, b } = colors[partName]
    buffer[j++] = r
    buffer[j++] = g
    buffer[j++] = b
  }
}

export function lerpTileColors(alpha: number) {
  const maxIndex = bufferSize
  for (let i = 0; i < maxIndex; i++) {
    const orig = liveBuffer[i]
    const target = targetBuffer[i]
    liveBuffer[i] = orig + (target - orig) * alpha
  }
}

const dummy: TileColors = TILE_PARTS.reduce((acc, partName) => {
  acc[partName] = new Color()
  return acc
}, {} as TileColors)

export function getLiveTileColors(index: TileIndex) {
  const i0 = index.i * nParts * nChannels

  TILE_PARTS.forEach((partName, partIndex) => {
    const base = i0 + partIndex * nChannels
    // console.log(originalBuffer[base])
    const r = liveBuffer[base]
    const g = liveBuffer[base + 1]
    const b = liveBuffer[base + 2]
    dummy[partName].setRGB(r, g, b)
  })

  return dummy
}
