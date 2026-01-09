# Deployment Guide

## Prerequisites

### System Dependencies (Linux)

If you're deploying on a Linux server, you need to install Puppeteer/Chrome dependencies:

**For Ubuntu/Debian:**
```bash
bash INSTALL_PUPPETEER_DEPS.sh
```

Or manually:
```bash
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
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libxext6 \
    libxi6 \
    libxrender1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
```

**For CentOS/RHEL/Fedora:**
```bash
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
```

## Building the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Build the frontend:
```bash
npm run build
```

This creates a `dist` folder with the production build.

## Setting Up the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (if not exists):
```bash
PORT=4001
JWT_SECRET=your-secret-key-here
```

## Running with PM2

1. Install PM2 globally (if not already installed):
```bash
npm install -g pm2
```

2. Start the backend:
```bash
cd backend
pm2 start index.js --name lead-finder
```

3. Save PM2 configuration:
```bash
pm2 save
```

4. Set PM2 to start on system boot:
```bash
pm2 startup
```

## Verifying the Setup

1. Check if the server is running:
```bash
pm2 status
pm2 logs index
```

2. Visit `http://your-server-ip:4001/` - you should see the frontend landing page.

3. If you see `{"message":"Welcome to the Lead Finder API"}`, the frontend build is missing. Run `npm run build` in the frontend directory.

## Troubleshooting

### WhatsApp/Puppeteer Errors

If you see errors like:
```
error while loading shared libraries: libatk-1.0.so.0: cannot open shared object file
```

Run the installation script:
```bash
bash INSTALL_PUPPETEER_DEPS.sh
```

Then restart PM2:
```bash
pm2 restart index
```

### Frontend Not Loading

1. Make sure the frontend is built:
```bash
cd frontend
npm run build
```

2. Verify the `dist` folder exists:
```bash
ls -la frontend/dist
```

3. Restart the backend:
```bash
pm2 restart index
```

### Port Already in Use

If port 4001 is already in use, change it in the `.env` file:
```
PORT=4002
```

Then restart PM2:
```bash
pm2 restart index
```

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=4001
JWT_SECRET=your-very-secure-secret-key-change-this-in-production
```

## Production Checklist

- [ ] System dependencies installed (for Puppeteer/Chrome)
- [ ] Frontend built (`npm run build` in frontend directory)
- [ ] Backend dependencies installed (`npm install` in backend directory)
- [ ] Environment variables configured (`.env` file)
- [ ] PM2 process running (`pm2 status`)
- [ ] Server accessible at `http://your-server-ip:4001/`
- [ ] Frontend loads correctly (not showing API message)
- [ ] WhatsApp QR code endpoint works (`/api/whatsapp/qrcode`)
