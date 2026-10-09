<div align="center">
  <img src="./public/logo.png" alt="CartWise Plus Logo" width="160" />
  <h1>CartWise Plus+</h1>
  <p><strong>Smarter Search. Better Choices.</strong></p>
  <p>Next-Gen Multi-Vendor E-Commerce Platform & Autonomous AI Shopping Ecosystem</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
  [![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?logo=sqlite)](https://www.sqlite.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_%26_Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
  [![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-Edge_Rate_Limiter-00E599?logo=redis)](https://upstash.com/)
  [![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?logo=cloudinary)](https://cloudinary.com/)
  [![Vitest](https://img.shields.io/badge/Vitest-52%2F52_Passing-6E9F18?logo=vitest)](https://vitest.dev/)
</div>

---

## 🌟 Executive Overview

**CartWise Plus+** is an enterprise-grade, multi-vendor e-commerce platform and autonomous AI shopping copilot built with **Next.js 16 (App Router), React 19, SQLite, MongoDB Atlas, Upstash Redis, and Cloudinary**.

The platform is styled with a **Luxury Obsidian Black, Royal Gold, and Crisp White** design identity across three portals and high-scale edge infrastructure:

1. 🛍️ **Customer Storefront & AI Shopping Copilot** (`/`): Real-time grocery catalog, multimodal vision, Recipe-to-Cart bundler, live Mapbox rider telemetry, Facebook-style account recovery, Indian Rupee (`₹`), and atomic checkout (UPI QR, Card, COD).
2. 🏛️ **Marketplace Admin Control Center** (`/admin`): Executive KPI analytics, vendor moderation, dynamic commissions, payout disbursements, load balancer telemetry, and compliance audit logs.
3. 🏪 **Merchant / Seller Portal** (`/seller`): Zero-IDOR isolated vendor dashboard, inventory & SKU management, sub-order fulfillment, payout tracking, and public vendor storefronts (`/store/[slug]`).
4. ⚡ **Edge & Infrastructure Layer**: Global Edge Middleware rate limiting, distributed Upstash Redis edge caching, Cloudinary media CDN, and a multi-core cluster load balancer.

---

## 🚀 Key Feature Highlights

### 🥗 1. Recipe & Meal-to-Cart AI Bundler
- **Executive Culinary Copilot**: Generates complete recipe ingredient bundles for healthy bowls, smoothies, salads, and dinner prep directly from catalog inventory.
- **Dynamic Nutrition & Macros**: Calculates calories, protein, carbs, prep time, and verified dietary regimen badges.
- **Interactive Pantry Checklist**: Allows shoppers to uncheck items already in their pantry with live dynamic subtotal and savings recalculation.
- **Deterministic 1-Click Cart Populator**: Batches required items into the shopping cart with deterministic SQLite product IDs.

### 🛰️ 2. Live Mapbox Rider Telemetry & Interactive Satellite GPS
- **Real-Time Delivery Simulation**: Animated Ather 450X EV courier navigating real-time polyline trajectory between fulfillment hub and customer doorstep.
- **Dynamic Physics & Orientation**: Real-time heading rotation (bearing) with pulsing sonar waves.
- **Layer Switcher**: Seamlessly toggles between Cyber Dark Matter, Live Satellite, and Street views.
- **RTK GPS Telemetry HUD**: Live speedometer (km/h), EV battery level, live lat/long coordinates ticker, dynamic countdown ETA, and simulated hands-free rider call.

### 🔒 3. Facebook-Style Account Discovery & OTP Password Reset
- **Step 1: Search Account**: User inputs email to locate matching account.
- **Step 2: Confirm Identity**: Facebook-style account confirmation card displaying profile avatar, full name, privacy-masked email (`m***a@example.com`), and VIP member badge.
- **Step 3: OTP Verification & Reset**: 6-digit cryptographic OTP verification (15-min expiry) via Brevo SMTP (with dev auto-fill fallback), PBKDF2 password hashing, and immediate authenticated sign-in.

### 🛡️ 4. Edge Rate Limiting & Distributed Caching (Upstash Redis)
- **Multi-Tier Edge Throttling**:
  - **Auth & Password Recovery (`/api/auth`)**: 10 req/min (anti-brute force and OTP spam protection).
  - **Payments & Checkout (`/api/payment`, `/api/checkout`)**: 15 req/min (anti-fraud protection).
  - **AI Copilot & Vision (`/api/chat`, `/api/image-search`)**: 30 req/min (LLM quota protection).
  - **General Storefront APIs (`/api/`)**: 100 req/min (DDoS mitigation).
- **Standards-Compliant RFC 6585 Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`.
- **Zero-Failure Dual Mode**: Uses Upstash REST Redis in production; gracefully falls back to an internal sliding-window in-memory limiter for local development.
- **Edge CDN Caching**: Attaches `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` to public catalog reads.

### ☁️ 5. Cloudinary Media Storage Pipeline
- **Cloud-Native Asset Pipeline**: Direct uploads to Cloudinary with folder partitioning (`cartwise/products`, `cartwise/uploads`) and tagging.
- **Automatic Optimization**: Injects `f_auto,q_auto` to serve next-gen WebP/AVIF formats with lossless compression and smart thumbnail cropping.
- **Dedicated Upload Endpoint (`/api/upload`)**: Handles both `multipart/form-data` and `application/json` base64 uploads.
- **Offline / Local Fallback**: Gracefully saves to `public/uploads/` if credentials are not configured.

### ⚖️ 6. Enterprise Load Balancer Subsystem
- **Multi-Algorithm Balancing**: Supports Round-Robin, Weighted Round-Robin, Least-Connections, and IP Hash (Sticky Sessions).
- **Circuit Breaker**: Automatically trips and sidelines unhealthy nodes after 3 consecutive failures; background prober periodically checks for recovery.
- **Health Probing API (`/api/health`)**: Reports node status, process uptime, memory usage, and database connectivity checks.
- **Admin Load Balancer Telemetry (`/api/admin/load-balancer`)**: Real-time dashboard to inspect nodes, latencies, error rates, and dynamically toggle balancing algorithms.
- **Multi-Core Cluster Runner (`scripts/cluster.ts`)**: Run `npm run start:cluster` to distribute incoming load across CPU cores with zero-downtime worker auto-recovery.

---

## 🎨 Design System: Luxury Black, Gold & White

All portals adhere to a unified aesthetic:
- **Base Surfaces**: Deep obsidian black (`#07090E`, `#0A0D16`, `#0E131F`).
- **Metallic Gold Accents**: Royal Gold gradients (`#F59E0B`, `#FBBF24`, `#D97706`) for active pills, brand emblems, and KPI metrics.
- **Emerald Green**: Fresh organic green (`#059669`, `#10B981`) for freshness badges and verification states.
- **High-Contrast Typography**: Crisp Pure White (`#FFFFFF`) headings and clear muted slate subtext.
- **Glassmorphic Depth**: Semi-transparent card panels with subtle ambient lighting.

---

## 📁 Repository Structure

```text
E_Commerce-Agent/
├── app/
│   ├── admin/                         # Marketplace Admin Control Center (18 pages)
│   │   ├── analytics/                 # Business intelligence & sales share
│   │   ├── audit-logs/                # Compliance activity ledger
│   │   ├── commissions/               # Commission rules & live simulator
│   │   ├── login/                     # Admin authentication portal
│   │   ├── orders/                    # Order fulfillment & vendor split
│   │   ├── payouts/                   # Payout disbursements
│   │   ├── products/                  # Product moderation queue
│   │   ├── sellers/                   # Vendor onboarding & KYC
│   │   └── page.tsx                   # Admin overview dashboard
│   ├── seller/                        # Seller / Merchant Hub (17 pages)
│   │   ├── dashboard/                 # Seller analytics & KPIs
│   │   ├── inventory/                 # Low-stock monitoring
│   │   ├── login/                     # Merchant login & registration
│   │   ├── orders/                    # Vendor sub-order fulfillment
│   │   ├── payouts/                   # Payout withdrawal requests
│   │   └── products/new/              # Add new product form
│   ├── store/[slug]/                  # Public vendor storefronts
│   ├── api/                           # REST, Edge & Agent Endpoints
│   │   ├── admin/load-balancer/       # Dynamic load balancer management
│   │   ├── auth/                      # Login, register, verify, and FB reset
│   │   ├── chat/                      # Autonomous AI shopping copilot
│   │   ├── health/                    # System health & cluster prober
│   │   ├── image-search/              # Visual snap search API
│   │   ├── orders/                    # Deterministic order creation & lifecycle
│   │   ├── payment/                   # Razorpay / Stripe / UPI verification
│   │   ├── products/                  # SQLite catalog queries with edge cache
│   │   └── upload/                    # Cloudinary & local media upload
│   ├── globals.css                    # Obsidian Black & Gold luxury tokens
│   ├── layout.tsx                     # Root layout with providers
│   └── page.tsx                       # Customer storefront & copilot UI
├── components/
│   ├── admin/                         # AdminNavbar, AdminSidebar, AdminLayout
│   ├── seller/                        # SellerNavbar, SellerSidebar, SellerLayout
│   ├── auth/                          # AuthModal (3-step FB recovery), AddressModal
│   ├── cart/                          # CartDrawer, InvoiceModal, UpiQrModal
│   ├── chat/                          # TextMessage, ProductsMessage, RecipeBundleMessage,
│   │                                  # SatelliteGpsModal, AgentTraceModal
│   ├── orders/                        # OrdersView with 4-stage lifecycle stepper
│   └── Navbar.tsx                     # Customer sticky navbar with search & cart
├── context/                           # CartContext, UserContext, VoiceContext
├── data/                              # store.db (SQLite database with WAL mode)
├── lib/
│   ├── agent/                         # LLM Real and Deterministic Mock agents
│   ├── cloudinary.ts                  # Cloudinary image pipeline & optimizer
│   ├── db.ts                          # SQLite core data access layer
│   ├── edgeCache.ts                   # Upstash Redis & in-memory edge cache
│   ├── edgeRateLimit.ts               # Upstash Redis sliding-window rate limiter
│   ├── email.ts                       # Brevo SMTP invoice & OTP dispatcher
│   ├── loadBalancer.ts                # Enterprise Load Balancer Engine
│   ├── models/User.ts                 # MongoDB User model & schema
│   ├── payment.ts                     # Payment gateways & HMAC verification
│   ├── sellerDb.ts                    # Zero-IDOR isolated seller data layer
│   ├── types.ts                       # Unified TypeScript contracts
│   └── userDb.ts                      # MongoDB & memory authentication store
├── middleware.ts                      # Global Next.js Edge Middleware
├── scripts/
│   ├── cluster.ts                     # Multi-core cluster load balancer runner
│   └── seed.ts                        # SQLite database seeder
└── tests/                             # 7 Vitest test suites (52 tests)
    ├── auth_mongo.test.ts
    ├── cloudinary_storage.test.ts
    ├── edge_rate_limit.test.ts
    ├── forgot_password.test.ts
    ├── load_balancer.test.ts
    ├── mapbox_telemetry.test.ts
    └── recipe_bundler.test.ts
```

---

## 🛠️ Environment Configuration

Copy `.env.example` to `.env.local` and configure your credentials:

| Environment Variable | Description | Default / Fallback |
|---|---|---|
| `AGENT_MODE` | AI Agent mode (`real` or `mock`) | `real` |
| `LLM_PROVIDER` | LLM model selector (`auto`, `gemini`, `openai`, `groq`) | `auto` |
| `MONGODB_URI` | MongoDB Atlas database connection string | In-memory fallback |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Brevo SMTP relay for order invoices and OTPs | Dev mode console print |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay sandbox credentials | Sandbox mode |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe sandbox credentials | Sandbox mode |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis for Edge rate limiting & cache | In-memory sliding window |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials for media storage | `public/uploads` local fallback |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL vector tile access token | High-DPI CartoDB Dark Matter |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v20+` or `v24+`
- **NPM**: `v10+`

### 2. Setup & Installation
```bash
# Clone the repository
git clone https://github.com/coder-soumyadip29/E_Commerce-Agent.git
cd E_Commerce-Agent

# Install dependencies
npm install

# Seed the SQLite database (catalog, sellers, orders)
npm run db:seed

# Start the Next.js development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Running Multi-Core Clustered Server
To start the multi-worker cluster load balancer across all available CPU cores:
```bash
npm run start:cluster
```

---

## 🔑 Test Credentials & Demo Accounts

| Role | Portal URL | Email | Password | Access Level |
|---|---|---|---|---|
| **Super Admin** | `/admin/login` | `admin@cartwise.com` | `Admin@12345` | Full Marketplace Control |
| **Active Seller** | `/seller/login` | `vikram@natureharvest.in` | `Seller@12345` | Nature's Harvest (10% Fee) |
| **Active Seller** | `/seller/login` | `meera@purebotanics.com` | `Seller@12345` | Pure Botanics (12% Fee) |
| **Pending Seller** | `/seller/login` | `ananya@greenlife.co` | `Seller@12345` | Under Onboarding Review |
| **VIP Customer** | `/` | `maya.sterling@example.com` | `password123` | VIP Gold Shopper (1-click autofill) |

---

## 🧪 Test Suite Execution

Run all 52 unit, integration, and security test suites:
```bash
npm test
```

### Test Coverage Highlights:
- `tests/load_balancer.test.ts`: Round-Robin, Least-Connections, IP Hash, Circuit Breaker, Health Probes.
- `tests/cloudinary_storage.test.ts`: Base64 / Buffer uploads, URL optimization, and deletion.
- `tests/edge_rate_limit.test.ts`: Route sensitivity tiers, sliding-window limits, RFC 6585 headers.
- `tests/forgot_password.test.ts`: Facebook-style account search, masked email privacy, OTP reset.
- `tests/recipe_bundler.test.ts`: Structured Chef bundle generation, pantry filtering, SQLite grounding.
- `tests/mapbox_telemetry.test.ts`: Live GPS coordinates, ETA calculations, courier physics.
- `tests/auth_mongo.test.ts`: MongoDB registration, OTP verification, address book persistence.

---

## 📜 License
This project is licensed under the MIT License.
