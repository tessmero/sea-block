/**
 * @file sounds.ts
 *
 * List all sound effects to load.
 */
import { Howl, Howler } from 'howler'
import { typedEntries } from './typed-entries'

// Define your sound settings in a single object
const SOUND_SPECS = {
  hover: { src: 'sounds/kenney/select_002.ogg', volume: 0.6 },
  unHover: { src: 'sounds/kenney/select_001.ogg', volume: 0.8 },
  click: { src: 'sounds/kenney/select_004.ogg', volume: 1 },
  // Add more sounds as needed
} as const

const multiplyAllVolumes = 0.2

type SoundKey = keyof typeof SOUND_SPECS

// Dynamically create Howl instances for each sound
const sounds: Record<SoundKey, Howl> = {} as Record<SoundKey, Howl>
for (const [name, { src, volume }] of typedEntries(SOUND_SPECS)) {
  sounds[name] = new Howl({
    src: [src],
    format: ['ogg'],
    volume: volume * multiplyAllVolumes,
  })
}

// play sound only if audio actually working
export function playSound(key: SoundKey) {
  if (Howler.ctx.state === 'running') {
    sounds[key].play()
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
  Object.values(sounds).map(
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
