export class LatLonResolver {
    constructor({
      anchorLat,
      anchorLon,
      anchorTileX,
      anchorTileY,
      anchorPx,
      anchorPy,
      tileSizeMM = 611500,
      tileSizePx = 2048,
      rotationDeg = 0 // degrees counter-clockwise (e.g., 90 or 270)
    }) {
      this.anchorLat = anchorLat;
      this.anchorLon = anchorLon;
      this.anchorTileX = anchorTileX;
      this.anchorTileY = anchorTileY;
      this.anchorPx = anchorPx;
      this.anchorPy = anchorPy;
      this.tileSizeMM = tileSizeMM;
      this.tileSizePx = tileSizePx;
  
      this.mmPerPixel = tileSizeMM / tileSizePx;
  
      const rad = (rotationDeg * Math.PI) / 180;
      this.cosTheta = Math.cos(rad);
      this.sinTheta = Math.sin(rad);
  
      // Constants for conversion
      this.metersPerDegLat = 111320;
      this.metersPerDegLon = 111320 * Math.cos(anchorLat * Math.PI / 180);
    }
  
    getLatLon(tileX, tileY, px, py) {
      // Offset from anchor tile center in pixels
      const deltaTileX = tileX - this.anchorTileX;
      const deltaTileY = tileY - this.anchorTileY;
  
      const globalPx = deltaTileX * this.tileSizePx + (px - this.anchorPx);
      const globalPy = deltaTileY * this.tileSizePx + (py - this.anchorPy);
  
      // Convert to mm
      const dxMM = globalPx * this.mmPerPixel;
      const dyMM = globalPy * this.mmPerPixel;
  
      // Rotate
      const xM = (dxMM * this.cosTheta - dyMM * this.sinTheta) / 1000;
      const yM = (dxMM * this.sinTheta + dyMM * this.cosTheta) / 1000;
  
      // Convert to GPS
      const deltaLat = yM / this.metersPerDegLat;
      const deltaLon = xM / this.metersPerDegLon;
  
      return {
        lat: this.anchorLat + deltaLat,
        lon: this.anchorLon + deltaLon
      };
    }
  }
  