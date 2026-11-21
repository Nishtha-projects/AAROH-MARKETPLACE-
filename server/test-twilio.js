/**
 * Standalone Twilio Verify Connectivity & SMS Dispatch Test Script for Aaroh
 * Usage:
 *   node server/test-twilio.js send <phone_number>
 *   node server/test-twilio.js check <phone_number> <code>
 */

import './env.js';
import { checkSmsConfigStatus, sendPhoneVerificationCode, checkPhoneVerificationCode, normalizeToE164 } from './services/smsService.js';

async function runTwilioTest() {
  console.log('\n=======================================================');
  console.log('📱 AAROH TWILIO VERIFY REAL SMS TEST');
  console.log('=======================================================');

  const status = checkSmsConfigStatus();

  console.log('Configuration Inspection:');
  console.log(`  • TWILIO_ACCOUNT_SID:        ${status.accountSidConfigured ? '[Configured]' : '[MISSING]'}`);
  console.log(`  • TWILIO_AUTH_TOKEN:         ${status.authTokenConfigured ? '[Configured]' : '[MISSING]'}`);
  console.log(`  • TWILIO_VERIFY_SERVICE_SID: ${status.verifyServiceSidConfigured ? '[Configured]' : '[MISSING]'}`);
  console.log(`  • Provider:                  ${status.provider}`);
  console.log('-------------------------------------------------------');

  if (!status.configured) {
    console.log('❌ Result: Twilio Verify is NOT fully configured in server/.env.');
    console.log(`   Missing variables: ${status.missing.join(', ')}`);
    console.log('\n📋 How to configure Twilio Verify:');
    console.log('   1. Log into your Twilio Console: https://console.twilio.com');
    console.log('   2. Copy your Account SID and Auth Token from your dashboard.');
    console.log('   3. Navigate to Verify > Services (https://console.twilio.com/us1/develop/verify/services).');
    console.log('   4. Create a Verify Service (name it "Aaroh") and copy the Service SID (starts with "VA...").');
    console.log('   5. Open server/.env and fill in:');
    console.log('      TWILIO_ACCOUNT_SID=your_actual_account_sid');
    console.log('      TWILIO_AUTH_TOKEN=your_actual_auth_token');
    console.log('      TWILIO_VERIFY_SERVICE_SID=your_actual_service_sid');
    console.log('=======================================================\n');
    return { success: false, reason: 'NOT_CONFIGURED', missing: status.missing };
  }

  const action = process.argv[2] || 'send';
  const targetPhone = process.argv[3];
  const inputCode = process.argv[4];

  if (!targetPhone) {
    console.log('💡 Usage Instructions:');
    console.log('   To send a real verification SMS:');
    console.log('     node server/test-twilio.js send +919845012345');
    console.log('   To verify a received SMS code:');
    console.log('     node server/test-twilio.js check +919845012345 123456');
    console.log('=======================================================\n');
    return { success: false, error: 'PHONE_REQUIRED' };
  }

  try {
    const normalized = normalizeToE164(targetPhone);

    if (action === 'check') {
      if (!inputCode) {
        console.error('❌ Error: Verification code is required to check.');
        console.log('   Usage: node server/test-twilio.js check <phone> <code>');
        return { success: false, error: 'CODE_REQUIRED' };
      }
      console.log(`🔍 Checking verification code "${inputCode}" with Twilio Verify for ${normalized}...`);
      const checkRes = await checkPhoneVerificationCode({ toPhone: normalized, code: inputCode });
      console.log('🎉 Verification Approved by Twilio!');
      console.log('   Status:', checkRes.status);
      console.log('=======================================================\n');
      return { success: true, result: checkRes };
    }

    console.log(`✉️ Dispatched real verification SMS via Twilio Verify to ${normalized}...`);
    const sendRes = await sendPhoneVerificationCode({ toPhone: normalized, purpose: 'test' });
    console.log('🎉 Twilio Gateway Accepted Request!');
    console.log(`   • Service SID: ${process.env.TWILIO_VERIFY_SERVICE_SID}`);
    console.log(`   • Verification SID: ${sendRes.sid}`);
    console.log(`   • Status: ${sendRes.status}`);
    console.log(`   • Recipient: ${sendRes.to}`);
    console.log('=======================================================\n');
    return { success: true, result: sendRes };
  } catch (err) {
    console.error(`\n❌ Twilio Verify Error: ${err.message}`);
    if (err.twilioCode) {
      console.error(`   Twilio Error Code: ${err.twilioCode}`);
    }
    console.error('=======================================================\n');
    return { success: false, error: err.message, code: err.twilioCode };
  }
}

runTwilioTest();
