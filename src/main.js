import * as PIXI from 'pixi.js';
import { AnchorBayManager } from './AnchorBayManager';
import { Tile } from './Tile.js';
import { Bay } from './Bay.js';

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


app.stage.addChild(viewport);



// Add a visual marker
const marker = new PIXI.Graphics()
  .beginFill(0x00ff00)
  .drawRect(0, 0, 10000, 10000)
  .endFill();
viewport.addChild(marker);

const checkbox = document.getElementById('tileCheckbox');
checkbox.addEventListener('change', (e) => {
  tileLayer.visible = e.target.checked;
});
//Event Handlers
// Mouse Controls:

// Manual panning
let isDragging = false;
let lastPos = { x: 0, y: 0 };

app.canvas.addEventListener('pointerdown', (e) => {
  if (e.button === 2) return;
  if (e.button === 1) {
    isDragging = true;
    lastPos = { x: e.clientX, y: e.clientY };
    return;
  }
  
  
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

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});




// Create a tile Container:
const tileLayer = new PIXI.Container();


//Load the bay visualization XML file: - this is the same as the xml in the visulaization table
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
  
});
console.log('tileLayer children:', tileLayer.children.length);
tileLayer.rotation = degToRad(-45); // Rotate the tile layer by 270 degrees
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

const bayOverlayContainer = new PIXI.Container();
app.stage.addChild(bayOverlayContainer);

import bayData from '../BayVisualization/NewBayConfiguration.json' assert { type: 'json' };

bayData.results[0].items.forEach(bayItem => {
  console.log('Bay item:', bayItem);
  const bay = new Bay(bayItem);              // Instantiate
  viewport.addChild(bay.bayContainer);     // Add graphics to overlay layer
});

//its unfortunate buy my axis are flipped
// bayOverlayContainer.rotation = degToRad(270); // Rotate the bay overlay by 270 degrees
// bayOverlayContainer.position.set(-65000, 430000)
// viewport.addChild(bayOverlayContainer);

function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}