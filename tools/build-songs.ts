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
  MIDI,
  SpessaSynthProcessor,
  SpessaSynthSequencer,
  audioToWav,
  loadSoundFont,
} from 'spessasynth_core'

// https://musical-artifacts.com/artifacts/6003
const soundFontSrc = './source-content/Reality_GMGS_falcomod.sf2'

const outDir = '../public/music/'

type SongParams = {
  midi: string // path to midi file
  adjust: (synth: SpessaSynthProcessor, seq: SpessaSynthSequencer) => void
  cutoff?: number // (seconds) limit song length
}

const songsToBuild: Record<string, SongParams> = {

  // Mozart / Andante cantabile con espressione
  mozart: {
    midi: './source-content/mozart.mid',
    adjust: (synth: SpessaSynthProcessor) => {
      // synth.programChange(0, 33) // 33 fingered bass
      synth.programChange(0, 26) // 26 jazz guitar
      synth.controllerChange(0, 1, 50) // add 50% vibrato
      synth.transposeAllChannels(4) // pitch up
    },
  },

  // // Couperin / Les Baricades Mistérieuses
  // couperin: {
  //   midi: './source-content/couperin.mid',
  //   adjust: (synth: SpessaSynthProcessor) => {
  //     // synth.programChange(0, 33) // 33 fingered bass
  //     synth.programChange(0, 53) // 53 ooh vocal
  //     synth.transposeAllChannels(4) // pitch up
  //   },
  //   // cutoff: 40, // end early
  // },

  // // Satie / Gymnopédie 1
  // 'satie': {
  //   midi: './source-content/satie.mid',
  //   adjust: (synth, seq) => {
  //     seq.playbackRate = 2 // speed up
  //     synth.programChange(0, 10) // 10 music box
  //     synth.transposeAllChannels(12) // pitch up
  //   },
  // },

  // // Debussy / Arabesque in C sharp major
  // 'debussy': {
  //   midi: './source-content/debussy.mid',
  //   adjust: (synth, seq) => {
  //     // seq.playbackRate = .6 // slow down
  //     synth.programChange(0, 10) // 10 music box
  //     synth.transposeAllChannels(9) // pitch up
  //   },
  //   cutoff: 79, // end early
  // },

}

async function main() {
// process arguments
  const sf = fs.readFileSync(path.join(__dirname, soundFontSrc))

  for (const [songName, { midi, adjust, cutoff }] of Object.entries(songsToBuild)) {
    const mid = fs.readFileSync(path.join(__dirname, midi))
    const midiObj = new MIDI(mid)
    const sampleRate = 44100
    const sampleCount = sampleRate * (midiObj.duration + 2)
    const synth = new SpessaSynthProcessor(sampleRate, {
      enableEventSystem: false,
      effectsEnabled: false,
    })
    synth.soundfontManager.reloadManager(loadSoundFont(sf))
    await synth.processorInitialized
    const seq = new SpessaSynthSequencer(synth)
    seq.loadNewSongList([midiObj])
    seq.loop = false

    adjust(synth, seq)

    // const test = seq.synth as SpessaSynthProcessor
    // test.getVoices()

    // halt and start repl
    // repl.start({prompt: 'debug-synth> '})

    let outLeft = new Float32Array(sampleCount)
    let outRight = new Float32Array(sampleCount)
    const start = performance.now()
    let filledSamples = 0

    // note: buffer size is recommended to be very small
    const bufSize = 128
    let i = 0

    // seq.onMetaEvent = msg => console.log(msg)

    while (filledSamples + bufSize < sampleCount) {
      const bufLeft = new Float32Array(bufSize)
      const bufRight = new Float32Array(bufSize)
      // advance sequencer
      seq.processTick()

      if (cutoff && seq.currentTime > cutoff) {
        const padSeconds = 1
        outLeft = outLeft.slice(0, filledSamples + sampleRate * (padSeconds))
        outRight = outRight.slice(0, filledSamples + sampleRate * (padSeconds))
        break
      }

      const arr = [bufLeft, bufRight]
      // console.log(bufLeft,bufRight)
      // render
      synth.renderAudio(arr, arr, arr)
      outLeft.set(bufLeft, filledSamples)
      outRight.set(bufRight, filledSamples)
      filledSamples += bufSize
      i++

      // log progress
      if (i % 100 === 0) {
        console.log('Rendered', seq.currentTime, '/', midiObj.duration)
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

    // delete wav
    fs.rmSync(wavPath)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
