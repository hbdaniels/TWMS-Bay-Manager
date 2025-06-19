import * as PIXI from 'pixi.js';

export class AnchorBayManager {
    constructor(viewport, config = {}) {
      this.viewport = viewport;
      this.chunkSize = config.chunkSize || 261659;
      this.zoomLevel = config.zoomLevel || 19;
  
      this.container = new PIXI.Container();
      this.viewport.addChild(this.container);
  
      this.anchorBay = {
        anchor: { x: 0, y: 0 }, // now global offset
        tiles: [],
        container: new PIXI.Container()
      };
  
      this.container.addChild(this.anchorBay.container);
      this.drawAnchorDebugBox();
    }
  
    setAnchorOffset(x, y) {
      this.anchorBay.anchor = { x, y };
      this.redrawAll();
    }
  
    addTile(localX, localY, data = {}) {
      const globalX = this.anchorBay.anchor.x + localX;
      const globalY = this.anchorBay.anchor.y + localY;
  
      const tile = new PIXI.Graphics();
      tile.lineStyle({ width: 4, color: 0xffffff, alpha: 1, alignment: 0.5 });
      tile.beginFill(0x000000, 0.2);
      tile.drawRect(-2, -2, this.chunkSize + 4, this.chunkSize + 4);
      tile.endFill();
  
      const randomColor = Math.floor(Math.random() * 0xffffff);
      tile.beginFill(randomColor, 0.6);
      tile.drawRect(0, 0, this.chunkSize, this.chunkSize);
      tile.endFill();
  
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
        this.anchorBay.container.addChild(label);
      }
  
      this.anchorBay.tiles.push({ ...data, localX, localY });
      this.anchorBay.container.addChild(tile);
    }
  
    drawAnchorDebugBox() {
      const { x, y } = this.anchorBay.anchor;
      const g = new PIXI.Graphics();
      g.lineStyle(2, 0xff0000, 0.8);
      g.drawRect(x, y, this.chunkSize * 2, this.chunkSize * 2);
  
      const label = new PIXI.Text('AnchorBay', { fontSize: 28, fill: '#ff0000' });
      label.x = x + 20;
      label.y = y + 20;
  
      this.anchorBay.container.addChild(g);
      this.anchorBay.container.addChild(label);
    }
  
    redrawAll() {
      this.anchorBay.container.removeChildren();
      this.drawAnchorDebugBox();
      for (const tile of this.anchorBay.tiles) {
        this.addTile(tile.localX, tile.localY, tile);
      }
    }
  
    setZoomLevel(level) {
      this.zoomLevel = level;
      this.chunkSize = 261659 / Math.pow(2, level - 17);
      this.redrawAll();
    }
  }
  