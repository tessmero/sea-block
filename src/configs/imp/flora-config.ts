/**
 * @file flora-config.ts
 *
 * Flora physics and display settings.
 */

import type { ConfigTree } from '../config-tree'
import { Configurable } from '../configurable'

// springs between flora tiles
const FLORA_FRICTION = 5e-4
const FLORA_SPRING = 3e-4 // spring towards neighbor tile level
const FLORA_CENTERING = 1e-4 // spring towards sea level
const FLORA_DAMPING = 1e-4
const FLORA_TEMPERATURE = 1e-5
const FLORA_AMPLITUDE = 1
const FLORA_LIMIT = 0.2

const floraConfigTree = {
  tooltip: 'settings for spheres and waves',
  children: {

    FLORA_FRICTION: { value: FLORA_FRICTION,
      min: 0,
      max: 1,
      step: 1e-5,
      tooltip: 'fraction of tile speed lost per step' },
    FLORA_SPRING: { value: FLORA_SPRING,
      min: 0,
      max: 0.01,
      step: 1e-5,
      tooltip: 'springs pushing flora tile towards neighboring tiles\' heights' },
    FLORA_CENTERING: { value: FLORA_CENTERING,
      min: 0,
      max: 0.01,
      step: 1e-5,
      tooltip: 'spring pushing flora tile towards neutral position' },
    FLORA_DAMPING: { value: FLORA_DAMPING,
      min: 0,
      max: 0.01,
      step: 1e-5,
      tooltip: 'damping for flora tile springs' },
    FLORA_TEMPERATURE: { value: FLORA_TEMPERATURE,
      min: 0,
      max: 0.01,
      step: 1e-5,
      tooltip: 'random acceleration for flora' },
    FLORA_AMPLITUDE: { value: FLORA_AMPLITUDE,
      min: 0,
      max: 50,
      step: 0.1,
      tooltip: 'multiplier for flora position changes' },
    FLORA_LIMIT: { value: FLORA_LIMIT,
      min: 0,
      max: 50,
      step: 0.1,
      tooltip: 'limit for flora position changes' },
  },
} satisfies ConfigTree

// register Configurable
class FloraConfig extends Configurable<typeof floraConfigTree> {
  static { Configurable.register('flora', () => new FloraConfig()) }
  tree = floraConfigTree
}
export const floraConfig = Configurable.create('flora') as FloraConfig
