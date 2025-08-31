/**
 * @file sm-ivy.ts
 *
 * Start Menu Ivy singleton, adapted from 'global' object in tessmero/ivy.
 */

import type { Vector2 } from 'three'
import { v } from './ivy-util'
import type { Scaffold } from './math/ivy-scaffold'
import type { Vine } from './math/ivy-vine'

export const smIvyConstants = {

  // //
  // vineColor: '#ffffff66',
  // scaffoldColor: '#ffffff66',

  //
  scaffoldThickness: 0.002,
  vineThickness: 0.002,

  vinePadding: 0, // max space between a vine and its scaffold

  // number of spirals around lattice
  // per distance unit
  spiralDensity: [1.3, 130],

  // size of vine instances
  // fraction of scaffold length
  helixDist: [0.1, 0.3],

  // max dist vines are allowed to jump between scaffolds
  maxJump: 0.01,

  growthSpeed: 1e-4, // distance per ms

  branchRate: 0.15, // chance for helix to branch at scaffold intersection

  twigRate: 5e-2, // helix to spawn twig
  twigLen: [0.01, 0.05],

  leafRate: 0.5, // twig to spawn leaf
  leafSize: [0.002, 0.004], // radius
  leafLen: [0.011, 0.02], // length
} as const

export const smIvy = {

  // total time elapsed in milliseconds
  t: 0,
  resetCountdown: 1000,
  resetDelay: 20 * 1000,

  hue: 0.5,
  hueVariance: 0.5,

  // non-clearing tessmero/ivy buffer
  buffer: {} as HTMLCanvasElement,
  ctx: {} as CanvasRenderingContext2D,

  // animated waving graphics, redrawn every frame
  canvas: {} as HTMLCanvasElement,
  finalCtx: {} as CanvasRenderingContext2D,

  // relate screen pixels to virtual 2D units
  canvasOffsetX: 0,
  canvasOffsetY: 0,
  canvasScale: 0,
  centerPos: v(0.5, 0.5),
  screenCorners: [] as Array<Vector2>,

  // objects
  allScaffolds: [] as Array<Scaffold>,
  allVines: [] as Array<Vine>, // Vine/Twig/Leaf intances

  // debug
  debugBezierPoints: false,

  // re-assigned at bottom of this file
  helix_d: 0,
  hpid2: 0,

}

// prepare for math later
smIvy.helix_d = smIvyConstants.scaffoldThickness + smIvyConstants.vineThickness
smIvy.hpid2 = Math.pow(Math.PI * smIvy.helix_d, 2)
