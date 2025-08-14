

<h1>
<img src="https://github.com/tessmero/sea-block/raw/main/tests/gfx/test-images/octagon-tiling.png"/>Sea Block</h1>

[![Node.js CI](https://github.com/tessmero/sea-block/actions/workflows/node.js.yml/badge.svg)](https://github.com/tessmero/sea-block/actions/workflows/node.js.yml)

[Live Demo](https://tessmero.github.io/sea-block)


Explore infinite blocky oceans and terrain. 

### Usage

Clone this repository and install dependencies.

```
git clone https://github.com/tessmero/sea-block.git
cd sea-block
npm install
```

Start local server and listen for changes in source.

```
npm run dev
```

Alternatively, run ```npx serve dist``` to start local server and ```npx vite build``` to rebuild assets in `dist` and listen for changes.

Check for syntax errors and enforce strong typing.

```
npx tsc
```

Enforce coding style preferences defined in `estlint.config.ts`

```
npx eslint 
```

Run unit tests defined in `tests`

```
npm run test
```

Output minified product in `dist`

```
npm run build:prod
```

### Resources

[Michael2-3B](https://github.com/Michael2-3B/Procedural-Perlin-Terrain) - terrain generator

[Kenney](https://kenney.nl/assets/ui-audio) - sound effect assets

[kunstderfuge.com](https://www.kunstderfuge.com) - classical music midis (.mid)

[Falcosoft](https://falcosoft.hu/softwares.html#midiplayer) - sound font (.sf2) and tools

[SpessaSynth](https://spessasus.github.io/SpessaSynth/) - play midi with sound font in javascript

[Sketchfab](https://sketchfab.com/robie1/collections/low-poly-chess-set) - chess pieces (.obj)