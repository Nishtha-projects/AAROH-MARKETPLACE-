# AAROH MARKETPLACE
### Where Heritage Meets Technology • Elevating Indian Artisans

**A Conscious Marketplace & Cultural Archive for Traditional and Lesser-Known Indian Crafts**

---

## 01. Overview

**Aaroh** is a web application created to empower indigenous and master Indian artisans by connecting them directly with appreciative global patrons. Built with deep respect for Indian cultural heritage, Aaroh provides fair remuneration, oral provenance archiving, and transparent commerce without predatory middleman markups.

---

## 02. Architecture & Quick Start

Aaroh runs as a unified full-stack system powered by:
- **Client (Vite + React 18):** Running on port `5173` (with responsive mobile/desktop interfaces, 23 languages, and dark/light heritage palettes).
- **Backend (Express + SQLite):** Running on port `5000` (persisting products, artisans, orders, enquiries, commissions, and user preferences).
- **Reverse Proxy Gateway:** Running on port `3000` unifying frontend assets and API endpoints under a single port.

### One-Command Unified Startup
```bash
# Install dependencies
npm install

# Start Vite frontend, Express backend, and Proxy gateway simultaneously
node scripts/start-all.mjs
```

The application is accessible at:
- **Web Interface:** `http://localhost:5173` or `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api`

---

## 03. Honest Feature & AI Audit Matrix

In accordance with Aaroh's ethical principles, every feature is transparently documented with its exact implementation tier:

| Capability | Tier | Backend Engine | Implementation Details |
|---|---|---|---|
| **Artisan Product CRUD** | **Full Production** | SQLite (`products` table) | Complete lifecycle: Create, Edit, Save Draft, Publish, Unpublish, and Delete with database persistence. |
| **Craft Image Upload** | **Full Production** | Express (`/api/marketplace/upload-image`) | File-type validation (JPEG, PNG, WebP) and strict 5MB upload size limits with static hosting. |
| **Customer Orders & Checkout** | **Full Production** | SQLite (`orders` table) | Persists orders with unique tracking codes (`AAROH-TRK-XXXXXX`) and transparent demo checkout disclaimers. |
| **Custom Commissions** | **Full Production** | SQLite (`commissions` table) | Two-way commission escrow tracking with mandatory reference ownership verification and 3-way IP licensing. |
| **Persistent User Preferences** | **Full Production** | SQLite (`user_settings` table) | Persists theme mode (light/dark), palette, reduced motion, and locale preferences for authenticated users. |
| **Cloudflare Turnstile CAPTCHA** | **Full Production** | Cloudflare Verify API | Server-side cryptographic token verification on sign-in and sign-up with dev sandbox fallback. |
| **Authentication & Roles** | **Full Production** | bcrypt + JWT + SQLite | Email/password, phone OTP, session restoration, and role protection (`artisan`, `customer`, `admin`). |
| **Multilingual & RTL Support** | **Full Production** | Client i18n & CSS | 23 languages (English + all 22 official scheduled Indian languages) with automated RTL layout for Arabic & Urdu (`dir="rtl"`). |
| **Voice-to-Text Listing** | **Prototype / Web Speech** | Browser Web Speech API | Client-side `webkitSpeechRecognition` + rule-based NLP extraction with **mandatory artisan review** before publishing. |
| **Canvas Photo Enhancer** | **Prototype / Canvas** | HTML5 Canvas 2D | Contrast/white-balance adjustment with side-by-side comparison, original retention, and accept/revert buttons. |
| **Craft Computer Vision** | **Prototype / Heuristic** | HTML5 Canvas Feature Vector | HSV histogram and Sobel edge-gradient feature extractor. Displays honest uncertainty warnings (<70%) with manual fallback. |
| **Fair Wage Calculator** | **Deterministic Formula** | Arithmetic Cost Engine | Multi-factor benchmark (`Materials + (Labor Hours × Fair Wage) + Packaging & Courier + Heritage Band`). 100% artisan autonomy. |
| **Aaroh Saathi Advisor** | **Rule-Based Assistant** | Knowledgebase Heuristic | Advisory responses based on National Crafts Council guidelines and Indian Geographical Indications (GI) regulations. |
| **Google & Microsoft OAuth** | **Requires API Keys** | Passport OAuth2 | Live SSO when `GOOGLE_CLIENT_ID` and `MICROSOFT_CLIENT_ID` are configured; honest setup modal when keys are missing. |
| **SMS OTP Delivery** | **Requires API Keys** | Twilio SMS API | Sends real SMS OTPs when Twilio keys are configured; restricted to development demo OTP (`OTP_DEMO_MODE=true`) in local dev. |

---

## 04. Database Schema

Aaroh uses an embedded SQLite database (`server/database/aaroh.db`) with zero external service requirements:

- **`users`**: User credentials, role (`artisan`, `customer`, `admin`), phone/email, verification status.
- **`products`**: Craft title, category, materials, dimensions, weight, price, status (`Published`, `Draft`, `Archived`), image URL, gallery, GI certification tag.
- **`artisans`**: Master artisan bios, village location, experience years, GI badge verification, craft discipline.
- **`orders`**: Order numbers, recipient information, items JSON, total amount, tracking code, fulfillment status (`Confirmed & Escrow Secured`, `In Production`, `Dispatched`, `Delivered`).
- **`commissions`**: Custom project requests, dimensions, budget, reference image, `license_choice` (`personal_display`, `commercial_reproduction`, `portfolio_only`), `is_private`, artisan responses.
- **`user_settings`**: `user_id`, `preferred_lang`, `theme_mode`, `palette`, `reduced_motion`, timestamp.
- **`cultural_heritage`**: Peer-reviewed anthropological and GI registry records across traditional Indian crafts.

---

## 05. Security Practices

- **Zero Plaintext Passwords:** All passwords hashed with `bcryptjs` (salt rounds: 10).
- **Stateless Authentication:** Signed JSON Web Tokens (JWT) with configurable expiry.
- **Upload Validation:** Strict 5MB file-size limit and MIME-type sniffing (JPEG, PNG, WebP only) before disk writes.
- **No In-Memory Illusions:** All products, orders, and commissions persist across server restarts.
- **Demo Mode Safety:** Demo OTPs (`123456`) are hardcoded to fail if `NODE_ENV === 'production'`.

---

## 06. License & Cultural Provenance

Living craftsmanship documented within Aaroh remains the intellectual and cultural heritage of the respective artisan communities and traditional guilds across India. Software code is published under the MIT License.
