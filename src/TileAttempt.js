import * as PIXI from 'pixi.js';
import { LatLonResolver } from './LatLonResolver.js';

const resolver = new LatLonResolver({
  anchorLat: 31.1484138,
  anchorLon: -87.9835681,
  anchorTileX: 4,
  anchorTileY: 5,
  anchorPx: 1104,
  anchorPy: 1309,
  tileSizeMM: 611500,
  tileSizePx: 2048,
  rotationDeg: 270
});

export class Tile {
  constructor({
    anchorX,
    anchorY,
    width,
    height,
    file = null,
    label = '',
    tileX,
    tileY
  }) {
    this.x = anchorX;
    this.y = anchorY;
    this.width = width;
    this.height = height;
    this.file = file;
    this.label = label;
    this.tileX = tileX;
    this.tileY = tileY;

    this.container = new PIXI.Container();
    this.container.x = this.x;
    this.container.y = this.y;

    if (this.file) {
      const filePath = ('/tiles/stitched/' + this.file).replace(/\\/g, '/');
      PIXI.Assets.load(filePath).then(texture => {
        const sprite = new PIXI.Sprite(texture);
        sprite.width = this.width;
        sprite.height = this.height;
        sprite.x = 0;
        sprite.y = 0;
        sprite.rotation = Math.PI / 2;

        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';

        sprite.on('pointerdown', (event) => {
          const local = event.getLocalPosition(sprite);
          const gps = resolver.getLatLon(this.tileX, this.tileY, local.x, local.y);

          const info = `
Label: ${this.label}
Position: (${this.x}, ${this.y})
Size: ${this.width} x ${this.height}
File: ${this.file}

Click Local: (${Math.round(local.x)}, ${Math.round(local.y)})
GPS:
      Lat: ${gps.lat.toFixed(7)}
      Lon: ${gps.lon.toFixed(7)}
          `;

          const debugBox = document.getElementById('tile-debug-content');
          if (debugBox) debugBox.textContent = info.trim();
        });

        this.container.addChildAt(sprite, 0);
      }).catch(err => {
        console.error(`Failed to load tile image ${filePath}`, err);
        this.drawPlaceholder();
      });
    } else {
      this.drawPlaceholder();
    }
  }

  drawPlaceholder() {
    const g = new PIXI.Graphics();
    g.fill({ color: 0x000000, alpha: 0.2 }).rect(-2, -2, this.width + 4, this.height + 4);
    g.fill({ color: Math.floor(Math.random() * 0xffffff), alpha: 0.6 }).rect(0, 0, this.width, this.height);
    this.container.addChildAt(g, 0);
  }

  getDebugInfo() {
    return {
      label: this.label,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      file: this.file
    };
  }
} 
