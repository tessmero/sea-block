/**
 * @file sound-effects.ts
 *
 * Helper functions to play sound effects.
 */
import type { Howl } from 'howler'
import { Howler } from 'howler'
import { typedEntries } from '../util/typed-entries'
import { getSound } from './sound-asset-loader'
import type { SoundEffectName } from 'configs/imp/sounds-config'
import { SOUND_SOURCES, soundsConfig } from 'configs/imp/sounds-config'

// called on startup
export function initAllSoundEffects() {
  for (const [name, src] of typedEntries(SOUND_SOURCES)) {
    // For each src array, create a Howl for each url
    soundEffects[name] = src.map((url) => {
      const howl = getSound(url)
      // howl.volume(volume)
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
    sound.volume(soundsConfig.tree.children[`sound-${key}`].value)
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
