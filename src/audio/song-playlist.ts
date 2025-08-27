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
  return { src: `music/${name}.ogg`, volume: 0.1 }
}

const SONG_NAMES = ['debussy', 'satie', 'mozart', 'chopin', 'mendelssohn'] as const
export type SongName = (typeof SONG_NAMES)[number]

const SONGS = Object.fromEntries(
  SONG_NAMES.map(name => [name, sng(name)]),
) as Record<SongName, SongParams>

export const FREECAM_PLAYLIST = [
  'satie', 'debussy', 'mozart',
] as const satisfies Array<SongName>
export const CHESS_PLAYLIST = ['chopin'] as const satisfies Array<SongName>
export const RAFT_PLAYLIST = ['mendelssohn'] as const satisfies Array<SongName>
let currentPlaylist: Array<SongName> = FREECAM_PLAYLIST

let currentSong: SongParams = SONGS[0]

let currentHowl: Howl | null = null
let isPlaying = false
let lastPlayedIndex = -1

// set live volume, used to fade out during transition
export function scaleSongVolume(scale: number) {
  if (!currentHowl) {
    return
  }
  currentHowl.volume(currentSong.volume * scale)
}

export function playNextTrack(playlist?: Array<SongName>): void {
  if (playlist) {
    currentPlaylist = playlist
  }
  isPlaying = true
  _playNextTrack()
}

function _playNextTrack(): void {
  if (!isPlaying) return

  // console.log('play next track', JSON.stringify(currentPlaylist))

  // const i = Math.floor(Math.random() * SONG.NAMES.length)
  const i = (lastPlayedIndex + 1) % currentPlaylist.length
  currentSong = SONGS[currentPlaylist[i]]
  const { src, volume } = currentSong
  lastPlayedIndex = i

  if (currentHowl) {
    currentHowl.stop()
    currentHowl.unload()
    currentHowl = null
  }
  currentHowl = new Howl({
    src: [src],
    format: ['ogg'],
    volume,
    html5: true, // Recommended for streaming-like behavior
    onend: () => {
      // console.log('Track ended, playing next…')
      _playNextTrack()
    },
  })

  // console.log('play song howl')
  currentHowl.play()
}

// Play or Stop toggle
export function toggleRadio(): void {
  if (!isPlaying) {
    isPlaying = true
    _playNextTrack()
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
