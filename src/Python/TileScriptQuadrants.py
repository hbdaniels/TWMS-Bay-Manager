import math
import os
import sys
import requests
from PIL import Image

# 📍 Bounding box (adjust if needed)
min_lat = 31.125949  #31.133495
max_lat = 31.17015
min_lon = -88.016061 #-88.01396
max_lon = -87.969942

# 🔍 Zoom level
zoom = 19

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
    "User-Agent": "TWMS-Bay-Manager/1.0 (youremail@domain.com)"
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

# Tile size
tile_size = 256

# Split into 4 quadrants
half_columns = columns // 2
half_rows = rows // 2

# Define quadrants
quadrants = [
    ("osm_q1.png", 0, 0),  # Top-left
    ("osm_q2.png", half_columns, 0),  # Top-right
    ("osm_q3.png", 0, half_rows),  # Bottom-left
    ("osm_q4.png", half_columns, half_rows),  # Bottom-right
]

for out_path, col_offset, row_offset in quadrants:
    width = tile_size * half_columns
    height = tile_size * half_rows
    out_img = Image.new("RGB", (width, height))

    for cx in range(half_columns):
        for cy in range(half_rows):
            x = x_min + col_offset + cx
            y = y_min + row_offset + cy
            tile_file = f"tiles/{zoom}_{x}_{y}.png"
            if not os.path.exists(tile_file):
                continue
            tile = Image.open(tile_file)
            out_img.paste(tile, (cx * tile_size, cy * tile_size))

    out_img.save(out_path)
    print(f"Saved {out_path}")
