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
    const anchor = this.anchorBays.find(a => a.id === anchorId);
    if (!anchor) return;

    const globalX = anchor.anchor.x + localX;
    const globalY = anchor.anchor.y + localY;

    const tile = new PIXI.Graphics();
    tile.beginFill(0x999999, 0.3);
    tile.drawRect(globalX, globalY, this.chunkSize, this.chunkSize);
    tile.endFill();

    if (data.label) {
      const label = new PIXI.Text(data.label, { fontSize: 24, fill: '#fff' });
      label.x = globalX + 10;
      label.y = globalY + 10;
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
