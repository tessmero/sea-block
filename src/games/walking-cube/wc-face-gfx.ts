/**
 * @file wc-face-gfx.ts
 *
 * Build face texturs for walking-cube character.
 */

import { addToSpriteAtlas } from 'gfx/2d/sprite-atlas'
import { CanvasTexture } from 'three'

export type FaceParams = {
  shocked?: boolean // eslint-disable-line @typescript-eslint/naming-convention
  eyesOpen?: boolean // eslint-disable-line @typescript-eslint/naming-convention
  mouthOpen?: boolean // eslint-disable-line @typescript-eslint/naming-convention
  fill?: boolean // eslint-disable-line @typescript-eslint/naming-convention
  rotations?: number // number of 90 degree turns
}

export class FaceGfx {
  static _bufferWidth = 100 // pixels, detail level
  static _bufferHeight = 100
  static _lineWidth = 8
  static _graphics = {} // key are hashes, values are {buffer,texture}

  /**
   *
   * @param {object} params
   */
  static getFaceTexture(params) {
    return this._getGfx(params).texture
  }

  /**
   *
   * @param {object} g
   * @param {number[]} rect
   * @param {object} params
   */
  static drawFace(g, rect, params) {
    const buffer = this._getGfx(params).buffer

    const [targetX, targetY, targetWidth, targetHeight] = rect

    const scaleX = targetWidth / FaceGfx._bufferWidth
    const scaleY = targetHeight / FaceGfx._bufferHeight
    const scale = Math.min(scaleX, scaleY) // Uniform scaling

    g.save()
    g.translate(targetX, targetY)
    g.scale(scale, scale)
    g.drawImage(buffer, 0, 0)
    g.restore()
  }

  /**
   *
   * @param {object} params
   */
  static _getGfx(params) {
    const hash = FaceGfx._hash(params)
    const all = FaceGfx._graphics
    if (!Object.hasOwn(all, hash)) {
      all[hash] = new FaceGfx()._buildFaceGfx(params)
    }
    return all[hash]
  }

  /**
   *
   * @param {object} params
   */
  static _hash(params: FaceParams) {
    const bools = ['shocked', 'eyesOpen', 'mouthOpen', 'fill']
    let result = 'base'
    for (const key of bools) {
      if (params[key]) {
        result = `${result}-${key}`
      }
    }
    if (params.rotations) { // present and > 0
      result = `${result}-rot=${params.rotations}`
    }
    return result
  }

  /**
   * build buffer and texture
   * @param {object} params
   */
  _buildFaceGfx(params) {
    const ox = 0
    const x = 0
    const y = 0
    const w = FaceGfx._bufferWidth
    const h = FaceGfx._bufferHeight
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    addToSpriteAtlas(canvas)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    const { rotations = 0 } = params
    if (rotations) { // present and > 0
      const [centerX, centerY] = [w / 2, h / 2]
      const angle = Math.PI / 2 * rotations

      ctx.translate(centerX, centerY)
      ctx.rotate(angle)
      ctx.translate(-centerX, -centerY)
    }

    ctx.lineCap = 'round'
    ctx.lineWidth = FaceGfx._lineWidth

    if (params.fill) {
      ctx.fillStyle = '#ddd'
      const dark = '#666'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = dark
      ctx.strokeRect(0, 0, w, h)
      ctx.fillStyle = dark
      ctx.strokeStyle = dark
    }
    else {
      ctx.fillStyle = 'black'
      ctx.strokeStyle = 'black'
    }

    const { shocked } = params

    if (shocked) {
      this._shockedFace(ctx, {
        x, y, w, h, ox,
        ...params,
      })
    }
    else {
      this._idleFace(ctx, {
        x, y, w, h, ox,
        ...params,
      })
    }

    return {
      buffer: canvas,
      texture: new CanvasTexture(canvas),
    }
  }

  /**
   *
   * @param {object} ctx
   * @param {object} params
   */
  _shockedFace(ctx, params) {
    const { x, y, w, h, ox } = params

    // draw shocked mouth
    ctx.beginPath()
    ctx.arc(x + w / 2 + ox, y + h / 2, w / 4, 0, 2 * Math.PI)
    ctx.fill()

    // draw shocked eyes
    ctx.beginPath()
    ctx.arc(x + w / 4 + ox, y + h / 5, w / 10, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + 3 * w / 4 + ox, y + h / 5, w / 10, 0, 2 * Math.PI)
    ctx.fill()
  }

  /**
   *
   * @param {object} ctx
   * @param {object} params
   */
  _idleFace(ctx, params) {
    const { x, y, w, h, ox, mouthOpen, eyesOpen } = params

    // draw idle mouth
    if (mouthOpen) {
      ctx.beginPath()
      ctx.arc(x + w / 2 + ox, y + h / 3, w / 3, 0.1 * Math.PI, 0.9 * Math.PI)
      ctx.fill()
    }
    else {
      ctx.beginPath()
      ctx.arc(x + w / 2 + ox, y, w / 2, 0.3 * Math.PI, 0.7 * Math.PI)
      ctx.stroke()
    }

    // draw idle eyes
    if (eyesOpen) {
      ctx.beginPath()
      ctx.arc(x + w / 4 + ox, y + h / 5, w / 10, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 3 * w / 4 + ox, y + h / 5, w / 10, 0, 2 * Math.PI)
      ctx.fill()
    }
    else {
      ctx.beginPath()
      ctx.arc(x + w / 4 + ox, y + h / 3, w / 6, 1.25 * Math.PI, 1.75 * Math.PI)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + 3 * w / 4 + ox, y + h / 3, w / 6, 1.25 * Math.PI, 1.75 * Math.PI)
      ctx.stroke()
    }
  }
}
