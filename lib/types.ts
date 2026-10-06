export interface Product {
  id: number;
  name: string;
  category: string;
  sub_category?: string;
  price: number;
  description: string;
  is_organic: boolean;
  average_rating?: number;
  review_count?: number;
  image_url?: string;
  stock: number;
}

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  reviewer_name: string;
  review_text: string;
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
