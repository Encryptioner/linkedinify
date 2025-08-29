#!/usr/bin/env python3
"""
LinkedInify Icon Generator
Creates all required PWA icons from a base design
"""

import os
from PIL import Image, ImageDraw, ImageFont
import json

# Icon sizes required for PWA
ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def create_icon(size):
    """Create a single icon of specified size"""
    # Create image with LinkedIn blue background
    img = Image.new('RGB', (size, size), '#0077b5')
    draw = ImageDraw.Draw(img)
    
    # Calculate text size and position
    text = "📝"
    font_size = int(size * 0.4)  # 40% of icon size
    
    try:
        # Try to use system font (works on most systems)
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]
    
    # Draw the emoji/text
    draw.text((x, y), text, fill='white', font=font)
    
    # Add subtle border
    border_width = max(1, size // 64)
    draw.rectangle([0, 0, size-1, size-1], outline='#005582', width=border_width)
    
    return img

def generate_all_icons():
    """Generate all required PWA icons"""
    # Create icons directory
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    print("🎨 Generating LinkedInify icons...")
    
    for size in ICON_SIZES:
        icon = create_icon(size)
        filename = f'icons/icon-{size}x{size}.png'
        icon.save(filename, 'PNG')
        print(f"✅ Created {filename}")
    
    # Create favicon
    favicon = create_icon(32)
    favicon.save('favicon.ico', 'ICO')
    print("✅ Created favicon.ico")
    
    print("\n🎉 All icons generated successfully!")
    print("\nGenerated files:")
    for size in ICON_SIZES:
        print(f"  - icons/icon-{size}x{size}.png")
    print("  - favicon.ico")

if __name__ == "__main__":
    try:
        generate_all_icons()
    except ImportError:
        print("❌ Pillow library not found. Install it with:")
        print("   pip install Pillow")
    except Exception as e:
        print(f"❌ Error generating icons: {e}")
        print("\nAlternative: Use online icon generators like:")
        print("  - https://realfavicongenerator.net/")
        print("  - https://www.favicon-generator.org/")
        print("  - https://favicon.io/")
