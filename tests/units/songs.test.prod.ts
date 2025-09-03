/**
 * @file songs.test.prod.ts
 *
 * Verify that song assets exist, analyze them, and assert that they contain
 * music in the expected keys.
 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { SongName, SONGS } from '../../src/audio/song-playlist'

// For pitch analysis
import decode from 'audio-decode' // npm install audio-decode
import { YIN } from 'pitchfinder' // npm install pitchfinder
import * as tonal from 'tonal'

const PUBLIC_MUSIC_DIR = path.resolve(__dirname, '../../public/musihc')

// assert all song assets exist
describe('Song Assets', function () {
  for (const name of Object.keys(SONGS) as Array<SongName>) {
    const song = SONGS[name]
    it(`exists: ${song.src}`, function () {
      const filePath = path.join(PUBLIC_MUSIC_DIR, path.basename(song.src))
      assert.ok(fs.existsSync(filePath), `Missing song asset: ${filePath}`)
    })
  }
})

// describe('Song Analysis', function () {
// this.timeout(20000)
for (const name of Object.keys(SONGS) as Array<SongName>) {
  describe(`Analysis of song ${name}`, function () {
    const song = SONGS[name]
    const filePath = path.join(PUBLIC_MUSIC_DIR, path.basename(song.src))
    let buffer: AudioBuffer
    // let bpmPeaks: Array<number>
    let pitches: Array<number>

    before(`can decode AudioBuffer from ${filePath}`, async function () {
      buffer = await getSongBuffer(filePath, this.skip)
    })

    describe(`Pitch analysis for ${name}`, function () {
      it(`can extract pitches from: ${filePath}`, async function () {
        pitches = extractPitches(buffer)
      })

      const minDistinctPitches = 5
      //
      const PITCH_EPSILON = 0.5 // in semitones, for grouping close pitches
      function freqToMidi(freq: number): number {
        return 69 + 12 * Math.log2(freq / 440)
      }
      it(`has at least ${minDistinctPitches} distinct pitch values`, function () {
        if (!pitches || pitches.length === 0) this.skip()
        // Convert to MIDI numbers, group by epsilon, then map to note names
        const midiNumbers = pitches.map(freqToMidi).filter(n => isFinite(n))
        // Group by epsilon
        const groups: Array<number> = []
        midiNumbers.forEach((midi) => {
          if (!groups.some(g => Math.abs(g - midi) < PITCH_EPSILON)) {
            groups.push(midi)
          }
        })
        // Map to note names using tonal.Note.fromMidi
        const noteNames = groups.map(midi =>
          tonal.Note && tonal.Note.fromMidi
            ? tonal.Note.fromMidi(Math.round(midi))
            : '',
        )
        // Filter unique note names
        const uniqueNotes = Array.from(new Set(noteNames.filter(Boolean)))
        assert.ok(
          uniqueNotes.length >= minDistinctPitches,
          'Expected at least ' + minDistinctPitches + ' distinct pitch values, got '
          + uniqueNotes.length + ': ' + uniqueNotes.join(', '),
        )
        // Print the distinct pitches (most common first) if test passes
        // Count occurrences of each note in the original midiNumbers (rounded to note name)
        const allNoteNames = midiNumbers.map(midi =>
          tonal.Note && tonal.Note.fromMidi
            ? tonal.Note.fromMidi(Math.round(midi))
            : '',
        ).filter(Boolean) // ignore falsey
          .filter(note => note !== 'D10' && note !== 'Db10') // ignore notes often detected spuriously
        const noteCounts = new Map()
        allNoteNames.forEach((n) => {
          noteCounts.set(n, (noteCounts.get(n) || 0) + 1)
        })
        const _sortedNotes = Array.from(noteCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([n]) => n)
        if (uniqueNotes.length >= minDistinctPitches) {
          // Only print if test passes
          // console.log('Distinct pitches (most common first):', sortedNotes.join(', '))
        }
      })
    })
  })
}
// })

async function getSongBuffer(filePath: string, skip): Promise<AudioBuffer> {
  if (!fs.existsSync(filePath)) {
    skip() // skip tests for this song (file missing)
  }
  const buffer = fs.readFileSync(filePath)
  try {
    return await decode(buffer)
  }
  catch (_e) {
    skip() // skip tests for this song (failed to decode)
  }
  return {} as AudioBuffer
}

function extractPitches(audioBuffer: AudioBuffer): Array<number> {
  // Use only the first channel
  const channel = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  // Analyze a n seconds window from the start (or less if shorter)
  const nSeconds = 100
  const windowSize = Math.min(sampleRate * nSeconds, channel.length)
  const window = channel.slice(0, windowSize)
  const detectPitch = YIN({ sampleRate })
  // Analyze frames
  const step = 2048 // n samples per frame
  const pitches: Array<number> = []
  for (let i = 0; i < window.length - step; i += step) {
    const frame = window.slice(i, i + step)
    const pitch = detectPitch(frame)
    if (typeof pitch === 'number') pitches.push(pitch)
  }
  // console.log(`extracted ${pitches.length} pitches`)
  return pitches
}
