/**
 * @file sound-fonts.ts
 *
 * List of sound fonts and helper to load all sound fonts.
 * Sound fonts are not tracked in this repository but
 * can be downloaded from free public sources.
 */

import * as fs from 'fs'
import path from 'path'
import { BasicSoundBank, loadSoundFont } from 'spessasynth_core'

type Loaded = Record<keyof typeof SOUND_FONTS, BasicSoundBank>

export function loadAllSoundFonts(): Loaded {
  const result = {}

  for (const [name, { local }] of Object.entries(SOUND_FONTS)) {
    const localSrc = path.join(__dirname, local)
    const data = fs.readFileSync(localSrc)
    const sf = loadSoundFont(data)
    result[name] = sf
  }

  return result as Loaded
}

export const SOUND_FONTS = {

  'falcomod-reality': {
    local: './music-data/sf2/Reality_GMGS_falcomod.sf2',
    remote: 'https://musical-artifacts.com/artifacts/6003/Reality_GMGS_falcomod.sf2',
  },

} as const satisfies Record<string, { local: string, remote: string }>
