import '../env.js';
import { reloadEnv } from '../env.js';

/**
 * Cloudflare Turnstile CAPTCHA Verification Service
 * Validates frontend Turnstile tokens against Cloudflare's Siteverify API.
 */

// Public Cloudflare test keys
export const CLOUDFLARE_TEST_SITE_KEY = '1x00000000000000000000AA';
export const CLOUDFLARE_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

/**
 * Checks whether Cloudflare Turnstile secret key is configured in server/.env
 */
export const checkTurnstileConfigStatus = () => {
  reloadEnv();
  const secretKey = (process.env.TURNSTILE_SECRET_KEY || '').trim();

  const isConfigured = Boolean(
    secretKey &&
    !secretKey.includes('your_') &&
    !secretKey.includes('xxxx')
  );

  const isTestKey = secretKey === CLOUDFLARE_TEST_SECRET_KEY;

  return {
    configured: isConfigured,
    isTestKey,
    provider: isConfigured ? (isTestKey ? 'Cloudflare Turnstile (Development Test Keys)' : 'Cloudflare Turnstile (Production)') : 'None (Unconfigured)',
    missing: isConfigured ? [] : ['TURNSTILE_SECRET_KEY']
  };
};

/**
 * Verifies Turnstile token with Cloudflare siteverify endpoint.
 * Throws clear error if keys are missing or token is invalid.
 */
export const verifyTurnstileToken = async ({ token, remoteIp = null }) => {
  const status = checkTurnstileConfigStatus();

  // If Turnstile is NOT configured in server/.env
  if (!status.configured) {
    const err = new Error(
      'Cloudflare Turnstile CAPTCHA is not configured on the server. Please set TURNSTILE_SECRET_KEY in server/.env (obtain free keys from Cloudflare Dashboard > Turnstile).'
    );
    err.status = 503;
    err.code = 'TURNSTILE_NOT_CONFIGURED';
    err.requiredVariables = ['TURNSTILE_SECRET_KEY'];
    throw err;
  }

  const cleanToken = (token || '').trim();
  if (!cleanToken) {
    const err = new Error('CAPTCHA verification token is missing. Please complete the security check.');
    err.status = 400;
    err.code = 'CAPTCHA_TOKEN_MISSING';
    throw err;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY.trim();

  try {
    const formParams = new URLSearchParams();
    formParams.append('secret', secretKey);
    formParams.append('response', cleanToken);
    if (remoteIp) {
      formParams.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formParams.toString()
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.warn('[Cloudflare Turnstile Verification Failed]', result['error-codes'] || result);
      const errorCodes = result['error-codes'] || [];
      let friendlyMessage = 'CAPTCHA verification failed. Please try the security check again.';

      if (errorCodes.includes('timeout-or-duplicate')) {
        friendlyMessage = 'CAPTCHA token expired or has already been used. Please refresh the security check.';
      } else if (errorCodes.includes('invalid-input-secret')) {
        friendlyMessage = 'Invalid Cloudflare Turnstile secret key. Please check TURNSTILE_SECRET_KEY in server/.env.';
      } else if (errorCodes.includes('invalid-input-response')) {
        friendlyMessage = 'Invalid CAPTCHA challenge response. Please try again.';
      }

      const err = new Error(friendlyMessage);
      err.status = 400;
      err.code = 'CAPTCHA_VERIFICATION_FAILED';
      err.details = errorCodes;
      throw err;
    }

    return {
      success: true,
      hostname: result.hostname,
      action: result.action,
      cdata: result.cdata
    };
  } catch (err) {
    if (err.status) throw err;
    console.error('[Cloudflare Turnstile Network Error]', err);
    const networkErr = new Error('Unable to connect to Cloudflare CAPTCHA verification service. Please check network.');
    networkErr.status = 502;
    networkErr.code = 'CAPTCHA_GATEWAY_ERROR';
    throw networkErr;
  }
};

export default {
  checkTurnstileConfigStatus,
  verifyTurnstileToken,
  CLOUDFLARE_TEST_SITE_KEY,
  CLOUDFLARE_TEST_SECRET_KEY
};
