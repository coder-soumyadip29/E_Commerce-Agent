# CartWise Tasks Checklist

## Step 0: Project Setup & Preparation
- [x] Create project directory structure (`cartwise/design`, `cartwise/reference`, `cartwise/test-images`)
- [x] Create `AGENTS.md` with system constraints and architectural rules
- [x] Add Stitch exports (HTML + screenshots) into `cartwise/design/Desktop` and `cartwise/design/Mobile`
- [x] Add mentor reference files (`setup_db.py`, `shopping_agent.py`, `reviews_api.py`, `app.py`, `store.db`) to `cartwise/reference/`
- [x] Extract and rename test images (`honey.png`, `oats.png`, `elephant.png`, `avocado_oil.png`, `rolled_oats.png`, etc.)

## Step 1: Database & Data Ingestion
- [x] Set up SQLite with `better-sqlite3` at `cartwise/data/store.db`
- [x] Seed and verify 32 products and 102 reviews matching mentor's database schema
- [x] Build data access layer in `cartwise/lib/db.ts` (`searchProducts`, `getProductById`, `createOrder`, `getOrders`)
- [x] Guarantee zero-hallucination querying strictly from SQLite records

## Step 2: Next.js Foundation & Design System
- [x] Initialize Next.js (App Router) + TypeScript + Tailwind CSS
- [x] Configure Organic Intelligence design tokens (`#1B4D3E` pine, `#2D7A54` green, `#FBF9F5` cream, Plus Jakarta Sans)
- [x] Apply iOS zoom-on-refresh fixes (exact viewport meta tag and html/body overflow CSS)
- [x] Build responsive layout supporting Desktop first then Mobile views

## Step 3: Agent Abstraction (`/lib/agent/`)
- [x] Define TypeScript contracts in `cartwise/lib/types.ts`: `text`, `products`, `image_analysis`, `clarify`, `compare`, `empty_state`
- [x] Implement `handleChat(messages)` with `AGENT_MODE=mock|real` switch (default: `mock`) in `cartwise/lib/agent/`
- [x] Implement `handleImage(file)` with `AGENT_MODE=mock|real` switch (default: `mock`) in `cartwise/lib/agent/`
- [x] Ground all candidate matches in SQLite queries with zero invented data

## Step 4: UI Components & Chat Interface
- [x] Implement dedicated React component for each structured message type:
  - [x] `TextMessage`
  - [x] `ProductsMessage` (grid/list with organic badges, star ratings, non-truncated titles, deterministic Add to Cart / Buy Now buttons)
  - [x] `ImageAnalysisMessage` (uploaded thumbnail, vision tags, description, matched product cards, non-product fallback)
  - [x] `ClarifyMessage` (interactive option pills)
  - [x] `CompareMessage` (side-by-side comparison matrix with attributes and ratings)
  - [x] `EmptyStateMessage` (reasoning and clickable alternative suggestions)
  - [x] `ThinkingMessage` (animated thinking state and trace indicators)
  - [x] `AgentTraceModal` (full inspector showing parsed intent, filters, and SQL executed against SQLite)
- [x] Implement `Navbar` with New Chat, Agent Trace inspector, Cart badge, and mobile drawer
- [x] Implement `EmptyChatPrompt` with 4 1-click suggestion cards and camera tips
- [x] Implement fixed `ChatInput` with photo upload and 1-click sample test images (`honey.png`, `oats.png`, `elephant.png`)

## Step 5: Shopping Cart & Order API
- [x] Implement deterministic `/api/orders` route saving to SQLite `orders` table
- [x] Implement `/api/chat` and `/api/image-search` routes
- [x] Implement `CartDrawer` with 3-step checkout flow (Cart -> Review Order -> Order Confirmed)
- [x] Implement `OrdersView` tab listing past orders recorded in SQLite
- [x] Verify production build passes with 0 errors (`npm run build`)

## Step 6: Aura PLUS Cyber UI Redesign (Preserving Products & Schema)
- [x] Deep futuristic dark mode design tokens & glassmorphism in `app/globals.css`
- [x] Top header with CartWise PLUS branding, pill search, Maya Sterling profile, wishlist, and live grid indicator
- [x] Horizontal Category Navigation bar with icon pills
- [x] Two-column master layout in `app/page.tsx`:
  - [x] Left pane: "MEGA SAVINGS DAYS • LIVE NOW" banner with live countdown timer, bestseller showcase, bank offers, and "Best Deals on Organic Harvest & Pantry Essentials" grid
  - [x] Right pane: "CartWise AI Copilot v3.8" sidebar with multi-modal controls, verified match cards, live shipment tracking (#1040), price arbitrage voucher with instant pay, and chat input
- [x] Interactive `SatelliteGpsModal` with live telemetry, radar scan, and courier tracking
- [x] Verify full compilation (`npm run build`) with 0 errors
- [x] Verify all 5 API vitest tests pass (`npx vitest run`) with 100% success

## Step 7: MongoDB Integration, Authentication, Addresses & Personalised Recommendations
- [x] Connect MongoDB with connection caching in `lib/mongodb.ts` (`mongodb://127.0.0.1:27017/cartwise`)
- [x] Define Mongoose User model with addresses, preferences, and verification schema in `lib/models/User.ts`
- [x] Implement database adapter `lib/userDb.ts` with password hashing (crypto PBKDF2), address persistence, and preference recommendations
- [x] Implement email verification utility (`lib/email.ts`) with 6-digit OTP generation, dev auto-fill, and SMTP support
- [x] Upgrade `app/api/auth/route.ts` with actions: `register`, `login`, `verify`, and `resend`
- [x] Upgrade `app/api/addresses/route.ts` with MongoDB persistence (GET, POST, PUT default, DELETE)
- [x] Upgrade `app/api/user/preferences/route.ts` with dietary personalization and tailored catalog recommendations
- [x] Upgrade `context/UserContext.tsx` with user state, session persistence (`localStorage`), email verification, and OTP handling
- [x] Upgrade `components/auth/AuthModal.tsx` with dedicated 6-digit email verification view, dev OTP helper banner, and resend countdown
- [x] Add "AI Personalised For You" showcase in `app/page.tsx` linked to active dietary preferences
- [x] Create comprehensive integration test suite `tests/auth_mongo.test.ts` (13/13 vitest tests passing)
- [x] Verify production build passes with 0 errors (`npm run build`)

## Step 8: Payment Gateway Integration (Razorpay / Stripe / Mock UPI Sandbox)
- [x] Configure payment gateway environment variables in `.env.local` and `.env.example` (`PAYMENT_GATEWAY_MODE=sandbox`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- [x] Create MongoDB payment audit collection & Mongoose schema in `lib/models/Payment.ts`
- [x] Implement payment security utilities in `lib/payment.ts`:
  - [x] Authoritative server-side price & inventory verification against SQLite (`verifyCartAgainstSqlite`)
  - [x] Coupon discount validation (`SAVE10`, `ORGANIC20`)
  - [x] Razorpay/Stripe order ID & payment ID generators
  - [x] Cryptographic HMAC-SHA256 signature generation and verification (`verifyPaymentSignature`)
  - [x] Atomic SQLite order creation (`atomicCreateSqliteOrder`) and stock deduction
  - [x] Dual-write MongoDB payment audit logging (`logPaymentInMongo`)
- [x] Implement API route `app/api/payment/create-order/route.ts`:
  - [x] Accepts `cartItems`, `totalAmount`, `discountCode`
  - [x] Verifies total against SQLite database to prevent client-side price tampering (returns 400 on price mismatch)
  - [x] Returns server-calculated amounts and gateway Order ID
- [x] Implement API route `app/api/payment/verify/route.ts`:
  - [x] Verifies cryptographic signature for UPI/Cards and instant authorization for COD
  - [x] Executes atomic SQLite order insertion and inventory decrement
  - [x] Updates MongoDB payment record status to `COMPLETED`
- [x] Build interactive payment frontend components in `components/cart/`:
  - [x] `DynamicUpiQrModal.tsx`: Dynamic UPI QR code modal (`upi://pay`), NPCI UPI spec with `sumankuity68@oksbi`, 5-minute timer, mobile deep link, manual UTR input + "I Have Paid" verification, and 1-click test triggers for Google Pay, PhonePe, and Paytm
  - [x] `CardSecurityModal.tsx`: Simulated 3D Secure 2.0 authentication modal with prefilled test OTP (`482910`)
  - [x] Enhanced `CartDrawer.tsx`: Multi-mode payment selectors (UPI, Card, COD), coupon codes, server-side tamper protection, and complete order receipt
- [x] Implement comprehensive payment test suite in `tests/payment.test.ts` (7/7 tests passing)
- [x] Verify complete test suite (20/20 vitest tests passing across entire repo)
- [x] Verify Next.js production build (`npm run build`) with 0 errors

## Step 9: Dynamic Address & Delivery Slot Logistics
- [x] Create `user_addresses` SQLite table in `lib/db.ts` & `scripts/seed.ts` with fields: `id`, `user_id`, `name`, `phone`, `street_address`, `landmark`, `city`, `pincode`, `type` (`Home` | `Work` | `Other`), `is_default`
- [x] Seed initial addresses for Maya Sterling in SQLite (`Penthouse 4B, 742 Evergreen Terrace` and `BioTech Innovation Hub`)
- [x] Implement database operations in `lib/db.ts`: `getUserAddresses`, `addUserAddressDb`, `setDefaultAddressDb`, `deleteUserAddressDb`, `getUserAddressById`
- [x] Define Delivery Slot architecture in `lib/deliverySlots.ts`:
  - [x] Instant 30-Min Fast Delivery (Grocery Express)
  - [x] Morning Slot (7:00 AM – 10:00 AM)
  - [x] Evening Slot (6:00 PM – 9:00 PM)
- [x] Implement PIN code auto-fill endpoint in `app/api/addresses/pincode/route.ts` with offline metro lookup and Indian Postal API fallback
- [x] Build `components/cart/AddNewAddressModal.tsx`:
  - [x] Form with validation for Name, Phone, Street, Landmark, PIN code, City, Type pills, and Default checkbox
  - [x] Instant PIN code auto-fill on typing 6 digits
  - [x] Browser Geolocation detector (`📍 Use Current Location`) with OpenStreetMap reverse geocoding
- [x] Upgrade `components/cart/CartDrawer.tsx`:
  - [x] Saved address selection pills with `Home`, `Work`, `Other` badges and radio selection
  - [x] Quick Geolocation bar ("Use Current Location")
  - [x] Interactive Delivery Slot Picker (3 slots with real-time dispatch windows)
  - [x] Pass delivery address and slot to order confirmation receipt
- [x] Create comprehensive integration test suite `tests/address_logistics.test.ts` (6/6 tests passing)
- [x] Verify complete test suite (26/26 vitest tests passing across all suites)
- [x] Verify production build passes with 0 errors (`npm run build`)
## Step 10: Invoice & Receipt Generation (Tax Compliance & Brevo Email Dispatch)
- [x] Define Tax Invoice Data Architecture in `lib/types.ts`: `InvoiceData`, `InvoiceItem`, `GstBreakdown`
- [x] Implement Tax & HSN Calculation Engine in `lib/invoice.ts`:
  - [x] Grocery & organic standard 5% GST computation (2.5% CGST + 2.5% SGST split)
  - [x] Accurate itemized pricing with calculated taxable amounts and GST amounts
  - [x] Official Indian HSN code mapper (`0409 00 00` Honey, `1904 10 90` Oats, `1509 90 00` Oil, `2008 19 20` Nut butters, etc.)
  - [x] Registered Store Identity (CartWise Organics Pvt Ltd, GSTIN `29AAACC1206D1ZM`, FSSAI `11223334000555`)
  - [x] Zero price discrepancy guarantee (Taxable + CGST + SGST = Final payable total)
- [x] Implement Email Dispatch Engine in `lib/email.ts` (`sendOrderInvoiceEmail`):
  - [x] Responsive HTML invoice email layout matching CartWise PLUS dark aesthetic
  - [x] Integrated with Brevo SMTP relay (`smtp-relay.brevo.com:587`)
  - [x] Includes order ID, transaction ID, itemized table, GST breakdown, customer name & delivery destination
- [x] Upgrade Payment Verification API `app/api/payment/verify/route.ts`:
  - [x] Generates complete tax invoice upon payment signature verification
  - [x] Dispatches invoice email to customer immediately after payment verification
  - [x] Returns `invoice` and `emailStatus` in verify response
- [x] Build Printable & Downloadable PDF Modal `components/cart/InvoiceModal.tsx`:
  - [x] High-fidelity tax invoice screen with GSTIN, HSN codes, customer address, and delivery slot
  - [x] Clean `@media print` styling hiding UI chrome and formatting document for browser "Save as PDF" / printer
  - [x] Action button "Print / Download PDF" triggering `window.print()`
- [x] Integrate with `components/cart/CartDrawer.tsx` Order Confirmed Screen:
  - [x] Email dispatch notice banner (`📄 Tax invoice sent to sumankuity68@gmail.com`)
  - [x] "View & Print Tax Invoice (PDF)" button opening interactive printable modal
  - [x] Dynamic receipt with payment ID, SQLite Order ID, and delivery destination
- [x] Build comprehensive unit & integration test suite in `tests/invoice_receipt.test.ts` (4/4 tests passing)
  - [x] Tests HSN code assignment for all grocery commodities
  - [x] Tests mathematical accuracy of CGST, SGST, taxable base, and totals
  - [x] Tests customer delivery address and slot binding
  - [x] Tests email dispatch handler
- [x] Verify complete test suite (30/30 vitest tests passing across all 5 suites)
- [x] Verify full TypeScript and Next.js compilation (`npx tsc --noEmit`) with 0 errors

## Step 11: AI Shopping Agent Order & Payment Tools (`lib/agent/real.ts`)
- [x] Implement `track_specific_order({ order_id })` tool:
  - [x] Defined in `TOOLS_DECLARATION` with input parameter `{ order_id: INTEGER }`
  - [x] Fetches order record from SQLite database via `getOrderById(orderId)`
  - [x] Computes real-time logistics telemetry: rider contact (name, phone, badge), vehicle specs, live coordinates, and ETA
  - [x] Returns structured checkpoints (Order Verified -> Warehouse Packaged -> Out for Express Delivery -> Delivered)
- [x] Implement `cancel_order({ order_id, reason })` tool:
  - [x] Defined in `TOOLS_DECLARATION` with input parameters `{ order_id: INTEGER, reason: STRING }`
  - [x] Validates if order is still in `placed` or `packing` stage in `lib/db.ts` (`cancelOrderDb`)
  - [x] Atomically transitions status to `cancelled` and restores product stock inventory in SQLite
  - [x] Rejects cancellation with clear explanations if order is already `delivered` or in `transit`
  - [x] Computes full refund amount to original payment method
- [x] Implement `generate_invoice({ order_id })` tool:
  - [x] Defined in `TOOLS_DECLARATION` with input parameter `{ order_id: INTEGER }`
  - [x] Grounded in official store identity (GSTIN `29AAACC1206D1ZM`, FSSAI)
  - [x] Itemized product list with standard HSN codes, quantity, unit price, and line totals
  - [x] 5% composite GST breakdown (CGST 2.5% + SGST 2.5%)
  - [x] Provides direct downloadable invoice receipt URL (`/api/orders/${order.id}/invoice`)
- [x] Multi-Turn Prompt Engineering in `SYSTEM_INSTRUCTION`:
  - [x] Directs Gemini agent to recognize order tracking, cancellation, and receipt intents in English, Hindi, and Bengali
  - [x] Formats natural conversational responses for tracking ETAs, cancellation refunds, and invoices
- [x] Unit & Integration Test Suite in `tests/agent_tools.test.ts`:
  - [x] 10/10 tests passing covering tracking, delivered states, cancellation restrictions, inventory replenishment, and invoice generation
- [x] Verify complete test suite (40/40 vitest tests passing across all 6 suites)
- [x] Full TypeScript type-checking (`npx tsc --noEmit`) verified with 0 errors

## Step 12: Real-Time Order Tracking & Lifecycle Engine
- [x] Schema Extension in `lib/db.ts`:
  - [x] Extended `orders` table with columns: `payment_id`, `payment_method`, `delivery_address_json`, `delivery_slot`, `tracking_status`, `estimated_delivery_time`, `cancellation_reason`
  - [x] Dynamic non-destructive schema migration in `getDb()` via `ALTER TABLE orders ADD COLUMN ...`
  - [x] Updated order models and formatters in `lib/db.ts` (`formatOrderRecord`, `getOrders`, `getOrderById`, `updateOrderTrackingStatusDb`)
  - [x] Updated seed script in `scripts/seed.ts` with comprehensive sample orders in `delivered`, `out_for_delivery`, and `packing` stages
- [x] 4-Stage Tracking Lifecycle Architecture:
  - [x] 🟡 `placed` (Order Placed)
  - [x] 🟠 `packing` (Order Packed & Quality Checked)
  - [x] 🔵 `out_for_delivery` (Out for Delivery - Rider assigned)
  - [x] 🟢 `delivered` (Delivered)
  - [x] Added `cancellation` state handling with inventory restoration
- [x] REST API Endpoints:
  - [x] `PATCH /api/orders/[id]/tracking` for advancing tracking status
  - [x] `POST /api/orders/[id]/cancel` for order cancellation with inventory replenishment
  - [x] Integrated `atomicCreateSqliteOrder` in `lib/payment.ts` and `app/api/payment/verify/route.ts` to record all lifecycle attributes
- [x] Visual Stepper & Delivery Component in `components/orders/OrdersView.tsx`:
  - [x] `OrderLifecycleStepper`: animated progress bar with glowing `animate-ping` / `animate-pulse` active ring and stage timestamps
  - [x] `DeliveryPartnerCard`: Rider details (name, phone, EV delivery vehicle, rating, distance telemetry)
  - [x] `LiveCountdown`: Real-time ticking ETA timer with minutes & seconds
  - [x] Interactive stage progression simulator ("Advance Stage" button)
  - [x] Direct "Tax Invoice (PDF)" button integrating `InvoiceModal`
  - [x] One-click cancellation for eligible orders (`placed` / `packing`)
- [x] Unit & Integration Test Suite in `tests/order_tracking_lifecycle.test.ts`:
  - [x] 5/5 tests passing verifying schema columns, 4-stage transitions, rider info, cancellation validation, and backward compatibility
- [x] Test Suite & Build Verification:
  - [x] All 7 test suites (45/45 vitest tests) passing 100%
  - [x] Full TypeScript type-checking (`npx tsc --noEmit`) verified with 0 errors


