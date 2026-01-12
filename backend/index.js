require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 4001;

// Data directory path
const DATA_DIR = path.join(__dirname, 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const PROFILE_SETTINGS_FILE = path.join(DATA_DIR, 'profile-settings.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const SMTP_CONFIGS_FILE = path.join(DATA_DIR, 'smtp_configs.json');

// Frontend build directory path
const FRONTEND_BUILD_DIR = '../frontend/dist';
// const FRONTEND_BUILD_DIR = path.join(__dirname, '..', 'frontend', 'dist');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Initialize data files with mock data
const initializeDataFiles = () => {
  console.log('📁 Initializing data files...');
  
  // Initialize analytics.json
  if (!fs.existsSync(ANALYTICS_FILE) || fs.readFileSync(ANALYTICS_FILE, 'utf8').trim() === '' || fs.readFileSync(ANALYTICS_FILE, 'utf8').trim() === '{}') {
    const mockAnalytics = {
      "1": {
        "searches": 12,
        "savedLeads": 8,
        "followups": 3
      }
    };
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(mockAnalytics, null, 2), 'utf8');
    console.log('  ✓ Created analytics.json with mock data');
  }
  
  // Initialize notifications.json
  if (!fs.existsSync(NOTIFICATIONS_FILE) || fs.readFileSync(NOTIFICATIONS_FILE, 'utf8').trim() === '' || fs.readFileSync(NOTIFICATIONS_FILE, 'utf8').trim() === '[]') {
    const mockNotifications = [
      {
        "id": "1",
        "userId": 1,
        "title": "Welcome to LeadFlow!",
        "message": "Get started by searching for leads and building your pipeline.",
        "type": "info",
        "read": false,
        "createdAt": new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        "id": "2",
        "userId": 1,
        "title": "New Lead Saved",
        "message": "Tech Solutions Inc has been added to your leads.",
        "type": "success",
        "read": false,
        "createdAt": new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        "id": "3",
        "userId": 1,
        "title": "Follow-up Reminder",
        "message": "You have 3 leads that need follow-up attention.",
        "type": "warning",
        "read": true,
        "createdAt": new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        "readAt": new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(mockNotifications, null, 2), 'utf8');
    console.log('  ✓ Created notifications.json with mock data');
  }
  
  // Initialize leads.json
  if (!fs.existsSync(LEADS_FILE) || fs.readFileSync(LEADS_FILE, 'utf8').trim() === '' || fs.readFileSync(LEADS_FILE, 'utf8').trim() === '[]') {
    const mockLeads = [
      {
        "id": "1",
        "userId": 1,
        "businessName": "Tech Solutions Inc",
        "phone": "+1 (555) 123-4567",
        "email": "contact@techsolutions.com",
        "address": "123 Tech Street, San Francisco, CA 94105",
        "website": "www.techsolutions.com",
        "industry": "Software",
        "city": "San Francisco",
        "country": "United States",
        "followupStatus": "pending",
        "notes": "Interested in our enterprise solution",
        "savedAt": new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        "id": "2",
        "userId": 1,
        "businessName": "Digital Marketing Pro",
        "phone": "+1 (555) 234-5678",
        "email": "info@digitalmarketingpro.com",
        "address": "456 Marketing Ave, New York, NY 10001",
        "website": "www.digitalmarketingpro.com",
        "industry": "Marketing",
        "city": "New York",
        "country": "United States",
        "followupStatus": "contacted",
        "notes": "Follow-up scheduled for next week",
        "savedAt": new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        "id": "3",
        "userId": 1,
        "businessName": "Cloud Services Ltd",
        "phone": "+1 (555) 345-6789",
        "email": "hello@cloudservices.com",
        "address": "789 Cloud Blvd, Austin, TX 78701",
        "website": "www.cloudservices.com",
        "industry": "Cloud Computing",
        "city": "Austin",
        "country": "United States",
        "followupStatus": "pending",
        "notes": "Potential enterprise client",
        "savedAt": new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        "id": "4",
        "userId": 1,
        "businessName": "AI Innovations Group",
        "phone": "+1 (555) 456-7890",
        "email": "contact@aiinnovations.com",
        "address": "321 Innovation Drive, Seattle, WA 98101",
        "website": "www.aiinnovations.com",
        "industry": "Artificial Intelligence",
        "city": "Seattle",
        "country": "United States",
        "followupStatus": "none",
        "notes": "",
        "savedAt": new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    fs.writeFileSync(LEADS_FILE, JSON.stringify(mockLeads, null, 2), 'utf8');
    console.log('  ✓ Created leads.json with mock data');
  }
  
  // Initialize profile-settings.json (only if empty)
  if (!fs.existsSync(PROFILE_SETTINGS_FILE) || fs.readFileSync(PROFILE_SETTINGS_FILE, 'utf8').trim() === '' || fs.readFileSync(PROFILE_SETTINGS_FILE, 'utf8').trim() === '{}') {
    const mockProfileSettings = {
      "1": {
        "fullName": "John Doe",
        "email": "admin@leadflow.com",
        "company": "LeadFlow Inc",
        "emailNotifications": true,
        "campaignUpdates": true,
        "weeklyReports": false,
        "updatedAt": new Date().toISOString()
      }
    };
    fs.writeFileSync(PROFILE_SETTINGS_FILE, JSON.stringify(mockProfileSettings, null, 2), 'utf8');
    console.log('  ✓ Created profile-settings.json with mock data');
  }
  
  console.log('✅ Data files initialization complete!\n');
};

// Helper function to read profile settings
const readProfileSettings = () => {
  try {
    if (fs.existsSync(PROFILE_SETTINGS_FILE)) {
      const data = fs.readFileSync(PROFILE_SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading profile settings:', error);
  }
  return {};
};

// Helper function to write profile settings
const writeProfileSettings = (settings) => {
  try {
    fs.writeFileSync(PROFILE_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing profile settings:', error);
    return false;
  }
};

// Helper function to read notifications
const readNotifications = () => {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading notifications:', error);
  }
  return [];
};

// Helper function to write notifications
const writeNotifications = (notifications) => {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing notifications:', error);
    return false;
  }
};

// Helper function to read leads
const readLeads = () => {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf8');
      if (!data || data.trim() === '') {
        return [];
      }
      const parsed = JSON.parse(data);
      // Ensure it's an array
      if (!Array.isArray(parsed)) {
        console.error('Leads file does not contain an array, resetting to empty array');
        return [];
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error reading leads:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      path: LEADS_FILE
    });
  }
  return [];
};

// Helper function to write leads
const writeLeads = (leads) => {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Validate leads is an array
    if (!Array.isArray(leads)) {
      console.error('Error writing leads: leads must be an array');
      return false;
    }
    
    // Write to file
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing leads:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      path: LEADS_FILE,
      dataDirExists: fs.existsSync(DATA_DIR)
    });
    return false;
  }
};

// Helper function to read analytics
const readAnalytics = () => {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading analytics:', error);
  }
  return {};
};

// Helper function to write analytics
const writeAnalytics = (analytics) => {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Validate analytics is an object
    if (typeof analytics !== 'object' || analytics === null) {
      console.error('Error writing analytics: analytics must be an object');
      return false;
    }
    
    // Write to file
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing analytics:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      path: ANALYTICS_FILE,
      dataDirExists: fs.existsSync(DATA_DIR)
    });
    return false;
  }
};

// Helper function to track daily message sends
const trackDailyMessageSend = (userId, type, count = 1) => {
  try {
    const analytics = readAnalytics();
    if (!analytics[userId]) {
      analytics[userId] = {
        searches: 0,
        savedLeads: 0,
        followups: 0,
        dailySends: {}
      };
    }
    
    if (!analytics[userId].dailySends) {
      analytics[userId].dailySends = {};
    }
    
    // Get today's date as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    if (!analytics[userId].dailySends[today]) {
      analytics[userId].dailySends[today] = {
        email: 0,
        whatsapp: 0
      };
    }
    
    // Increment the count for the message type
    if (type === 'email' || type === 'whatsapp') {
      analytics[userId].dailySends[today][type] = (analytics[userId].dailySends[today][type] || 0) + count;
    }
    
    writeAnalytics(analytics);
    return true;
  } catch (error) {
    console.error('Error tracking daily message send:', error);
    return false;
  }
};

// Helper function to read templates
const readTemplates = () => {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading templates:', error);
  }
  return [];
};

// Helper function to write templates
const writeTemplates = (templates) => {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing templates:', error);
    return false;
  }
};

// Helper function to read campaigns
const readCampaigns = () => {
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading campaigns:', error);
  }
  return [];
};

// Helper function to write campaigns
const writeCampaigns = (campaigns) => {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing campaigns:', error);
    return false;
  }
};

// Helper function to read SMTP configs
const readSmtpConfigs = () => {
  try {
    if (fs.existsSync(SMTP_CONFIGS_FILE)) {
      const data = fs.readFileSync(SMTP_CONFIGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading SMTP configs:', error);
  }
  return {};
};

// Helper function to write SMTP configs
const writeSmtpConfigs = (configs) => {
  try {
    fs.writeFileSync(SMTP_CONFIGS_FILE, JSON.stringify(configs, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing SMTP configs:', error);
    return false;
  }
};

// Helper function to send email using SMTP configuration
const sendEmail = async (userId, toEmail, subject, message, htmlMessage = null, attachments = []) => {
  try {
    const configs = readSmtpConfigs();
    const smtpConfig = configs[userId];
    
    if (!smtpConfig) {
      throw new Error('SMTP configuration not found. Please configure SMTP settings first.');
    }
    
    // Determine secure settings based on port
    // Port 465 uses SSL (secure: true)
    // Port 587 uses STARTTLS (secure: false, requireTLS: true)
    // Other ports use secure setting from config or default to false
    const port = parseInt(smtpConfig.port);
    const isSecurePort = port === 465;
    
    // For port 587, always use STARTTLS (secure: false)
    // For port 465, always use SSL (secure: true)
    // For other ports, use the config setting or default to false
    let useSecure = false;
    let requireTLS = false;
    
    if (port === 465) {
      useSecure = true; // SSL
      requireTLS = false;
    } else if (port === 587) {
      useSecure = false; // STARTTLS
      requireTLS = true;
    } else {
      // For other ports, use config setting or default
      useSecure = smtpConfig.secure || false;
      requireTLS = !useSecure;
    }
    
    // Create transporter configuration
    const transporterConfig = {
      host: smtpConfig.host,
      port: port,
      secure: useSecure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password
      },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false
      }
    };
    
    // Add requireTLS only for port 587
    if (requireTLS) {
      transporterConfig.requireTLS = true;
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport(transporterConfig);
    
    // Verify connection
    await transporter.verify();
    
    // Prepare email options
    const mailOptions = {
      from: `"Lead Finder" <${smtpConfig.username}>`,
      to: toEmail,
      subject: subject,
      text: message,
      html: htmlMessage || message.replace(/\n/g, '<br>')
    };
    
    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${toEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${toEmail}:`, error.message);
    throw error;
  }
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i;
    const allowedMimeTypes = /^image\/(jpeg|jpg|png)$/i;
    
    const extname = allowedExtensions.test(path.extname(file.originalname));
    const mimetype = allowedMimeTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/images', express.static(IMAGES_DIR));

// Serve static files from the frontend build directory
// Always register static middleware - it will only serve files if they exist
app.use(express.static(FRONTEND_BUILD_DIR));

// WhatsApp Web Client Setup
let whatsappClient = null;
let whatsappQRCode = null;
let whatsappReady = false;
let whatsappQRCallback = null;

// Initialize WhatsApp Client
const initializeWhatsApp = () => {
  if (whatsappClient) {
    return whatsappClient;
  }

  console.log('🔧 Initializing WhatsApp Web Client...');

  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      clientId: 'leadflow-whatsapp',
      dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--disable-blink-features=AutomationControlled'
      ],
      timeout: 60000,
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
    }
  });

  // QR Code generation - Display in terminal
  whatsappClient.on('qr', async (qr) => {
    whatsappQRCode = qr;
    console.log('\n' + '='.repeat(70));
    console.log('📱 WHATSAPP WEB QR CODE - SCAN WITH YOUR PHONE');
    console.log('='.repeat(70));
    qrcode.generate(qr, { small: true });
    console.log('='.repeat(70));
    console.log('Instructions:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Go to Settings → Linked Devices');
    console.log('3. Tap "Link a Device"');
    console.log('4. Scan the QR code above');
    console.log('='.repeat(70) + '\n');
    
    // Call the callback if set (for API endpoint)
    if (whatsappQRCallback && typeof whatsappQRCallback === 'function') {
      try {
        // Generate QR code as data URL for frontend
        const qrCodeDataUrl = await QRCode.toDataURL(qr, {
          width: 300,
          margin: 2
        });
        
        whatsappQRCallback({
          qrCodeUrl: qr,
          qrCodeImage: qrCodeDataUrl,
          sessionId: 'whatsapp-session',
          expiresIn: 60,
          message: 'Scan this QR code with WhatsApp to connect your account'
        });
      } catch (error) {
        console.error('Error generating QR code image:', error);
        if (typeof whatsappQRCallback === 'function') {
          whatsappQRCallback({
            qrCodeUrl: qr,
            qrCodeImage: null,
            sessionId: 'whatsapp-session',
            expiresIn: 60,
            message: 'Scan this QR code with WhatsApp to connect your account'
          });
        }
      }
      whatsappQRCallback = null;
    }
  });

  // Ready event
  whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
    whatsappReady = true;
    whatsappQRCode = null; // Clear QR code when ready
  });

  // Authentication event
  whatsappClient.on('authenticated', () => {
    console.log('✅ WhatsApp Client authenticated!');
  });

  // Authentication failure
  whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp authentication failure:', msg);
    whatsappReady = false;
  });

  // Disconnected
  whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp Client disconnected:', reason);
    whatsappReady = false;
    whatsappQRCode = null;
    whatsappClient = null;
    // Reinitialize after 5 seconds
    setTimeout(() => {
      console.log('🔄 Reinitializing WhatsApp Client...');
      initializeWhatsApp();
    }, 5000);
  });

  // Loading screen event
  whatsappClient.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading WhatsApp: ${percent}% - ${message}`);
  });

  // Initialize the client with retry logic
  const initializeWithRetry = (retries = 3) => {
    whatsappClient.initialize()
      .then(() => {
        console.log('✅ WhatsApp client initialization started');
      })
      .catch(err => {
        const errorMessage = err.message || err.toString() || '';
        const errorString = JSON.stringify(err, null, 2);
        
        console.error('❌ Error initializing WhatsApp client:', errorMessage);
        
        // Check for "browser is already running" error
        const isBrowserRunningError = 
          errorMessage.includes('browser is already running') ||
          errorMessage.includes('userDataDir') ||
          errorString.includes('browser is already running');
        
        if (isBrowserRunningError) {
          console.error('');
          console.error('⚠️  Browser session lock detected');
          console.error('💡 This usually happens when the server was restarted but the browser process is still running.');
          console.error('🔧 Attempting to clean up and retry...');
          console.error('');
          
          // Try to clean up the lock file
          try {
            const lockFilePath = path.join('./.wwebjs_auth/session-leadflow-whatsapp', 'Default', 'SingletonLock');
            const lockFileDir = path.join('./.wwebjs_auth/session-leadflow-whatsapp', 'Default');
            
            if (fs.existsSync(lockFilePath)) {
              fs.unlinkSync(lockFilePath);
              console.log('✅ Removed lock file');
            }
            
            // Also try to remove Last Browser file
            const lastBrowserPath = path.join('./.wwebjs_auth/session-leadflow-whatsapp', 'Last Browser');
            if (fs.existsSync(lastBrowserPath)) {
              fs.unlinkSync(lastBrowserPath);
              console.log('✅ Removed Last Browser file');
            }
          } catch (cleanupError) {
            console.error('⚠️  Could not clean up lock files:', cleanupError.message);
          }
          
          // Reset client and retry after a delay
          if (retries > 0) {
            console.log(`🔄 Retrying initialization after cleanup... (${retries} attempts left)`);
            setTimeout(() => {
              whatsappClient = null;
              initializeWhatsApp();
            }, 3000);
            return;
          }
        }
        
        // Check for missing system dependencies (Linux) - check multiple error formats
        const isDependencyError = 
          errorMessage.includes('libatk') || 
          errorMessage.includes('shared libraries') || 
          errorMessage.includes('cannot open shared object file') ||
          errorMessage.includes('Code: 127') ||
          errorString.includes('libatk') ||
          errorString.includes('shared libraries') ||
          errorString.includes('cannot open shared object file');
        
        if (isDependencyError) {
          console.error('');
          console.error('⚠️  MISSING SYSTEM DEPENDENCIES DETECTED');
          console.error('📦 Puppeteer requires system libraries to run on Linux.');
          console.error('');
          console.error('🔧 To fix this, run the installation script:');
          console.error('   bash INSTALL_PUPPETEER_DEPS.sh');
          console.error('');
          console.error('📖 Or manually install dependencies (Ubuntu/Debian):');
          console.error('   sudo apt-get update');
          console.error('   sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libgbm1 libasound2 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 libxss1 libgconf-2-4 libxshmfence1 libnss3 libnspr4 libx11-xcb1 libxcb1 ca-certificates fonts-liberation libappindicator3-1 libdbus-1-3 libgdk-pixbuf2.0-0 libglib2.0-0 libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libxext6 libxi6 libxrender1 libxtst6 lsb-release wget xdg-utils');
          console.error('');
          console.error('📖 For CentOS/RHEL:');
          console.error('   sudo yum install -y alsa-lib atk cups-libs gtk3 libXcomposite libXcursor libXdamage libXext libXi libXrandr libXScrnSaver libXtst pango');
          console.error('');
          console.error('📚 More info: https://pptr.dev/troubleshooting');
          console.error('');
          console.error('💡 The server will continue running, but WhatsApp features will be unavailable until dependencies are installed.');
          console.error('   After installing dependencies, restart the server: pm2 restart index');
          console.error('');
        }
        
        if (retries > 0 && !isDependencyError && !isBrowserRunningError) {
          // Only retry if it's not a dependency error or browser running error
          console.log(`🔄 Retrying initialization... (${retries} attempts left)`);
          setTimeout(() => {
            whatsappClient = null;
            initializeWhatsApp();
          }, 5000);
        } else if (!isDependencyError && !isBrowserRunningError) {
          console.error('❌ Failed to initialize WhatsApp client after multiple attempts');
          console.error('💡 Troubleshooting tips:');
          console.error('   1. Make sure Chrome/Chromium is installed');
          console.error('   2. Try running: npm install puppeteer');
          console.error('   3. Check if antivirus is blocking browser launch');
          console.error('   4. WhatsApp Web will work when QR code endpoint is called');
          whatsappClient = null;
        } else if (isBrowserRunningError && retries === 0) {
          console.error('❌ Failed to initialize WhatsApp client - browser session locked');
          console.error('💡 Manual fix: Stop all browser processes and delete .wwebjs_auth folder, then restart server');
          whatsappClient = null;
        }
      });
  };

  initializeWithRetry();

  return whatsappClient;
};

// Initialize WhatsApp lazily (only when QR code is requested)
// This allows the server to start even if WhatsApp initialization fails
// initializeWhatsApp(); // Commented out - will initialize on first QR code request

// In-memory user storage (replace with database in production)
// Default user: admin@leadflow.com / admin123
const users = [
  {
    id: 1,
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@leadflow.com',
    password: bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 10),
    name: 'John Doe',
    role: 'admin'
  }
];

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Root route is handled by static middleware and catch-all route below

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication Routes
// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name,
      role: 'user'
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user', message: error.message });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login', message: error.message });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
});

// Logout route (client-side token removal, but we can track it)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Profile Settings Routes
// Get profile settings
app.get('/api/settings/profile', authenticateToken, (req, res) => {
  try {
    const settings = readProfileSettings();
    // Get settings for the current user
    const userId = req.user.id;
    const userSettings = settings[userId] || {
      fullName: 'John Doe',
      email: req.user.email || 'john@example.com',
      company: 'LeadFlow Inc',
      emailNotifications: true,
      campaignUpdates: true,
      weeklyReports: false
    };
    
    res.json(userSettings);
  } catch (error) {
    console.error('Error getting profile settings:', error);
    res.status(500).json({
      error: 'Failed to get profile settings',
      message: error.message
    });
  }
});

// Save profile settings
app.post('/api/settings/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, email, company, emailNotifications, campaignUpdates, weeklyReports } = req.body;
    
    // Read existing settings
    const settings = readProfileSettings();
    
    // Update user settings
    settings[userId] = {
      fullName: fullName || 'John Doe',
      email: email || req.user.email,
      company: company || 'LeadFlow Inc',
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      campaignUpdates: campaignUpdates !== undefined ? campaignUpdates : true,
      weeklyReports: weeklyReports !== undefined ? weeklyReports : false,
      updatedAt: new Date().toISOString()
    };
    
    // Write to file
    if (writeProfileSettings(settings)) {
      res.json({
        success: true,
        message: 'Profile settings saved successfully',
        settings: settings[userId]
      });
    } else {
      res.status(500).json({
        error: 'Failed to save profile settings'
      });
    }
  } catch (error) {
    console.error('Error saving profile settings:', error);
    res.status(500).json({
      error: 'Failed to save profile settings',
      message: error.message
    });
  }
});

// Change password
app.post('/api/settings/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Find user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
});

// WhatsApp Web QR Code Generation
app.get('/api/whatsapp/qrcode', authenticateToken, async (req, res) => {
  try {
    // Ensure WhatsApp client is initialized (lazy initialization)
    if (!whatsappClient) {
      try {
        initializeWhatsApp();
        // Wait a moment for initialization to start
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (initError) {
        console.error('Failed to initialize WhatsApp client:', initError.message);
        
        const errorMessage = initError.message || initError.toString() || '';
        const errorString = JSON.stringify(initError, null, 2);
        const isDependencyError = 
          errorMessage.includes('libatk') || 
          errorMessage.includes('shared libraries') || 
          errorMessage.includes('cannot open shared object file') ||
          errorMessage.includes('Code: 127') ||
          errorString.includes('libatk') ||
          errorString.includes('shared libraries') ||
          errorString.includes('cannot open shared object file');
        
        if (isDependencyError) {
          return res.status(500).json({
            error: 'WhatsApp client initialization failed - Missing system dependencies',
            message: 'Puppeteer requires system libraries to run on Linux. Please install dependencies.',
            details: 'Run: bash INSTALL_PUPPETEER_DEPS.sh or see DEPLOYMENT.md for manual installation steps.',
            troubleshooting: {
              ubuntu_debian: 'sudo apt-get update && sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libgbm1 libasound2 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 libxss1 libgconf-2-4 libxshmfence1 libnss3 libnspr4 libx11-xcb1 libxcb1 ca-certificates fonts-liberation libappindicator3-1 libdbus-1-3 libgdk-pixbuf2.0-0 libglib2.0-0 libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libxext6 libxi6 libxrender1 libxtst6 lsb-release wget xdg-utils',
              centos_rhel: 'sudo yum install -y alsa-lib atk cups-libs gtk3 libXcomposite libXcursor libXdamage libXext libXi libXrandr libXScrnSaver libXtst pango',
              more_info: 'https://pptr.dev/troubleshooting'
            }
          });
        }
        
        return res.status(500).json({
          error: 'WhatsApp client initialization failed',
          message: 'Please check server logs. Make sure Chrome/Chromium is installed.',
          details: errorMessage
        });
      }
    }

    // If already ready, return status
    if (whatsappReady) {
      return res.json({
        connected: true,
        message: 'WhatsApp is already connected',
        qrCodeUrl: null
      });
    }

    // If QR code already exists, return it
    if (whatsappQRCode) {
      // Generate QR code as data URL for frontend
      const qrCodeDataUrl = await QRCode.toDataURL(whatsappQRCode, {
        width: 300,
        margin: 2
      });

      return res.json({
        qrCodeUrl: whatsappQRCode, // Return the actual WhatsApp QR code string
        qrCodeImage: qrCodeDataUrl, // Return as image data URL
        sessionId: 'whatsapp-session',
        expiresIn: 60,
        message: 'Scan this QR code with WhatsApp to connect your account'
      });
    }

    // Set up callback to return QR code when generated
    return new Promise((resolve) => {
      whatsappQRCallback = (qrData) => {
        resolve(res.json(qrData));
      };

      // If QR code already exists, generate and return it immediately
      if (whatsappQRCode) {
        (async () => {
          try {
            const qrCodeDataUrl = await QRCode.toDataURL(whatsappQRCode, {
              width: 300,
              margin: 2
            });
            
            resolve(res.json({
              qrCodeUrl: whatsappQRCode,
              qrCodeImage: qrCodeDataUrl,
              sessionId: 'whatsapp-session',
              expiresIn: 60,
              message: 'Scan this QR code with WhatsApp to connect your account'
            }));
          } catch (error) {
            resolve(res.status(500).json({
              error: 'Failed to generate QR code image',
              message: error.message
            }));
          }
        })();
        return;
      }

      // Wait for QR code to be generated (will be handled by 'qr' event)
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!whatsappQRCode && typeof whatsappQRCallback === 'function') {
          whatsappQRCallback = null;
          resolve(res.status(408).json({
            error: 'QR code generation timeout',
            message: 'Please try again'
          }));
        }
      }, 30000);
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate QR code', 
      message: error.message 
    });
  }
});

// Check WhatsApp connection status
app.get('/api/whatsapp/status', authenticateToken, async (req, res) => {
  try {
    if (!whatsappClient) {
      return res.json({
        connected: false,
        phoneNumber: null,
        name: null,
        lastConnected: null,
        message: 'WhatsApp client not initialized'
      });
    }

    if (whatsappReady) {
      try {
        const info = whatsappClient.info;
        return res.json({
          connected: true,
          phoneNumber: info?.wid?.user || null,
          name: info?.pushname || null,
          platform: info?.platform || null,
          lastConnected: new Date().toISOString(),
          message: 'WhatsApp is connected'
        });
      } catch (error) {
        return res.json({
          connected: whatsappReady,
          phoneNumber: null,
          name: null,
          lastConnected: null,
          message: 'Connected but unable to get details'
        });
      }
    }

    res.json({
      connected: false,
      phoneNumber: null,
      name: null,
      lastConnected: null,
      message: 'WhatsApp is not connected. Please scan the QR code.'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to check status',
      message: error.message
    });
  }
});

// Disconnect/Logout WhatsApp
app.post('/api/whatsapp/disconnect', authenticateToken, async (req, res) => {
  try {
    if (!whatsappClient) {
      return res.json({
        success: false,
        message: 'WhatsApp client not initialized'
      });
    }

    if (whatsappReady) {
      try {
        await whatsappClient.logout();
        console.log('✅ WhatsApp client logged out');
      } catch (error) {
        console.error('Error logging out:', error);
        // Force destroy if logout fails
        try {
          await whatsappClient.destroy();
        } catch (destroyError) {
          console.error('Error destroying client:', destroyError);
        }
      }
    }

    // Reset state
    whatsappClient = null;
    whatsappReady = false;
    whatsappQRCode = null;
    whatsappQRCallback = null;

    res.json({
      success: true,
      message: 'WhatsApp disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      error: 'Failed to disconnect',
      message: error.message
    });
  }
});

// Format phone number for WhatsApp (international format without +)
const formatPhoneForWhatsApp = (phone, country = 'Sri Lanka') => {
  if (!phone || phone === 'N/A') return null;
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove + if present (we'll add country code)
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Country code mapping
  const countryCodes = {
    'Sri Lanka': '94',
    'United States': '1',
    'Canada': '1',
    'United Kingdom': '44',
    'Australia': '61',
    'Germany': '49',
    'France': '33',
    'Italy': '39',
    'Spain': '34',
    'India': '91',
    'Singapore': '65',
    'Malaysia': '60',
    'Thailand': '66',
    'Philippines': '63',
    'Indonesia': '62',
    'Vietnam': '84',
    'United Arab Emirates': '971',
    'Saudi Arabia': '966',
    'South Africa': '27',
    'Brazil': '55',
    'Mexico': '52'
  };
  
  const countryCode = countryCodes[country] || '94'; // Default to Sri Lanka
  
  // If number already starts with country code, use it
  if (cleaned.startsWith(countryCode)) {
    return cleaned;
  }
  
  // If number starts with 0, remove it and add country code
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Add country code
  return countryCode + cleaned;
};

// Country code mapping for Serper API gl parameter
const getCountryCode = (countryName) => {
  const countryMap = {
    'Sri Lanka': 'lk',
    'United States': 'us',
    'Canada': 'ca',
    'United Kingdom': 'uk',
    'Australia': 'au',
    'Germany': 'de',
    'France': 'fr',
    'Italy': 'it',
    'Spain': 'es',
    'Netherlands': 'nl',
    'Belgium': 'be',
    'Switzerland': 'ch',
    'Austria': 'at',
    'Sweden': 'se',
    'Norway': 'no',
    'Denmark': 'dk',
    'Finland': 'fi',
    'Ireland': 'ie',
    'Portugal': 'pt',
    'Poland': 'pl',
    'Czech Republic': 'cz',
    'Greece': 'gr',
    'Romania': 'ro',
    'Hungary': 'hu',
    'New Zealand': 'nz',
    'Japan': 'jp',
    'South Korea': 'kr',
    'China': 'cn',
    'India': 'in',
    'Singapore': 'sg',
    'Malaysia': 'my',
    'Thailand': 'th',
    'Philippines': 'ph',
    'Indonesia': 'id',
    'Vietnam': 'vn',
    'Hong Kong': 'hk',
    'Taiwan': 'tw',
    'United Arab Emirates': 'ae',
    'Saudi Arabia': 'sa',
    'Israel': 'il',
    'South Africa': 'za',
    'Brazil': 'br',
    'Mexico': 'mx',
    'Argentina': 'ar',
    'Chile': 'cl',
    'Colombia': 'co',
    'Peru': 'pe',
    'Turkey': 'tr',
    'Russia': 'ru'
  };
  return countryMap[countryName] || 'us'; // Default to US if not found
};

// Place search route using Serper.dev API (protected)
app.post('/api/search', authenticateToken, async (req, res) => {
  console.log('Received search request:', req.body);
  try {
    const { industry, city, country } = req.body;
    const userId = req.user.id;
    
    if (!industry && !city) {
      return res.status(400).json({ error: 'At least industry/keyword or city is required' });
    }

    // Track search in analytics
    const analytics = readAnalytics();
    if (!analytics[userId]) {
      analytics[userId] = {
        searches: 0,
        savedLeads: 0,
        followups: 0
      };
    }
    analytics[userId].searches = (analytics[userId].searches || 0) + 1;
    writeAnalytics(analytics);

    // Build query string from form fields
    let queryParts = [];
    if (industry) queryParts.push(industry);
    if (city) queryParts.push(city);
    if (country && country !== 'Sri Lanka') {
      queryParts.push(country);
    }
    const query = queryParts.join(' ');

    // Get country code for gl parameter
    const countryCode = getCountryCode(country || 'Sri Lanka');

    let data = JSON.stringify({
      "q": query,
      "gl": countryCode
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/places',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY, 
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);
    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform search', 
      message: error.message
    });
  }
});

// Leads Routes
// Get saved leads for user
app.get('/api/leads', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const leads = readLeads();
    
    // Filter leads for this user
    const userLeads = leads.filter(lead => lead.userId === userId);
    
    res.json(userLeads);
  } catch (error) {
    console.error('Error getting leads:', error);
    res.status(500).json({
      error: 'Failed to get leads',
      message: error.message
    });
  }
});

// Save a lead
app.post('/api/leads', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { businessName, phone, email, address, website, industry, city, country, notes } = req.body;
    
    console.log('📝 Saving lead request:', { userId, businessName, email, phone });
    
    if (!businessName) {
      console.error('❌ Validation failed: Business name is required');
      return res.status(400).json({ error: 'Business name is required' });
    }
    
    console.log('📖 Reading leads from file...');
    const leads = readLeads();
    console.log(`✅ Read ${leads.length} leads from file`);
    
    // Check for duplicates - compare by businessName, email, or phone
    const normalizeString = (str) => (str || '').toLowerCase().trim();
    const normalizePhone = (str) => (str || '').replace(/[^\d+]/g, '').trim();
    
    const isDuplicate = leads.some(lead => {
      if (lead.userId !== userId) return false;
      
      // Check by business name (exact match, case-insensitive)
      if (normalizeString(lead.businessName) === normalizeString(businessName)) {
        return true;
      }
      
      // Check by email (if both have valid emails)
      const leadEmail = normalizeString(lead.email);
      const newEmail = normalizeString(email);
      if (leadEmail !== 'n/a' && newEmail !== 'n/a' && leadEmail === newEmail) {
        return true;
      }
      
      // Check by phone (normalized, removing non-digits)
      const leadPhone = normalizePhone(lead.phone);
      const newPhone = normalizePhone(phone);
      if (leadPhone && newPhone && leadPhone === newPhone) {
        return true;
      }
      
      return false;
    });
    
    if (isDuplicate) {
      return res.status(409).json({ 
        error: 'Duplicate lead',
        message: 'This lead already exists in your database'
      });
    }
    
    // Validate leads array - ensure it's always an array
    let validLeads = Array.isArray(leads) ? leads : [];
    if (!Array.isArray(leads)) {
      console.error('⚠️ Leads data is not an array, resetting to empty array');
      console.error('Leads type:', typeof leads, 'Value:', leads);
      validLeads = [];
    }
    
    const newLead = {
      id: Date.now().toString(),
      userId,
      businessName,
      phone: phone || 'N/A',
      email: email || 'N/A',
      address: address || 'N/A',
      website: website || 'N/A',
      industry: industry || '',
      city: city || '',
      country: country || '',
      followupStatus: 'none',
      notes: notes || '',
      savedAt: new Date().toISOString()
    };
    
    // Validate newLead has required fields
    if (!newLead.id || !newLead.userId || !newLead.businessName) {
      console.error('Invalid lead data:', newLead);
      return res.status(400).json({
        error: 'Invalid lead data',
        message: 'Lead data validation failed'
      });
    }
    
    console.log('➕ Adding new lead to array...');
    validLeads.push(newLead);
    console.log(`✅ Lead added. Total leads: ${validLeads.length}`);
    
    // Write leads to file - check if successful
    console.log('💾 Writing leads to file...');
    const leadsWritten = writeLeads(validLeads);
    if (!leadsWritten) {
      console.error('❌ Failed to write leads to file');
      // Remove the lead from array since write failed
      validLeads.pop();
      return res.status(500).json({
        error: 'Failed to save lead',
        message: 'Could not write to leads file. Please check file permissions and disk space.',
        details: `File path: ${LEADS_FILE}`
      });
    }
    console.log('✅ Leads written to file successfully');
    
    // Update analytics
    console.log('📊 Updating analytics...');
    const analytics = readAnalytics();
    if (!analytics[userId]) {
      analytics[userId] = {
        searches: 0,
        savedLeads: 0,
        followups: 0
      };
    }
    analytics[userId].savedLeads = (analytics[userId].savedLeads || 0) + 1;
    
    // Write analytics - check if successful (but don't fail the request if this fails)
    const analyticsWritten = writeAnalytics(analytics);
    if (!analyticsWritten) {
      console.error('⚠️ Failed to write analytics, but lead was saved successfully');
      // Continue anyway since the lead was saved
    } else {
      console.log('✅ Analytics updated successfully');
    }
    
    console.log('✅ Lead saved successfully:', newLead.id);
    res.status(201).json(newLead);
  } catch (error) {
    console.error('❌ Error saving lead:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      userId: req.user?.id,
      businessName: req.body?.businessName
    });
    res.status(500).json({
      error: 'Failed to save lead',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete a lead
app.delete('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const leadId = req.params.id;
    
    const leads = readLeads();
    const leadIndex = leads.findIndex(lead => lead.id === leadId && lead.userId === userId);
    
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    leads.splice(leadIndex, 1);
    writeLeads(leads);
    
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      error: 'Failed to delete lead',
      message: error.message
    });
  }
});

// Notifications Routes
// Get all notifications for user
app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = readNotifications();
    
    // Filter notifications for this user
    const userNotifications = notifications.filter(notif => notif.userId === userId);
    
    // Sort by date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(userNotifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      error: 'Failed to get notifications',
      message: error.message
    });
  }
});

// Get unread notifications count for user
app.get('/api/notifications/unread', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = readNotifications();
    
    // Filter unread notifications for this user
    const unreadCount = notifications.filter(
      notif => notif.userId === userId && !notif.read
    ).length;
    
    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      message: error.message
    });
  }
});

// Create a new notification
app.post('/api/notifications', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { title, message, type = 'info' } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    const notifications = readNotifications();
    const newNotification = {
      id: Date.now().toString(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    writeNotifications(notifications);
    
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      error: 'Failed to create notification',
      message: error.message
    });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    const notifications = readNotifications();
    const notification = notifications.find(
      notif => notif.id === notificationId && notif.userId === userId
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    notification.readAt = new Date().toISOString();
    writeNotifications(notifications);
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = readNotifications();
    
    const updated = notifications.map(notif => {
      if (notif.userId === userId && !notif.read) {
        return {
          ...notif,
          read: true,
          readAt: new Date().toISOString()
        };
      }
      return notif;
    });
    
    writeNotifications(updated);
    
    res.json({ 
      success: true, 
      message: 'All notifications marked as read',
      count: updated.filter(n => n.userId === userId && n.read).length
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
});

// Delete a notification
app.delete('/api/notifications/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    const notifications = readNotifications();
    const notificationIndex = notifications.findIndex(
      notif => notif.id === notificationId && notif.userId === userId
    );
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notifications.splice(notificationIndex, 1);
    writeNotifications(notifications);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: error.message
    });
  }
});

// Templates Routes
// Get all templates for user
app.get('/api/templates', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const templates = readTemplates();
    
    // Filter templates for this user
    const userTemplates = templates.filter(template => template.userId === userId);
    
    // Sort by date (newest first)
    userTemplates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(userTemplates);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      error: 'Failed to get templates',
      message: error.message
    });
  }
});

// Get a single template
app.get('/api/templates/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const templateId = req.params.id;
    const templates = readTemplates();
    
    const template = templates.find(
      t => t.id === templateId && t.userId === userId
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({
      error: 'Failed to get template',
      message: error.message
    });
  }
});

// Create a new template
app.post('/api/templates', authenticateToken, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.message) {
        return res.status(400).json({
          error: 'File upload error',
          message: err.message
        });
      }
      return res.status(400).json({
        error: 'File upload error',
        message: 'Invalid file. Only JPG and PNG images are allowed (Max 5MB).'
      });
    }
    next();
  });
}, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, message, subject, heading, pattern, useHtml } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    if (type !== 'whatsapp' && type !== 'email') {
      return res.status(400).json({ error: 'Type must be either "whatsapp" or "email"' });
    }
    
    // Check template limit (15 templates per user)
    const templates = readTemplates();
    const userTemplates = templates.filter(t => t.userId === userId);
    if (userTemplates.length >= 15) {
      return res.status(400).json({ 
        error: 'Template limit reached',
        message: 'You can only save up to 15 templates. Please delete an existing template to create a new one.'
      });
    }
    
    // Pattern-based validation
    if (pattern) {
      // WhatsApp patterns
      if (type === 'whatsapp') {
        if (pattern === 'image-only') {
          if (!req.file) {
            return res.status(400).json({ error: 'Image is required for image-only pattern' });
          }
        } else if (pattern === 'heading-text' || pattern === 'heading-image-text') {
          if (!heading) {
            return res.status(400).json({ error: 'Heading is required for this pattern' });
          }
          if (!message) {
            return res.status(400).json({ error: 'Message is required for this pattern' });
          }
        } else if (pattern === 'text-only' || pattern === 'image-text') {
          if (!message) {
            return res.status(400).json({ error: 'Message is required for this pattern' });
          }
        }
      }
      // Email patterns
      else if (type === 'email') {
        if (!subject) {
          return res.status(400).json({ error: 'Subject is required for email templates' });
        }
        if (!message) {
          return res.status(400).json({ error: 'Message is required for this pattern' });
        }
      }
    } else {
      // Fallback validation for templates without pattern
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      if (type === 'email' && !subject) {
        return res.status(400).json({ error: 'Subject is required for email templates' });
      }
    }
    
    const imagePath = req.file ? `/api/images/${req.file.filename}` : null;
    
    const newTemplate = {
      id: Date.now().toString(),
      userId,
      name,
      type,
      message: message || null, // Can be null for image-only pattern
      subject: type === 'email' ? subject : null,
      heading: heading || null,
      pattern: pattern || null,
      useHtml: useHtml === 'true' || useHtml === true,
      image: imagePath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    templates.push(newTemplate);
    writeTemplates(templates);
    
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      error: 'Failed to create template',
      message: error.message
    });
  }
});

// Update a template
app.put('/api/templates/:id', authenticateToken, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.message) {
        return res.status(400).json({
          error: 'File upload error',
          message: err.message
        });
      }
      return res.status(400).json({
        error: 'File upload error',
        message: 'Invalid file. Only JPG and PNG images are allowed (Max 5MB).'
      });
    }
    next();
  });
}, (req, res) => {
  try {
    const userId = req.user.id;
    const templateId = req.params.id;
    const { name, type, message, subject, heading, pattern, useHtml } = req.body;
    
    const templates = readTemplates();
    const templateIndex = templates.findIndex(
      t => t.id === templateId && t.userId === userId
    );
    
    if (templateIndex === -1) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = templates[templateIndex];
    
    // Update fields
    if (name !== undefined) template.name = name;
    if (type !== undefined) template.type = type;
    if (message !== undefined) template.message = message;
    if (type === 'email' && subject !== undefined) template.subject = subject;
    if (heading !== undefined) template.heading = heading;
    if (pattern !== undefined) template.pattern = pattern;
    if (useHtml !== undefined) template.useHtml = useHtml === 'true' || useHtml === true;
    
    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (template.image) {
        const oldImagePath = path.join(IMAGES_DIR, path.basename(template.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      template.image = `/api/images/${req.file.filename}`;
    }
    
    template.updatedAt = new Date().toISOString();
    
    writeTemplates(templates);
    
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      error: 'Failed to update template',
      message: error.message
    });
  }
});

// Delete a template
app.delete('/api/templates/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const templateId = req.params.id;
    
    const templates = readTemplates();
    const templateIndex = templates.findIndex(
      t => t.id === templateId && t.userId === userId
    );
    
    if (templateIndex === -1) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = templates[templateIndex];
    
    // Delete associated image if exists
    if (template.image) {
      const imagePath = path.join(IMAGES_DIR, path.basename(template.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    templates.splice(templateIndex, 1);
    writeTemplates(templates);
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      error: 'Failed to delete template',
      message: error.message
    });
  }
});

// Campaigns Routes
// Get all campaigns for user
app.get('/api/campaigns', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const campaigns = readCampaigns();
    
    // Filter campaigns for this user
    const userCampaigns = campaigns.filter(campaign => campaign.userId === userId);
    
    // Sort by date (newest first)
    userCampaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(userCampaigns);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({
      error: 'Failed to get campaigns',
      message: error.message
    });
  }
});

// Get a single campaign
app.get('/api/campaigns/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;
    const campaigns = readCampaigns();
    
    const campaign = campaigns.find(
      c => c.id === campaignId && c.userId === userId
    );
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(500).json({
      error: 'Failed to get campaign',
      message: error.message
    });
  }
});

// Create a new campaign
app.post('/api/campaigns', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, templateId, leadIds } = req.body;
    
    if (!name || !type || !templateId || !leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'Name, type, templateId, and leadIds are required' });
    }
    
    if (type !== 'whatsapp' && type !== 'email') {
      return res.status(400).json({ error: 'Type must be either "whatsapp" or "email"' });
    }
    
    // Verify template exists and matches type
    const templates = readTemplates();
    const template = templates.find(t => t.id === templateId && t.userId === userId && t.type === type);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found or type mismatch' });
    }
    
    // Verify leads exist
    const leads = readLeads();
    const validLeadIds = leadIds.filter(leadId => 
      leads.some(lead => lead.id === leadId && lead.userId === userId)
    );
    
    if (validLeadIds.length === 0) {
      return res.status(400).json({ error: 'No valid leads found' });
    }
    
    const campaigns = readCampaigns();
    const newCampaign = {
      id: Date.now().toString(),
      userId,
      name,
      type,
      templateId,
      template: template, // Store template data
      leadIds: validLeadIds,
      status: 'Draft', // Draft, Live, Completed, Failed
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    campaigns.push(newCampaign);
    writeCampaigns(campaigns);
    
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

// Send a campaign
app.post('/api/campaigns/:id/send', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;
    
    const campaigns = readCampaigns();
    const campaignIndex = campaigns.findIndex(
      c => c.id === campaignId && c.userId === userId
    );
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const campaign = campaigns[campaignIndex];
    const leads = readLeads();
    const campaignLeads = leads.filter(lead => 
      campaign.leadIds.includes(lead.id) && lead.userId === userId
    );
    
    if (campaignLeads.length === 0) {
      return res.status(400).json({ error: 'No leads found for this campaign' });
    }
    
    // Update campaign status to Live when sending starts
    campaign.status = 'Live';
    campaign.updatedAt = new Date().toISOString();
    writeCampaigns(campaigns);
    
    // Send messages based on type
    let sentCount = 0;
    let failedCount = 0;
    
    if (campaign.type === 'whatsapp') {
      // Check if WhatsApp is connected
      if (!whatsappClient) {
        campaign.status = 'Failed';
        campaign.updatedAt = new Date().toISOString();
        writeCampaigns(campaigns);
        return res.status(400).json({ error: 'WhatsApp client is not initialized. Please connect WhatsApp first.' });
      }
      
      // Check actual connection status - try to verify client is actually ready
      let isConnected = false;
      try {
        // First check the ready flag
        if (whatsappReady) {
          isConnected = true;
        } else {
          // If flag is false, check if client actually has connection info
          // Sometimes the flag might not be set but client is connected
          if (whatsappClient.info && whatsappClient.info.wid) {
            console.log('WhatsApp client has info but whatsappReady flag is false. Using client info.');
            isConnected = true;
            // Update the flag for future checks
            whatsappReady = true;
          }
        }
      } catch (error) {
        console.error('Error checking WhatsApp connection:', error);
        // If we can't check, assume not connected
        isConnected = false;
      }
      
      if (!isConnected) {
        console.log('WhatsApp connection check failed:', {
          whatsappClient: !!whatsappClient,
          whatsappReady: whatsappReady,
          hasInfo: whatsappClient?.info ? true : false
        });
        campaign.status = 'Failed';
        campaign.updatedAt = new Date().toISOString();
        writeCampaigns(campaigns);
        return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
      }
      
      console.log('WhatsApp connection verified. Proceeding with campaign send.');
      
      // Send WhatsApp messages
      for (let i = 0; i < campaignLeads.length; i++) {
        const lead = campaignLeads[i];
        try {
          // Add random delay between messages (5-10 seconds) except for the first message
          if (i > 0) {
            const delaySeconds = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // Random between 5-10 seconds
            console.log(`Waiting ${delaySeconds} seconds before sending next message...`);
            await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          }
          
          // Format phone number for WhatsApp (international format)
          const formattedPhone = formatPhoneForWhatsApp(lead.phone, lead.country || 'Sri Lanka');
          
          if (formattedPhone && formattedPhone.length >= 10) {
            // Replace template variables with lead data
            let message = campaign.template?.message;
            
            // Validate template message exists
            if (!message) {
              console.log(`No template message found for campaign ${campaign.name}, skipping ${lead.businessName}...`);
              failedCount++;
              continue;
            }
            
            // Ensure message is a string
            if (typeof message !== 'string') {
              message = String(message);
            }
            
            // Replace template variables
            message = message.replace(/\{businessName\}/g, lead.businessName || '');
            message = message.replace(/\{phone\}/g, lead.phone || '');
            message = message.replace(/\{email\}/g, lead.email || '');
            message = message.replace(/\{address\}/g, lead.address || '');
            
            // Trim and validate message
            message = message.trim();
            
            // Skip if message is empty or only whitespace
            if (!message || message.length === 0 || !message.replace(/\s/g, '').length) {
              console.log(`Empty or whitespace-only message for ${lead.businessName}, skipping...`);
              failedCount++;
              continue;
            }
            
            // Ensure message is a valid non-empty string (final check)
            if (typeof message !== 'string' || message.length === 0) {
              console.log(`Invalid message format for ${lead.businessName}, skipping...`);
              failedCount++;
              continue;
            }
            
            // Validate and format chatId
            // Validate and format chatId
            const chatId = `${formattedPhone}@c.us`;
            
            // Ensure chatId is valid (only digits and @c.us)
            if (!/^\d+@c\.us$/.test(chatId)) {
              console.log(`Invalid chatId format for ${lead.businessName}: ${chatId}`);
              failedCount++;
              continue;
            }
            
            // Final validation: ensure message is a non-empty string
            let finalMessage = String(message).trim();
            if (!finalMessage || finalMessage.length === 0) {
              console.log(`Final validation failed: empty message for ${lead.businessName}`);
              failedCount++;
              continue;
            }
            
            // Remove any null bytes or problematic control characters
            finalMessage = finalMessage.replace(/\0/g, '').replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
            
            // Ensure message is still valid after cleaning
            if (!finalMessage || finalMessage.length === 0) {
              console.log(`Message became empty after cleaning for ${lead.businessName}`);
              failedCount++;
              continue;
            }
            
            try {
              console.log(`Sending message to ${lead.businessName} (${formattedPhone}): ${finalMessage.substring(0, 50)}...`);
              console.log(`ChatId: ${chatId}, Message length: ${finalMessage.length}`);
              
              if (campaign.template?.image) {
                // Send with image
                const imagePath = path.join(IMAGES_DIR, path.basename(campaign.template.image));
                if (fs.existsSync(imagePath)) {
                  // Use MessageMedia for images (proper whatsapp-web.js format)
                  const { MessageMedia } = require('whatsapp-web.js');
                  const media = MessageMedia.fromFilePath(imagePath);
                  // Send image with caption
                  await whatsappClient.sendMessage(chatId, media, { caption: finalMessage });
                } else {
                  // If image doesn't exist, send text only
                  console.log(`Image not found at ${imagePath}, sending text only`);
                  await whatsappClient.sendMessage(chatId, finalMessage);
                }
              } else {
                // Send text-only message - ensure it's a plain string
                await whatsappClient.sendMessage(chatId, finalMessage);
              }
              console.log(`✅ Message sent successfully to ${lead.businessName}`);
              sentCount++;
              // Track daily WhatsApp send
              trackDailyMessageSend(userId, 'whatsapp', 1);
            } catch (sendError) {
              console.error(`❌ Error sending message to ${lead.businessName}:`, sendError.message);
              console.error(`   ChatId: ${chatId}`);
              console.error(`   Message was: "${message}"`);
              console.error(`   Final message: "${finalMessage}"`);
              console.error(`   Message type: ${typeof message}, length: ${message?.length}`);
              console.error(`   Full error:`, sendError);
              failedCount++;
            }
          } else {
            console.log(`Invalid phone number for ${lead.businessName}: ${lead.phone}`);
            failedCount++;
          }
        } catch (error) {
          console.error(`Error sending WhatsApp to ${lead.businessName}:`, error);
          failedCount++;
        }
      }
    } else if (campaign.type === 'email') {
      // Check if SMTP is configured
      const configs = readSmtpConfigs();
      const smtpConfig = configs[userId];
      
      if (!smtpConfig) {
        return res.status(400).json({ 
          error: 'SMTP configuration not found. Please configure SMTP settings in Link Accounts page first.' 
        });
      }
      
      // Get template message and subject
      let emailSubject = campaign.template?.subject || 'Campaign Message';
      let emailMessage = campaign.template?.message || '';
      
      // Send emails with random delay between messages (5-10 seconds)
      for (let i = 0; i < campaignLeads.length; i++) {
        const lead = campaignLeads[i];
        try {
          // Add random delay between messages except for the first one
          if (i > 0) {
            const delaySeconds = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
            await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          }
          
          if (!lead.email || !lead.email.includes('@')) {
            console.log(`Invalid email for ${lead.businessName}: ${lead.email}`);
            failedCount++;
            continue;
          }
          
          // Replace template variables
          let finalSubject = emailSubject;
          let finalMessage = emailMessage;
          
          finalSubject = finalSubject.replace(/\{businessName\}/g, lead.businessName || '');
          finalSubject = finalSubject.replace(/\{phone\}/g, lead.phone || '');
          finalSubject = finalSubject.replace(/\{email\}/g, lead.email || '');
          finalSubject = finalSubject.replace(/\{address\}/g, lead.address || '');
          
          finalMessage = finalMessage.replace(/\{businessName\}/g, lead.businessName || '');
          finalMessage = finalMessage.replace(/\{phone\}/g, lead.phone || '');
          finalMessage = finalMessage.replace(/\{email\}/g, lead.email || '');
          finalMessage = finalMessage.replace(/\{address\}/g, lead.address || '');
          
          // Prepare attachments if template has image
          let attachments = [];
          if (campaign.template?.image) {
            const imagePath = path.join(IMAGES_DIR, path.basename(campaign.template.image));
            if (fs.existsSync(imagePath)) {
              attachments.push({
                filename: path.basename(campaign.template.image),
                path: imagePath
              });
            }
          }
          
          // Send email
          await sendEmail(
            userId,
            lead.email,
            finalSubject,
            finalMessage,
            null, // HTML version will be auto-generated from text
            attachments.length > 0 ? attachments : undefined
          );
          
          console.log(`✅ Email sent successfully to ${lead.businessName} (${lead.email})`);
          sentCount++;
          // Track daily email send
          trackDailyMessageSend(userId, 'email', 1);
        } catch (error) {
          console.error(`❌ Error sending email to ${lead.businessName} (${lead.email}):`, error.message);
          failedCount++;
        }
      }
    }
    
    // Update campaign with results - mark as Completed
    campaign.status = 'Completed';
    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    campaign.updatedAt = new Date().toISOString();
    campaign.sentAt = new Date().toISOString();
    writeCampaigns(campaigns);
    
    res.json({
      success: true,
      message: `Campaign sent successfully. ${sentCount} sent, ${failedCount} failed.`,
      sentCount,
      failedCount
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    
    // Update campaign status to failed
    const campaigns = readCampaigns();
    const campaignIndex = campaigns.findIndex(
      c => c.id === req.params.id && c.userId === req.user.id
    );
    if (campaignIndex !== -1) {
      campaigns[campaignIndex].status = 'Failed';
      campaigns[campaignIndex].updatedAt = new Date().toISOString();
      writeCampaigns(campaigns);
    }
    
    res.status(500).json({
      error: 'Failed to send campaign',
      message: error.message
    });
  }
});

// Delete a campaign
app.delete('/api/campaigns/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;
    
    const campaigns = readCampaigns();
    const campaignIndex = campaigns.findIndex(
      c => c.id === campaignId && c.userId === userId
    );
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    campaigns.splice(campaignIndex, 1);
    writeCampaigns(campaigns);
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      error: 'Failed to delete campaign',
      message: error.message
    });
  }
});

// Campaigns Routes
// Get all campaigns for user
app.get('/api/campaigns', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const campaigns = readCampaigns();
    
    // Filter campaigns for this user
    const userCampaigns = campaigns.filter(campaign => campaign.userId === userId);
    
    // Sort by date (newest first)
    userCampaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(userCampaigns);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({
      error: 'Failed to get campaigns',
      message: error.message
    });
  }
});

// Get a single campaign
app.get('/api/campaigns/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;
    const campaigns = readCampaigns();
    
    const campaign = campaigns.find(
      c => c.id === campaignId && c.userId === userId
    );
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(500).json({
      error: 'Failed to get campaign',
      message: error.message
    });
  }
});

// Create a new campaign
app.post('/api/campaigns', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, templateId, leadIds } = req.body;
    
    if (!name || !type || !templateId || !leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'Name, type, templateId, and leadIds are required' });
    }
    
    if (type !== 'whatsapp' && type !== 'email') {
      return res.status(400).json({ error: 'Type must be either "whatsapp" or "email"' });
    }
    
    // Verify template exists and matches type
    const templates = readTemplates();
    const template = templates.find(t => t.id === templateId && t.userId === userId && t.type === type);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found or type mismatch' });
    }
    
    // Verify leads exist
    const leads = readLeads();
    const validLeadIds = leadIds.filter(leadId => 
      leads.some(lead => lead.id === leadId && lead.userId === userId)
    );
    
    if (validLeadIds.length === 0) {
      return res.status(400).json({ error: 'No valid leads found' });
    }
    
    const campaigns = readCampaigns();
    const newCampaign = {
      id: Date.now().toString(),
      userId,
      name,
      type,
      templateId,
      template: template, // Store template data
      leadIds: validLeadIds,
      status: 'Draft', // Draft, Live, Completed, Failed
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    campaigns.push(newCampaign);
    writeCampaigns(campaigns);
    
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

// Send a campaign
app.post('/api/campaigns/:id/send', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;
    
    const campaigns = readCampaigns();
    const campaignIndex = campaigns.findIndex(
      c => c.id === campaignId && c.userId === userId
    );
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const campaign = campaigns[campaignIndex];
    const leads = readLeads();
    const campaignLeads = leads.filter(lead => 
      campaign.leadIds.includes(lead.id) && lead.userId === userId
    );
    
    if (campaignLeads.length === 0) {
      return res.status(400).json({ error: 'No leads found for this campaign' });
    }
    
    // Update campaign status to Live when sending starts
    campaign.status = 'Live';
    campaign.updatedAt = new Date().toISOString();
    writeCampaigns(campaigns);
    
    // Send messages based on type
    let sentCount = 0;
    let failedCount = 0;
    
    if (campaign.type === 'whatsapp') {
      // Check if WhatsApp is connected
      if (!whatsappClient) {
        campaign.status = 'Failed';
        campaign.updatedAt = new Date().toISOString();
        writeCampaigns(campaigns);
        return res.status(400).json({ error: 'WhatsApp client is not initialized. Please connect WhatsApp first.' });
      }
      
      // Check actual connection status - try to verify client is actually ready
      let isConnected = false;
      try {
        // First check the ready flag
        if (whatsappReady) {
          isConnected = true;
        } else {
          // If flag is false, check if client actually has connection info
          // Sometimes the flag might not be set but client is connected
          if (whatsappClient.info && whatsappClient.info.wid) {
            console.log('WhatsApp client has info but whatsappReady flag is false. Using client info.');
            isConnected = true;
            // Update the flag for future checks
            whatsappReady = true;
          }
        }
      } catch (error) {
        console.error('Error checking WhatsApp connection:', error);
        // If we can't check, assume not connected
        isConnected = false;
      }
      
      if (!isConnected) {
        console.log('WhatsApp connection check failed:', {
          whatsappClient: !!whatsappClient,
          whatsappReady: whatsappReady,
          hasInfo: whatsappClient?.info ? true : false
        });
        campaign.status = 'Failed';
        campaign.updatedAt = new Date().toISOString();
        writeCampaigns(campaigns);
        return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
      }
      
      console.log('WhatsApp connection verified. Proceeding with campaign send.');
      
      // Send WhatsApp messages
      for (let i = 0; i < campaignLeads.length; i++) {
        const lead = campaignLeads[i];
        try {
          // Add random delay between messages (5-10 seconds) except for the first message
          if (i > 0) {
            const delaySeconds = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // Random between 5-10 seconds
            console.log(`Waiting ${delaySeconds} seconds before sending next message...`);
            await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          }
          
          // Format phone number for WhatsApp (international format)
          const formattedPhone = formatPhoneForWhatsApp(lead.phone, lead.country || 'Sri Lanka');
          
          if (formattedPhone && formattedPhone.length >= 10) {
            // Replace template variables with lead data
            let message = campaign.template?.message;
            
            // Validate template message exists
            if (!message) {
              console.log(`No template message found for campaign ${campaign.name}, skipping ${lead.businessName}...`);
              failedCount++;
              continue;
            }
            
            // Ensure message is a string
            if (typeof message !== 'string') {
              message = String(message);
            }
            
            // Replace template variables
            message = message.replace(/\{businessName\}/g, lead.businessName || '');
            message = message.replace(/\{phone\}/g, lead.phone || '');
            message = message.replace(/\{email\}/g, lead.email || '');
            message = message.replace(/\{address\}/g, lead.address || '');
            
            // Trim and validate message
            message = message.trim();
            
            // Skip if message is empty or only whitespace
            if (!message || message.length === 0 || !message.replace(/\s/g, '').length) {
              console.log(`Empty or whitespace-only message for ${lead.businessName}, skipping...`);
              failedCount++;
              continue;
            }
            
            // Ensure message is a valid non-empty string (final check)
            if (typeof message !== 'string' || message.length === 0) {
              console.log(`Invalid message format for ${lead.businessName}, skipping...`);
              failedCount++;
              continue;
            }
            
            // Validate and format chatId
            // Validate and format chatId
            const chatId = `${formattedPhone}@c.us`;
            
            // Ensure chatId is valid (only digits and @c.us)
            if (!/^\d+@c\.us$/.test(chatId)) {
              console.log(`Invalid chatId format for ${lead.businessName}: ${chatId}`);
              failedCount++;
              continue;
            }
            
            // Final validation: ensure message is a non-empty string
            let finalMessage = String(message).trim();
            if (!finalMessage || finalMessage.length === 0) {
              console.log(`Final validation failed: empty message for ${lead.businessName}`);
              failedCount++;
              continue;
            }
            
            // Remove any null bytes or problematic control characters
            finalMessage = finalMessage.replace(/\0/g, '').replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
            
            // Ensure message is still valid after cleaning
            if (!finalMessage || finalMessage.length === 0) {
              console.log(`Message became empty after cleaning for ${lead.businessName}`);
              failedCount++;
              continue;
            }
            
            try {
              console.log(`Sending message to ${lead.businessName} (${formattedPhone}): ${finalMessage.substring(0, 50)}...`);
              console.log(`ChatId: ${chatId}, Message length: ${finalMessage.length}`);
              
              if (campaign.template?.image) {
                // Send with image
                const imagePath = path.join(IMAGES_DIR, path.basename(campaign.template.image));
                if (fs.existsSync(imagePath)) {
                  // Use MessageMedia for images (proper whatsapp-web.js format)
                  const { MessageMedia } = require('whatsapp-web.js');
                  const media = MessageMedia.fromFilePath(imagePath);
                  // Send image with caption
                  await whatsappClient.sendMessage(chatId, media, { caption: finalMessage });
                } else {
                  // If image doesn't exist, send text only
                  console.log(`Image not found at ${imagePath}, sending text only`);
                  await whatsappClient.sendMessage(chatId, finalMessage);
                }
              } else {
                // Send text-only message - ensure it's a plain string
                await whatsappClient.sendMessage(chatId, finalMessage);
              }
              console.log(`✅ Message sent successfully to ${lead.businessName}`);
              sentCount++;
              // Track daily WhatsApp send
              trackDailyMessageSend(userId, 'whatsapp', 1);
            } catch (sendError) {
              console.error(`❌ Error sending message to ${lead.businessName}:`, sendError.message);
              console.error(`   ChatId: ${chatId}`);
              console.error(`   Message was: "${message}"`);
              console.error(`   Final message: "${finalMessage}"`);
              console.error(`   Message type: ${typeof message}, length: ${message?.length}`);
              console.error(`   Full error:`, sendError);
              failedCount++;
            }
          } else {
            console.log(`Invalid phone number for ${lead.businessName}: ${lead.phone}`);
            failedCount++;
          }
        } catch (error) {
          console.error(`Error sending WhatsApp to ${lead.businessName}:`, error);
          failedCount++;
        }
      }
    } else if (campaign.type === 'email') {
      // Check if SMTP is configured
      const configs = readSmtpConfigs();
      const smtpConfig = configs[userId];
      
      if (!smtpConfig) {
        return res.status(400).json({ 
          error: 'SMTP configuration not found. Please configure SMTP settings in Link Accounts page first.' 
        });
      }
      
      // Get template message and subject
      let emailSubject = campaign.template?.subject || 'Campaign Message';
      let emailMessage = campaign.template?.message || '';
      
      // Send emails with random delay between messages (5-10 seconds)
      for (let i = 0; i < campaignLeads.length; i++) {
        const lead = campaignLeads[i];
        try {
          // Add random delay between messages except for the first one
          if (i > 0) {
            const delaySeconds = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
            await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
          }
          
          if (!lead.email || !lead.email.includes('@')) {
            console.log(`Invalid email for ${lead.businessName}: ${lead.email}`);
            failedCount++;
            continue;
          }
          
          // Replace template variables
          let finalSubject = emailSubject;
          let finalMessage = emailMessage;
          
          finalSubject = finalSubject.replace(/\{businessName\}/g, lead.businessName || '');
          finalSubject = finalSubject.replace(/\{phone\}/g, lead.phone || '');
          finalSubject = finalSubject.replace(/\{email\}/g, lead.email || '');
          finalSubject = finalSubject.replace(/\{address\}/g, lead.address || '');
          
          finalMessage = finalMessage.replace(/\{businessName\}/g, lead.businessName || '');
          finalMessage = finalMessage.replace(/\{phone\}/g, lead.phone || '');
          finalMessage = finalMessage.replace(/\{email\}/g, lead.email || '');
          finalMessage = finalMessage.replace(/\{address\}/g, lead.address || '');
          
          // Prepare attachments if template has image
          let attachments = [];
          if (campaign.template?.image) {
            const imagePath = path.join(IMAGES_DIR, path.basename(campaign.template.image));
            if (fs.existsSync(imagePath)) {
              attachments.push({
                filename: path.basename(campaign.template.image),
                path: imagePath
              });
            }
          }
          
          // Send email
          await sendEmail(
            userId,
            lead.email,
            finalSubject,
            finalMessage,
            null, // HTML version will be auto-generated from text
            attachments.length > 0 ? attachments : undefined
          );
          
          console.log(`✅ Email sent successfully to ${lead.businessName} (${lead.email})`);
          sentCount++;
          // Track daily email send
          trackDailyMessageSend(userId, 'email', 1);
        } catch (error) {
          console.error(`❌ Error sending email to ${lead.businessName} (${lead.email}):`, error.message);
          failedCount++;
        }
      }
    }
    
    // Update campaign with results - mark as Completed
    campaign.status = 'Completed';
    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    campaign.updatedAt = new Date().toISOString();
    campaign.sentAt = new Date().toISOString();
    writeCampaigns(campaigns);
    
    res.json({
      success: true,
      message: `Campaign sent successfully. ${sentCount} sent, ${failedCount} failed.`,
      sentCount,
      failedCount
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    
    // Update campaign status to failed
    const campaigns = readCampaigns();
    const campaignIndex = campaigns.findIndex(
      c => c.id === req.params.id && c.userId === req.user.id
    );
    if (campaignIndex !== -1) {
      campaigns[campaignIndex].status = 'Failed';
      campaigns[campaignIndex].updatedAt = new Date().toISOString();
      writeCampaigns(campaigns);
    }
    
    res.status(500).json({
      error: 'Failed to send campaign',
      message: error.message
    });
  }
});

// Schedule a campaign
app.post('/api/campaigns/:id/schedule', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;
    const { scheduledAt } = req.body;
    
    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required' });
    }
    
    // Parse the scheduled time (should be in format with timezone or ISO string)
    const scheduledDate = new Date(scheduledAt);
    
    // Get current time in Sri Lankan timezone for comparison
    const now = new Date();
    const sriLankanNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
    const sriLankanScheduled = new Date(scheduledDate.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
    
    // Compare in Sri Lankan time
    if (sriLankanScheduled <= sriLankanNow) {
      return res.status(400).json({ error: 'Scheduled time must be in the future (Sri Lankan Time)' });
    }
    
    const campaigns = readCampaigns();
    const campaignIndex = campaigns.findIndex(
      c => c.id === campaignId && c.userId === userId
    );
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const campaign = campaigns[campaignIndex];
    
    if (campaign.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft campaigns can be scheduled' });
    }
    
    // Store the scheduled time as ISO string (backend will handle timezone conversion when checking)
    campaign.status = 'Scheduled';
    campaign.scheduledAt = scheduledDate.toISOString();
    campaign.updatedAt = new Date().toISOString();
    writeCampaigns(campaigns);
    
    res.json({
      success: true,
      message: 'Campaign scheduled successfully',
      campaign: campaign
    });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    res.status(500).json({
      error: 'Failed to schedule campaign',
      message: error.message
    });
  }
});

// Delete a campaign
app.delete('/api/campaigns/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;
    
    const campaigns = readCampaigns();
    const campaignIndex = campaigns.findIndex(
      c => c.id === campaignId && c.userId === userId
    );
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    campaigns.splice(campaignIndex, 1);
    writeCampaigns(campaigns);
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      error: 'Failed to delete campaign',
      message: error.message
    });
  }
});

// SMTP Configuration Routes
// Get SMTP configuration for user
app.get('/api/smtp/config', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const configs = readSmtpConfigs();
    const userConfig = configs[userId] || null;
    
    // Don't send password in response
    if (userConfig) {
      const { password, ...configWithoutPassword } = userConfig;
      res.json({
        connected: !!userConfig,
        config: configWithoutPassword
      });
    } else {
      res.json({
        connected: false,
        config: null
      });
    }
  } catch (error) {
    console.error('Error getting SMTP config:', error);
    res.status(500).json({
      error: 'Failed to get SMTP configuration',
      message: error.message
    });
  }
});

// Save SMTP configuration for user
app.post('/api/smtp/config', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { host, port, username, password, secure } = req.body;
    
    if (!host || !port || !username || !password) {
      return res.status(400).json({ error: 'Host, port, username, and password are required' });
    }
    
    const configs = readSmtpConfigs();
    configs[userId] = {
      host,
      port: parseInt(port),
      username,
      password, // Store password (in production, should be encrypted)
      secure: secure || false,
      updatedAt: new Date().toISOString()
    };
    
    if (writeSmtpConfigs(configs)) {
      res.json({
        success: true,
        message: 'SMTP configuration saved successfully',
        config: {
          host,
          port: parseInt(port),
          username,
          secure: secure || false
        }
      });
    } else {
      res.status(500).json({
        error: 'Failed to save SMTP configuration'
      });
    }
  } catch (error) {
    console.error('Error saving SMTP config:', error);
    res.status(500).json({
      error: 'Failed to save SMTP configuration',
      message: error.message
    });
  }
});

// Delete SMTP configuration for user
app.delete('/api/smtp/config', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const configs = readSmtpConfigs();
    
    if (configs[userId]) {
      delete configs[userId];
      writeSmtpConfigs(configs);
      res.json({
        success: true,
        message: 'SMTP configuration deleted successfully'
      });
    } else {
      res.status(404).json({ error: 'SMTP configuration not found' });
    }
  } catch (error) {
    console.error('Error deleting SMTP config:', error);
    res.status(500).json({
      error: 'Failed to delete SMTP configuration',
      message: error.message
    });
  }
});

// Analytics Routes
// Get analytics for user
app.get('/api/analytics', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const analytics = readAnalytics();
    const leads = readLeads();
    const campaigns = readCampaigns();
    
    // Get user-specific analytics (for searches counter and daily sends tracking)
    const userAnalytics = analytics[userId] || {
      searches: 0,
      savedLeads: 0,
      followups: 0,
      dailySends: {}
    };
    
    // Calculate all metrics from REAL DATA sources (not stored values)
    
    // 1. Total Searches - from tracked counter (incremented on each search)
    const totalSearches = userAnalytics.searches || 0;
    
    // 2. Saved Leads - REAL COUNT from leads array
    const savedLeadsCount = leads.filter(lead => lead.userId === userId).length;
    
    // 3. Followups - REAL COUNT from leads with followup status
    const followupsCount = leads.filter(
      lead => lead.userId === userId && lead.followupStatus && lead.followupStatus !== 'none'
    ).length;
    
    // 4. Total Campaigns - REAL COUNT from campaigns array
    const userCampaigns = campaigns.filter(c => c.userId === userId);
    const totalCampaigns = userCampaigns.length;
    
    // 5. Total Messages Sent - REAL SUM from campaign sentCount values
    const totalSent = userCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    
    // 6. Total Failed Messages - REAL SUM from campaign failedCount values
    const totalFailed = userCampaigns.reduce((sum, c) => sum + (c.failedCount || 0), 0);
    
    // 7. Daily Sends Data - from tracked daily sends (last 30 days)
    const dailySends = userAnalytics.dailySends || {};
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        email: dailySends[dateStr]?.email || 0,
        whatsapp: dailySends[dateStr]?.whatsapp || 0
      });
    }
    
    // Return all REAL DATA (calculated from actual sources)
    res.json({
      searches: totalSearches,
      savedLeads: savedLeadsCount,
      followups: followupsCount,
      totalCampaigns,
      totalSent,
      totalFailed,
      dailySends: last30Days
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error.message
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method,
    path: req.path,
    availableRoutes: ['GET /', 'GET /health', 'POST /api/search']
  });
});

// Start server
// Initialize data files before starting server
initializeDataFiles();

// Campaign Scheduler - Check for scheduled campaigns every minute
const checkScheduledCampaigns = async () => {
  try {
    const campaigns = readCampaigns();
    const now = new Date();
    
    // Find campaigns that are scheduled and ready to send
    const readyCampaigns = campaigns.filter(campaign => {
      if (campaign.status !== 'Scheduled' || !campaign.scheduledAt) {
        return false;
      }
      
      const scheduledTime = new Date(campaign.scheduledAt);
      
      // Convert both times to Sri Lankan timezone for accurate comparison
      const sriLankanNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
      const sriLankanScheduled = new Date(scheduledTime.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
      
      // Send if scheduled time has passed (within 1 minute tolerance)
      // Compare in Sri Lankan time
      const timeDiff = sriLankanNow - sriLankanScheduled;
      return timeDiff >= 0 && timeDiff < 60000; // 1 minute window
    });
    
    for (const campaign of readyCampaigns) {
      try {
        console.log(`⏰ Sending scheduled campaign: ${campaign.name}`);
        
        // Update status to Live
        campaign.status = 'Live';
        campaign.updatedAt = new Date().toISOString();
        writeCampaigns(campaigns);
        
        // Get campaign leads
        const leads = readLeads();
        const campaignLeads = leads.filter(lead => 
          campaign.leadIds.includes(lead.id) && lead.userId === campaign.userId
        );
        
        if (campaignLeads.length === 0) {
          campaign.status = 'Failed';
          campaign.updatedAt = new Date().toISOString();
          writeCampaigns(campaigns);
          continue;
        }
        
        let sentCount = 0;
        let failedCount = 0;
        
        if (campaign.type === 'whatsapp') {
          // Check if WhatsApp is connected
          if (!whatsappClient) {
            campaign.status = 'Failed';
            campaign.updatedAt = new Date().toISOString();
            writeCampaigns(campaigns);
            continue;
          }
          
          let isConnected = false;
          try {
            if (whatsappReady) {
              isConnected = true;
            } else if (whatsappClient.info && whatsappClient.info.wid) {
              isConnected = true;
              whatsappReady = true;
            }
          } catch (error) {
            console.error('Error checking WhatsApp connection:', error);
          }
          
          if (!isConnected) {
            campaign.status = 'Failed';
            campaign.updatedAt = new Date().toISOString();
            writeCampaigns(campaigns);
            continue;
          }
          
          // Send WhatsApp messages (reuse the same logic from send endpoint)
          for (let i = 0; i < campaignLeads.length; i++) {
            const lead = campaignLeads[i];
            try {
              // Add random delay between messages (5-10 seconds) except for the first message
              if (i > 0) {
                const delaySeconds = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
              }
              
              const formattedPhone = formatPhoneForWhatsApp(lead.phone, lead.country || 'Sri Lanka');
              
              if (formattedPhone && formattedPhone.length >= 10) {
                let message = campaign.template?.message || '';
                
                if (typeof message !== 'string') {
                  message = String(message);
                }
                
                message = message.replace(/\{businessName\}/g, lead.businessName || '');
                message = message.replace(/\{phone\}/g, lead.phone || '');
                message = message.replace(/\{email\}/g, lead.email || '');
                message = message.replace(/\{address\}/g, lead.address || '');
                message = message.trim();
                
                if (!message || message.length === 0) {
                  failedCount++;
                  continue;
                }
                
                let finalMessage = String(message).trim();
                finalMessage = finalMessage.replace(/\0/g, '').replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
                
                if (!finalMessage || finalMessage.length === 0) {
                  failedCount++;
                  continue;
                }
                
                const chatId = `${formattedPhone}@c.us`;
                
                if (!/^\d+@c\.us$/.test(chatId)) {
                  failedCount++;
                  continue;
                }
                
                if (campaign.template?.image) {
                  const imagePath = path.join(IMAGES_DIR, path.basename(campaign.template.image));
                  if (fs.existsSync(imagePath)) {
                    const { MessageMedia } = require('whatsapp-web.js');
                    const media = MessageMedia.fromFilePath(imagePath);
                    await whatsappClient.sendMessage(chatId, media, { caption: finalMessage });
                  } else {
                    await whatsappClient.sendMessage(chatId, finalMessage);
                  }
                } else {
                  await whatsappClient.sendMessage(chatId, finalMessage);
                }
                sentCount++;
              } else {
                failedCount++;
              }
            } catch (error) {
              console.error(`Error sending scheduled WhatsApp to ${lead.businessName}:`, error);
              failedCount++;
            }
          }
        } else if (campaign.type === 'email') {
          // Check if SMTP is configured
          const configs = readSmtpConfigs();
          const smtpConfig = configs[campaign.userId];
          
          if (!smtpConfig) {
            campaign.status = 'Failed';
            campaign.updatedAt = new Date().toISOString();
            writeCampaigns(campaigns);
            console.error(`❌ SMTP configuration not found for user ${campaign.userId}`);
            continue;
          }
          
          // Get template message and subject
          let emailSubject = campaign.template?.subject || 'Campaign Message';
          let emailMessage = campaign.template?.message || '';
          
          // Send emails with random delay between messages (5-10 seconds)
          for (let i = 0; i < campaignLeads.length; i++) {
            const lead = campaignLeads[i];
            try {
              // Add random delay between messages except for the first one
              if (i > 0) {
                const delaySeconds = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
              }
              
              if (!lead.email || !lead.email.includes('@')) {
                console.log(`Invalid email for ${lead.businessName}: ${lead.email}`);
                failedCount++;
                continue;
              }
              
              // Replace template variables
              let finalSubject = emailSubject;
              let finalMessage = emailMessage;
              
              finalSubject = finalSubject.replace(/\{businessName\}/g, lead.businessName || '');
              finalSubject = finalSubject.replace(/\{phone\}/g, lead.phone || '');
              finalSubject = finalSubject.replace(/\{email\}/g, lead.email || '');
              finalSubject = finalSubject.replace(/\{address\}/g, lead.address || '');
              
              finalMessage = finalMessage.replace(/\{businessName\}/g, lead.businessName || '');
              finalMessage = finalMessage.replace(/\{phone\}/g, lead.phone || '');
              finalMessage = finalMessage.replace(/\{email\}/g, lead.email || '');
              finalMessage = finalMessage.replace(/\{address\}/g, lead.address || '');
              
              // Prepare attachments if template has image
              let attachments = [];
              if (campaign.template?.image) {
                const imagePath = path.join(IMAGES_DIR, path.basename(campaign.template.image));
                if (fs.existsSync(imagePath)) {
                  attachments.push({
                    filename: path.basename(campaign.template.image),
                    path: imagePath
                  });
                }
              }
              
              // Send email
              await sendEmail(
                campaign.userId,
                lead.email,
                finalSubject,
                finalMessage,
                null, // HTML version will be auto-generated from text
                attachments.length > 0 ? attachments : undefined
              );
              
              console.log(`✅ Email sent successfully to ${lead.businessName} (${lead.email})`);
              sentCount++;
            } catch (error) {
              console.error(`❌ Error sending email to ${lead.businessName} (${lead.email}):`, error.message);
              failedCount++;
            }
          }
        }
        
        // Update campaign with results
        campaign.status = 'Completed';
        campaign.sentCount = sentCount;
        campaign.failedCount = failedCount;
        campaign.updatedAt = new Date().toISOString();
        campaign.sentAt = new Date().toISOString();
        writeCampaigns(campaigns);
        
        console.log(`✅ Scheduled campaign "${campaign.name}" completed: ${sentCount} sent, ${failedCount} failed`);
      } catch (error) {
        console.error(`Error processing scheduled campaign ${campaign.name}:`, error);
        campaign.status = 'Failed';
        campaign.updatedAt = new Date().toISOString();
        writeCampaigns(campaigns);
      }
    }
  } catch (error) {
    console.error('Error checking scheduled campaigns:', error);
  }
};

// Run scheduler every minute
setInterval(checkScheduledCampaigns, 60000); // Check every 60 seconds

// Catch-all handler: send back React's index.html file for client-side routing
// This must be after all API routes but before app.listen
app.get('*', (req, res) => {
  // Don't handle API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(FRONTEND_BUILD_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not built. Please build the frontend first.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('⏰ Campaign scheduler started (checking every minute)');
  console.log('Available routes:');
  console.log('  GET  /');
  console.log('  GET  /health');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/me (protected)');
  console.log('  POST /api/auth/logout (protected)');
  console.log('  GET  /api/whatsapp/qrcode (protected)');
  console.log('  GET  /api/whatsapp/status (protected)');
  console.log('  POST /api/whatsapp/disconnect (protected)');
  console.log('  GET  /api/settings/profile (protected)');
  console.log('  POST /api/settings/profile (protected)');
  console.log('  POST /api/settings/password (protected)');
  console.log('  GET  /api/notifications (protected)');
  console.log('  GET  /api/notifications/unread (protected)');
  console.log('  POST /api/notifications (protected)');
  console.log('  PUT  /api/notifications/:id/read (protected)');
  console.log('  PUT  /api/notifications/read-all (protected)');
  console.log('  DELETE /api/notifications/:id (protected)');
  console.log('  GET  /api/analytics (protected)');
  console.log('  POST /api/search (protected)');
  console.log('  GET  /api/leads (protected)');
  console.log('  POST /api/leads (protected)');
  console.log('  DELETE /api/leads/:id (protected)');
  console.log('  GET  /api/templates (protected)');
  console.log('  GET  /api/templates/:id (protected)');
  console.log('  POST /api/templates (protected)');
  console.log('  PUT  /api/templates/:id (protected)');
  console.log('  DELETE /api/templates/:id (protected)');
  console.log('  GET  /api/campaigns (protected)');
  console.log('  GET  /api/campaigns/:id (protected)');
  console.log('  POST /api/campaigns (protected)');
  console.log('  POST /api/campaigns/:id/send (protected)');
  console.log('  DELETE /api/campaigns/:id (protected)');
  console.log('  GET  /api/images/* (static files)');
  console.log('  GET  /* (frontend - serves React app)');
  
  if (fs.existsSync(FRONTEND_BUILD_DIR)) {
    console.log('✅ Frontend build directory found - serving frontend from backend');
  } else {
    console.log('⚠️  Frontend build directory not found - run "npm run build" in frontend directory');
  }
});

