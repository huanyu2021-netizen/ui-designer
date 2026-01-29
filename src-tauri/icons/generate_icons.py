from PIL import Image, ImageDraw
import os

# Create icons directory if it doesn't exist
os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

# Create a simple colored square icon
def create_icon(size, filename):
    # Create a simple image with a gradient or solid color
    img = Image.new('RGBA', (size, size), (66, 133, 244, 255))  # Blue color
    draw = ImageDraw.Draw(img)

    # Add a simple border
    border_color = (255, 255, 255, 255)
    draw.rectangle([0, 0, size-1, size-1], outline=border_color, width=2)

    # Add a simple "A" text in the center
    text_color = (255, 255, 255, 255)
    font_size = size // 2

    # For simplicity, draw a circle in the center instead of text (no font needed)
    margin = size // 4
    draw.ellipse([margin, margin, size-margin, size-margin], fill=text_color)

    return img

# Generate icon.ico with multiple sizes
sizes = [16, 32, 48, 64, 128, 256]
icons = []

for size in sizes:
    icon_img = create_icon(size, f'icon_{size}x{size}.png')
    icons.append(icon_img)
    # Also save individual PNG files
    icon_img.save(f'icon_{size}x{size}.png')

# Save as ICO file with multiple sizes
icons[0].save('icon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)])

# Create specific PNG files that Tauri might look for
create_icon(32, '32x32.png').save('32x32.png')
create_icon(128, '128x128.png').save('128x128.png')
create_icon(256, '128x128@2x.png').save('128x128@2x.png')
create_icon(512, 'icon.png').save('icon.png')

print("Icons generated successfully!")
