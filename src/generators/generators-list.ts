/**
 * @file generators-list.ts
 *
 * Helper to lookup terrain generator by name.
 */

import type { ConfigTree } from '../configs/config-tree'
import { DefaultStyle } from '../gfx/styles/default-style'
import { AllOceanTG } from './all-ocean-tg'
import { MichaelTG } from './michael-tg'
import { SpaceQuestTG } from './space-quest-tg'
import type { TerrainGenerator } from './terrain-generator'

export const allGenerators = {
  'Michael2-3B': new MichaelTG(),
  'space-quest': new SpaceQuestTG(),
  'all-ocean': new AllOceanTG(),
} as const satisfies Record<string, TerrainGenerator<ConfigTree>>

export function getGenerator(name: keyof typeof allGenerators): TerrainGenerator<ConfigTree> {
  const result = allGenerators[name]
  result.refreshConfig()
  DefaultStyle.setDefaultCss(result.style)
  return result
}
