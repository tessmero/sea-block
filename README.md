# sea-block

[Live Demo](https://tessmero.github.io/sea-block)

Explore infinite blocky oceans and terrain. 

Features:

- A TypeScript adaptation of [Michael2-3B's Terrain Generator](https://github.com/Michael2-3B/Procedural-Perlin-Terrain)
- Three.js / WebGL graphics
- Camera and player movement control based on three.js OrbitCamera
- Water physics animation


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

Generate music assets in `public/music`.

```
npx ts-node tools/build-songs.ts
```

