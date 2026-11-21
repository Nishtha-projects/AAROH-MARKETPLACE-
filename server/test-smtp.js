/**
 * Standalone SMTP Connectivity & Live Email Delivery Test Script for Aaroh
 * Usage:
 *   node server/test-smtp.js [optional_recipient_email]
 */

import './env.js';
import nodemailer from 'nodemailer';
import { checkEmailConfigStatus } from './services/mailer.js';

async function runSmtpTest() {
  console.log('\n=======================================================');
  console.log('🧪 AAROH SMTP Connectivity & Live Delivery Test');
  console.log('=======================================================');

  const status = checkEmailConfigStatus();

  console.log('Configuration Inspection:');
  console.log(`  • Host:     ${status.host}`);
  console.log(`  • Port:     ${status.port}`);
  console.log(`  • User:     ${status.userConfigured ? '[Configured]' : '[MISSING / PLACEHOLDER]'}`);
  console.log(`  • Password: ${status.passConfigured ? '[Configured]' : '[MISSING / PLACEHOLDER]'}`);
  console.log(`  • From:     ${status.fromConfigured ? '[Configured]' : '[MISSING / PLACEHOLDER]'}`);
  console.log(`  • Provider: ${status.provider}`);
  console.log('-------------------------------------------------------');

  if (!status.configured) {
    console.log('❌ Result: SMTP is NOT fully configured in server/.env.');
    console.log(`   Missing variables: ${status.missing.join(', ')}`);
    console.log('\n📋 How to configure Gmail SMTP:');
    console.log('   1. Visit your Google Account Security: https://myaccount.google.com/security');
    console.log('   2. Ensure 2-Step Verification is turned ON.');
    console.log('   3. Generate an App Password: https://myaccount.google.com/apppasswords');
    console.log('      (Select "Mail" and "Other", name it "Aaroh")');
    console.log('   4. Copy the generated 16-character password (e.g. "abcd efgh ijkl mnop").');
    console.log('   5. Open server/.env and replace:');
    console.log('      SMTP_HOST=smtp.gmail.com');
    console.log('      SMTP_PORT=465');
    console.log('      SMTP_USER=your actual email (e.g. user@gmail.com)');
    console.log('      SMTP_PASS=your 16-character app password');
    console.log('      EMAIL_FROM="Aaroh Living Crafts" <user@gmail.com>');
    console.log('=======================================================\n');
    return { success: false, reason: 'NOT_CONFIGURED', missing: status.missing };
  }

  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');
  const from = process.env.EMAIL_FROM || user;
  const isSecure = port === 465;

  console.log(`📡 Connecting to ${host}:${port} (SSL/TLS: ${isSecure})...`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: host === 'smtp.gmail.com' ? true : false
    }
  });

  try {
    console.log('🔐 Verifying SMTP authentication credentials with mail gateway...');
    await transporter.verify();
    console.log('✅ SMTP Connection & Authentication Successful!\n');

    const targetRecipient = process.argv[2] || user;
    console.log(`✉️ Sending test verification email to: ${targetRecipient}...`);

    const info = await transporter.sendMail({
      from,
      to: targetRecipient,
      subject: '🪷 AAROH Marketplace - SMTP Connectivity Test',
      text: `Hello,\n\nThis is a verification test from your AAROH Marketplace backend.\nSMTP Host: ${host}:${port}\nAuthentication: Success\nTimestamp: ${new Date().toISOString()}\n\nYour email verification service is ready to dispatch real OTP codes!`,
      html: `
        <div style="font-family: Georgia, serif; background: #FAF5EB; padding: 30px; color: #1C2638;">
          <div style="max-width: 500px; margin: 0 auto; background: #FFFFFF; border: 1px solid #EBE4D5; border-radius: 8px; padding: 25px;">
            <h2 style="color: #1A3459; margin-top: 0;">🪷 Aaroh Living Heritage Crafts</h2>
            <p style="color: #2D4C3A; font-weight: bold;">✅ SMTP Connection & Delivery Test Succeeded!</p>
            <p>Your Gmail SMTP gateway is properly authenticated and ready to dispatch real 6-digit OTP verification codes to collectors and artisans.</p>
            <hr style="border: none; border-top: 1px solid #EBE4D5; margin: 20px 0;" />
            <p style="font-size: 12px; color: #7E8BA0;">Dispatched by Aaroh Backend Test Suite • ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    });

    console.log(`🎉 Live Test Email Dispatched Successfully!`);
    console.log(`   • Message ID: ${info.messageId}`);
    console.log(`   • Recipient:  ${targetRecipient}`);
    console.log('=======================================================\n');
    return { success: true, messageId: info.messageId, recipient: targetRecipient };
  } catch (err) {
    console.error(`\n❌ SMTP Error: ${err.message}`);
    if (err.code === 'EAUTH' || err.responseCode === 535) {
      console.error('💡 Diagnosis: Authentication Failed (Error 535).');
      console.error('   • If using Gmail: Standard account passwords will NOT work.');
      console.error('   • You must enable 2-Step Verification on your Google Account.');
      console.error('   • Generate a 16-character Google App Password at: https://myaccount.google.com/apppasswords');
      console.error('   • Paste that 16-character password into SMTP_PASS in server/.env.');
    } else if (err.code === 'ESOCKET' || err.code === 'ETIMEDOUT') {
      console.error('💡 Diagnosis: Network Connection Failed.');
      console.error(`   • Unable to reach ${host}:${port}. Verify firewall or ISP restrictions.`);
    }
    console.error('=======================================================\n');
    return { success: false, error: err.message, code: err.code };
  }
}

runSmtpTest();
