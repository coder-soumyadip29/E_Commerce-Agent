<div align="center">
  <img src="./public/logo.png" alt="CartWise Plus Logo" width="160" />
  <h1>CartWise Plus+</h1>
  <p><strong>Smarter Search. Better Choices.</strong></p>
  <p>Next-Gen Multi-Vendor E-Commerce Platform & Autonomous AI Shopping Assistant</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
  [![React Native](https://img.shields.io/badge/React_Native-Expo_57-blue?logo=react)](https://reactnative.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
  [![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?logo=sqlite)](https://www.sqlite.org/)
  [![Google Gemini](https://img.shields.io/badge/Gemini_LLM-Vision_%26_Tools-4285F4?logo=google)](https://ai.google.dev/)
</div>

---

## 🌟 Executive Overview

**CartWise Plus+** is a unified e-commerce ecosystem built with **Next.js 16, React 19, SQLite, and React Native (Expo)**. It delivers a comprehensive multi-portal architecture designed with a **Luxury Obsidian Black, Royal Gold, and Pure White** visual identity:

1. 🛍️ **Customer AI Shopping Storefront** (`/`): Real-time catalog, multimodal Gemini Vision, Indian Rupee (`₹`), 15-min express delivery tracking, and atomic checkout (UPI QR, Card, COD).
2. 🏛️ **Marketplace Admin Control Center** (`/admin`): Executive oversight, GMV revenue analytics, seller moderation, dynamic commissions, payout disbursements, dispute handling, and compliance audit logs.
3. 🏪 **Merchant / Seller Portal** (`/seller`): Zero-IDOR isolated vendor dashboard, inventory & SKU management, sub-order fulfillment, payout tracking, and public storefronts (`/store/[slug]`).
4. 📱 **React Native Mobile App** (`cartwise-mobile`): Live Web Bridge container enabling **instant auto-updates** without app store recompilation, backed by native Haptics, Camera, and GPS.

---

## 🎨 Design System: Luxury Black, Gold & White

All three web portals and the mobile container adhere to a cohesive design system:
- **Base Surfaces**: Deep obsidian black (`#07090E`, `#0A0D16`, `#0E131F`).
- **Metallic Gold Accents**: Royal Gold gradients (`#F59E0B`, `#FBBF24`, `#D97706`) for active pills, brand emblems, and KPI metrics.
- **High-Contrast Typography**: Crisp Pure White (`#FFFFFF`) headings and clear muted slate subtext.
- **Glassmorphic Depth**: Semi-transparent card panels with subtle ambient gold lighting.

---

## 🚀 Portals & Modules

### 1. 🛍️ Customer Storefront & AI Shopping Copilot
- **Multimodal Visual Search**: Upload product images for instant attribute parsing and SQLite catalog matching.
- **Function-Calling Agent (`lib/agent/real.ts`)**:
  - `search_products`: Multi-filter queries (category, price range, organic rating).
  - `track_specific_order`: Real-time rider telemetry, coordinates, and countdown ETA.
  - `cancel_order`: Atomic cancellation with inventory replenishment and refund calculation.
  - `generate_invoice`: Grounded GST tax invoice computation.
- **Multilingual Voice Assistant**: Web Speech API for real-time speech-to-text in English, Hindi, and Bengali.
- **Multi-Mode Payment System**: Dynamic UPI QR generator (`upi://pay`), 3D Secure simulation, and COD with tamper-proof price verification.
- **Tax Compliance & Invoices**: 5% GST computation (CGST 2.5% + SGST 2.5%), HSN mapping, and printable PDF modal (`InvoiceModal`).

### 2. 🏛️ Admin Control Center (`/admin`)
- **Executive KPI Dashboard**: Real-time revenue analytics, order volume, active vendors, and SVG time series curves.
- **Vendor KYC & Directory (`/admin/sellers`)**: Onboard merchants, toggle `ACTIVE`/`SUSPENDED`/`REJECTED`, and configure custom commission rates.
- **Catalog Moderation (`/admin/products`)**: Review submitted SKUs, manage marketplace prices, and toggle stock.
- **Commission Engine & Simulator (`/admin/commissions`)**: Dynamic rule hierarchy editor and simulated fee calculator.
- **Payout Disbursements (`/admin/payouts`)**: Process vendor bank transfers with wire reference IDs.
- **Audit Ledger & RBAC (`/admin/audit-logs`)**: Immutable log of all administrative actions with actor metadata.

### 3. 🏪 Seller / Merchant Portal (`/seller`)
- **Zero-IDOR Security**: Session queries strictly scoped to authenticated vendor token (`cartwise_seller_token`).
- **Store Dashboard (`/seller/dashboard`)**: Daily sales, pending fulfillment alerts, and revenue trends.
- **Order Fulfillment (`/seller/orders`)**: Manage store sub-orders and package tracking.
- **Catalog Management (`/seller/products/new`)**: Add new product listings with image URLs and variants.
- **Public Storefronts (`/store/[slug]`)**: Dedicated customer-facing seller pages.

### 4. 📱 React Native Mobile App (`cartwise-mobile`)
- **Instant Auto-Update Architecture**: Mobile users always receive the latest website updates without rebuilding APKs.
- **Native Device Bridge**:
  - 📸 Camera & Photo Picker for AI Vision search.
  - 📳 Tactile Haptic feedback on button clicks.
  - 📍 Hardware GPS reverse geocoding for pincode lookup.
  - 📡 Dark-mode offline reconnect screen with retry button.
  - ⚙️ In-App Server Switcher (Local Wi-Fi, Emulator, Production).

---

## 📁 Repository Structure

```text
Euphoria Ecommerce/
├── CartWise-main/                      # Next.js 16 Full-Stack Application
│   ├── app/
│   │   ├── admin/                      # 18 Admin Control Center Pages
│   │   │   ├── analytics/              # Business intelligence & sales share
│   │   │   ├── audit-logs/             # Compliance activity ledger
│   │   │   ├── commissions/            # Commission rules & live simulator
│   │   │   ├── login/                  # Admin authentication portal
│   │   │   ├── orders/                 # Order fulfillment & vendor split
│   │   │   ├── payouts/                # Payout disbursements
│   │   │   ├── products/               # Product moderation queue
│   │   │   ├── sellers/                # Vendor onboarding & KYC
│   │   │   └── page.tsx                # Admin overview dashboard
│   │   ├── seller/                     # 17 Seller / Merchant Hub Pages
│   │   │   ├── dashboard/              # Seller analytics & KPIs
│   │   │   ├── inventory/              # Low-stock monitoring
│   │   │   ├── login/                  # Merchant login & registration
│   │   │   ├── orders/                 # Vendor sub-order fulfillment
│   │   │   ├── payouts/                # Payout withdrawal requests
│   │   │   └── products/new/           # Add new product form
│   │   ├── store/[slug]/               # Public vendor storefronts
│   │   ├── api/                        # REST & Agent API Endpoints
│   │   │   ├── admin/                  # Admin CRUD & auth routes
│   │   │   ├── seller/                 # Isolated seller routes
│   │   │   ├── chat/                   # AI shopping copilot router
│   │   │   ├── orders/                 # SQLite atomic order routes
│   │   │   └── payment/                # Verification & invoice dispatch
│   │   ├── globals.css                 # Black & Gold luxury styling tokens
│   │   ├── layout.tsx                  # Root Next.js layout
│   │   └── page.tsx                    # Main customer storefront
│   ├── components/
│   │   ├── admin/                      # AdminNavbar, AdminSidebar, AdminLayout
│   │   ├── seller/                     # SellerNavbar, SellerSidebar, SellerLayout
│   │   ├── auth/                       # AuthModal, AddressModal, PersonalisationModal
│   │   ├── cart/                       # CartDrawer, InvoiceModal, UpiQrModal
│   │   ├── chat/                       # Copilot messages (Text, Products, Vision, Trace)
│   │   ├── orders/                     # OrdersView with 4-stage lifecycle stepper
│   │   └── Navbar.tsx                  # Customer sticky navbar with official logo
│   ├── context/                        # CartContext, UserContext, VoiceContext
│   ├── data/                           # store.db (SQLite database with WAL mode)
│   ├── lib/
│   │   ├── adminAuth.ts                # Admin cookie token authentication
│   │   ├── adminDb.ts                  # Admin multi-vendor database queries
│   │   ├── sellerAuth.ts               # Seller cookie token authentication
│   │   ├── sellerDb.ts                 # Zero-IDOR isolated seller data layer
│   │   ├── agent/                      # Gemini Real and Deterministic Mock agents
│   │   ├── db.ts                       # SQLite core data access layer
│   │   ├── email.ts                    # Brevo SMTP invoice email dispatcher
│   │   ├── invoice.ts                  # GST tax computation & HSN mapper
│   │   ├── payment.ts                  # Cryptographic HMAC payment verification
│   │   └── types.ts                    # Unified TypeScript contracts
│   ├── public/                         # logo.png, product images, icons
│   ├── scripts/seed.ts                 # SQLite seed script (10 categories & orders)
│   └── tests/                          # 7 Vitest test suites (45+ tests)
│
└── cartwise-mobile/                    # React Native (Expo) Mobile App
    ├── assets/                         # logo.png, app icon, splash screen
    ├── src/
    │   ├── components/
    │   │   ├── NativeHeader.tsx        # Top bar with live sync indicator
    │   │   ├── OfflineScreen.tsx       # Dark offline reconnection screen
    │   │   └── ServerSwitchModal.tsx   # Server environment changer
    │   └── services/
    │       └── nativeBridge.ts         # Two-way JS Bridge (Haptics, Camera, GPS)
    ├── App.tsx                         # Main WebView container
    ├── app.json                        # Permissions (Camera, Location, Vibrate)
    └── config.ts                       # Server URLs & feature flags
```

---

## 🛠️ Quick Start & Installation

### Prerequisites
- **Node.js**: `v20+` or `v24+`
- **NPM**: `v10+`

### 1. Web Application Setup
```bash
# Navigate to web project
cd CartWise-main

# Install dependencies
npm install

# Seed the SQLite database
npm run db:seed

# Start Next.js development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### 2. Mobile App Setup (Free)
```bash
# Navigate to mobile project
cd cartwise-mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```
1. Install **Expo Go** on your smartphone from Google Play Store or Apple App Store.
2. Scan the terminal QR code to run the live mobile app on your phone!

---

### 3. Test Credentials & Demo Accounts

| Role | Portal URL | Email | Password | Access Level |
|---|---|---|---|---|
| **Super Admin** | `/admin/login` | `admin@cartwise.com` | `Admin@12345` | Full Marketplace Control |
| **Active Seller** | `/seller/login` | `vikram@natureharvest.in` | `Seller@12345` | Nature's Harvest (10% Fee) |
| **Active Seller** | `/seller/login` | `meera@purebotanics.com` | `Seller@12345` | Pure Botanics (12% Fee) |
| **Pending Seller** | `/seller/login` | `ananya@greenlife.co` | `Seller@12345` | Under Onboarding Review |
| **Customer** | `/` | *(Any email with 6-digit OTP)* | — | Standard Shopper |

---

## 🧪 Test Suite Execution

Run all unit, integration, and security test suites:
```bash
cd CartWise-main
npm test
```

---

## 📜 License
This project is licensed under the MIT License.
