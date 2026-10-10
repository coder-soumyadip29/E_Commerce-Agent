# CartWise Tasks Checklist

## Step Project Setup & Preparation
- [x] Create project directory structure (`cartwise/design`, `cartwise/reference`, `cartwise/test-images`)
- [x] Create `AGENTS.md` with system constraints and architectural rules
- [x] Add Stitch exports (HTML + screenshots) into `cartwise/design/Desktop` and `cartwise/design/Mobile`
- [x] Add mentor reference files (`setup_db.py`, `shopping_agent.py`, `reviews_api.py`, `app.py`, `store.db`) to `cartwise/reference/`
- [x] Extract and rename test images (`honey.png`, `oats.png`, `elephant.png`, `avocado_oil.png`, `rolled_oats.png`, etc.)

## Step Database & Data Ingestion
- [x] Set up SQLite with `better-sqlite3` at `cartwise/data/store.db`
- [x] Seed and verify 32 products and 102 reviews matching mentor's database schema
- [x] Build data access layer in `cartwise/lib/db.ts` (`searchProducts`, `getProductById`, `createOrder`, `getOrders`)
- [x] Guarantee zero-hallucination querying strictly from SQLite records

## Step Next.js Foundation & Design System
- [x] Initialize Next.js (App Router) + TypeScript + Tailwind CSS
- [x] Configure Organic Intelligence design tokens (`#1B4D3E` pine, `#2D7A54` green, `#FBF9F5` cream, Plus Jakarta Sans)
- [x] Apply iOS zoom-on-refresh fixes (exact viewport meta tag and html/body overflow CSS)
- [x] Build responsive layout supporting Desktop first then Mobile views

## Step Agent Abstraction (`/lib/agent/`)
- [x] Define TypeScript contracts in `cartwise/lib/types.ts`: `text`, `products`, `image_analysis`, `clarify`, `compare`, `empty_state`
- [x] Implement `handleChat(messages)` with `AGENT_MODE=mock|real` switch (default: `mock`) in `cartwise/lib/agent/`
- [x] Implement `handleImage(file)` with `AGENT_MODE=mock|real` switch (default: `mock`) in `cartwise/lib/agent/`
- [x] Ground all candidate matches in SQLite queries with zero invented data

## Step UI Components & Chat Interface
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

## Step Shopping Cart & Order API
- [x] Implement deterministic `/api/orders` route saving to SQLite `orders` table
- [x] Implement `/api/chat` and `/api/image-search` routes
- [x] Implement `CartDrawer` with 3-step checkout flow (Cart -> Review Order -> Order Confirmed)
- [x] Implement `OrdersView` tab listing past orders recorded in SQLite
- [x] Verify production build passes with 0 errors (`npm run build`)

## Step Aura PLUS Cyber UI Redesign (Preserving Products & Schema)
- [x] Deep futuristic dark mode design tokens & glassmorphism in `app/globals.css`
- [x] Top header with CartWise PLUS branding, pill search, Maya Sterling profile, wishlist, and live grid indicator
- [x] Horizontal Category Navigation bar with icon pills
- [x] Two-column master layout in `app/page.tsx`:
  - [x] Left pane: "MEGA SAVINGS DAYS • LIVE NOW" banner with live countdown timer, bestseller showcase, bank offers, and "Best Deals on Organic Harvest & Pantry Essentials" grid
  - [x] Right pane: "CartWise AI Copilot v3.8" sidebar with multi-modal controls, verified match cards, live shipment tracking (#1040), price arbitrage voucher with instant pay, and chat input
- [x] Interactive `SatelliteGpsModal` with live telemetry, radar scan, and courier tracking
- [x] Verify full compilation (`npm run build`) with 0 errors
- [x] Verify all 5 API vitest tests pass (`npx vitest run`) with 100% success

## Step MongoDB Integration, Authentication, Addresses & Personalised Recommendations
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

## Step Payment Gateway Integration (Razorpay / Stripe / Mock UPI Sandbox)
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

## Step Dynamic Address & Delivery Slot Logistics
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
## Step Invoice & Receipt Generation (Tax Compliance & Brevo Email Dispatch)
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

## Step AI Shopping Agent Order & Payment Tools (`lib/agent/real.ts`)
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

## Step Real-Time Order Tracking & Lifecycle Engine
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

## Step Complete Multi-Vendor Marketplace Admin System
- [x] Multi-Vendor Architectural Foundations & Data Abstraction (`lib/adminDb.ts`, `lib/types.ts`):
  - [x] Seller entity schema (`ACTIVE`, `PENDING`, `SUSPENDED`, `REJECTED`, bank accounts, custom commission rates)
  - [x] Multi-tier Commission Engine (Global platform baseline, category rates, vendor contracts)
  - [x] Order Split Fulfillment Architecture (Parent order split into vendor sub-orders with frozen commission snapshots)
  - [x] Financial audit models: Payouts, payment reconciliation, returns (RMA lifecycle), refunds, coupons, and customer reviews
  - [x] RBAC Administration schema (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SUPPORT`, `FINANCE`, `MODERATOR`) and Audit Logging
- [x] Admin Secure Authentication & Session Guard:
  - [x] Cookie token session (`cartwise_admin_token`) with role verification (`app/api/admin/auth/route.ts`)
  - [x] Dedicated branded login portal (`app/admin/login/page.tsx`) with 1-click super admin pre-fill
  - [x] Route-level protection and unauthorized 401 interception
- [x] Admin Shell & Responsive Navigation (`components/admin/`):
  - [x] `AdminNavbar.tsx`: Live search, unread notification counter, current admin identity, and logout
  - [x] `AdminSidebar.tsx`: Grouped navigation (Overview, Marketplace, Operations, Finance, Marketing, System), collapsible mobile drawer, and active indicator
  - [x] `AdminLayout.tsx`: Authentication validation wrapper with persistent layout shell
- [x] 18 Complete Production-Grade Admin Control Center Modules:
  - [x] Executive Dashboard (`app/admin/page.tsx`): 8 real-time KPI metrics, dynamic SVG GMV chart, and pending moderation queue
  - [x] Seller Directory & Onboarding (`app/admin/sellers/page.tsx`): Status toggling, KYC verification badges, and custom commission rates
  - [x] Products & Moderation Queue (`app/admin/products/page.tsx`): Product approvals, suspensions, inline stock adjustment, and price controls
  - [x] Categories & Taxonomies (`app/admin/categories/page.tsx`): Category hierarchy, category commission rate overrides, and subcategories
  - [x] Inventory & Stock Center (`app/admin/inventory/page.tsx`): Low stock alerts, threshold triggers, and bulk stock replenishment
  - [x] Order Fulfillment & Multi-Vendor Splits (`app/admin/orders/page.tsx`): Sub-order vendor breakdown, tracking carrier assignment, and status updates
  - [x] Commission Rate Rules & Live Simulator (`app/admin/commissions/page.tsx`): Dynamic fee simulator and rule hierarchy editor
  - [x] Vendor Payout Disbursements (`app/admin/payouts/page.tsx`): Bank transfer approvals, wire reference IDs, and payout logs
  - [x] Payment Gateway Reconciliations (`app/admin/payments/page.tsx`): Dual-gateway transaction log (UPI, Stripe, Cards, COD)
  - [x] Returns & RMA Management (`app/admin/returns/page.tsx`): 6-stage reverse logistics lifecycle (`REQUESTED` -> `COMPLETED`)
  - [x] Customer Refund Disputes (`app/admin/refunds/page.tsx`): Instant dispute resolution and full/partial refund processing
  - [x] Customer Directory & CRM (`app/admin/customers/page.tsx`): Lifetime value, order history, and account status
  - [x] Product Review Moderation (`app/admin/reviews/page.tsx`): Customer rating reviews, approval, spam rejection, and purge
  - [x] Coupons & Marketplace Discounts (`app/admin/coupons/page.tsx`): Coupon builder, usage limits, and active toggling
  - [x] Flash Sales & Marketing Campaigns (`app/admin/promotions/page.tsx`): Promotional banner management and scheduled events
  - [x] Financial & Operations Reports (`app/admin/reports/page.tsx`): 1-click real CSV exports for GMV, payouts, orders, and taxes
  - [x] Business Intelligence & Analytics (`app/admin/analytics/page.tsx`): Category sales share, top performing vendors, and growth curves
  - [x] Admin Notification Center (`app/admin/notifications/page.tsx`): Real-time operations alerts and mark-as-read toggling
  - [x] Admin Staff & RBAC Management (`app/admin/admin-users/page.tsx`): Admin team management and role permission matrix
  - [x] Compliance Audit Logs (`app/admin/audit-logs/page.tsx`): Immutable administrative activity ledger with actor and resource metadata
  - [x] Global Marketplace Settings (`app/admin/settings/page.tsx`): Commission baselines, payout schedules, tax rules, and currency
## Step Complete Production-Grade Seller / Vendor Portal
- [x] Multi-Vendor Seller Architecture & Database Isolation (`lib/sellerDb.ts`, `lib/sellerAuth.ts`, `lib/types.ts`):
  - [x] Zero-IDOR backend query filters strictly derived from `cartwise_seller_token` session cookie
  - [x] Extended data models: store slug, branding, policies, bank credentials, support tickets, product variants, and seller replies
  - [x] Status-based access interception: `ACTIVE` accounts enter dashboard; `SUSPENDED` / `BLOCKED` accounts receive a restricted-access screen; `PENDING` accounts see onboarding notice
- [x] Seller Authentication & Master Layout (`components/seller/`):
  - [x] Secure authentication API (`app/api/seller/auth/route.ts`) supporting login, onboarding registration, session check, and logout
  - [x] Branded merchant login page (`app/seller/login/page.tsx`) with 1-click test credentials for Seller 1 (Active), Seller 2 (Active), Seller 4 (Under Review), and Seller 5 (Suspended)
  - [x] Merchant navigation bar (`components/seller/SellerNavbar.tsx`) with store identity, live customer storefront preview link, and notification badge
  - [x] Responsive 10-module merchant sidebar (`components/seller/SellerSidebar.tsx`) with mobile drawer
  - [x] Master layout guard (`components/seller/SellerLayout.tsx`) with account status checks
- [x] Seller Operations & Catalog Management:
  - [x] Seller Executive Dashboard (`app/seller/dashboard/page.tsx`, `app/api/seller/dashboard/route.ts`): 8 live KPI cards, SVG sales velocity chart, recent sub-orders, and top products
  - [x] Store Branding & Profile (`app/seller/store/page.tsx`, `app/seller/settings/store/page.tsx`, `app/api/seller/store/route.ts`): Logo, banner, contact info, and policies (shipping, return, refund)
  - [x] Merchant Identity & Onboarding Profile (`app/seller/profile/page.tsx`, `app/api/seller/profile/route.ts`): 85% profile completion meter, KYC status, and masked bank coordinates
  - [x] Public Customer Storefront (`app/store/[slug]/page.tsx`, `app/api/store/[slug]/route.ts`): Integrated customer store page with verified vendor rating, banner, and direct cart add
  - [x] Catalog Management (`app/seller/products/page.tsx`, `app/api/seller/products/route.ts`): Filterable product table, moderation status (`ACTIVE`, `PENDING_APPROVAL`, `REJECTED`), and stock/price editor
  - [x] Product Creation Pipeline (`app/seller/products/new/page.tsx`): Multi-variant creator, low-stock threshold, dimensions, SEO metadata, and admin submission workflow
  - [x] Warehouse Inventory Control (`app/seller/inventory/page.tsx`, `app/api/seller/inventory/route.ts`): Total stock vs reserved stock vs available stock with inline stock updates
  - [x] Sub-Order Fulfillment & Shipping (`app/seller/orders/page.tsx`, `app/api/seller/orders/route.ts`): Sub-order isolation, carrier dispatch (`Delhivery`, `Bluedart`, `FedEx`, `Shadowfax`), tracking codes, and status lifecycle
  - [x] Returns & RMA Management (`app/seller/returns/page.tsx`, `app/api/seller/returns/route.ts`): Return authorization and completion
  - [x] Refunds History (`app/seller/refunds/page.tsx`, `app/api/seller/refunds/route.ts`): Customer refund deductions and escrow ledger tracking
- [x] Economics, Finance & Payouts:
  - [x] Earnings & Settlement (`app/seller/earnings/page.tsx`, `app/api/seller/earnings/route.ts`): Gross sales, platform fee deductions, net lifetime earnings, available balance, and escrow pending
  - [x] Immutable Commission Log (`app/seller/commissions/page.tsx`): Historical fee snapshot per sub-order immune to retroactive changes
  - [x] Payout Disbursements & Modal (`app/seller/payouts/page.tsx`, `app/api/seller/payouts/route.ts`): Minimum ₹500 withdrawal guard, available balance check, and status tracker (`PENDING`, `COMPLETED`, `REJECTED`)
  - [x] Bank Coordinates & Payment Settings (`app/seller/settings/payment/page.tsx`): Masked account details, IFSC, and UPI VPA
- [x] Marketing, Analytics & Support:
  - [x] Product Reviews & Merchant Replies (`app/seller/reviews/page.tsx`, `app/api/seller/reviews/route.ts`): Star distribution metrics, public merchant reply posting, and safety reporting
  - [x] Store-Exclusive Coupons (`app/seller/coupons/page.tsx`, `app/api/seller/coupons/route.ts`): Coupon builder, usage caps, and active/inactive toggle
  - [x] Deep Performance Analytics (`app/seller/analytics/page.tsx`, `app/api/seller/analytics/route.ts`): Revenue charts, order volume, category share, and product diagnostic table
  - [x] Seller Notifications Feed (`app/seller/notifications/page.tsx`, `app/api/seller/notifications/route.ts`): Real-time operations feed with mark-as-read
  - [x] Merchant Support Desk (`app/seller/support/page.tsx`, `app/api/seller/support/route.ts`): Multi-category ticket system with threaded back-and-forth messaging
- [x] Security, Zero-IDOR & Quality Verification:
  - [x] Dedicated unit test suite (`tests/seller_security.test.ts`) with 8 tests passing verifying cross-tenant catalog isolation, order isolation, IDOR prevention, negative stock rejection, and payout limits
  - [x] Full Vitest regression suite passing (8/8 test files, 53/53 tests 100% passing)
  - [x] Full TypeScript compiler check (`npx tsc --noEmit`) passing with 0 errors
  - [x] Zero regression across existing customer storefront and Admin control center

## Step Recipe & Meal-to-Cart AI Bundler
- [x] Data Architecture & Schema Extension (`lib/types.ts`):
  - [x] Defined `RecipeIngredient` (`product: Product`, `requiredQty`, `unit`, `purpose`)
  - [x] Defined `RecipeBundleMessagePayload` (`recipeName`, `dishType`, `servings`, `prepTime`, `caloriesPerServing`, `nutrition`, `dietaryTags`, `instructions`, `ingredients`, `totalBundlePrice`, `originalBundlePrice`, `bundleDiscountPercent`, `trace`)
  - [x] Integrated `recipe_bundle` structured variant directly into `AssistantMessage` union
- [x] Dedicated Luxury Chef UI Component (`components/chat/RecipeBundleMessage.tsx`):
  - [x] Executive Black & Gold / Organic Emerald styling with ambient lighting and Chef AI badge
  - [x] Nutritional breakdown grid: Prep time, calories, protein, carbs, and verified dietary badges
  - [x] Interactive Pantry Checklist: checkbox for each ingredient allowing users to uncheck items already in their pantry
  - [x] Quantity stepper (`-` / `+`) per ingredient with live dynamic subtotal and savings recalculation
  - [x] Collapsible step-by-step culinary preparation instructions
  - [x] Deterministic 1-click batch cart bundler (`addToCart(product, qty)`) with loading spinner and success feedback
- [x] Agent Intelligence & Catalog Grounding (`lib/agent/`):
  - [x] Grounded recipes in `lib/agent/mock.ts` with instant responses for oats bowls, quinoa salads, smoothies, and meal prep
  - [x] Added `generate_recipe_bundle` tool declaration to `lib/agent/real.ts` for Gemini / OpenAI / Groq LLMs
  - [x] Catalog search and stock verification against SQLite `store.db` with zero invented product IDs
  - [x] Updated suggestion prompts in `components/chat/EmptyChatPrompt.tsx` with 1-click Chef AI recipe trigger
- [x] Test Suite & Build Verification:
  - [x] Dedicated unit test suite (`tests/recipe_bundler.test.ts`) with 3 tests passing verifying structured bundle outputs, SQLite grounding, price calculations, and tool execution
  - [x] Full Next.js production compilation (`npm run build`) passing with 0 errors across all 91 routes

## Step Live Mapbox Rider Telemetry & Interactive GPS Tracker Modal
- [x] Environment & Tile Configuration:
  - [x] Added `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.example`
  - [x] Built seamless fallback to high-DPI vector Dark Matter & OSM tiles for zero-token local/offline execution
- [x] Telemetry Schema Extension (`lib/types.ts`):
  - [x] Extended `OrderTrackingInfo` with `originCoords`, `destinationCoords`, `currentCoords`, `riderName`, `riderPhone`, `riderVehicle`, `riderRating`, `speedKmh`, `batteryPercent`, `routeProgress`
- [x] Interactive GPS Telemetry Engine (`components/chat/SatelliteGpsModal.tsx`):
  - [x] High-precision Web Mercator projection supporting pan / drag and dynamic zoom controls
  - [x] Map Layer Switcher: Dark Cyber, Live Satellite, and Street views
  - [x] Animated Ather 450X EV rider navigating real-time polyline trajectory with dynamic heading rotation (bearing) and radar wave pulses
  - [x] Store Fulfillment Hub and Customer Doorstep pins with glowing beacons
  - [x] Real-time Telemetry HUD: RTK GPS satellite lock, live speedometer (km/h), EV battery level, live lat/long coordinates ticker, and dynamic ETA
  - [x] Interactive action controls: Recenter on Rider, Play/Pause telemetry simulation, fast-forward to arrival, and simulated hands-free rider call dialog
  - [x] Live shareable tracking link copying with visual feedback
- [x] Storefront & Orders Integration (`components/orders/OrdersView.tsx`, `app/page.tsx`):
  - [x] Integrated "🛰️ Live GPS" launch button directly on active customer orders in `OrdersView.tsx`
  - [x] Grounded telemetry coordinates and vehicle data in `lib/agent/mock.ts` for AI copilot order tracking
- [x] Test Suite & Verification:
  - [x] Dedicated telemetry integration test suite (`tests/mapbox_telemetry.test.ts`) with 2/2 tests passing
  - [x] Full Next.js production build (`npm run build`) verified with 0 errors across all 91 routes

## Step Facebook-Style Account Search & Password Reset Flow
- [x] Backend & Data Security Layer:
  - [x] Extended `IUser` and `UserSchema` in `lib/models/User.ts` with `resetPasswordOtp?: string` and `resetPasswordOtpExpires?: Date`
  - [x] Created `sendPasswordResetEmail(email, code, userName)` in `lib/email.ts` with Brevo SMTP transport and dev auto-print fallback
  - [x] Implemented `searchAccountByEmail(email)` with email masking (`m***a@example.com`), MongoDB + in-memory resilience in `lib/userDb.ts`
  - [x] Implemented `sendPasswordResetOtp(email)` with 6-digit cryptographic code and 15-minute expiration
  - [x] Implemented `resetPasswordWithOtp(email, code, newPassword)` using PBKDF2 hash & salt, atomic token clearing, and auto-verification
  - [x] Extended `/api/auth` with `action: "search_account"`, `action: "send_reset_otp"`, and `action: "reset_password"`
  - [x] Added `searchAccount`, `sendPasswordResetOtp`, and `resetPasswordWithOtp` helpers to `UserContext.tsx`
- [x] Facebook-Style 3-Step Modal Interface (`components/auth/AuthModal.tsx`):
  - [x] Added "Forgot password?" trigger link adjacent to Password label on the Sign-In tab
  - [x] Step 1 (Search): User enters email; searches database; includes quick-demo auto-fill for testing
  - [x] Step 2 (Confirm): Displays matched user card with avatar, full name, masked email, and VIP badge; prompts "This is my account — Send OTP" or "Not your account? Search again"
  - [x] Step 3 (Reset): 6-digit OTP input with Dev Auto-Fill banner, show/hide password toggle, new password confirmation, resend cooldown timer, and automatic authenticated login
  - [x] Step indicator breadcrumbs ("1. Search → 2. Confirm → 3. Reset") and contextual back navigation
- [x] Testing & Build Verification:
  - [x] Added comprehensive test suite `tests/forgot_password.test.ts` (12/12 tests passing 100%)
  - [x] Verified zero regressions across all existing test suites (`auth_mongo`, `recipe_bundler`, `mapbox_telemetry`)
  - [x] Full production build verified (`npm run build`) with 0 errors across all 91 routes

## Step Edge Caching & Multi-Tier Rate Limiting
- [x] Edge Rate Limiter Architecture (`lib/edgeRateLimit.ts`):
  - [x] Dual-mode rate limiter supporting Upstash Redis REST API (zero serverless cold-start) with automatic sliding-window in-memory fallback
  - [x] Multi-tier route protection:
    - Auth & Credential recovery (`/api/auth`): 10 req/min (anti-brute force and OTP spam protection)
    - Payment transactions (`/api/payment`, `/api/checkout`): 15 req/min (anti-fraud protection)
    - AI Copilot & Vision (`/api/chat`, `/api/image-search`): 30 req/min (LLM quota protection)
    - General storefront APIs (`/api/`): 100 req/min (DDoS mitigation)
  - [x] Standards-compliant RFC 6585 response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`, `X-RateLimit-Source`)
- [x] Distributed Edge Caching Layer (`lib/edgeCache.ts`):
  - [x] Supports Upstash Redis REST KV cache with in-memory TTL map fallback
  - [x] Standard CDN Cache-Control header helpers (`s-maxage=60`, `stale-while-revalidate=300`) for Cloudflare / Vercel Edge networks
- [x] Global Next.js Edge Middleware (`middleware.ts`):
  - [x] Intercepts `/api/:path*`, derives client IP (`x-forwarded-for` / `x-real-ip`), evaluates tier rules, and enforces HTTP 429 throttling
  - [x] Attaches edge caching headers to public catalog reads (`/api/products`, `/api/store`)
- [x] Environment & Documentation (`.env.example`):
  - [x] Added `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` with instructions for the free tier
- [x] Test Suite & Verification:
  - [x] Dedicated unit test suite (`tests/edge_rate_limit.test.ts`) with 9/9 tests passing (100%)
  - [x] Full Next.js production build (`npm run build`) verified with 0 errors across all 91 routes + Edge proxy

## Step Cloudinary Media Storage & Transformation Pipeline
- [x] Core Cloudinary Utility (`lib/cloudinary.ts`):
  - [x] Installed and configured `cloudinary` v2 SDK
  - [x] Implemented `uploadImage(fileInput, options)` supporting Buffers, base64 data URIs, and remote URLs
  - [x] Built resilient local fallback (`public/uploads`) for local development and offline resilience
  - [x] Implemented `deleteImage(publicId)` for asset purging
  - [x] Implemented `getOptimizedImageUrl(publicIdOrUrl, options)` generating automatic WebP/AVIF transformations (`f_auto,q_auto`)
- [x] Media Upload API Route (`app/api/upload/route.ts`):
  - [x] Multi-format upload handler supporting `multipart/form-data` and `application/json` (base64)
  - [x] Protected with Edge Middleware rate limiting
- [x] Environment & Documentation:
  - [x] Added `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to `.env.example`
- [x] Test Suite & Verification:
  - [x] Dedicated unit test suite (`tests/cloudinary_storage.test.ts`) with 9/9 tests passing (100%)
  - [x] Full test suite (43/43 tests passing across 6 test suites)
  - [x] Full Next.js production build (`npm run build`) verified with 0 errors across all 92 routes

## Step Enterprise Load Balancer Subsystem
- [x] Core Load Balancer Engine (`lib/loadBalancer.ts`):
  - [x] Implemented multiple distribution algorithms: Round-Robin, Weighted Round-Robin, Least-Connections, and IP Hash (Sticky Sessions)
  - [x] Built Circuit Breaker with passive failure tracking (trips after 3 consecutive failures)
  - [x] Built active health probing (`probeAllNodes()`)
  - [x] Built automatic multi-node failover with retry logic and latency tracking
- [x] Multi-Core Cluster Runner (`scripts/cluster.ts`):
  - [x] Created `npm run start:cluster` running Node.js `node:cluster` to distribute incoming load across multi-core workers with zero-downtime auto-recovery
- [x] Health Probing & Admin Telemetry APIs:
  - [x] Created `/api/health` providing real-time system metrics, memory usage, uptime, and database connectivity checks
  - [x] Created `/api/admin/load-balancer` allowing administrators to inspect active nodes, latencies, error rates, and dynamically toggle balancing algorithms
  - [x] Integrated `X-LoadBalancer-Node` header in `middleware.ts` for per-request worker observability
- [x] Test Suite & Verification:
  - [x] Dedicated unit test suite (`tests/load_balancer.test.ts`) with 9/9 tests passing (100%)
- [x] Full test suite passing (52/52 tests across 7 test suites)
- [x] Full Next.js production compilation (`npm run build`) passing with 0 errors across all 94 routes
## Step 21: Multi-LLM Provider Enhancement & Deployment Reliability
- [x] Integrated Google Gemini (`gemini-flash-latest`) using `GOOGLE_API_KEY` with verified function calling
- [x] Integrated Groq (`openai/gpt-oss-120b`) using `GROQ_API_KEY` for ultra-fast, zero-quota-exhaustion AI responses
- [x] Configured seamless fallback cascade (OpenAI -> Groq -> Gemini -> Deterministic Engine)
- [x] Fixed conversational query parsing & plural category matching in `mock.ts` and `db.ts`
- [x] Secured `/api/chat` route against unhandled errors with graceful fallback

## Step 22: Fixed Chatbot Layout & Professional E-Commerce Footer
- [x] Fixed Chatbot Assistant Sidebar:
  - [x] Locked right assistant panel to viewport height with internal message scroll (`overflow-y-auto`) and pinned bottom input bar
  - [x] Chatbot remains strictly fixed and accessible at all times while browsing products
- [x] Independently Scrollable Product Feed:
  - [x] Product storefront side has independent smooth scrolling with `scrollbar-thin`
  - [x] Top tech deals banner, value pillars, bank offers, filter tags, and catalog cards scroll seamlessly
- [x] Professional E-Commerce Footer Component (`components/Footer.tsx`):
  - [x] Value assurance bar: 15-Min Delivery, 100% Genuine, 7-Day Free Returns, 256-Bit SSL Secure
  - [x] 4 rich footer columns: Brand Story, Categories with direct filters, Customer Support & AI Concierge, Verified Safe Payments
  - [x] Interactive member newsletter subscription with instant confirmation
  - [x] Smooth "Back to Top" navigation button
  - [x] Payment badges (UPI, GPay, PhonePe, Visa, MasterCard, RuPay, COD)
  - [x] Legal & compliance bar with registered office address and copyright
  - [x] Embedded in both main store view and `OrdersView`
- [x] Verified full Next.js production build (`npx next build`) with 0 errors across 94 routes

## Step 23: Complete Unique Product Images & Category-Aware Fallbacks
- [x] Comprehensive Unique Product Image Catalog:
  - [x] Created `PRODUCT_UNIQUE_IMAGES: Record<number, string>` in `lib/storeData.ts` mapping all 108 products across all 10 categories to individual, distinct, high-res photos
  - [x] Upgraded `getProductImageUrl(idOrName, ...)` to perform deterministic product ID lookups before name/category matching
  - [x] Populated `SEED_PRODUCTS_RAW` and `INITIAL_PRODUCTS` with complete 108 items so serverless and local environments load all products with their distinct images
  - [x] Updated `scripts/seed.ts` items 1-32 to eliminate duplicate `/images/honey.png`, `/images/avocado_oil.png`, and `/images/oats.png`
- [x] Database Query Fidelity:
  - [x] Updated `searchProducts` and `getProductById` in `lib/db.ts` to include `p.image_url` in SQL SELECT queries
  - [x] Ensured row mapping retains `p.image_url` or falls back to ID-based `getProductImageUrl(r.id, ...)`
- [x] Intelligent Category-Specific Fallbacks:
  - [x] Created `getFallbackImageUrl(category)` returning dedicated SVG vector fallbacks for mobiles, electronics, appliances, fashion, beauty, food-health, home, toys-baby, auto, and sports
  - [x] Replaced hardcoded `/images/honey.png` `onError` fallbacks across `app/page.tsx`, `ProductDetailModal.tsx`, `ProductsMessage.tsx`, `CompareMessage.tsx`, and `CartDrawer.tsx`
  - [x] Ensured broken or slow-loading images never turn products into honey jars
- [x] Verified full Next.js production build (`npm run build`) passing with 0 errors across 94 routes

