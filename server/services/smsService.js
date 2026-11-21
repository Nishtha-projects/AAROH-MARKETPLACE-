import '../env.js';
import { reloadEnv } from '../env.js';

/**
 * Real SMS Verification Service for Aaroh Marketplace
 * Integrates with Twilio Verify API for sending and checking SMS codes
 * Enforces E.164 phone formatting and strict error handling.
 */


/**
 * Normalize and validate phone numbers into E.164 format.
 * Format: +[country code][number] e.g. +919845011001, +14155552671
 */
export const normalizeToE164 = (phone) => {
  if (!phone || typeof phone !== 'string') {
    const err = new Error('Phone number is required.');
    err.status = 400;
    throw err;
  }

  const trimmed = phone.trim();
  // Remove spaces, hyphens, parentheses, and dots
  const stripped = trimmed.replace(/[\s\-\(\)\.]/g, '');

  let e164 = stripped;
  if (!e164.startsWith('+')) {
    // If 10 digits, assume standard India mobile number (+91)
    if (/^\d{10}$/.test(e164)) {
      e164 = `+91${e164}`;
    } else if (/^\d{11,15}$/.test(e164)) {
      e164 = `+${e164}`;
    } else {
      const err = new Error('Please enter a valid phone number with country code (e.g., +91 98450 12345 or +1 415 555 2671).');
      err.status = 400;
      throw err;
    }
  }

  // Validate E.164 regex: + followed by 7 to 15 digits (first digit 1-9)
  if (!/^\+[1-9]\d{6,14}$/.test(e164)) {
    const err = new Error('Invalid phone number format. Please provide a valid E.164 number with country code (e.g. +91 98450 12345).');
    err.status = 400;
    throw err;
  }

  return e164;
};

/**
 * Check configuration status of Twilio SMS / Verify service safely without exposing secrets
 */
export const checkSmsConfigStatus = () => {
  reloadEnv();
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const verifyServiceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || '').trim();

  const isSidValid = Boolean(accountSid && !accountSid.includes('xxxx') && !accountSid.includes('your'));
  const isTokenValid = Boolean(authToken && !authToken.includes('xxxx') && !authToken.includes('your'));
  const isVerifyValid = Boolean(verifyServiceSid && !verifyServiceSid.includes('xxxx') && !verifyServiceSid.includes('your'));

  const missing = [];
  if (!isSidValid) missing.push('TWILIO_ACCOUNT_SID');
  if (!isTokenValid) missing.push('TWILIO_AUTH_TOKEN');
  if (!isVerifyValid) missing.push('TWILIO_VERIFY_SERVICE_SID');

  const configured = isSidValid && isTokenValid && isVerifyValid;

  return {
    configured,
    provider: configured ? 'Twilio Verify' : 'None (Unconfigured)',
    accountSidConfigured: isSidValid,
    authTokenConfigured: isTokenValid,
    verifyServiceSidConfigured: isVerifyValid,
    missing
  };
};

/**
 * Check whether Twilio Verify or another SMS provider is configured.
 */
export const isSmsConfigured = () => {
  const hasTwilioVerify = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID &&
    !process.env.TWILIO_ACCOUNT_SID.includes('xxxx') &&
    !process.env.TWILIO_AUTH_TOKEN.includes('xxxx')
  );

  const hasTwilioMessages = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER &&
    !process.env.TWILIO_ACCOUNT_SID.includes('xxxx')
  );

  const hasFast2Sms = Boolean(
    process.env.FAST2SMS_API_KEY && 
    !process.env.FAST2SMS_API_KEY.includes('your-')
  );

  return hasTwilioVerify || hasTwilioMessages || hasFast2Sms;
};

export const getSmsProviderInfo = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_VERIFY_SERVICE_SID) {
    return 'Twilio Verify';
  }
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_PHONE_NUMBER) {
    return 'Twilio Programmable SMS';
  }
  if (process.env.FAST2SMS_API_KEY) {
    return 'Fast2SMS';
  }
  return 'None (Not Configured)';
};

/**
 * Send real SMS verification code via Twilio Verify
 */
export const sendPhoneVerificationCode = async ({ toPhone, purpose = 'verification' }) => {
  const normalizedPhone = normalizeToE164(toPhone);

  if (!isSmsConfigured()) {
    const err = new Error("SMS verification service is not configured. Please configure Twilio Verify credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID) in server/.env.");
    err.status = 503;
    err.code = 'SMS_SERVICE_NOT_CONFIGURED';
    err.requiredVariables = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_VERIFY_SERVICE_SID'
    ];
    throw err;
  }

  // 1. PRIMARY: Twilio Verify Service
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    const endpoint = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
    const params = new URLSearchParams();
    params.append('To', normalizedPhone);
    params.append('Channel', 'sms');

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[Twilio Verify Send Error]', data.code, data.message);
        const errMsg = data.message || 'SMS delivery failed.';
        const err = new Error(`Twilio Verify delivery failed: ${errMsg}`);
        err.status = res.status >= 400 && res.status < 500 ? res.status : 502;
        err.twilioCode = data.code;
        throw err;
      }

      console.log(`[Aaroh Twilio Verify] Verification dispatched (SID: ${data.sid}) to ${normalizedPhone}`);
      return {
        success: true,
        provider: 'Twilio Verify',
        status: data.status,
        sid: data.sid,
        to: normalizedPhone
      };
    } catch (err) {
      if (err.status) throw err;
      console.error('[Twilio Verify Network Error]', err);
      const networkErr = new Error('Failed to reach SMS verification gateway. Please check network connection.');
      networkErr.status = 502;
      throw networkErr;
    }
  }

  // 2. FALLBACK: Twilio Programmable Messages (if Twilio phone number provided without Verify SID)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const err = new Error("Twilio Verify Service SID (TWILIO_VERIFY_SERVICE_SID) is required for verification codes.");
    err.status = 503;
    throw err;
  }

  const err = new Error("Verification service is not configured. Please contact the administrator.");
  err.status = 503;
  throw err;
};

/**
 * Check verification code submitted by user through Twilio Verify
 */
export const checkPhoneVerificationCode = async ({ toPhone, code }) => {
  const normalizedPhone = normalizeToE164(toPhone);
  const cleanCode = (code || '').trim();

  if (!cleanCode || cleanCode.length < 4 || cleanCode.length > 10) {
    const err = new Error('Please enter a valid verification code.');
    err.status = 400;
    throw err;
  }

  if (!isSmsConfigured()) {
    const err = new Error("SMS verification service is not configured. Please configure Twilio Verify credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID) in server/.env.");
    err.status = 503;
    err.code = 'SMS_SERVICE_NOT_CONFIGURED';
    throw err;
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    const endpoint = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
    const params = new URLSearchParams();
    params.append('To', normalizedPhone);
    params.append('Code', cleanCode);

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[Twilio Verify Check Error]', data.code, data.message);
        if (data.code === 20404 || data.status === 404) {
          const err = new Error('Verification code has expired or was not requested. Please request a new code.');
          err.status = 400;
          throw err;
        }
        const err = new Error(data.message || 'Verification check failed.');
        err.status = 400;
        throw err;
      }

      if (data.status === 'approved' || data.valid === true) {
        console.log(`[Aaroh Twilio Verify] Verification approved for ${normalizedPhone}`);
        return {
          approved: true,
          status: 'approved',
          to: normalizedPhone
        };
      }

      const err = new Error('Invalid verification code. Please check and try again.');
      err.status = 400;
      throw err;
    } catch (err) {
      if (err.status) throw err;
      console.error('[Twilio Verify Check Exception]', err);
      const networkErr = new Error('Failed to verify code with SMS provider.');
      networkErr.status = 502;
      throw networkErr;
    }
  }

  const err = new Error("Verification service is not configured. Please contact the administrator.");
  err.status = 503;
  throw err;
};

// Backwards-compatible alias for existing imports
export const sendPhoneOtpSms = async ({ toPhone, otpCode, purpose = 'signup' }) => {
  return await sendPhoneVerificationCode({ toPhone, purpose });
};

export default {
  normalizeToE164,
  isSmsConfigured,
  checkSmsConfigStatus,
  getSmsProviderInfo,
  sendPhoneVerificationCode,
  checkPhoneVerificationCode,
  sendPhoneOtpSms
};
