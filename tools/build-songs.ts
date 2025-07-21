/**
 * @file build-songs.ts
 *
 * Run on linux to generate ogg files in public/music.
 * 1. Creates wav, same as user interface at https://spessasus.github.io/SpessaSynth/.
 * 2. Uses oggenc to convert wav to ogg (apt install vorbis-tools).
 *
 * High-quality sound font: https://musical-artifacts.com/artifacts/6003.
 * Classical music midis: https://www.kunstderfuge.com.
 */
import * as fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import {
  BasicSoundBank,
  MIDI,
  SpessaSynthProcessor,
  SpessaSynthSequencer,
  audioToWav,
} from 'spessasynth_core'
import { convertToMidi } from './ts-to-midi'
import { SONGS_TO_BUILD } from './songs-list'
import { loadAllSoundFonts, SOUND_FONTS } from './sound-fonts'

const outDir = '../public/music/'
const defaultSoundFont: keyof typeof SOUND_FONTS = 'falcomod-reality'

const sampleRate = 44100

async function main() {
  // load/download all necssary sf2 files
  const loadedSoundFonts = loadAllSoundFonts()

  // build all songs
  for (const [songName, songParams] of Object.entries(SONGS_TO_BUILD)) {
    const { src, adjust, cutoff, soundFount } = songParams
    const midi = loadMidi(src)
    const soundFont = loadedSoundFonts[soundFount || defaultSoundFont]
    const sampleCount = sampleRate * (midi.duration + 2) // two extra seconds at end

    // build synthesiser for one song
    const seq: SpessaSynthSequencer = await buildSongSynth(midi, soundFont)

    // apply adjustments in song list
    if (adjust) adjust({ seq, synth: seq.synth })

    // halt and start repl
    // repl.start({prompt: 'debug-synth> '})

    // prepare output data
    let outLeft = new Float32Array(sampleCount)
    let outRight = new Float32Array(sampleCount)
    const start = performance.now()
    let filledSamples = 0

    // buffer size is recommended to be small
    const bufSize = 128
    let i = 0

    // seq.onMetaEvent = msg => console.log(msg)

    // iterate over
    while (filledSamples + bufSize < sampleCount) {
      const bufLeft = new Float32Array(bufSize)
      const bufRight = new Float32Array(bufSize)
      // advance sequencer
      seq.processTick()

      // check if reached cutoff time in song list
      if (cutoff && seq.currentTime > cutoff) {
        const padSeconds = 1 // add silence after cutoff
        outLeft = outLeft.slice(0, filledSamples + sampleRate * (padSeconds))
        outRight = outRight.slice(0, filledSamples + sampleRate * (padSeconds))
        break
      }

      // render audio
      const arr = [bufLeft, bufRight]
      seq.synth.renderAudio(arr, arr, arr)
      outLeft.set(bufLeft, filledSamples)
      outRight.set(bufRight, filledSamples)
      filledSamples += bufSize

      // log progress
      i++
      if (i % 100 === 0) {
        console.log('Rendered', seq.currentTime, '/', midi.duration)
      }
    }

    // finished rendering
    console.log('Rendered in', Math.floor(performance.now() - start), 'ms')

    // write wav
    const wave = audioToWav([outLeft, outRight], sampleRate)
    const wavPath = path.join(__dirname, outDir, `${songName}.wav`)
    fs.writeFileSync(wavPath, Buffer.from(wave))
    console.log('wrote file', wavPath)

    // conert wav to ogg
    const oggOutPath = wavPath.replace(/\.wav$/i, '.ogg')
    console.log('encoding OGG...')
    try {
      await execSync(`oggenc -o "${oggOutPath}" "${wavPath}"`)
      console.log('encoded OGG', oggOutPath)
    }
    catch (e) {
      console.error('Error encoding OGG', e)
    }

    // delete wav that was converted to ogg
    fs.rmSync(wavPath)
  }
}

// construct SpessaSynth processor and sequencer for one song
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

// get midi data from (.mid) or (.ts)
function loadMidi(src: string): MIDI {
  const srcFullPath = path.join(__dirname, src)
  let midiBuffer: Buffer<ArrayBuffer>
  if (src.endsWith('.mid')) {
    // load midi file
    midiBuffer = fs.readFileSync(srcFullPath)
  }
  else if (src.endsWith('.ts')) {
    // convert tessmero song data to midi
    const { default: songData } = require(srcFullPath) // eslint-disable-line @typescript-eslint/no-require-imports
    midiBuffer = convertToMidi(songData)

    // save copy for experimenting in SpessaSynth gui
    fs.writeFileSync(
      `${srcFullPath}.mid`,
      convertToMidi(songData, 10), // midi with 10x volume
    )
  }
  else {
    throw new Error(`unrecognized song source "${src}", should be .mid or .ts file.`)
  }

  // return midi as SpessaSynth object type
  return new MIDI(midiBuffer)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
