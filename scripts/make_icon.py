from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 1024
BG = (10, 20, 40, 255)        # dark navy
RING = (200, 155, 60, 255)    # gold
TEXT = (200, 155, 60, 255)    # gold

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

margin = 24
draw.ellipse([margin, margin, SIZE - margin, SIZE - margin], fill=BG)

ring_width = 22
draw.ellipse(
    [margin, margin, SIZE - margin, SIZE - margin],
    outline=RING,
    width=ring_width
)

font = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 340)
text = "3TP"
bbox = draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
draw.text(
    ((SIZE - tw) / 2 - bbox[0], (SIZE - th) / 2 - bbox[1]),
    text,
    font=font,
    fill=TEXT
)

out_dir = os.path.join(os.path.dirname(__file__), "..", "build")
os.makedirs(out_dir, exist_ok=True)

png_path = os.path.join(out_dir, "icon.png")
ico_path = os.path.join(out_dir, "icon.ico")

img.save(png_path)
img.save(ico_path, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

print("Saved:", png_path, ico_path)
