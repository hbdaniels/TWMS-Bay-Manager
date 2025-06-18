import math
import os
import sys
import requests
from PIL import Image

# 📍 Bounding box
min_lat = 31.133495
max_lat = 31.17015
min_lon = -88.01396
max_lon = -87.969942

# 🔍 Zoom level
zoom = 17

# 🧭 Tile conversion
def latlon_to_tilexy(lat, lon, z):
    n = 2 ** z
    xtile = (lon + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    ytile = (1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n
    return int(xtile), int(ytile)

# Compute tile range
x_min, y_max = latlon_to_tilexy(min_lat, min_lon, zoom)
x_max, y_min = latlon_to_tilexy(max_lat, max_lon, zoom)

print(f"Downloading tiles x: {x_min}→{x_max}, y: {y_min}→{y_max} at zoom {zoom}")

# Output directory
os.makedirs("tiles", exist_ok=True)
columns = x_max - x_min + 1
rows = y_max - y_min + 1

# Headers for OSM tile usage compliance
headers = {
    "User-Agent": "WarehouseViewer/1.0 (youremail@domain.com)"
}

# Download tiles
for x in range(x_min, x_max + 1):
    for y in range(y_min, y_max + 1):
        filename = f"tiles/{zoom}_{x}_{y}.png"
        if os.path.exists(filename): 
            continue
        url = f"https://tile.openstreetmap.org/{zoom}/{x}/{y}.png"
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
            with open(filename, "wb") as f:
                f.write(resp.content)
            print(f"Downloaded tile {x},{y}")
        else:
            print(f"Failed to download {url} — status {resp.status_code}")
            sys.exit(1)

# Stitch tiles into one image
tile_size = 256
out_width = columns * tile_size
out_height = rows * tile_size
out_image = Image.new("RGB", (out_width, out_height))

for x in range(x_min, x_max + 1):
    for y in range(y_min, y_max + 1):
        tile_img = Image.open(f"tiles/{zoom}_{x}_{y}.png")
        px = (x - x_min) * tile_size
        py = (y - y_min) * tile_size
        out_image.paste(tile_img, (px, py))

# Save result
out_path = f"osm_bkg_z{zoom}.png"
out_image.save(out_path)
print(f"Saved stitched image: {out_path}")
