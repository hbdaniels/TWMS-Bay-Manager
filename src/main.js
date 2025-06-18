import * as PIXI from 'pixi.js';
import { AnchorBayManager } from './AnchorBayManager';



const app = new PIXI.Application({
  resizeTo: window, // Automatically match window size
  antialias: true,
  background: '#ffffff',
});
await app.init();
document.body.appendChild(app.canvas);


// Create viewport container (camera layer)
const viewport = new PIXI.Container();
viewport.scale.set(0.002); // initial zoom level
viewport.position.set(app.screen.width / 2, app.screen.height / 2);
//app.stage.scale.x = -1;
app.stage.position.x = app.screen.width;
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
window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  app.stage.position.x = app.screen.width;
});


// Anchor layout constants
const ANCHOR_SPACING = 2000000; // 2,000,000mm = 1 anchor span
const ANCHOR_SIZE = 10000; // For visual box size in canvas

// Draw a grid of anchors (3x3 as demo)
for (let row = -1; row <= 1; row++) {
  for (let col = -1; col <= 1; col++) {
    const anchorX = col * ANCHOR_SPACING;
    const anchorY = row * ANCHOR_SPACING;

    const box = new PIXI.Graphics();
    box.lineStyle(2, 0x3399ff, 1);
    box.beginFill(0x0000ff, 1);
    box.drawRect(anchorX, anchorY, ANCHOR_SIZE, ANCHOR_SIZE);
    box.endFill();

    const label = new PIXI.Text(`(${anchorX}, ${anchorY})`, {
      fontSize: 48,
      fill: '#003366',
    });
    label.x = anchorX + 500;
    label.y = anchorY + 500;

    viewport.addChild(box);
    viewport.addChild(label);
  }
}

const anchorManager = new AnchorBayManager(viewport);

// Place a bay at (2M, 2M)
// 
const tileSize = 261659;
const tilesPerAnchor = 7;
const anchorSpacing = tileSize * tilesPerAnchor; // no gaps!
const anchorsWide = 3;
const anchorsHigh = 3;

for (let ay = 0; ay < anchorsHigh; ay++) {
  for (let ax = 0; ax < anchorsWide; ax++) {
    const anchorId = `A${ax}-${ay}`;
    const anchorX = ax * anchorSpacing;
    const anchorY = ay * anchorSpacing;
    anchorManager.addAnchorBay(anchorId, anchorX, anchorY);

    for (let row = 0; row < tilesPerAnchor; row++) {
      for (let col = 0; col < tilesPerAnchor; col++) {
        const localX = (col - Math.floor(tilesPerAnchor / 2)) * tileSize;
        const localY = (row - Math.floor(tilesPerAnchor / 2)) * tileSize;
        anchorManager.addTileToAnchor(anchorId, localX, localY, {
          label: `C${col}-R${row}`
        });
      }
    }
  }
}



