# Quick Fix for WhatsApp/Puppeteer Dependencies

## Option 1: Use the Installation Script (Recommended)

SSH into your server and run:

```bash
cd /path/to/lead-finder
chmod +x INSTALL_PUPPETEER_DEPS.sh
bash INSTALL_PUPPETEER_DEPS.sh
```

Then restart PM2:
```bash
pm2 restart index
```

## Option 2: One-Line Command (Ubuntu/Debian)

If you're on Ubuntu/Debian, you can run this single command:

```bash
sudo apt-get update && sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libgbm1 libasound2 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 libxss1 libgconf-2-4 libxshmfence1 libnss3 libnspr4 libx11-xcb1 libxcb1 ca-certificates fonts-liberation libappindicator3-1 libdbus-1-3 libgdk-pixbuf2.0-0 libglib2.0-0 libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libxext6 libxi6 libxrender1 libxtst6 lsb-release wget xdg-utils && pm2 restart index
```

## Option 3: One-Line Command (CentOS/RHEL)

If you're on CentOS/RHEL/Fedora:

```bash
sudo yum install -y alsa-lib atk cups-libs gtk3 libXcomposite libXcursor libXdamage libXext libXi libXrandr libXScrnSaver libXtst pango && pm2 restart index
```

## Verify Installation

After installation, check the PM2 logs:

```bash
pm2 logs index --lines 50
```

You should see:
- ✅ WhatsApp client initialization started
- ✅ WhatsApp Client is ready!

Instead of the dependency errors.

## Note

The server will continue running even without WhatsApp dependencies installed. Only WhatsApp features will be unavailable until dependencies are installed.

