export type ProductApprovalStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "SUSPENDED";
export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";

export interface Product {
  id: number;
  name: string;
  category: string;
  sub_category?: string;
  price: number;
  original_price?: number;
  description: string;
  is_organic: boolean;
  average_rating?: number;
  review_count?: number;
  image_url?: string;
  image?: string;
  stock: number;
  seller_id?: number;
  seller_name?: string;
  approval_status?: ProductApprovalStatus;
  status?: ProductStatus;
  sku?: string;
  brand?: string;
  rejection_reason?: string;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  seo_title?: string;
  meta_description?: string;
  tags?: string[];
  variants?: ProductVariant[];
}

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  reviewer_name: string;
  review_text: string;
  user_id?: number;
  user_name?: string;
  comment?: string;
  status?: "APPROVED" | "PENDING" | "REJECTED";
  seller_reply?: string;
  seller_replied_at?: string;
  created_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export type OrderStatus = "placed" | "packing" | "transit" | "in_transit" | "delivered" | "cancelled";
export type OrderTrackingStatus = "placed" | "packing" | "out_for_delivery" | "delivered" | "cancelled";

export interface DeliveryPartnerInfo {
  name: string;
  phone: string;
  vehicle: string;
  badge: string;
  rating: number;
}

export interface Order {
  id: number;
  user_id?: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  items?: OrderItem[];
  payment_id?: string;
  payment_method?: string;
  delivery_address_json?: string;
  delivery_slot?: string;
  tracking_status?: OrderTrackingStatus;
  estimated_delivery_time?: string;
  cancellation_reason?: string;
  delivery_partner?: DeliveryPartnerInfo;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AddressType = "Home" | "Work" | "Other";

export interface UserAddressRecord {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  street_address: string;
  landmark?: string;
  city: string;
  pincode: string;
  type: AddressType;
  is_default: boolean;
  created_at?: string;
}

export type DeliverySlotId = "express_30min" | "morning_slot" | "evening_slot";

export interface DeliverySlot {
  id: DeliverySlotId;
  title: string;
  subtitle: string;
  timeWindow: string;
  badge?: string;
  price: number;
  estimatedTime: string;
}

export interface InvoiceItem {
  id: number;
  product_name: string;
  hsn_code: string;
  quantity: number;
  unit_price: number;
  taxable_amount: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
}

export interface GstBreakdown {
  taxableSubtotal: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderId: number;
  paymentId: string;
  date: string;
  storeName: string;
  storeGstin: string;
  storeFssai: string;
  storeAddress: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress: UserAddressRecord;
  deliverySlot?: DeliverySlot;
  paymentMethod: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  gst: GstBreakdown;
  deliveryFee: number;
  finalTotal: number;
}

export interface UserAddress {
  id: number;
  user_id: number;
  label: string; // "Home", "Work", "Other"
  recipient_name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state?: string;
  zip_code: string;
  pincode?: string;
  country?: string;
  type?: AddressType;
  is_default: boolean;
}

export interface UserPreferences {
  dietary_tags: string[]; // ["100% Organic", "Gluten-Free", "Vegan", "High-Protein", "Sugar-Free"]
  health_goals: string[]; // ["Immunity & Vitality", "Cardio Health", "Clean Eating", "Digestive Balance"]
  copilot_tone: "concise" | "detailed" | "wholesale-deal-finder";
  max_spend_budget?: number;
  preferred_categories?: string[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  vip_level: string; // "Verified VIP Buyer"
  role?: AdminRole | "CUSTOMER" | "SELLER";
  permissions?: string[];
  preferences: UserPreferences;
  addresses: UserAddress[];
  default_address_id?: number;
  isVerified?: boolean;
}

export interface AgentTraceStep {
  title: string;
  detail: string;
  status: "complete" | "running" | "failed";
}

export interface AgentTrace {
  query?: string;
  parsed_intent?: string;
  filters?: {
    keyword?: string;
    category?: string;
    sub_category?: string;
    max_price?: number;
    is_organic?: boolean;
    min_rating?: number;
    [key: string]: any;
  };
  sql_query?: string;
  results_count?: number;
  steps: AgentTraceStep[];
}

export interface OrderTrackingInfo {
  orderId: string | number;
  productName: string;
  carrier: string;
  status: "OUT FOR DELIVERY" | "IN TRANSIT" | "DELIVERED";
  estimatedArrival: string;
  step: "packed" | "transit" | "out_for_delivery";
}

export interface PromoArbitrageInfo {
  code: string;
  savings: number;
  finalTotal: number;
}

export type AssistantMessage =
  | { type: "text"; text: string }
  | {
      type: "products";
      products: Product[];
      text?: string;
      trace?: AgentTrace;
      orderTracking?: OrderTrackingInfo;
      promoArbitrage?: PromoArbitrageInfo;
    }
  | { type: "image_analysis"; tags: string[]; description: string; matchedProducts?: Product[]; uploadedImage?: string }
  | { type: "clarify"; question: string; options: string[] }
  | { type: "compare"; products: Product[]; comparisonPoints: Record<string, string[]> }
  | { type: "empty_state"; reason: string; suggestions?: string[] };

export interface UserChatMessage {
  id: string;
  role: "user";
  content: string;
  image?: string;
  timestamp: number;
}

export interface AssistantChatMessage {
  id: string;
  role: "assistant";
  payload: AssistantMessage;
  timestamp: number;
}

export type ChatMessage = UserChatMessage | AssistantChatMessage;

// ============================================================================
// Multi-Vendor & Admin Control Center Interfaces
// ============================================================================

export type SellerStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "BLOCKED";
export type SellerVerificationStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

export interface Seller {
  id: number;
  user_id: number;
  store_name: string;
  owner_name: string;
  business_name?: string;
  legal_name?: string;
  email: string;
  phone: string;
  status: SellerStatus;
  verification_status: SellerVerificationStatus;
  is_verified?: boolean;
  rating: number;
  commission_rate: number; // custom override or default %
  business_address?: string;
  tax_id?: string;
  business_registration_number?: string;
  bank_details?: {
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    account_holder: string;
    routing_number?: string;
  };
  total_products?: number;
  total_orders?: number;
  total_revenue?: number;
  total_sales?: number;
  payout_balance?: number;
  store_slug?: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  policies?: {
    shipping?: string;
    return?: string;
    refund?: string;
  };
  social_links?: {
    website?: string;
    instagram?: string;
    twitter?: string;
  };
  rejection_reason?: string;
  created_at: string;
}

export interface SellerOrder {
  id: number;
  order_id: number; // Parent customer order
  seller_id: number;
  seller_name?: string;
  subtotal: number;
  commission_rate: number;
  commission_amount: number;
  seller_earnings: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  commission_rate: number;
  status: "ACTIVE" | "INACTIVE";
  display_order: number;
  sub_categories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string; // e.g. "Size: L / Color: Black"
  price: number;
  stock: number;
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  options?: Record<string, string>;
}

export type CommissionType = "GLOBAL" | "CATEGORY" | "SELLER";

export interface CommissionConfig {
  id?: number;
  type?: CommissionType;
  target_id?: number; // category_id or seller_id
  target_name?: string;
  rate?: number; // percentage, e.g. 10.0
  updated_at?: string;
  default_rate?: number;
  rules?: CommissionConfig[];
}

export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REJECTED";

export interface Payout {
  id: number;
  seller_id: number;
  seller_name?: string;
  amount: number;
  commission_deducted: number;
  net_amount: number;
  status: PayoutStatus;
  requested_at: string;
  processed_at?: string;
  transaction_ref?: string;
  notes?: string;
}

export type RefundStatus = "REQUESTED" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED";

export interface Refund {
  id: number;
  order_id: number;
  seller_id?: number;
  customer_id: number;
  customer_name?: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requested_at: string;
  processed_at?: string;
}

export type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "PICKUP" | "RECEIVED" | "INSPECTED" | "COMPLETED";

export interface ReturnRequest {
  id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  seller_id?: number;
  customer_id: number;
  customer_name?: string;
  reason: string;
  status: ReturnStatus;
  requested_at: string;
  created_at?: string;
  processed_at?: string;
}

export type CouponDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CouponStatus = "ACTIVE" | "EXPIRED" | "DISABLED";

export interface Coupon {
  id: number | string;
  code: string;
  discount_type: CouponDiscountType | "PERCENTAGE" | "FIXED";
  discount_value: number;
  min_order?: number;
  min_order_value?: number;
  max_discount?: number;
  usage_limit: number;
  used_count?: number;
  times_used?: number;
  seller_id?: number; // optional seller-specific coupon
  applicable_category?: string;
  start_date?: string;
  end_date?: string;
  expiry_date?: string;
  status?: CouponStatus;
  is_active?: boolean;
}

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "SUPPORT" | "FINANCE" | "MODERATOR";

export type AdminPermission =
  | "SELLER_VIEW"
  | "SELLER_APPROVE"
  | "SELLER_SUSPEND"
  | "PRODUCT_VIEW"
  | "PRODUCT_APPROVE"
  | "PRODUCT_EDIT"
  | "PRODUCT_DELETE"
  | "ORDER_VIEW"
  | "ORDER_MANAGE"
  | "PAYMENT_VIEW"
  | "REFUND_MANAGE"
  | "PAYOUT_VIEW"
  | "PAYOUT_APPROVE"
  | "CATEGORY_MANAGE"
  | "COUPON_MANAGE"
  | "REPORT_VIEW"
  | "SETTINGS_MANAGE"
  | "AUDIT_VIEW";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  status: "ACTIVE" | "INACTIVE";
  last_login?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  actor_id: number;
  actor_name: string;
  actor_role: string;
  action: string;
  resource: string;
  resource_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "danger" | string;
  target_role?: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface PlatformSettings {
  marketplace_name: string;
  platform_name?: string;
  currency: string;
  currency_symbol: string;
  default_commission_rate: number;
  require_seller_approval: boolean;
  allow_new_seller_registration?: boolean;
  require_product_approval: boolean;
  allow_customer_cancellation: boolean;
  return_window_days: number;
  tax_gst_rate: number;
  support_email: string;
  support_phone?: string;
  minimum_payout_amount?: number;
  payout_schedule?: "WEEKLY" | "BI_WEEKLY" | "MONTHLY";
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalSellers: number;
  activeSellers: number;
  pendingSellers: number;
  pendingProducts: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
  totalCommission: number;
  refundsCount: number;
  refundsAmount: number;
  revenueGrowthPercent: number;
  ordersGrowthPercent: number;
}

export interface AnalyticsChartPoint {
  date: string;
  revenue: number;
  orders: number;
  commission: number;
}

export interface SupportTicket {
  id: number;
  seller_id: number;
  seller_name: string;
  subject: string;
  category: "Order" | "Payment" | "Payout" | "Product" | "Account" | "Technical" | "Other";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  messages: Array<{
    id: number;
    sender: "SELLER" | "ADMIN";
    sender_name: string;
    message: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface SellerDashboardMetrics {
  todaySales: number;
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockCount: number;
  customerReviewsCount: number;
  averageRating: number;
  availableBalance: number;
  pendingBalance: number;
  totalPaidOut: number;
}
