/**
 * @file michael-config.ts
 *
 * Controls heirarchy and default values for terrain generator.
 */

import { Config, NumericParam } from './config'

// heirarchiccal config type
export interface MichaelConfig extends Config {
  params: {
    seed: NumericParam
    offsetX: NumericParam
    offsetZ: NumericParam
    noiseMapValues: { params: {
      persistence: NumericParam
      amplitude: NumericParam
      octaves: NumericParam
      wavelength: NumericParam
    } }
    terrainCustomization: { params: {
      exponent: NumericParam
      peaks: NumericParam
      waterLevel: NumericParam
      beachSize: NumericParam
    } }
    lighting: { params: {
      worldLight: NumericParam
      lightPosition: NumericParam
      lightHeight: NumericParam
    } }
  }
}

// heirarchical config details
export const michaelConfig: MichaelConfig = { params: {

  seed: { value: 0,
    min: 0,
    max: 10000,
    step: 1,
    resetOnChange: 'full' },
  offsetX: { value: 0,
    min: -1000,
    max: 1000,
    step: 1,
    resetOnChange: 'full' },
  offsetZ: { value: 0,
    min: -1000,
    max: 1000,
    step: 1,
    resetOnChange: 'full' },

  noiseMapValues: { params: {
    persistence: { value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      resetOnChange: 'full' },
    amplitude: { value: 1,
      min: 0,
      max: 10,
      step: 0.1,
      resetOnChange: 'full' },
    octaves: { value: 5,
      min: 1,
      max: 8,
      step: 1,
      resetOnChange: 'full' },
    wavelength: { value: 133,
      min: 1,
      max: 256,
      step: 1,
      resetOnChange: 'full' },
  } },

  terrainCustomization: { params: {
    exponent: { value: 3.3,
      min: 1,
      max: 10,
      step: 0.05,
      resetOnChange: 'full' },
    peaks: { value: 0.25,
      min: 0,
      max: 0.25,
      step: 0.01,
      resetOnChange: 'full' },
    waterLevel: { value: 132,
      min: 0,
      max: 255,
      step: 1,
      resetOnChange: 'full' },
    beachSize: { value: 12,
      min: 0,
      max: 255,
      step: 1,
      resetOnChange: 'full' },
  } },

  lighting: { params: {
    worldLight: { value: 160,
      min: 0,
      max: 255,
      step: 1 },
    lightPosition: { value: 225,
      min: 0,
      max: 360,
      step: 1 },
    lightHeight: { value: 60,
      min: -90,
      max: 90,
      step: 1 },
  } },
} }
