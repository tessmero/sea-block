/**
 * @file sound-effects.ts
 *
 * Helper functions to play sound effects.
 */
import type { Howl } from 'howler'
import { Howler } from 'howler'
import { typedEntries } from '../util/typed-entries'
import type { SoundAssetUrl } from './sound-asset-loader'
import { getSound } from './sound-asset-loader'

type SoundParams = {
  src: Array<SoundAssetUrl>
  volume: number
}

const SOUND_EFFECTS = {
  hover: { src: ['kenney/glass_005.ogg'], volume: 0.05 },
  unhover: { src: ['kenney/glass_006.ogg'], volume: 0.05 },
  click: { src: ['kenney/select_002.ogg'], volume: 0.1 },
  unclick: { src: ['kenney/select_001.ogg'], volume: 0.08 },
  collapse: { src: ['kenney/minimize_006.ogg'], volume: 0.1 },

  chessClick: { src: ['kenney/click_002.ogg'], volume: 0.2 },
  chessCancel: { src: ['kenney/error_004.ogg'], volume: 0.08 },
  chessLand: { src: [
    'kenney/impactWood_medium_000.ogg',
    'kenney/impactWood_medium_001.ogg',
    'kenney/impactWood_medium_002.ogg',
    'kenney/impactWood_medium_003.ogg',
    'kenney/impactWood_medium_004.ogg',
  ], volume: 0.2 },
  chessGoodCapture: { src: ['kenney/select_006.ogg'], volume: 0.2 },
  chessBadCapture: { src: ['kenney/error_005.ogg'], volume: 0.5 },
  // chessConfirm: { src: ['kenney/glass_005.ogg'], volume: 0.1 },

  chessJump: { src: [
    'kenney/drop_001.ogg',
  ], volume: 0.07 },

  chessCelebrate: { src: [
    'chess/celebrate1.ogg',
    'chess/celebrate2.ogg',
    'chess/celebrate3.ogg',
    'chess/celebrate4.ogg',
    'chess/celebrate5.ogg',
  ], volume: 0.08 },

} as const satisfies Record<string, SoundParams>

type SoundEffectName = keyof typeof SOUND_EFFECTS

// called on startup
export function initAllSoundEffects() {
  for (const [name, { src, volume }] of typedEntries(SOUND_EFFECTS)) {
    // For each src array, create a Howl for each url
    soundEffects[name] = src.map((url) => {
      const howl = getSound(url)
      howl.volume(volume)
      return howl
    })
  }
}
// create howl instances for each ogg in the src array
const soundEffects: Record<SoundEffectName, Array<Howl>> = {} as Record<SoundEffectName, Array<Howl>>

// play sound only if audio actually working
export function playSound(key: SoundEffectName) {
  // if (isDevMode) {
  //   return
  // }
  if (Howler.ctx.state === 'running') {
    const sounds = soundEffects[key]
    if (!sounds || sounds.length === 0) return
    // Pick one randomly
    const sound = sounds[Math.floor(Math.random() * sounds.length)]
    sound.stop() // stop if already playing
    sound.play()
  }
  else {
    // attempt to enable sound
    Howler.ctx.resume()
  }
}

export function toggleSound(key: SoundEffectName) {
  if (Howler.ctx.state === 'running') {
    const sounds = soundEffects[key]
    if (!sounds || sounds.length === 0) return
    // Pick one randomly
    const sound = sounds[Math.floor(Math.random() * sounds.length)]
    if (sound.playing()) {
      sound.stop()
    }
    else {
      sound.play()
    }
  }
}

// // Promise that resolves when Howler's audio context is running
// function waitForAudioContextRunning(): Promise<void> {
//   if (Howler.ctx.state === 'running') {
//     return Promise.resolve()
//   }
//   return new Promise<void>((resolve) => {
//     // Listen for a statechange event
//     const checkState = () => {
//       if (Howler.ctx.state === 'running') {
//         Howler.ctx.removeEventListener('statechange', checkState)
//         resolve()
//       }
//     }
//     Howler.ctx.addEventListener('statechange', checkState)
//     // Optionally, try to resume the context (required in some browsers)
//     Howler.ctx.resume?.()
//   })
// }

// export function soundsWorking(): Promise<void> {
//   return Promise.all([
//     loadAllSounds(),
//     waitForAudioContextRunning(),
//   ]).then(() => {})
// }
