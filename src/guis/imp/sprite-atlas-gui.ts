/**
 * @file sprite-atlas-gui.ts
 *
 * Display all images in memory for debugging.
 */

import type { Rectangle } from 'util/layout-parser'
import { drawAtlasEntries, getAtlasHeight } from 'gfx/2d/sprite-atlas'
import type { GuiElement, SliderState } from 'guis/gui'
import { Gui } from 'guis/gui'
import { SPRITE_ATLAS_LAYOUT } from 'guis/layouts/sprite-atlas-layout'
import type { SeaBlock } from 'sea-block'
import type { Vector2 } from 'three'

// const lyt = SPRITE_ATLAS_GUI_LAYOUT
// const y0 = lyt.backPanel.top
// const barHeight = lyt.backPanel.height

const scrollBar: GuiElement = {
  layoutKey: 'scrollBar',
  display: { type: 'panel', border: '16x16-btn-square' },
  // dragAction: (event) => {
  //   //slider.display.offsetY = Math.max(0, Math.min(barHeight, event.lvPos.y - y0))
  //   scrollBar.display.offsetY = 20//Math.min(barHeight, event.lvPos.y)
  //   scrollBar.display.needsUpdate = true
  // },
}

const scrollBarSlider: GuiElement = {
  layoutKey: 'scrollBarSlider',
  slideIn: 'scrollBar',
  display: { type: 'button' },
  clickAction: (event) => {
    if (event?.sliderState) {
      atlasPos = event.sliderState
      updateAtlasView()
    }
  },
  dragAction: (event) => {
    if (event?.sliderState) {
      atlasPos = event.sliderState
      updateAtlasView()
    }
  },
}

// view panel displays part of atlas and can be dragged
let dragStartLvPos: Vector2 | undefined = undefined
let dragStartAtlasPos: SliderState | undefined = undefined
let atlasPos: SliderState = { x: 0, y: 0 }
const viewHeight = 100

const viewPanel: GuiElement = {
  layoutKey: 'viewPanel',
  display: { type: 'sprite-atlas' },
  clickAction: ({ inputEvent }) => {
    if (inputEvent) {
      // console.log('click lvpos', inputEvent.lvPos)
      dragStartLvPos = inputEvent.lvPos.clone()
      dragStartAtlasPos = atlasPos
      scrollBarSlider.display.forcedState = 'pressed'
      scrollBarSlider.display.needsUpdate = true
      scrollBar.display.needsUpdate = true
    }
  },
  dragAction: ({ inputEvent }) => {
    if (inputEvent) {
      if (dragStartLvPos && dragStartAtlasPos) {
        const delta = inputEvent.lvPos.clone().sub(dragStartLvPos)
        const dy = -delta.y / (getAtlasHeight() - viewHeight)
        atlasPos = {
          x: 0,
          y: Math.max(0, Math.min(1, dragStartAtlasPos.y + dy)),
        }
        scrollBarSlider.display.forcedSliderState = atlasPos
        updateAtlasView()
      }
    }
  },
  unclickAction: () => {
    dragStartLvPos = undefined
    dragStartAtlasPos = undefined
    scrollBarSlider.display.forcedState = undefined
    scrollBarSlider.display.needsUpdate = true
  },
}

function updateAtlasView() {
  viewPanel.display.needsUpdate = true
  scrollBarSlider.display.needsUpdate = true
  scrollBar.display.needsUpdate = true
  viewPanel.display.needsUpdate = true
}

export class SpriteAtlasGui extends Gui {
  public drawAtlasView(ctx: CanvasRenderingContext2D, rect: Rectangle) {
    const { x, y, w, h } = rect
    // ctx.translate(x, y)
    // drawAtlasEntries({ ctx, yFraction: atlasPos.y, viewHeight: h })
    // ctx.translate(-x, -y)

    const { imageset } = viewPanel.display
    if (!imageset) {
      return // not loaded
    }

    const buffer = imageset.default as OffscreenCanvas
    const bufferCtx = buffer.getContext('2d') as OffscreenCanvasRenderingContext2D
    bufferCtx.fillStyle = '#c0c0c0'
    bufferCtx.fillRect(0, 0, w, h)
    drawAtlasEntries({ ctx: bufferCtx, yFraction: atlasPos.y, viewHeight: h })
    ctx.drawImage(buffer, 0, 0, w, h, x, y, w, h)
  }

  static {
    Gui.register('sprite-atlas', {
      factory: () => new SpriteAtlasGui(),
      layoutFactory: () => (SPRITE_ATLAS_LAYOUT),
      elements: [
        {
          layoutKey: 'backPanel',
          display: { type: 'panel' },
        },
        viewPanel,
        scrollBar,
        scrollBarSlider,
        {
          layoutKey: 'titleBar',
          display: { type: 'panel' },
        },
        {
          layoutKey: 'titleBarLabel',
          display: { type: 'label', label: 'SPRITE ATLAS', font: 'mini' },
        },
        {
          layoutKey: 'closeBtn',
          display: { type: 'button', icon: 'icons/16x16-x.png', border: '16x16-btn-square' },
          clickAction: ({ seaBlock }) => {
            const item = seaBlock.config.tree.children.testGui
            item.value = 'none'
            seaBlock.onCtrlChange(item)
          },
        },
      ],
    })
  }

  refreshLayout(context: SeaBlock): void {
    super.refreshLayout(context)
    updateAtlasView()
  }
}
