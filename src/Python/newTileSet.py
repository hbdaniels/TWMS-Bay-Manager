# Quadrants was too damn big.

from PIL import Image
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
input_folder = os.path.join(script_dir, "tiles")
         
output_folder = "stitched"
zoom = 19
tiles_per_chunk = 8            # 8x8 = 2048x2048 output
tile_size = 256

os.makedirs(output_folder, exist_ok=True)

# Figure out min/max tiles from filenames
tiles = [
    f for f in os.listdir(input_folder)
    if f.startswith(f"{zoom}_") and f.endswith(".png")
]

tile_coords = [
    tuple(map(int, f.split('.')[0].split('_')[1:])) for f in tiles
]

x_tiles = sorted(set(x for x, y in tile_coords))
y_tiles = sorted(set(y for x, y in tile_coords))

for x_chunk_start in range(x_tiles[0], x_tiles[-1]+1, tiles_per_chunk):
    for y_chunk_start in range(y_tiles[0], y_tiles[-1]+1, tiles_per_chunk):
        stitched = Image.new("RGB", (tiles_per_chunk * tile_size, tiles_per_chunk * tile_size))
        for dx in range(tiles_per_chunk):
            for dy in range(tiles_per_chunk):
                x = x_chunk_start + dx
                y = y_chunk_start + dy
                tile_name = f"{zoom}_{x}_{y}.png"
                tile_path = os.path.join(input_folder, tile_name)
                if os.path.exists(tile_path):
                    tile = Image.open(tile_path)
                    stitched.paste(tile, (dx * tile_size, dy * tile_size))
        out_name = f"z{zoom}_{x_chunk_start}_{y_chunk_start}.png"
        stitched.save(os.path.join(output_folder, out_name))
        print(f"Created {out_name}")
