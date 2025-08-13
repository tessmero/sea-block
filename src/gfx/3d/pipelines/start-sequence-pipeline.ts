/**
 * @file start-sequence-pipeline.ts
 *
 * Pipeline like freecam but with extra color transformation.
 */

import { freeCamPipeline } from './free-cam-pipeline'
import type { Pipeline } from './pipeline'

export const startSequencePipeline = {
  update: (_dt) => {},
  steps: [
    ...freeCamPipeline.steps,

    // add extra color transformation
    ({ current }) => {
      // const targetColors= current.targetColors || getOriginalTileColors(tileIndex,colorsDummy)
      // if (!targetColors) {
      //   return current // no starting color, give up
      // }
      // const anim = StartSequenceGame.colorTransformAnim
      // console.log('color warp anim', anim)
      // const lMult = Math.pow(0.2 + 0.8 * anim, -1) // lightness multiplier
      // for (const key in targetColors) {
      //   const color = targetColors[key]
      //   color.getHSL(hsl)
      //   if (key === 'top') {
      //     hsl.l *= lMult
      //   }
      //   hsl.h -= 0.95 * (1 - anim) // rotate hues
      //   color.setHSL(hsl.h, hsl.s, hsl.l)
      // }

      return current
    },
  ],
} as const satisfies Pipeline

// dummy
// const hsl = { h: 0, s: 0, l: 0 }
