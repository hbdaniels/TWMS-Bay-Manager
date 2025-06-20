import * as PIXI from 'pixi.js';
// Remove 'container' from constructor args entirely
export class Tile {
  constructor({
    anchorX,
    anchorY,
    width,
    height,
    file = null,
    label = '',
    originLat = 31.1513758,
    originLon = -88.0051681
    // originLat = 31.140278,
    // originLon = -87.991464
  }) {
    this.x = anchorX;
    this.y = anchorY;
    this.width = width;
    this.height = height;
    this.file = file;
    this.label = label;
    this.originLat = originLat;
    this.originLon = originLon;
    this.metersPerDegLat = 111320.0;
    this.metersPerDegLon = this.metersPerDegLat * Math.cos(this.originLat * Math.PI / 180);



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

        sprite.eventMode = 'static'; // Required in Pixi v8+
        sprite.cursor = 'pointer';

        sprite.on('pointerdown', (event) => {
          // Get local coordinates inside the tile
          const local = event.getLocalPosition(sprite);
        
          const gps = this.getPixelLatLon(local.x, local.y);
        
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

  getPixelLatLon(px, py) {
    const TILE_PX = 2048;
    const TILE_MM = 611500;
    const mmPerPixel = TILE_MM / TILE_PX;  // ≈ 298.72 mm
  
    // Step 1: Convert pixel to mm (local to sprite)
    let localXmm = px * mmPerPixel;
    let localYmm = py * mmPerPixel;
  
    // Step 2: UNDO tile's internal 90° CW rotation (rotate -90°)
    const thetaTile = Math.PI / 2;
    const xUnrot = localXmm * Math.cos(-thetaTile) - localYmm * Math.sin(-thetaTile);
    const yUnrot = localXmm * Math.sin(-thetaTile) + localYmm * Math.cos(-thetaTile);
  
    // Step 3: Get absolute mm in TWMS coords
    const xMM = this.x + xUnrot;
    const yMM = this.y + yUnrot;
  
    // Step 4: Convert to meters
    const xM = xMM / 1000;
    const yM = yMM / 1000;
  
    // Step 5: UNDO full map rotation (rotate -270°)
    const thetaGlobal = 3 * Math.PI / 2;
    const east = xM * Math.cos(thetaGlobal) - yM * Math.sin(thetaGlobal);
    const north = xM * Math.sin(thetaGlobal) + yM * Math.cos(thetaGlobal);
  
    // Step 6: Convert to Lat/Lon
    const metersPerDegLat = 111320;
    const metersPerDegLon = metersPerDegLat * Math.cos(this.originLat * Math.PI / 180);
  
    const deltaLat = north / metersPerDegLat;
    const deltaLon = east / metersPerDegLon;
  
    return {
      lat: this.originLat + deltaLat,
      lon: this.originLon + deltaLon
    };
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
}
