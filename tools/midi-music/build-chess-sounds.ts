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
    'Eb4', 'G4', 'Bb4', 'Eb5', 'G5', 'Bb5', 'Eb6', 'Eb6', 'Eb6',
    'G6', 'G6', 'Eb6', 'Eb6', 'G6', 'G6', 'Eb6', 'Eb6', 'G6',
    'Bb6', 'Bb6', 'G6', 'G6', 'Eb6', 'Eb6', 'G6', 'Bb6', 'Bb6',
    'Eb7', 'Eb7', 'G7', 'G7', 'Bb7', 'Bb7', 'Eb8', 'Eb8', 'G8',
    'G8', 'Bb8', 'Bb8', 'Eb9',
  ] },
  { name: 'celebrate2', length: 1.5, noteSeq: [
    'Eb5', 'G5', 'Bb5', 'Eb6', 'Bb5', 'G5', 'Eb5',
    'F5', 'Ab5', 'C6', 'F6', 'C6', 'Ab5', 'F5',
    'G5', 'Bb5', 'Eb6', 'G6', 'Eb6', 'Bb5', 'G5',
    'Ab5', 'C6', 'F6', 'Ab6', 'F6', 'C6', 'Ab5',
    'Bb5', 'Eb6', 'G6', 'Bb6', 'G6', 'Eb6', 'Bb5',
    'Eb6', 'G6', 'Bb6', 'Eb7',
  ] },
  { name: 'celebrate3', length: 1.5, noteSeq: [
    'Eb4', 'Bb4', 'Eb5', 'G5', 'Bb5', 'Eb6', 'G6', 'Bb6',
    'Eb7', 'Bb6', 'G6', 'Eb6', 'Bb5', 'G5', 'Eb5', 'Bb4',
    'Eb5', 'G5', 'Bb5', 'Eb6', 'G6', 'Bb6', 'Eb7', 'G7',
    'Bb7', 'Eb8', 'G8', 'Bb8', 'Eb9',
  ] },
  { name: 'celebrate4', length: 1.1, noteSeq: [
    'Eb5', 'F5', 'G5', 'Ab5', 'Bb5', 'C6', 'Eb6', 'F6',
    'G6', 'Ab6', 'Bb6', 'C7', 'Eb7', 'F7', 'G7', 'Ab7',
    'Bb7', 'C8', 'Eb8', 'F8', 'G8', 'Ab8', 'Bb8',
  ] },
  { name: 'celebrate5', length: 1.3, noteSeq: [
    'Eb6', 'G6', 'Bb6', 'Eb7', 'Bb6', 'G6', 'Eb6',
    'Eb6', 'F6', 'G6', 'Ab6', 'Bb6', 'C7', 'Eb7',
    'Eb7', 'G7', 'Bb7', 'Eb8', 'Bb7', 'G7', 'Eb7',
    'Eb7', 'F7', 'G7', 'Ab7', 'Bb7', 'C8', 'Eb8',
    'Eb8', 'G8', 'Bb8', 'Eb9',
  ] },
]

// Plonk sound effect configs
const PLONKS = [
  { name: 'plonk1', length: 0.18, noteSeq: ['Eb5', 'G5', 'Bb5'] },
  { name: 'plonk2', length: 0.22, noteSeq: ['Bb4', 'Eb5', 'G5'] },
  { name: 'plonk3', length: 0.15, noteSeq: ['G5', 'Bb5', 'Eb6'] },
  { name: 'plonk4', length: 0.19, noteSeq: ['Eb5', 'Bb5'] },
  { name: 'plonk5', length: 0.21, noteSeq: ['G5', 'Eb6'] },
  { name: 'plonk6', length: 0.17, noteSeq: ['Bb4', 'Eb5'] },
  { name: 'plonk7', length: 0.16, noteSeq: ['Eb5', 'G5'] },
  { name: 'plonk8', length: 0.23, noteSeq: ['Bb5', 'Eb6', 'G6'] },
  { name: 'plonk9', length: 0.14, noteSeq: ['Eb6'] },
  { name: 'plonk9b', length: 0.22, noteSeq: ['Eb6', 'Eb7'] },
  { name: 'plonk10', length: 0.20, noteSeq: ['G5', 'Bb5'] },
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
  track.instrument.number = 12
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
