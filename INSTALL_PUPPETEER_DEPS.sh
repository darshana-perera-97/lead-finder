#!/bin/bash

# Script to install Puppeteer dependencies on Linux
# This fixes the "libatk-1.0.so.0: cannot open shared object file" error

echo "🔧 Installing Puppeteer/Chrome dependencies for Linux..."

# Detect the Linux distribution
if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    echo "📦 Detected Debian/Ubuntu - installing dependencies..."
    sudo apt-get update
    sudo apt-get install -y \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libgtk-3-0 \
        libgbm1 \
        libasound2 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxkbcommon0 \
        libxrandr2 \
        libxss1 \
        libgconf-2-4 \
        libxshmfence1 \
        libnss3 \
        libnspr4 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrender1 \
        libxtst6 \
        ca-certificates \
        fonts-liberation \
        libappindicator3-1 \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcups2 \
        libdbus-1-3 \
        libdrm2 \
        libgbm1 \
        libgdk-pixbuf2.0-0 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        lsb-release \
        wget \
        xdg-utils

elif [ -f /etc/redhat-release ]; then
    # CentOS/RHEL/Fedora
    echo "📦 Detected RedHat/CentOS/Fedora - installing dependencies..."
    sudo yum install -y \
        alsa-lib \
        atk \
        cups-libs \
        gtk3 \
        ipa-gothic-fonts \
        libXcomposite \
        libXcursor \
        libXdamage \
        libXext \
        libXi \
        libXrandr \
        libXScrnSaver \
        libXtst \
        pango \
        xorg-x11-fonts-100dpi \
        xorg-x11-fonts-75dpi \
        xorg-x11-utils \
        xorg-x11-fonts-cyrillic \
        xorg-x11-fonts-Type1 \
        xorg-x11-fonts-misc

else
    echo "❌ Unsupported Linux distribution. Please install Chrome/Chromium dependencies manually."
    echo "📖 See: https://pptr.dev/troubleshooting#chrome-headless-doesnt-launch-on-unix"
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo "🔄 Please restart your PM2 process:"
echo "   pm2 restart index"
echo ""
echo "💡 If issues persist, try:"
echo "   - Reinstalling node_modules: rm -rf node_modules && npm install"
echo "   - Clearing Puppeteer cache: rm -rf ~/.cache/puppeteer"

