import * as PIXI from 'pixi.js';
import { AnchorBayManager } from './AnchorBayManager';
import { Tile } from './Tile.js';

const app = new PIXI.Application({
  resizeTo: window, // Automatically match window size
  antialias: true,
  background: '#ffffff',
});
await app.init();
document.body.appendChild(app.canvas);

// Trigger initial size sync once PIXI and CSS are stable
app.ticker.addOnce(() => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  viewport.position.set(app.renderer.width / 2, app.renderer.height / 2);
  console.log('Initial resize sync:', app.renderer.width, app.renderer.height);
});

// Ensure future resizes sync too
window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  //iewport.position.set(app.renderer.width / 2, app.renderer.height / 2);
  console.log('After window resize:', app.renderer.width, app.renderer.height);
});

console.log('Canvas:', app.canvas.width, app.canvas.height);
console.log('Renderer:', app.renderer.width, app.renderer.height);

// Create viewport container (camera layer)
const viewport = new PIXI.Container();
viewport.scale.set(0.002); // initial zoom level
// Delay one frame to let PIXI calculate true screen size
requestAnimationFrame(() => {
  viewport.position.set(app.renderer.width / 2, app.renderer.height / 2);
});



//app.stage.scale.x = -1;
//app.stage.position.x = app.screen.width;
app.stage.addChild(viewport);



// Add a visual marker
const marker = new PIXI.Graphics()
  .beginFill(0x00ff00)
  .drawRect(0, 0, 5000, 5000)
  .endFill();
viewport.addChild(marker);

// Manual panning
let isDragging = false;
let lastPos = { x: 0, y: 0 };

app.canvas.addEventListener('pointerdown', (e) => {
  isDragging = true;
  lastPos = { x: e.clientX, y: e.clientY };
});

app.canvas.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastPos.x;
  const dy = e.clientY - lastPos.y;
  viewport.x += dx;
  viewport.y += dy;
  lastPos = { x: e.clientX, y: e.clientY };
});

app.canvas.addEventListener('pointerup', () => {
  isDragging = false;
});


// Manual zoom
let zoomScale = 0.002;
app.canvas.addEventListener('wheel', (e) => {
  e.preventDefault();

  const rect = app.canvas.getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;

  const worldX = (screenX - viewport.x) / viewport.scale.x;
  const worldY = (screenY - viewport.y) / viewport.scale.y;

  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  zoomScale *= zoomFactor;
  zoomScale = Math.min(Math.max(zoomScale, 0.0001), 5);
  viewport.scale.set(zoomScale);

  const newScreenX = worldX * viewport.scale.x + viewport.x;
  const newScreenY = worldY * viewport.scale.y + viewport.y;

  viewport.x -= (newScreenX - screenX);
  viewport.y -= (newScreenY - screenY);
}, { passive: false });






// Resize logic
// window.addEventListener('resize', () => {
//   app.renderer.resize(window.innerWidth, window.innerHeight);
//   app.stage.position.x = app.screen.width;
// });


// Anchor layout constants
//const ANCHOR_SIZE = 10000; // For visual box size in canvas


// const anchorManager = new AnchorBayManager(viewport);

// // Place a bay at (2M, 2M)
// // 
// const tileSize = 261659;
// const tilesPerAnchor = 7;
// const anchorSpacing = tileSize * tilesPerAnchor; // no gaps!
// const anchorsWide = 3;
// const anchorsHigh = 3;

// for (let ay = 0; ay < anchorsHigh; ay++) {
//   for (let ax = 0; ax < anchorsWide; ax++) {
//     const anchorId = `A${ax}-${ay}`;
//     const anchorX = ax * anchorSpacing;
//     const anchorY = ay * anchorSpacing;
//     anchorManager.addAnchorBay(anchorId, anchorX, anchorY);

//     for (let row = 0; row < tilesPerAnchor; row++) {
//       for (let col = 0; col < tilesPerAnchor; col++) {
//         const localX = (col - Math.floor(tilesPerAnchor / 2)) * tileSize;
//         const localY = (row - Math.floor(tilesPerAnchor / 2)) * tileSize;
//         anchorManager.addTileToAnchor(anchorId, localX, localY, {
//           label: `C${col}-R${row}`
//         });
//       }
//     }
//   }
// }
//const anchorManager = new AnchorBayManager(viewport);

// Define a single anchor bay at (0, 0)
//const anchorId = 'MainAnchor';
//anchorManager.addAnchorBay(anchorId, 0, 0);

// const tileSize = 261659;
// const tilesWide = 8;
// const tilesHigh = 8;

// // Build centered grid around anchor (0,0)
// for (let row = 0; row < tilesHigh; row++) {
//   for (let col = 0; col < tilesWide; col++) {
//     const localX = (col - Math.floor(tilesWide / 2)) * tileSize;
//     const localY = (row - Math.floor(tilesHigh / 2)) * tileSize;
//     console.log(`Placing tile ${tile.file} at (${localX}, ${localY})`);

//     anchorManager.addTile(anchorId, localX, localY, {
//       label: `R${row}C${col}`
//     });
//   }
// }

// const tileSize = 611500; // In mm (your surface size)
// const tilesWide = 4;
// const tilesHigh = 4;

// Starting from (0,0) as center
// for (let row = 0; row < tilesHigh; row++) {
//   for (let col = 0; col < tilesWide; col++) {
//     const localX = (col - Math.floor(tilesWide / 2)) * tileSize;
//     const localY = (row - Math.floor(tilesHigh / 2)) * tileSize;

    // const tile = new Tile({
    //   anchorX: localX,
    //   anchorY: localY,
    //   width: tileSize,
    //   height: tileSize,
    //   label: `R${row}C${col}`,
    //   container: tileLayer
    // });
    

//     const tile = new Tile({
//       anchorX: localX,
//       anchorY: localY,
//       width: 611500,
//       height: 611500,
//       file: 'tiles/z19_134004_214344.png', // <-- relative to /public
//       label: `R${row}C${col}`,
//       container: viewport
//     });

//     // Optional: store for future interaction
//     // allTiles.push(tile);
//   }
// }

// Create a tile Container:
const tileLayer = new PIXI.Container();


// Assuming the XML was loaded as text:
const xmlText = await fetch('./BayVisualization/Map1Visualization.xml').then(r => r.text());
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

const tileNodes = [...xmlDoc.getElementsByTagName('Surface')];


tileNodes.forEach(node => {
  console.log('Inspecting node:', node.outerHTML);

  const name = node.getAttribute('Name');
  const file = node.getAttribute('File');
  const x = parseInt(node.getAttribute('X'), 10);
  const y = parseInt(node.getAttribute('Y'), 10);
  const width = parseInt(node.getAttribute('DimensionX'), 10);
  const height = parseInt(node.getAttribute('DimensionY'), 10);

  console.log(`Tile: ${name}, file=${file}, x=${x}, y=${y}, w=${width}, h=${height}`);

  const tile = new Tile({
    container: tileLayer, // your PIXI container for tiles
    anchorX: x,
    anchorY: y,
    width,
    height,
    file,
    label: name
  });

  tileLayer.addChild(tile.container);
  
  console.log(`Loaded tile: ${name} at (${x}, ${y}) with size ${width}x${height}`);
  console.log(`Tile file: ${file}`);
  // If you're using the image tiles, this is where you’d load them with PIXI.Sprite.from(file)
});
console.log('tileLayer children:', tileLayer.children.length);
tileLayer.rotation = 3 * Math.PI/2; // Rotate the tile layer by 270 degrees
viewport.addChild(tileLayer);

// Compute bounding box of all tiles
const tileBounds = tileLayer.getLocalBounds();

tileLayer.children.forEach((child, index) => {
  console.log(`Tile ${index}: pos=(${child.x}, ${child.y}), file=${child.texture?.baseTexture?.resource?.url}`);
});


console.log('Tile bounds:', tileBounds);

// Center viewport on tile bounding box
const centerX = tileBounds.x + tileBounds.width / 2;
const centerY = tileBounds.y + tileBounds.height / 2;

viewport.position.set(
  app.renderer.width / 2 - centerX * viewport.scale.x,
  app.renderer.height / 2 - centerY * viewport.scale.y
);




