# Environment Variables Setup

## Quick Start

Copy the `env.template` file to `.env`:
```bash
cp env.template .env
```

Or manually create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=4001

# JWT Secret for token signing (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Serper API Key for search functionality
SERPER_API_KEY=your-serper-api-key-here

# Session Configuration
SESSION_SECRET=your-session-secret-change-this-in-production

# Default Admin User (for initial setup)
# Default password: admin123
DEFAULT_ADMIN_EMAIL=admin@leadflow.com
DEFAULT_ADMIN_PASSWORD=admin123
```

## Important Notes:

1. **JWT_SECRET**: Generate a strong random string for production. You can use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **SERPER_API_KEY**: Get your API key from https://serper.dev

3. **Default Login Credentials**:
   - Email: `admin@leadflow.com`
   - Password: `admin123`

4. The `.env` file is already in `.gitignore`, so it won't be committed to version control.

