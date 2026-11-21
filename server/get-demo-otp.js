/**
 * AAROH Development Demo OTP Retrieval Tool
 * Usage:
 *   node server/get-demo-otp.js
 *   npm run demo:otp
 */

import './env.js';
import { getActiveDemoOtps, isOtpDemoModeActive } from './services/otpService.js';

function showDemoOtps() {
  console.log('\n=======================================================');
  console.log('🧪 AAROH DEVELOPMENT DEMO OTP RETRIEVAL');
  console.log('=======================================================');

  if (!isOtpDemoModeActive()) {
    console.log('⚠️ Demo mode is currently INACTIVE.');
    console.log('   To enable: ensure NODE_ENV=development and OTP_DEMO_MODE=true in server/.env.');
    console.log('=======================================================\n');
    return;
  }

  const activeOtps = getActiveDemoOtps();

  if (activeOtps.length === 0) {
    console.log('ℹ️ No active demo codes found.');
    console.log('   To generate a code: sign up on http://localhost:5173 or click "Resend Code".');
    console.log('=======================================================\n');
    return;
  }

  console.log(`Active 6-Digit Codes (${activeOtps.length} active, 5-minute single-use validity):\n`);

  activeOtps.forEach((item, index) => {
    const remainingSec = Math.max(0, Math.floor((item.expiresAt - Date.now()) / 1000));
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    const isEmail = item.type.includes('email');

    console.log(`  [${index + 1}] ${isEmail ? '📧 EMAIL' : '📱 PHONE SMS'}: ${item.target}`);
    console.log(`      👤 User:     ${item.userName}`);
    console.log(`      🔑 OTP CODE: \x1b[32m\x1b[1m${item.code}\x1b[0m`);
    console.log(`      ⏱️ Valid:    ${mins}m ${secs}s remaining`);
    console.log('-------------------------------------------------------');
  });

  console.log('💡 Tip: Enter the 6-digit code on the Aaroh verification screen.');
  console.log('=======================================================\n');
}

showDemoOtps();
