/**
 * @file song-playlist.ts
 *
 * List of songs and helper function to play songs.
 * Songs are streamed only when necessary, unlike sound
 * effects which are loaded on startup.
 */
import { Howl } from 'howler'

type SongParams = {
  src: string
  volume: number
}

function sng(name) {
  return { src: `music/${name}.ogg`, volume: 1 }
}

// for f in public/music/*.ogg; do b=${f##*/}; echo "'${b%.ogg}':sng('${b%.ogg}'),"; done
const SONGS = {
  debussy: sng('debussy'),
  couperin: sng('couperin'),
  satie: sng('satie'),
  mozart: sng('mozart'),
} as const satisfies Record<string, SongParams>

const SONG_NAMES = [...Object.keys(SONGS)]
export type SongName = keyof typeof SONGS

let currentHowl: Howl | null = null
let isPlaying = false
let lastPlayedIndex = -1

function playNextTrack(): void {
  if (!isPlaying) return

  // const i = Math.floor(Math.random() * SONG_NAMES.length)
  const i = (lastPlayedIndex + 1) % SONG_NAMES.length
  const { src } = SONGS[SONG_NAMES[i]]
  lastPlayedIndex = i

  // Stop previous audio if needed
  if (currentHowl) {
    currentHowl.unload()
  }

  currentHowl = new Howl({
    src: [src],
    format: ['ogg'],
    html5: true, // Recommended for streaming-like behavior
    onend: () => {
      // console.log('Track ended, playing next…')
      playNextTrack()
    },
  })

  currentHowl.play()
}

// Play or Stop toggle
export function toggleRadio(): void {
  if (!isPlaying) {
    isPlaying = true
    playNextTrack()
  }
  else {
    isPlaying = false
    if (currentHowl) {
      currentHowl.stop()
      currentHowl.unload()
      currentHowl = null
    }
  }
}
