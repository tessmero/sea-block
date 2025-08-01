/**
 * @file ts-to-midi.ts
 *
 * Used to convert tessmero song (.ts) to midi (.mid).
 */

import { Midi } from '@tonejs/midi'
import * as tonal from 'tonal'

export type Song = {
  voices: ReadonlyArray<Voice>
  score: ReadonlyArray<ScoreMeasure>
}
type ScoreMeasure = ReadonlyArray<VoiceMeasure>
type VoiceMeasure = ReadonlyArray<string | number>

type Voice = {
  // wave: 'square' | 'sine' | 'sh'
  volume: number
  duration: number // seconds
  freq: string
  instrument?: number // midi instrument
  // env: string
}

export function convertToMidi(mySong: Song, vMult = 1): Buffer<ArrayBuffer> {
  const midi = new Midi()

  mySong.voices.forEach((voice, trackIndex) => {
    const track = midi.addTrack()
    track.channel = trackIndex % 16
    track.instrument.number = voice.instrument || 0

    // Choose associated voice pattern (melodic steps)
    const voiceMeasures: Array<VoiceMeasure> = mySong.score.map(section => section[trackIndex])

    let time = 0
    let lastNoteTime = 0
    let lastNoteDuration = 0
    let currentFreq: string | null = null
    const stepDuration = voice.duration

    voiceMeasures.forEach((measure) => {
      measure.forEach((note) => {
        if (note === 'rest') {
        // rest: flush any previous note
          if (currentFreq) {
            track.addNote({
              midi: freqToMidi(currentFreq),
              time: lastNoteTime,
              duration: lastNoteDuration,
              velocity: voice.volume * vMult,
            })
            // time += lastNoteDuration
            currentFreq = null
          }
          else {
            // time += stepDuration
          }
        }
        else if (note === 'sustain') {
        // sustain
          lastNoteDuration += stepDuration
        }
        else {
        // flush previous note if any
          if (currentFreq) {
            track.addNote({
              midi: freqToMidi(currentFreq),
              time: lastNoteTime,
              duration: lastNoteDuration,
              velocity: voice.volume * vMult,
            })
            // time += lastNoteDuration
          }

          // get new note
          const baseFreq = voice.freq
          currentFreq = pitchAdd(baseFreq, note)
          lastNoteTime = time
          lastNoteDuration = stepDuration
        }

        time += stepDuration
      })
    })

    // flush sustained note at end of song
    if (currentFreq) {
      track.addNote({
        midi: freqToMidi(currentFreq),
        time: lastNoteTime,
        duration: lastNoteDuration,
        velocity: voice.volume * vMult,
      })
      // time += lastNoteDuration
      currentFreq = null
      lastNoteDuration = 0
    }
  })

  // Save to file
  const out = midi.toArray()
  // fs.writeFileSync('output.mid', Buffer.from(out))
  // console.log('✅ MIDI file saved as output.mid')

  return Buffer.from(out) satisfies Buffer<ArrayBuffer>
}

function freqToMidi(noteStr) {
  const midi = tonal.Midi.toMidi(noteStr)
  if (midi === null) {
    throw new Error(`Invalid note: ${noteStr}`)
  }
  return midi
}

function pitchAdd(baseNote, semitones) {
  const midi = tonal.Midi.toMidi(baseNote)
  return tonal.Midi.midiToNoteName(midi + semitones)
}
