# Deployment Guide

## Serving Frontend from Backend

The backend is configured to serve the frontend static files at the root route (`/`).

### Steps to Deploy:

1. **Build the Frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   This creates a `dist` folder with the production build.

2. **Start the Backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Access the Application:**
   - Open `http://localhost:4001` in your browser
   - The frontend will be served from the backend
   - API routes are available at `/api/*`

### Development Mode:

For development, you can run frontend and backend separately:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or Vite's default port) and connect to the backend at `http://localhost:4001`.

### Environment Variables:

To use relative API paths when served from backend, create a `.env.production` file in the frontend directory:

```
VITE_API_BASE_URL=
```

This will make the frontend use relative paths (`/api/*`) instead of absolute URLs.

### Production Build:

When building for production to be served from backend:

```bash
cd frontend
# Create .env.production file with: VITE_API_BASE_URL=
npm run build
cd ../backend
npm start
```

The application will be available at `http://localhost:4001` (or your configured PORT).

