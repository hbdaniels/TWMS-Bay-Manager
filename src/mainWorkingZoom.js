import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
  resizeTo: window,
  antialias: true,
  background: '#222',
});
await app.init();
document.body.appendChild(app.canvas);

const viewport = new PIXI.Container();
app.stage.addChild(viewport);

// Initial zoom scale
let zoomScale = 0.002;
viewport.scale.set(zoomScale);

// Center the view to start
viewport.position.set(app.screen.width / 2, app.screen.height / 2);

// Sample content
const marker = new PIXI.Graphics();
marker.beginFill(0x00ff00);
marker.drawRect(0, 0, 5000, 5000);
marker.endFill();
viewport.addChild(marker);

// Panning
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
app.canvas.addEventListener('pointerup', () => { isDragging = false; });

// Cursor-locked zoom
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
