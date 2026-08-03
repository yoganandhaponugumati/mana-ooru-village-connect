import os
from PIL import Image

public_dir = './public'

bg_path = os.path.join(public_dir, 'village-life-bg.webp')
if os.path.exists(bg_path):
    img = Image.open(bg_path)
    print(f"Original bg size: {os.path.getsize(bg_path)} bytes, dimensions: {img.size}")
    
    # Save a high-quality compressed mobile version (width 720px)
    mobile_width = 720
    w_percent = (mobile_width / float(img.size[0]))
    h_size = int((float(img.size[1]) * float(w_percent)))
    img_mobile = img.resize((mobile_width, h_size), Image.Resampling.LANCZOS)
    
    mobile_bg_path = os.path.join(public_dir, 'village-life-bg-mobile.webp')
    img_mobile.save(mobile_bg_path, 'WEBP', quality=75, optimize=True)
    print(f"Mobile bg created: {os.path.getsize(mobile_bg_path)} bytes, dimensions: {img_mobile.size}")

# Also optimize site-icon & logo webp files if possible
logo_path = os.path.join(public_dir, 'logo.webp')
if os.path.exists(logo_path):
    img_logo = Image.open(logo_path)
    print(f"Original logo size: {os.path.getsize(logo_path)} bytes, dimensions: {img_logo.size}")
    # Resize logo to 128x128 max since it is used as a 34x34 icon
    img_logo_small = img_logo.resize((128, 128), Image.Resampling.LANCZOS)
    img_logo_small.save(logo_path, 'WEBP', quality=80, optimize=True)
    print(f"Optimized logo size: {os.path.getsize(logo_path)} bytes, dimensions: {img_logo_small.size}")
