import './env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initializeMailer, checkEmailConfigStatus } from './services/mailer.js';
import { checkSmsConfigStatus } from './services/smsService.js';
import { checkTurnstileConfigStatus } from './services/captchaService.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import './database/db.js'; // Ensure database is initialized

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow Vite frontend scripts and Cloudflare Turnstile
  crossOriginEmbedderPolicy: false
}));

// Cookie Parser for HTTP-only session cookies
app.use(cookieParser());

// CORS Configuration with Credentials support
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback for flexible deployment
    }
  },
  credentials: true
}));

app.use(express.json());

// Request logging (sanitizing passwords/OTPs from logs)
app.use((req, res, next) => {
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';
  if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
  if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
  if (sanitizedBody.code) sanitizedBody.code = '[REDACTED_OTP]';
  if (sanitizedBody.captchaToken) sanitizedBody.captchaToken = '[REDACTED_CAPTCHA]';
  if (sanitizedBody.turnstileToken) sanitizedBody.turnstileToken = '[REDACTED_CAPTCHA]';
  
  if (req.method !== 'GET') {
    console.log(`[API ${req.method}] ${req.originalUrl}`, Object.keys(sanitizedBody).length ? sanitizedBody : '');
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Aaroh Marketplace Authentication & Identity Engine',
    timestamp: new Date().toISOString()
  });
});

// In production, serve the frontend build from dist folder
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Uncaught Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error.' });
});

// Boot server and print clear startup configuration check
app.listen(PORT, async () => {
  const emailStatus = checkEmailConfigStatus();
  const smsStatus = checkSmsConfigStatus();
  const turnstileStatus = checkTurnstileConfigStatus();

  console.log(`\n=======================================================`);
  console.log(`🪷 Aaroh Authentication Backend running on port ${PORT}`);
  console.log(`📡 Health Check:     http://localhost:${PORT}/api/health`);
  console.log(`🔍 Gateway Status:   http://localhost:${PORT}/api/auth/service-status`);
  console.log(`🛡️ Admin API:        http://localhost:${PORT}/api/admin/stats`);
  console.log(`-------------------------------------------------------`);
  console.log(`📧 [Email OTP - Gmail / SMTP Configuration Status]`);
  console.log(`   • SMTP_HOST:      ${emailStatus.hostValid ? `[Configured] (${emailStatus.host})` : '[MISSING]'}`);
  console.log(`   • SMTP_PORT:      ${emailStatus.portValid ? `[Configured] (${emailStatus.port})` : '[MISSING]'}`);
  console.log(`   • SMTP_USER:      ${emailStatus.userConfigured ? '[Configured]' : '[MISSING / PLACEHOLDER]'}`);
  console.log(`   • SMTP_PASS:      ${emailStatus.passConfigured ? '[Configured]' : '[MISSING / PLACEHOLDER]'}`);
  console.log(`   • EMAIL_FROM:     ${emailStatus.fromConfigured ? '[Configured]' : '[MISSING / PLACEHOLDER]'}`);
  if (emailStatus.configured) {
    console.log(`   Status: 🟢 Configured (${emailStatus.provider})`);
  } else {
    console.log(`   Status: ⚠️ NOT READY (Missing in server/.env: ${emailStatus.missing.join(', ')})`);
  }
  console.log(`-------------------------------------------------------`);
  console.log(`📱 [Twilio SMS OTP - Verify API Configuration Status]`);
  console.log(`   • TWILIO_ACCOUNT_SID:        ${smsStatus.accountSidConfigured ? '[Configured]' : '[MISSING]'}`);
  console.log(`   • TWILIO_AUTH_TOKEN:         ${smsStatus.authTokenConfigured ? '[Configured]' : '[MISSING]'}`);
  console.log(`   • TWILIO_VERIFY_SERVICE_SID: ${smsStatus.verifyServiceSidConfigured ? '[Configured]' : '[MISSING]'}`);
  if (smsStatus.configured) {
    console.log(`   Status: 🟢 Configured (Twilio Verify)`);
  } else {
    console.log(`   Status: ⚠️ NOT READY (Missing in server/.env: ${smsStatus.missing.join(', ')})`);
  }
  console.log(`-------------------------------------------------------`);
  console.log(`🛡️ [Cloudflare Turnstile CAPTCHA Status]`);
  console.log(`   • TURNSTILE_SECRET_KEY:      ${turnstileStatus.configured ? (turnstileStatus.isTestKey ? '[Configured - Test Key]' : '[Configured - Live]') : '[MISSING]'}`);
  if (turnstileStatus.configured) {
    console.log(`   Status: 🟢 Configured (${turnstileStatus.provider})`);
  } else {
    console.log(`   Status: ⚠️ NOT READY (Missing in server/.env: TURNSTILE_SECRET_KEY)`);
  }
  console.log(`=======================================================\n`);

  if (emailStatus.configured) {
    await initializeMailer();
  }
});


export default app;
