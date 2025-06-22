import math
import os
import requests
from PIL import Image

# --- Configuration ---
zoom = 19
tile_size = 256
tiles_per_chunk = 8  # 8x8 grid
center_lat = 31.148414
center_lon = -87.983568
tile_folder = "tiles"
output_folder = "stitched"

os.makedirs(tile_folder, exist_ok=True)
os.makedirs(output_folder, exist_ok=True)

# --- Convert lat/lon to OSM tile coordinates ---
def latlon_to_tile_coords(lat, lon, zoom):
    lat_rad = math.radians(lat)
    n = 2 ** zoom
    x = int((lon + 180.0) / 360.0 * n)
    y = int((1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n)
    return x, y

# --- Calculate range of tiles centered around the base station ---
center_x, center_y = latlon_to_tile_coords(center_lat, center_lon, zoom)
half = tiles_per_chunk // 2
x_range = range(center_x - half, center_x + half)
y_range = range(center_y - half, center_y + half)

# --- Download tiles ---
def download_tile(zoom, x, y):
    url = f"https://tile.openstreetmap.org/{zoom}/{x}/{y}.png"
    out_path = os.path.join(tile_folder, f"{zoom}_{x}_{y}.png")
    if not os.path.exists(out_path):
        print(f"Downloading {url}")
        response = requests.get(url)
        if response.status_code == 200:
            with open(out_path, 'wb') as f:
                f.write(response.content)
        else:
            print(f"Failed to download {url}")
    return out_path

# --- Stitch tiles ---
stitched = Image.new("RGB", (tile_size * tiles_per_chunk, tile_size * tiles_per_chunk))
for dx, x in enumerate(x_range):
    for dy, y in enumerate(y_range):
        tile_path = download_tile(zoom, x, y)
        if os.path.exists(tile_path):
            tile = Image.open(tile_path)
            stitched.paste(tile, (dx * tile_size, dy * tile_size))

out_path = os.path.join(output_folder, f"osm_z{zoom}_centered.png")
stitched.save(out_path)
print(f"Saved stitched map to {out_path}")
