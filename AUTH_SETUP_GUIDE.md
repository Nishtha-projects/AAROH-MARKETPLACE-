# AAROH AUTHENTICATION SYSTEM — SETUP & CONFIGURATION GUIDE

This guide provides complete instructions to configure and operate the production authentication system in **AAROH Fair-Trade Art Marketplace**.

---

## Architecture Overview

AAROH provides an enterprise-grade multi-channel authentication system supporting:
- **Email OTP via Gmail SMTP**: Real 6-digit cryptographically secure OTPs delivered directly via Gmail TLS/SSL.
- **SMS OTP via Twilio Verify**: Enterprise carrier SMS OTP delivery and verification via Twilio Verify Service.
- **Google OAuth 2.0 / OpenID Connect**: Seamless sign-in and account linking with verified Google profiles.
- **Microsoft Entra ID (Azure AD)**: Sign-in for Microsoft personal (`outlook.com`, `live.com`) and enterprise work/school accounts.
- **Cloudflare Turnstile CAPTCHA**: Invisible/interactive bot protection validated server-side via Cloudflare Siteverify.
- **Unified SQLite Engine**: Atomic user creation, role preservation (`customer`, `artisan`, `admin`), hashed OTP storage (bcrypt), and brute-force rate limiting.

---

## 1. Google Cloud OAuth 2.0 Setup

### Steps to Obtain Credentials:
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing project (e.g., `Aaroh-Marketplace`).
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**.
   - App Name: `Aaroh Marketplace`.
   - User support email: Select your email.
   - Developer contact email: Enter your email.
   - Scopes: Add `openid`, `.../auth/userinfo.email`, and `.../auth/userinfo.profile`.
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Aaroh Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5000`
     - `http://localhost:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
5. Click **Create**. Copy the **Client ID** and **Client Secret**.
6. Paste into `server/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

---

## 2. Microsoft Entra ID (Azure AD) Setup

### Steps to Obtain Credentials:
1. Open the [Microsoft Azure Portal](https://portal.azure.com/) and navigate to **Microsoft Entra ID** (formerly Azure Active Directory).
2. Go to **Manage** > **App registrations** > Click **+ New registration**:
   - **Name**: `Aaroh Art Marketplace`.
   - **Supported account types**: Select **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**.
   - **Redirect URI**:
     - Platform: **Web**.
     - URL: `http://localhost:5000/api/auth/microsoft/callback`.
   - Click **Register**.
3. In the Overview tab:
   - Copy **Application (client) ID**. This is your `MICROSOFT_CLIENT_ID`.
4. Navigate to **Certificates & secrets** > **Client secrets**:
   - Click **+ New client secret**.
   - Description: `Aaroh Server Auth Secret`.
   - Expires: Choose your desired expiration (e.g. 180 or 730 days).
   - Click **Add**.
   - **Immediately copy the Value** (not Secret ID). This is your `MICROSOFT_CLIENT_SECRET`.
5. Navigate to **API permissions**:
   - Ensure `Microsoft Graph` permissions include:
     - `User.Read` (Delegated)
     - `email` (Delegated)
     - `offline_access` (Delegated)
     - `openid` (Delegated)
     - `profile` (Delegated)
6. Paste into `server/.env`:
   ```env
   MICROSOFT_CLIENT_ID=your_application_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret_value
   MICROSOFT_TENANT_ID=common
   MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/microsoft/callback
   ```

---

## 3. Cloudflare Turnstile CAPTCHA Setup

### Steps to Obtain Keys:
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and select **Turnstile** from the sidebar.
2. Click **Add widget**:
   - **Widget name**: `Aaroh Marketplace Auth`.
   - **Domain**: Add `localhost` and `127.0.0.1` (add your production domain later).
   - **Widget Mode**: **Managed** (recommended) or **Non-interactive**.
3. Click **Create**.
4. Cloudflare provides two keys:
   - **Site Key (Public)**: Used in the frontend widget.
   - **Secret Key (Private)**: Used on the backend to verify the site token with Cloudflare's Siteverify API (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).
5. Configure in the project:
   - In root `.env`:
     ```env
     VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
     ```
   - In `server/.env`:
     ```env
     TURNSTILE_SITE_KEY=your_turnstile_site_key
     TURNSTILE_SECRET_KEY=your_turnstile_secret_key
     ```
> **Local Testing Keys**: For development or continuous integration, Cloudflare provides official dummy keys that always pass validation:
> - Site Key: `1x00000000000000000000AA`
> - Secret Key: `1x0000000000000000000000000000000AA`

---

## 4. Twilio Verify SMS Configuration & Trial Restrictions

### Steps to Obtain Credentials:
1. Log in to the [Twilio Console](https://console.twilio.com/).
2. On your Dashboard, copy:
   - **Account SID**: `TWILIO_ACCOUNT_SID`
   - **Auth Token**: `TWILIO_AUTH_TOKEN`
3. Navigate to **Explore Products** > **Verify** > **Services**:
   - Click **Create Service**.
   - Friendly Name: `Aaroh Authentication`.
   - Code Length: **6 digits**.
   - Copy the generated **Service SID** (starts with `VA...`).
4. Paste into `server/.env`:
   ```env
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_VERIFY_SERVICE_SID=VA...
   ```

### Important Twilio Trial Restrictions:
- **Verified Caller IDs Only**: While on an un-upgraded Twilio Trial Account, SMS messages can **ONLY** be delivered to phone numbers that you have explicitly verified in your Twilio Console under **Phone Numbers > Verified Caller IDs**.
- **Twilio Error 21608**: If a user attempts to sign up or log in with an unverified phone number on a trial account, Twilio rejects the request with code `21608`.
- **User-Friendly Error Handling**: AAROH automatically detects this condition and displays a clear message to the user:
  > *"SMS could not be delivered: While on Twilio Trial, SMS can only be sent to verified phone numbers. Please add this number to your Twilio Verified Caller IDs or upgrade your Twilio project."*
- **Upgrading**: To send SMS OTPs to any real mobile phone worldwide, click **Upgrade Project** in the Twilio Console and add a payment method.

---

## 5. Gmail SMTP Configuration

### Steps to Obtain 16-Character App Password:
1. Log in to your Google Account and go to [Google Account Security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned **ON**.
3. In the search box or under *How you sign in to Google*, go to **App passwords** ([Direct Link](https://myaccount.google.com/apppasswords)).
4. Enter an App name: `Aaroh Marketplace`.
5. Click **Create**.
6. Google displays a 16-character code (e.g., `abcd efgh ijkl mnop`).
7. Paste into `server/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   EMAIL_FROM=your_email@gmail.com
   ```

---

## 6. Callback URLs & Port Mapping Reference

| Service | Environment Variable | Exact Local URI |
| :--- | :--- | :--- |
| **Backend Server** | `PORT` / `BACKEND_URL` | `http://localhost:5000` |
| **Frontend Web App** | `CLIENT_URL` | `http://localhost:5173` |
| **Google Redirect URI** | `GOOGLE_REDIRECT_URI` | `http://localhost:5000/api/auth/google/callback` |
| **Microsoft Redirect URI** | `MICROSOFT_REDIRECT_URI` | `http://localhost:5000/api/auth/microsoft/callback` |
| **Cloudflare Siteverify** | Internal API | `https://challenges.cloudflare.com/turnstile/v0/siteverify` |

---

## 7. Action Items: Credentials to Enter

Check off the following credentials in your local `server/.env` and `.env`:

- [x] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (Configured & active)
- [x] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` (Configured & active)
- [x] `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY` (Configured with official test keys)
- [ ] `GOOGLE_CLIENT_ID` (Obtain from Google Cloud Console)
- [ ] `GOOGLE_CLIENT_SECRET` (Obtain from Google Cloud Console)
- [ ] `MICROSOFT_CLIENT_ID` (Obtain from Azure Portal / Entra ID)
- [ ] `MICROSOFT_CLIENT_SECRET` (Obtain from Azure Portal / Entra ID)

---

## 8. Running the Application

### 1. Start the Backend Server:
```bash
npm run server
# Or: node server/server.js
# Output: [Aaroh Server] Listening on port 5000
```

### 2. Start the Frontend Client:
```bash
npm run dev
# Output: Local: http://localhost:5173/
```

### 3. Run Authentication Test Suites:
```bash
# Run real multi-factor authentication integration suite:
node server/test-real-auth.js
```
