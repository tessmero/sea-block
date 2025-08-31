/**
 * @file audio-config.ts
 *
 * Config impelmentation with adjustable volume for each sound effect.
 */

import type { ConfigTree } from 'configs/config-tree'
import { Configurable } from 'configs/configurable'
import { enabledConfigItems } from 'configs/sounds/enabled-sounds'

// type SoundParams = {
//   src: Array<SoundAssetUrl>
//   volume: number
// }

const audioConfigTree = {
  children: { // controlled by in-game settings
    musicVolume: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },
    sfxVolume: { // controlled by in-game settings
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },
    ...enabledConfigItems, // sound assets tracked and used in production
    // ...testConfigItems, // other sound assets
  },
} satisfies ConfigTree

class AudioConfig extends Configurable<typeof audioConfigTree> {
  static { Configurable.register('audio', () => new AudioConfig()) }
  tree = audioConfigTree
}
export const audioConfig = Configurable.create('audio') as AudioConfig
