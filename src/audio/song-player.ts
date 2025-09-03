/**
 * @file song-player.ts
 *
 * List of songs and helper function to play songs.
 * Songs are streamed only when necessary, unlike sound
 * effects which are loaded on startup.
 */
import { audioConfig } from 'configs/imp/audio-config'
import { Howl } from 'howler'

type SongParams = {
  src: string
  volume: number
}

const SONG_NAMES = [
  'debussy',
  'satie',
  'mozart',
  'chopin',
  'mendelssohn',
  'retroindiejosh_mysterious-wave', // iuyt
] as const
export type SongName = (typeof SONG_NAMES)[number]

export const SONGS: Record<SongName, SongParams> = {
  'debussy': {
    src: 'music/debussy.ogg',
    volume: 0.1,
  },
  'satie': {
    src: 'music/satie.ogg',
    volume: 0.1,
  },
  'mozart': {
    src: 'music/mozart.ogg',
    volume: 0.1,
  },
  'chopin': {
    src: 'music/chopin.ogg',
    volume: 0.1,
  },
  'mendelssohn': {
    src: 'music/mendelssohn.ogg',
    volume: 0.1,
  },
  'retroindiejosh_mysterious-wave': {
    // cut first 58 seconds: ffmpeg -ss 58.1 -i in.ogg -c copy out.ogg
    src: 'music/retroindiejosh_mysterious-wave.ogg',
    volume: 0.2,
  },
}

export const FREECAM_PLAYLIST = [
  'satie', 'debussy', 'mozart',
] as const satisfies Array<SongName>

export const CHESS_PLAYLIST = [
  'chopin',
] as const satisfies Array<SongName>

export const RAFT_PLAYLIST = [
  'mendelssohn',
] as const satisfies Array<SongName>

export const START_MENU_PLAYLIST = [
  'retroindiejosh_mysterious-wave',
] as const satisfies Array<SongName>

let currentPlaylist: Array<SongName> = FREECAM_PLAYLIST

let currentSong: SongParams = SONGS[SONG_NAMES[0]]

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
  const key = currentPlaylist[i]
  currentSong = SONGS[key]
  const { src } = currentSong
  lastPlayedIndex = i

  if (currentHowl) {
    currentHowl.stop()
    currentHowl.unload()
    currentHowl = null
  }
  currentHowl = new Howl({
    src: [src],
    format: ['ogg'],
    volume: _getSongVolume(currentSong),
    html5: true, // Recommended for streaming-like behavior
    onend: () => {
      // console.log('Track ended, playing next…')
      _playNextTrack()
    },
  })

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

export function updateAllSongVolumes() {
  if (currentHowl) {
    // update volume of ongoing song
    currentHowl.volume(_getSongVolume(currentSong))
  }
}

function _getSongVolume(song: SongParams) {
  return song.volume // volume for specific song
    * audioConfig.tree.children.musicVolume.value // global music volume slider
}
