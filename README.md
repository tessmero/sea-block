# sea-block

[Live Demo](https://tessmero.github.io/iframe/sea-block/index.html)

Explore infinite blocky oceans and terrain. 

Features:

- A TypeScript adaptation of [Michael2-3B's Terrain Generator](https://github.com/Michael2-3B/Procedural-Perlin-Terrain)
- Three.js / WebGL graphics
- Intuitive controls based on three.js OrbitCamera
- Simple physics and water animation


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

Run ```npm run build:prod``` to build minified assets for production.
