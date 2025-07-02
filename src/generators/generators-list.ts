/**
 * @file generators-list.ts
 *
 * Helper to lookup terrain generator by name.
 */

import { ConfigTree } from '../configs/config-tree'
import { allStyles } from '../gfx/styles/styles-list'
import { AllOceanTG } from './all-ocean-tg'
import { MichaelTG } from './michael-tg'
import { SpaceQuestTG } from './space-quest-tg'
import { TerrainGenerator } from './terrain-generator'

export const allGenerators: Record<string, TerrainGenerator<ConfigTree>> = {
  'Michael2-3B': new MichaelTG(),
  'space-quest': new SpaceQuestTG(),
  'all-ocean': new AllOceanTG(),
}

export function getGenerator(name: string): TerrainGenerator<ConfigTree> {
  const result = allGenerators[name]
  result.refreshConfig()
  allStyles.default = result.style
  return result
}
