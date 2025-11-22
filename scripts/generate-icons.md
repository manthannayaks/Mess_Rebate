# PWA Icon Generation Instructions

To generate icons for the PWA, you can use one of these methods:

## Method 1: Online Tool (Recommended)
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 PNG image with your app icon
3. Download the generated icons
4. Place them in `assets/icons/` folder with these names:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

## Method 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:
```bash
convert your-icon.png -resize 72x72 assets/icons/icon-72x72.png
convert your-icon.png -resize 96x96 assets/icons/icon-96x96.png
convert your-icon.png -resize 128x128 assets/icons/icon-128x128.png
convert your-icon.png -resize 144x144 assets/icons/icon-144x144.png
convert your-icon.png -resize 152x152 assets/icons/icon-152x152.png
convert your-icon.png -resize 192x192 assets/icons/icon-192x192.png
convert your-icon.png -resize 384x384 assets/icons/icon-384x384.png
convert your-icon.png -resize 512x512 assets/icons/icon-512x512.png
```

## Method 3: Create Simple Placeholder Icons
For now, you can create simple colored squares as placeholders until you have a proper icon design.

