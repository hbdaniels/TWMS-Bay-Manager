// AnchorBayManager.js
import * as PIXI from 'pixi.js';

export class AnchorBayManager {
  constructor(viewport, config = {}) {
    this.viewport = viewport;
    this.anchorBays = [];
    this.chunkSize = config.chunkSize || 261659; // meters per tile at zoom 17
    this.zoomLevel = config.zoomLevel || 19; // allows fine-grain tuning

    this.container = new PIXI.Container();
    this.viewport.addChild(this.container);
  }

  addAnchorBay(id, anchorX, anchorY) {
    const anchor = {
      id,
      anchor: { x: anchorX, y: anchorY },
      tiles: [],
      container: new PIXI.Container()
    };
    this.anchorBays.push(anchor);

    this.container.addChild(anchor.container);
    this.drawAnchorDebugBox(anchor);
    return anchor;
  }

  addTileToAnchor(anchorId, localX, localY, data = {}) {
    console.log('Tile request:', anchorId, data.localX ?? localX, ", ", data.localY ?? localY, data.label);

    const anchor = this.anchorBays.find(a => a.id === anchorId);
    if (!anchor) return;

    const globalX = anchor.anchor.x + localX;
    const globalY = anchor.anchor.y + localY;

    const tile = new PIXI.Graphics();
    tile.lineStyle({
        width: 4,              // 4 screen pixels
        color: 0xffffff,       // bright white for visibility
        alpha: 1,
        alignment: 0.5
      });
      
      // Generate a bright, random color
    const randomColor = Math.floor(Math.random() * 0xffffff);
    
    // Optional: draw black backing for visual edge
    tile.beginFill(0x000000, 0.2);
    tile.drawRect(-2, -2, this.chunkSize + 4, this.chunkSize + 4);
    tile.endFill();
    
    // Actual tile fill
    tile.beginFill(randomColor, 0.6);
    tile.drawRect(0, 0, this.chunkSize, this.chunkSize);
    tile.endFill();
      
      // Position the tile's container, not the shape
      tile.x = globalX;
      tile.y = globalY;

      if (data.label) {
        const label = new PIXI.Text(`${data.label}\n(${globalX}, ${globalY})`, {
          fontFamily: 'monospace',
          fontSize: 20000,
          fill: '#ff00ff',
          align: 'center',
        });
        label.anchor.set(0.5);
        label.x = globalX + this.chunkSize / 2;
        label.y = globalY + this.chunkSize / 2;
      
        console.log('Adding label:', label.text);
        anchor.container.addChild(label);
      }
      
      
      

    anchor.tiles.push({ ...data, localX, localY });
    anchor.container.addChild(tile);
  }

  drawAnchorDebugBox(anchor) {
    const g = new PIXI.Graphics();
    g.lineStyle(2, 0xff0000, 0.8);
    g.drawRect(anchor.anchor.x, anchor.anchor.y, this.chunkSize * 2, this.chunkSize * 2);

    const label = new PIXI.Text(anchor.id, { fontSize: 28, fill: '#ff0000' });
    label.x = anchor.anchor.x + 20;
    label.y = anchor.anchor.y + 20;

    anchor.container.addChild(g);
    anchor.container.addChild(label);
  }

  setZoomLevel(level) {
    this.zoomLevel = level;
    this.chunkSize = 261659 / Math.pow(2, level - 17);
    this.redrawAll();
  }

  redrawAll() {
    this.container.removeChildren();
    for (const anchor of this.anchorBays) {
      anchor.container.removeChildren();
      this.drawAnchorDebugBox(anchor);
      for (const tile of anchor.tiles) {
        this.addTileToAnchor(anchor.id, tile.localX, tile.localY, tile);
      }
    }
  }
}
