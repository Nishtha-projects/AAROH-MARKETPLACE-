# AAROH | Marketplace for Indian Art & Craft

**Bridging Traditional Indian Craftsmanship with Digital Innovation.**

<p align="center">
  A digital platform celebrating India's artistic heritage and connecting traditional artisans with a wider audience.
</p>

---

## Project Overview

Aaroh is a web-based marketplace focused on promoting traditional Indian handicrafts, regional artwork, and artisan products through a modern digital experience.

The platform aims to bring traditional craftsmanship closer to customers while providing artisans with opportunities to showcase their work.

**Project Status:** In Development

## Core Features

- **Artisan Marketplace** – Explore traditional Indian crafts and handmade products.
- **Cultural Discovery** – Discover India's diverse art forms and craftsmanship.
- **Authentication** – Google and Microsoft login integration.
- **Multilingual Interface** – Support for multiple languages.
- **Artisan Dashboard** – Dedicated artisan interface.
- **Admin Dashboard** – Administrative management interface.
- **Product Exploration** – Browse collections and product details.
- **Customer Interaction** – Enquiries and custom commission interfaces.

*Features are actively being developed.*

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js |
| Styling | CSS |
| Database | Supabase |
| Authentication | Google OAuth, Microsoft OAuth |
| Version Control | Git & GitHub |

## Project Architecture

```text
AAROH-MARKETPLACE/
│
├── public/                 # Public assets and images
│
├── src/                    # Frontend application
│   ├── components/         # UI components
│   ├── assets/             # Application assets
│   ├── data/               # Application data
│   ├── locales/            # Language translations
│   ├── services/           # Frontend services
│   └── styles/             # CSS styles
│
├── server/                 # Backend application
│   ├── database/
│   ├── middleware/
│   ├── migrations/
│   ├── routes/
│   └── services/
│
├── package.json
├── index.html
├── supabase_migration.sql
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Nishtha-projects/AAROH-MARKETPLACE-.git
```

### 2. Navigate to the Project

```bash
cd AAROH-MARKETPLACE-
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create the required environment files using the setup guides provided in the repository.

Configure database and authentication credentials locally. Never commit secret values to GitHub.

### 5. Run the Frontend

```bash
npm run dev
```

Vite will display the local development URL in the terminal. Open that URL in your browser.

### Backend Setup

The backend is maintained separately inside the `server/` directory. Install its dependencies and use the scripts defined in `server/package.json` after configuring the required environment variables.

Refer to `AUTH_SETUP_GUIDE.md` and `FIREBASE_AUTH_SETUP.md` for authentication configuration.

## Team

**Nishtha**
- Backend development and integration
- Database and dataset-related work
- Authentication integration

**Harshita**
- Frontend development
- User interface and component development

## Project Vision

To preserve India's traditional craftsmanship through technology, empower artisans, and create a digital bridge between cultural heritage and modern consumers.

## Repository

**GitHub:** https://github.com/Nishtha-projects/AAROH-MARKETPLACE-

---

## Copyright

© 2026 Aaroh Marketplace Project Team. All Rights Reserved.

This repository is publicly available for project viewing and academic evaluation. Public availability does not grant permission to reproduce, redistribute, or commercially reuse the project without prior written permission from the project owner.

---

**AAROH — Celebrating Heritage. Empowering Artisans.**
