// main.js
import * as PIXI from 'pixi.js';
import { AnchorBayManager } from './AnchorBayManager.js';

// Create PIXI application
const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  background: '#ffffff', // White background
});
await app.init();
document.body.appendChild(app.canvas);

// Log to confirm setup
console.log('PIXI v8 initialized:', PIXI.VERSION);

// Add a simple pointer event listener on the stage
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen; // Make the whole canvas interactive

app.stage.on('pointerdown', (e) => {
  console.log('Pointer down at:', e.global.x, e.global.y);
});

// Handle resizing
window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  app.stage.hitArea = app.screen;
});

const rootContainer = new PIXI.Container();
app.stage.addChild(rootContainer);

rootContainer.scale.set(0.001); // Adjust as needed


// Create and add the manager
const anchorManager = new AnchorBayManager(rootContainer);

// Example usage:
const bay = anchorManager.addAnchorBay('Bay-A', 1000, 1000);
anchorManager.addTileToAnchor('Bay-A', 0, 0, { label: 'T-01' });
anchorManager.addTileToAnchor('Bay-A', 500, 500, { label: 'T-02' });