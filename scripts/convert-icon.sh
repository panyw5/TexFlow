#!/bin/bash

# Create iconset directory
mkdir -p img/logo.iconset

# 确保原始图标是 1024x1024，如果不是则先调整
sips -z 1024 1024 img/logo.png --out img/logo_1024.png

# 为了符合 macOS 标准，创建一个带更多边距的版本
# 将内容缩小到约 75% 的大小，居中放置（更符合 macOS 视觉标准）
sips -p 1024 1024 -c 768 768 img/logo_1024.png --out img/logo_resized.png

# Convert to different sizes using the resized version
sips -z 16 16     img/logo_resized.png --out img/logo.iconset/icon_16x16.png
sips -z 32 32     img/logo_resized.png --out img/logo.iconset/icon_16x16@2x.png
sips -z 32 32     img/logo_resized.png --out img/logo.iconset/icon_32x32.png
sips -z 64 64     img/logo_resized.png --out img/logo.iconset/icon_32x32@2x.png
sips -z 128 128   img/logo_resized.png --out img/logo.iconset/icon_128x128.png
sips -z 256 256   img/logo_resized.png --out img/logo.iconset/icon_128x128@2x.png
sips -z 256 256   img/logo_resized.png --out img/logo.iconset/icon_256x256.png
sips -z 512 512   img/logo_resized.png --out img/logo.iconset/icon_256x256@2x.png
sips -z 512 512   img/logo_resized.png --out img/logo.iconset/icon_512x512.png
sips -z 1024 1024 img/logo_resized.png --out img/logo.iconset/icon_512x512@2x.png

# Convert iconset to icns
iconutil -c icns img/logo.iconset

# Clean up temporary files
rm -rf img/logo.iconset img/logo_1024.png img/logo_resized.png

echo "Icon conversion completed with macOS standard sizing (75% content): img/logo.icns"
