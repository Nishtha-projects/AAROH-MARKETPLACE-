# Firebase Authentication & Provider Setup Guide for Aaroh

This guide details all steps required to configure and connect real Firebase Authentication for Aaroh.

---

## 1. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate the environment variables from your Firebase Console (**Project Settings > General > Your Apps > Web App**):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=aaroh-marketplace.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=aaroh-marketplace
   VITE_FIREBASE_STORAGE_BUCKET=aaroh-marketplace.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

---

## 2. Firebase Console Providers to Enable

Navigate to **Firebase Console > Authentication > Sign-in method**:

### A. Phone Authentication (SMS OTP & reCAPTCHA)
1. Click **Phone** in the Sign-in providers list.
2. Toggle **Enable**.
3. *(Optional for testing)*: Under **Phone numbers for testing**, add test numbers with fixed verification codes (e.g. `+91 99999 99999` with code `123456`) to test without consuming SMS credits during local dev.
4. Click **Save**.

### B. Google Sign-In (OAuth 2.0 / OIDC)
1. Click **Google** in the Sign-in providers list.
2. Toggle **Enable**.
3. Select your Project public-facing support email.
4. Click **Save**.

### C. Microsoft Sign-In (Microsoft Entra ID / Outlook)
1. Click **Add new provider** > Select **Microsoft**.
2. Toggle **Enable**.
3. Fill in credentials from Microsoft Azure Portal:
   - **Application (client) ID**
   - **Application Secret**
4. Copy the **Redirect URI** provided by Firebase (format: `https://<PROJECT-ID>.firebaseapp.com/__/auth/handler`).
5. In Azure Portal (**App registrations > Your App > Authentication**):
   - Add a Web Platform and paste the Firebase Redirect URI.
6. Click **Save** in Firebase.

### D. Email / Password
1. Click **Email/Password**.
2. Toggle **Enable**.
3. (Email link passwordless can remain disabled).
4. Click **Save**.

---

## 3. Authorized Domains to Register

Navigate to **Firebase Console > Authentication > Settings > Authorized domains**:
1. Verify the following domains are in the list:
   - `localhost` *(CRITICAL: do NOT include http:// or port numbers; enter only `localhost`)*
   - `<your-project-id>.firebaseapp.com`
   - `<your-project-id>.web.app`
2. If deploying to production (e.g., custom domain `aaroh.in` or Vercel/Firebase Hosting), add that domain here as well.

---

## 4. Firestore Database Setup

For persisting user profile roles (`artisan` vs `customer`):
1. Navigate to **Firebase Console > Firestore Database**.
2. Click **Create database**.
3. Choose your nearest regional location (e.g., `asia-south1` for Mumbai, India).
4. Start in **Production mode** and configure the rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
