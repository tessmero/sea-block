/**
 * @file build-chess-sounds.ts
 *
 * Generates both celebratory arpeggio and short plonk sound effects in A major using tonal and SpessaSynth.
 * Outputs OGG files to public/sounds/chess/.
 */
import * as fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { Note } from 'tonal'
import {
  BasicSoundBank,
  MIDI,
  SpessaSynthProcessor,
  SpessaSynthSequencer,
  audioToWav,
} from 'spessasynth_core'
import { Midi } from '@tonejs/midi'
import { loadAllSoundFonts, SOUND_FONTS } from './sound-fonts'

const outDir = path.join(__dirname, '../../public/sounds/chess')
const defaultSoundFont: keyof typeof SOUND_FONTS = 'falcomod-reality'
const sampleRate = 44100

// Celebration sound effect configs
const CELEBRATIONS = [
  { name: 'celebrate1', length: 1, noteSeq: [
    'A3', 'C#4', 'E4', 'A4', 'C#5', 'E5', 'A5', 'A5', 'A5',
    'C#6', 'C#6', 'A5', 'A5', 'C#6', 'C#6', 'A5', 'A5', 'C#6',
    'E6', 'E6', 'C#6', 'C#6', 'A5', 'A5', 'C#6', 'E6', 'E6',
    'A6', 'A6', 'C#7', 'C#7', 'E7', 'E7', 'A7', 'A7', 'C#8',
    'C#8', 'E8', 'E8', 'A8',
  ] },
  { name: 'celebrate2', length: 1.5, noteSeq: [
    'A4', 'C#5', 'E5', 'A5', 'E5', 'C#5', 'A4',
    'B4', 'D5', 'F#5', 'B5', 'F#5', 'D5', 'B4',
    'C#5', 'E5', 'A5', 'C#6', 'A5', 'E5', 'C#5',
    'D5', 'F#5', 'B5', 'D6', 'B5', 'F#5', 'D5',
    'E5', 'A5', 'C#6', 'E6', 'C#6', 'A5', 'E5',
    'A5', 'C#6', 'E6', 'A6',
  ] },
  { name: 'celebrate3', length: 1.5, noteSeq: [
    'A3', 'E4', 'A4', 'C#5', 'E5', 'A5', 'C#6', 'E6',
    'A6', 'E6', 'C#6', 'A5', 'E5', 'C#5', 'A4', 'E4',
    'A4', 'C#5', 'E5', 'A5', 'C#6', 'E6', 'A6', 'C#7',
    'E7', 'A7', 'C#8', 'E8', 'A8',
  ] },
  { name: 'celebrate4', length: 1.1, noteSeq: [
    'A4', 'B4', 'C#5', 'D5', 'E5', 'F#5', 'A5', 'B5',
    'C#6', 'D6', 'E6', 'F#6', 'A6', 'B6', 'C#7', 'D7',
    'E7', 'F#7', 'A7', 'B7', 'C#8', 'D8', 'E8',
  ] },
  { name: 'celebrate5', length: 1.3, noteSeq: [
    'A5', 'C#6', 'E6', 'A6', 'E6', 'C#6', 'A5',
    'A5', 'B5', 'C#6', 'D6', 'E6', 'F#6', 'A6',
    'A6', 'C#7', 'E7', 'A7', 'E7', 'C#7', 'A6',
    'A6', 'B6', 'C#7', 'D7', 'E7', 'F#7', 'A7',
    'A7', 'C#8', 'E8', 'A8',
  ] },
]

// Plonk sound effect configs
const PLONKS = [
  { name: 'plonk1', length: 0.18, noteSeq: ['A4', 'C#5', 'E5'] },
  { name: 'plonk2', length: 0.22, noteSeq: ['E4', 'A4', 'C#5'] },
  { name: 'plonk3', length: 0.15, noteSeq: ['C#5', 'E5', 'A5'] },
  { name: 'plonk4', length: 0.19, noteSeq: ['A4', 'E5'] },
  { name: 'plonk5', length: 0.21, noteSeq: ['C#5', 'A5'] },
  { name: 'plonk6', length: 0.17, noteSeq: ['E4', 'A4'] },
  { name: 'plonk7', length: 0.16, noteSeq: ['A4', 'C#5'] },
  { name: 'plonk8', length: 0.23, noteSeq: ['E5', 'A5', 'C#6'] },
  { name: 'plonk9', length: 0.14, noteSeq: ['A5'] },
  { name: 'plonk9b', length: 0.22, noteSeq: ['A5', 'A6'] },
  { name: 'plonk10', length: 0.20, noteSeq: ['C#5', 'E5'] },
]

function generateCelebrationMidi(
  name: string, lengthSec: number, noteSeq: Array<string>, midiOutDir: string,
): string {
  const midi = new Midi()
  const notes = noteSeq
  const midiNotes = notes
    .map(n => Note.midi(n))
    .filter(n => n && n >= 21 && n <= 127) as Array<number>
  const totalNotes = midiNotes.length
  const noteDuration = lengthSec / totalNotes
  const track = midi.addTrack()
  track.instrument.number = 13
  let time = 0
  for (const midiNum of midiNotes) {
    track.addNote({
      midi: midiNum,
      time: time,
      duration: noteDuration,
      velocity: 0.8,
    })
    time += noteDuration * 0.9 // slight overlap for legato
  }
  const midiPath = path.join(midiOutDir, `${name}.mid`)
  fs.writeFileSync(midiPath, Buffer.from(midi.toArray()))
  return midiPath
}

function generatePlonkMidi(
  name: string, lengthSec: number, noteSeq: Array<string>, midiOutDir: string,
): string {
  const midi = new Midi()
  const notes = noteSeq
  const midiNotes = notes
    .map(n => Note.midi(n))
    .filter(n => n && n >= 21 && n <= 127) as Array<number>
  const totalNotes = midiNotes.length
  const noteDuration = lengthSec / totalNotes
  const track = midi.addTrack()
  // track.instrument.number = 10 // music box
  track.instrument.number = 13
  let time = 0
  for (const midiNum of midiNotes) {
    track.addNote({
      midi: midiNum,
      time: time,
      duration: noteDuration * 0.8,
      velocity: 0.9,
    })
    time += noteDuration * 0.7 // overlap for percussive feel
  }

  const midiPath = path.join(midiOutDir, `${name}.mid`)
  fs.writeFileSync(midiPath, Buffer.from(midi.toArray()))
  return midiPath
}

async function main() {
  // Ensure midi output dirs exist
  const midiOutDir = path.join(__dirname, 'chess-mid')
  if (!fs.existsSync(midiOutDir)) fs.mkdirSync(midiOutDir)

  // Step 1: Generate and write MIDI files
  for (const { name, length, noteSeq } of CELEBRATIONS) {
    generateCelebrationMidi(name, length, noteSeq, midiOutDir)
  }
  for (const { name, length, noteSeq } of PLONKS) {
    generatePlonkMidi(name, length, noteSeq, midiOutDir)
  }

  // Step 2: Load soundfonts
  const loadedSoundFonts = loadAllSoundFonts()
  const soundFont = loadedSoundFonts[defaultSoundFont]

  // Step 3: Render each midi file to wav/ogg
  for (const { name, length } of [...CELEBRATIONS, ...PLONKS]) {
    const midiPath = path.join(midiOutDir, `${name}.mid`)
    const midiBuffer = fs.readFileSync(midiPath)
    const midi = new MIDI(midiBuffer)
    // Add a little extra time for celebration, less for plonk
    const extra = name.startsWith('celebrate') ? 1 : 0.2
    const sampleCount = Math.ceil(sampleRate * (length + extra))
    const seq: SpessaSynthSequencer = await buildSongSynth(midi, soundFont)
    const outLeft = new Float32Array(sampleCount)
    const outRight = new Float32Array(sampleCount)
    let filledSamples = 0
    const bufSize = 128
    while (filledSamples + bufSize < sampleCount) {
      const bufLeft = new Float32Array(bufSize)
      const bufRight = new Float32Array(bufSize)
      seq.processTick()
      seq.synth.renderAudio([bufLeft, bufRight], [bufLeft, bufRight], [bufLeft, bufRight])
      outLeft.set(bufLeft, filledSamples)
      outRight.set(bufRight, filledSamples)
      filledSamples += bufSize
    }
    // Write wav
    const wave = audioToWav([outLeft, outRight], sampleRate)
    const wavPath = path.join(outDir, `${name}.wav`)
    fs.writeFileSync(wavPath, Buffer.from(wave))
    // Convert to ogg
    const oggOutPath = wavPath.replace(/\.wav$/i, '.ogg')
    try {
      await execSync(`oggenc -o "${oggOutPath}" "${wavPath}"`)
    }
    catch (e) {
      console.error('Error encoding OGG', e)
    }
    fs.rmSync(wavPath)
    console.log('Wrote', oggOutPath)
  }
}

async function buildSongSynth(midi: MIDI, soundFont: BasicSoundBank): Promise<SpessaSynthSequencer> {
  const synth = new SpessaSynthProcessor(sampleRate, {
    enableEventSystem: false,
    effectsEnabled: false,
  })
  synth.soundfontManager.reloadManager(soundFont)
  await synth.processorInitialized
  const seq = new SpessaSynthSequencer(synth)
  seq.loadNewSongList([midi])
  seq.loop = false
  return seq
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
