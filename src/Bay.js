import * as PIXI from 'pixi.js';

export class Bay {
  constructor(data) {
    this.data = { ...data }; // Copy to avoid mutating original
    this.initGraphics();
    this.setupInteractions();
  }

  initGraphics() {
    const { coord_x1, coord_x2, coord_y1, coord_y2, rotationoffset = 0, offset_x, offset_y, bayrotation } = this.data;

    const width = Math.abs(coord_x2 - coord_x1);
    const height = Math.abs(coord_y2 - coord_y1);

    const g = new PIXI.Graphics();
    g.lineStyle(4, 0x00ff00, 0.8);
    g.beginFill(0x00ff00, 1);
    g.drawRect(0, 0, width, height);
    g.endFill();

    g.pivot.set(0, 0); // Rotate around x1, y1
    g.x = coord_x1;
    g.y = coord_y1;
    //rotation is already handled because my axis are different from TWMS
    //g.rotation = rotationoffset * Math.PI / 180;

    //g.interactive = true;
    //g.cursor = 'pointer';

    this.gfx = g;

    this.bayContainer = new PIXI.Container();
    this.bayContainer.addChild(g);
    this.bayContainer.rotation = degToRad(270 + bayrotation); // Apply rotation in radians
    this.bayContainer.position.set(offset_y || 0, offset_x * -1 || 0); // Apply any additional offset
    console.log(rotationoffset);
    this.data.rotationoffset = rotationoffset //- 90;
    this.data.bayrotation = bayrotation || 0; // Store bay rotation if provided

    
    //changing axis for web compatibility. Really need to think if there's a better way.
    this.offset_x = offset_x || 0;
    this.offset_y = offset_y || 0;

  }

  setupInteractions() {
    const g = this.gfx;
    const container = this.bayContainer;
    container.interactive = true;
    container.cursor = 'pointer';
    //container.on('pointerdown', ...)

    // Dragging
    let isDragging = false;

    container.on('pointerdown', (event) => {
      const native = event.data.originalEvent;
      const button = native.button;
    
      // LEFT CLICK (start drag + debug)
      if (button === 0) {
        event.stopPropagation();
    
        // Start drag
        isDragging = true;
        this.dragOffset = event.data.getLocalPosition(container.parent);
        g.alpha = 0.7;
    
        // Show debug info
        const local = event.getLocalPosition(g);
        this.showDebug(local);
      }
    
      // RIGHT CLICK (show context menu)
      if (button === 2) {
        event.stopPropagation();
        native.preventDefault(); // suppress browser menu
        const pos = event.data.global;
        console.log('Right-click on bay:', this.data.bay);
        this.showContextMenu(pos.x, pos.y);
      }
    });
    

    container.on('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        g.alpha = 1;
        this.updateDataFromGraphics();
      }
    });

    container.on('pointerupoutside', () => {
      if (isDragging) {
        isDragging = false;
        g.alpha = 1;
      }
    });

    container.on('pointermove', (event) => {
      if (!isDragging) return;
      const newPos = event.data.getLocalPosition(container.parent);
      const dx = newPos.x - this.dragOffset.x;
      const dy = newPos.y - this.dragOffset.y;
      container.x += dx;
      container.y += dy;
      this.offset_y += dx;
      this.offset_x += dy * -1; // Invert y-axis for web compatibility
      this.dragOffset = newPos;
    });

    // Global listener to close context menu
    document.addEventListener('mousedown', (e) => {
      const menu = document.getElementById('bay-context-menu');
      if (!menu) return;
    
      // If the click is outside the menu, hide it
      if (!menu.contains(e.target)) {
        menu.style.display = 'none';
      }
    });
    
    

    // Disable native right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  showDebug(local) {
    const debugBox = document.getElementById('tile-debug-content');
    if (!debugBox) return;
    console.log(this.gfx.x, this.gfx.y, this.offset_x, this.offset_y, this.data.coord_x1, this.data.coord_y1, this.data.coord_x2, this.data.coord_y2);

    const info = `
Label: ${this.data.bay || 'Unnamed'}
Position: (${this.gfx.x.toFixed(2)}, ${this.gfx.y.toFixed(2)})
Size: ${Math.abs(this.data.coord_x2 - this.data.coord_x1)} x ${Math.abs(this.data.coord_y2 - this.data.coord_y1)}
Rotation: ${(this.gfx.rotation * 180 / Math.PI).toFixed(2)}°
Container Rotation: ${this.bayContainer.rotation * 180 / Math.PI}°
TWMS Offset Position: (${this.offset_x}, ${this.offset_y})
Container Position: (${this.bayContainer.x.toFixed(0)}, ${this.bayContainer.y.toFixed(0)})

Click Local: (${Math.round(local.x)}, ${Math.round(local.y)})
    `;

    debugBox.textContent = info.trim();
  }

  showContextMenu(x, y) {
    const menu = document.getElementById('bay-context-menu');
    if (menu) {
      menu.style.display = 'none'; // hide old menu
    }
  
    const panel = document.getElementById('bay-rotation-panel');
    if (panel) {
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.style.display = 'block';
  
      Bay.lastClicked = this;
  
      // Button actions
      document.getElementById('rotate-left').onclick = () => {
        this.rotate(this.data.bayrotation - 1);
      };
  
      document.getElementById('rotate-right').onclick = () => {
        this.rotate(this.data.bayrotation + 1);
      };
  
      document.getElementById('rotate-reset').onclick = () => {
        this.rotate(0);
      };
  
      document.getElementById('rotate-step').onclick = () => {
        this.rotate(this.data.bayrotation + 15);
      };
    }
  }
  

  showConfig() {
    const cfg = document.getElementById('bay-config-display');
    if (cfg) {
      cfg.style.display = 'block';
      cfg.innerText = JSON.stringify(this.data, null, 2);
    }
  }

  rotate(degrees) {
    this.data.bayrotation = degrees;
    this.gfx.rotation = degrees * Math.PI / 180;
    this.updateDataFromGraphics();
  }

  updateDataFromGraphics() {
    const { coord_x2, coord_y2, coord_x1, coord_y1 } = this.data;
    const width = Math.abs(coord_x2 - coord_x1);
    const height = Math.abs(coord_y2 - coord_y1);
  
    const rotation = this.bayContainer.rotation;
  
    this.data.coord_x1 = this.bayContainer.x;
    this.data.coord_y1 = this.bayContainer.y;
    this.data.coord_x2 = this.bayContainer.x + width * Math.cos(rotation);
    this.data.coord_y2 = this.bayContainer.y + height * Math.sin(rotation);
  }

  getContainer() {
    return this.bayContainer;
  }
}


function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

function radToDeg(radians) {
  return radians * (180 / Math.PI);
} 