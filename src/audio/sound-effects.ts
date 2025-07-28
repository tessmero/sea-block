/**
 * @file sound-effects.ts
 *
 * List of sound effects to load at startup, and helper functions to play them.
 */
import { Howl, Howler } from 'howler'
import { typedEntries } from '../util/typed-entries'

type SoundParams = {
  src: string
  volume: number
}

function soundSrc(name) {
  return `sounds/kenney/${name}.ogg`
}

// sound effects to load immediately
const SOUND_EFFECTS = {
  hover: { src: soundSrc('glass_005'), volume: 0.5 },
  unhover: { src: soundSrc('glass_006'), volume: 0.5 },
  click: { src: soundSrc('select_002'), volume: 1 },
  unclick: { src: soundSrc('select_001'), volume: 0.8 },
  collapse: { src: soundSrc('minimize_006'), volume: 1 },
} as const satisfies Record<string, SoundParams>

type SoundEffectName = keyof typeof SOUND_EFFECTS

const multiplyAllVolumes = 0.06

// create howl instance for each ogg
const soundEffects: Record<SoundEffectName, Howl> = {} as Record<SoundEffectName, Howl>
for (const [name, { src, volume }] of typedEntries(SOUND_EFFECTS)) {
  soundEffects[name] = new Howl({
    src: [src],
    format: ['ogg'],
    volume: volume * multiplyAllVolumes,
  })
}
//
// function loadAll<TName extends string>(
//   manifest: Record<TName, SoundParams>
// ): Record<TName, Howl> {
//   for (const [name, { src, volume }] of typedEntries(SOUND_EFFECTS)) {
//     result[name] = new Howl({
//       src: [src],
//       format: ['ogg'],
//       volume: volume * multiplyAllVolumes,
//     })
//   }
// }

// play sound only if audio actually working
export function playSound(key: SoundEffectName) {
  if (Howler.ctx.state === 'running') {
    const sound = soundEffects[key]
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
    const sound = soundEffects[key]
    if (sound.playing()) {
      sound.stop()
    }
    else {
      sound.play()
    }
  }
}

// Promise that resolves when Howler's audio context is running
function waitForAudioContextRunning(): Promise<void> {
  if (Howler.ctx.state === 'running') {
    return Promise.resolve()
  }
  return new Promise<void>((resolve) => {
    // Listen for a statechange event
    const checkState = () => {
      if (Howler.ctx.state === 'running') {
        Howler.ctx.removeEventListener('statechange', checkState)
        resolve()
      }
    }
    Howler.ctx.addEventListener('statechange', checkState)
    // Optionally, try to resume the context (required in some browsers)
    Howler.ctx.resume?.()
  })
}

// Promise that resolves when all sounds are loaded
const allSoundsLoaded = Promise.all(
  Object.values(soundEffects).map(
    sound =>
      new Promise<void>((resolve, reject) => {
        sound.once('load', resolve)
        sound.once('loaderror', reject)
      }),
  ),
).then(() => {})

// Combine both promises
export function soundsLoaded(): Promise<void> {
  return Promise.all([
    allSoundsLoaded,
    waitForAudioContextRunning(),
  ]).then(() => {})
}
