import '../env.js';
import { reloadEnv } from '../env.js';
import nodemailer from 'nodemailer';

let transporter = null;
let lastCredentialSignature = '';

/**
 * Validates whether real, non-placeholder SMTP configuration is present
 */
export const checkEmailConfigStatus = () => {
  reloadEnv();
  const host = (process.env.SMTP_HOST || '').trim();
  const port = (process.env.SMTP_PORT || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const from = (process.env.EMAIL_FROM || '').trim();

  // Reset cached transporter if credentials changed on disk
  const currentSignature = `${host}:${port}:${user}:${pass}`;
  if (lastCredentialSignature && lastCredentialSignature !== currentSignature) {
    transporter = null;
  }
  lastCredentialSignature = currentSignature;


  const isPlaceholderUser = (u) => {
    if (!u) return true;
    const lower = u.toLowerCase();
    return (
      lower.includes('your') ||
      lower.includes('example') ||
      lower.includes('xxxx') ||
      !lower.includes('@')
    );
  };

  const isPlaceholderPass = (p) => {
    if (!p) return true;
    const lower = p.toLowerCase();
    return (
      lower.includes('your') ||
      lower.includes('xxxx') ||
      lower.includes('password') ||
      p.length < 8
    );
  };

  const isPlaceholderFrom = (f) => {
    if (!f) return true;
    const lower = f.toLowerCase();
    return lower.includes('your');
  };

  const isHostValid = Boolean(host);
  const isPortValid = Boolean(port && !isNaN(parseInt(port, 10)));
  const isUserValid = Boolean(user && !isPlaceholderUser(user));
  const isPassValid = Boolean(pass && !isPlaceholderPass(pass));
  const isFromValid = Boolean(from && !isPlaceholderFrom(from));

  const missing = [];
  if (!isHostValid) missing.push('SMTP_HOST');
  if (!isPortValid) missing.push('SMTP_PORT');
  if (!isUserValid) missing.push('SMTP_USER');
  if (!isPassValid) missing.push('SMTP_PASS');
  if (!isFromValid) missing.push('EMAIL_FROM');

  const realSmtpConfigured = isHostValid && isPortValid && isUserValid && isPassValid;

  if (realSmtpConfigured) {
    return {
      configured: true,
      isEthereal: false,
      provider: host.toLowerCase().includes('gmail') ? 'Gmail SMTP' : 'Custom SMTP',
      host,
      port: parseInt(port, 10),
      hostValid: true,
      portValid: true,
      userConfigured: true,
      passConfigured: true,
      fromConfigured: isFromValid,
      missing: []
    };
  }

  // Development-only Ethereal Test Mailbox fallback
  const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
  const isEtherealAllowed = process.env.ALLOW_ETHEREAL_DEV_MAIL === 'true' && isDevelopment;

  if (isEtherealAllowed) {
    return {
      configured: true,
      isEthereal: true,
      provider: 'Nodemailer Ethereal Sandbox (Development Only)',
      host: 'smtp.ethereal.email',
      port: 587,
      hostValid: true,
      portValid: true,
      userConfigured: true,
      passConfigured: true,
      fromConfigured: true,
      missing: []
    };
  }

  return {
    configured: false,
    isEthereal: false,
    provider: 'None (Unconfigured)',
    host: host || 'Not set',
    port: port ? parseInt(port, 10) : 465,
    hostValid: isHostValid,
    portValid: isPortValid,
    userConfigured: isUserValid,
    passConfigured: isPassValid,
    fromConfigured: isFromValid,
    missing
  };
};

export const isEmailConfigured = () => {
  return checkEmailConfigStatus().configured;
};

export const getEmailProviderInfo = () => {
  const status = checkEmailConfigStatus();
  if (status.configured) {
    return `${status.provider} (${status.host}:${status.port})`;
  }
  return 'None (Not Configured)';
};

/**
 * Initialize email transport based on environment variables
 */
export const initializeMailer = async () => {
  const status = checkEmailConfigStatus();

  if (status.configured && !status.isEthereal) {
    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = (process.env.SMTP_USER || '').trim();
    // Google App Passwords are 16 characters often grouped with spaces (e.g. "abcd efgh ijkl mnop")
    const pass = (process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');
    const isSecure = port === 465;

    const isGmail = host.toLowerCase().includes('gmail');
    const transportConfig = isGmail
      ? {
          host: 'smtp.gmail.com',
          port: port,
          secure: isSecure,
          auth: { user, pass }
        }
      : {
          host,
          port,
          secure: isSecure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false
          }
        };

    transporter = nodemailer.createTransport(transportConfig);

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log(`✅ [Aaroh Mailer] Verified live connection to ${host}:${port} (${status.provider}). Ready to dispatch real OTPs.`);
    } catch (verifyErr) {
      console.error(`❌ [Aaroh Mailer] SMTP Authentication Failed for ${user} on ${host}:${port}:`, verifyErr.message);
      console.error(`   ℹ️ If using Gmail: ensure 2-Step Verification is enabled and use a 16-character App Password (not your personal Google account password).`);
    }

    return transporter;
  }

  const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
  if (status.isEthereal && isDevelopment) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`✅ [Aaroh Mailer] Ethereal SMTP test mailbox initialized (${testAccount.user}) [Development Only].`);
      console.log(`   ℹ️ Simulated OTP emails will output clickable preview URLs in this terminal.`);
      return transporter;
    } catch (etherealErr) {
      console.warn('[Aaroh Mailer] Failed to initialize Ethereal account:', etherealErr.message);
    }
  }

  console.log(`⚠️ [Aaroh Mailer] Real SMTP credentials not configured in server/.env.`);
  console.log(`   Missing: ${status.missing.join(', ')}`);
  return null;
};

/**
 * Send real 6-digit OTP verification email via SMTP
 */
export const sendOtpEmail = async ({ toEmail, otpCode, verificationLink, purpose = 'signup', userName = 'Valued Collector' }) => {
  const cleanEmail = toEmail.trim().toLowerCase();
  const status = checkEmailConfigStatus();

  // If real SMTP is not configured, throw descriptive configuration error
  if (!status.configured) {
    const err = new Error(
      `Email verification service is not configured. Missing in server/.env: ${status.missing.join(', ')}.`
    );
    err.status = 503;
    err.code = 'EMAIL_SERVICE_NOT_CONFIGURED';
    err.requiredVariables = status.missing;
    throw err;
  }

  if (!transporter) {
    await initializeMailer();
  }

  if (!transporter) {
    const err = new Error("Email verification service could not be initialized. Please check SMTP configuration.");
    err.status = 500;
    throw err;
  }

  const user = (process.env.SMTP_USER || '').trim();
  const fromAddress = process.env.EMAIL_FROM || `"Aaroh Living Crafts" <${user}>`;
  const isForgot = purpose === 'forgot_password';
  const isLogin = purpose === 'login';
  const subject = isForgot 
    ? `Your Aaroh Password Reset Code: ${otpCode}`
    : isLogin
    ? `Your Aaroh Login Verification Code: ${otpCode}`
    : `Verify your AAROH account`;

  const purposeText = isForgot
    ? "We received a request to securely reset the password for your Aaroh account."
    : isLogin
    ? "We received a request to securely sign in to your Aaroh account. Use the verification code below to complete your sign-in."
    : "Welcome to AAROH, India's living cultural craft journal and fair-trade artisan marketplace. Please verify your email address to activate your account.";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Georgia', serif; background-color: #FAF5EB; margin: 0; padding: 24px; color: #1C2638; }
        .card { max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #EBE4D5; padding: 36px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .brand { text-align: center; margin-bottom: 24px; }
        .brand-logo { font-size: 32px; display: block; margin-bottom: 6px; }
        .brand-name { font-size: 24px; font-weight: bold; color: #1A3459; letter-spacing: 0.05em; }
        .brand-tag { font-size: 13px; color: #7E8BA0; text-transform: uppercase; letter-spacing: 0.1em; }
        .code-box { background: #FAF5EB; border: 2px dashed #C25634; border-radius: 8px; text-align: center; padding: 20px; margin: 24px 0; }
        .otp-number { font-family: 'Courier New', monospace; font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #1A3459; margin: 0; }
        .expire-notice { font-size: 13px; color: #C25634; margin-top: 8px; font-weight: 600; }
        .info-p { font-size: 15px; line-height: 1.6; color: #3A475C; margin: 14px 0; }
        .cta-btn { display: inline-block; background-color: #1A3459; color: #FAF5EB !important; padding: 13px 32px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px; letter-spacing: 0.05em; }
        .security-badge { background: #EEF3E4; border: 1px solid #68793D; border-radius: 6px; padding: 12px; font-size: 12px; color: #2D4C3A; margin-top: 24px; }
        .footer { text-align: center; font-size: 12px; color: #7E8BA0; margin-top: 28px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">
          <span class="brand-logo">🪷</span>
          <div class="brand-name">Aaroh</div>
          <div class="brand-tag">Living Heritage Crafts & Cultural Journal</div>
        </div>

        <p class="info-p">Welcome to AAROH, ${userName}.</p>
        <p class="info-p">${purposeText}</p>

        <div class="code-box">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #7E8BA0; margin-bottom: 6px;">
            Your verification code is:
          </div>
          <div class="otp-number">${otpCode}</div>
          <div class="expire-notice">This code expires in 5 minutes.</div>
        </div>

        ${verificationLink ? `
          <div style="text-align: center; margin: 26px 0; padding: 18px; background: #FAF5EB; border-radius: 8px;">
            <p style="font-size: 14px; color: #3A475C; margin: 0 0 14px; font-weight: 600;">You can also verify your email by clicking:</p>
            <a href="${verificationLink}" class="cta-btn" target="_blank" rel="noopener noreferrer">Verify My Email</a>
            <p style="font-size: 11px; color: #7E8BA0; margin: 12px 0 0; word-break: break-all;">
              Or copy this link: <a href="${verificationLink}" style="color: #C25634;">${verificationLink}</a>
            </p>
          </div>
        ` : ''}

        <p class="info-p" style="font-size: 13px; color: #525E75;">
          Enter this verification code on the AAROH website to complete your verification. Never share this code with anyone.
        </p>

        <div class="security-badge">
          🛡️ <strong>Fair Trade Security Guarantee:</strong> All artisan guild transactions and collector communications are cryptographically verified.
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Aaroh Cultural Crafts Guild<br>
          If you did not initiate this request, you can safely ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const textBody = verificationLink
      ? `Welcome to AAROH, ${userName}.\n\nYour verification code is: ${otpCode}\n\nThis code expires in 5 minutes.\n\nYou can also verify your email by clicking:\nVerify My Email: ${verificationLink}\n\nThis code is valid for 5 minutes and is single-use.`
      : `Welcome to AAROH, ${userName}.\n\nYour verification code is: ${otpCode}\n\nThis code expires in 5 minutes.\n\nThis code is valid for 5 minutes and is single-use.`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject,
      text: textBody,
      html: htmlContent
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n=======================================================`);
      console.log(`📧 [Aaroh Test Mailer - Ethereal Sandbox (Development Only)]`);
      console.log(`   ⚠️ NOTICE: This is a simulated test email. It does NOT deliver to the user's actual Gmail inbox.`);
      console.log(`   📨 Recipient: ${cleanEmail}`);
      console.log(`   🔗 Ethereal Preview URL: ${previewUrl}`);
      console.log(`   💡 Open the preview link above to inspect the rendered email and code.`);
      console.log(`=======================================================\n`);
    } else {
      console.log(`[Aaroh Mailer] Real email successfully dispatched to ${cleanEmail} (Message ID: ${info.messageId})`);
    }
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null
    };
  } catch (sendErr) {
    console.error(`[Aaroh Mailer] Delivery failure to ${cleanEmail}:`, sendErr.message);
    let friendlyMessage = `Failed to send verification email: ${sendErr.message}`;
    if (sendErr.code === 'EAUTH' || sendErr.responseCode === 535) {
      friendlyMessage = "SMTP Authentication failed. Please verify your SMTP_USER and SMTP_PASS in server/.env (ensure 2-Step Verification is enabled and use a 16-character Google App Password).";
    } else if (sendErr.code === 'ESOCKET' || sendErr.code === 'ETIMEDOUT' || sendErr.code === 'ECONNREFUSED') {
      friendlyMessage = `Could not connect to SMTP server at ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Please check network connection and port settings.`;
    }
    const err = new Error(friendlyMessage);
    err.status = 502;
    err.code = 'EMAIL_DELIVERY_FAILED';
    throw err;
  }
};

/**
 * Send password reset confirmation email via SMTP
 */
export const sendPasswordResetSuccessEmail = async ({ toEmail, userName = 'Valued Collector' }) => {
  const cleanEmail = toEmail.trim().toLowerCase();
  const status = checkEmailConfigStatus();

  if (!status.configured) {
    return { success: false, reason: 'NOT_CONFIGURED' };
  }

  if (!transporter) {
    await initializeMailer();
  }

  if (!transporter) return { success: false, reason: 'NO_TRANSPORTER' };

  const user = (process.env.SMTP_USER || '').trim();
  const fromAddress = process.env.EMAIL_FROM || `"Aaroh Living Crafts" <${user}>`;
  const subject = `Your Aaroh Password Has Been Reset`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Georgia', serif; background-color: #FAF5EB; margin: 0; padding: 24px; color: #1C2638; }
        .card { max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #EBE4D5; padding: 36px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .brand { text-align: center; margin-bottom: 24px; }
        .brand-logo { font-size: 32px; display: block; margin-bottom: 6px; }
        .brand-name { font-size: 24px; font-weight: bold; color: #1A3459; letter-spacing: 0.05em; }
        .brand-tag { font-size: 13px; color: #7E8BA0; text-transform: uppercase; letter-spacing: 0.1em; }
        .notice-box { background: #EEF3E4; border: 1px solid #68793D; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center; }
        .info-p { font-size: 15px; line-height: 1.6; color: #3A475C; margin: 14px 0; }
        .footer { text-align: center; font-size: 12px; color: #7E8BA0; margin-top: 28px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">
          <span class="brand-logo">🪷</span>
          <div class="brand-name">Aaroh</div>
          <div class="brand-tag">Living Heritage Crafts & Cultural Journal</div>
        </div>

        <p class="info-p">Hello ${userName},</p>
        <div class="notice-box">
          <strong style="color: #2D4C3A; font-size: 16px;">Security Notice: Password Reset Successful</strong>
          <p style="margin: 8px 0 0; font-size: 13px; color: #3A475C;">Your account password was just successfully changed.</p>
        </div>
        <p class="info-p">
          If you initiated this change, no further action is needed. You may now log in using your new credentials.
        </p>
        <p class="info-p" style="color: #C25634; font-weight: 600;">
          If you did NOT change your password, please contact our fair-trade security team immediately.
        </p>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Aaroh Cultural Crafts Guild
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject,
      text: `Hello ${userName},\n\nYour Aaroh account password was successfully reset on ${new Date().toUTCString()}.\n\nIf you did not perform this action, please contact support immediately.`,
      html: htmlContent
    });
    return { success: true };
  } catch (err) {
    console.warn('[Aaroh Mailer] Password reset confirmation email notice:', err.message);
    return { success: false, error: err.message };
  }
};

export default { 
  initializeMailer, 
  sendOtpEmail, 
  sendPasswordResetSuccessEmail,
  isEmailConfigured, 
  checkEmailConfigStatus, 
  getEmailProviderInfo 
};

