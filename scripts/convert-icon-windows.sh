#!/bin/bash

echo "Converting PNG to ICO for Windows..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it with: brew install imagemagick"
    exit 1
fi

# Check if source PNG exists
if [ ! -f "img/logo.png" ]; then
    echo "Source file img/logo.png not found!"
    exit 1
fi

# Convert PNG to ICO with multiple sizes
convert img/logo.png \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 48x48 \) \
    \( -clone 0 -resize 64x64 \) \
    \( -clone 0 -resize 128x128 \) \
    \( -clone 0 -resize 256x256 \) \
    -delete 0 img/logo.ico

echo "Windows icon created: img/logo.ico"