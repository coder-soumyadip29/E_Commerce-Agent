import { InvoiceData, InvoiceItem, GstBreakdown, UserAddressRecord, DeliverySlot, Product } from "./types";

// Standard Indian HSN codes for organic food commodities
const HSN_CODE_MAP: Record<string, string> = {
  honey: "0409 00 00",
  oat: "1904 10 90",
  oil: "1509 90 00",
  fruit: "0810 90 90",
  mango: "0804 50 20",
  rice: "1006 30 10",
  flour: "1101 00 00",
  dal: "0713 40 00",
  tea: "0902 40 20",
  spice: "0910 99 90",
  almond: "2008 19 20",
  butter: "2008 19 20",
  nut: "2008 19 20",
};

export function getHsnCode(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, code] of Object.entries(HSN_CODE_MAP)) {
    if (lower.includes(key)) return code;
  }
  return "2106 90 99"; // Other food preparations
}

export function generateInvoiceData(params: {
  orderId?: number;
  paymentId?: string;
  paymentMethod: string;
  items: Array<any>;
  finalTotal?: number;
  subtotal?: number;
  discountAmount?: number;
  discountCode?: string;
  deliveryAddress?: any;
  deliverySlot?: DeliverySlot;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  date?: string;
  // Compatibility aliases
  order?: { id: number; total: number; created_at?: string };
  transactionId?: string;
  address?: UserAddressRecord;
  slot?: DeliverySlot;
  userEmail?: string;
}): InvoiceData {
  const finalOrderId = params.orderId ?? params.order?.id ?? 1001;
  const finalPaymentId = params.paymentId ?? params.transactionId ?? `tx_${finalOrderId}`;
  const finalTotal = params.finalTotal ?? params.order?.total ?? 0;
  const subtotal = params.subtotal ?? finalTotal;
  const discountAmount = params.discountAmount ?? 0;
  const discountCode = params.discountCode;
  const deliveryAddress = params.deliveryAddress ?? params.address;
  const deliverySlot = params.deliverySlot ?? params.slot;
  const customerName = params.customerName ?? deliveryAddress?.name;
  const customerEmail = params.customerEmail ?? params.userEmail;
  const customerPhone = params.customerPhone ?? deliveryAddress?.phone;
  const date = params.date ?? params.order?.created_at ?? new Date().toISOString();
  const paymentMethod = params.paymentMethod;
  const items = params.items;

  // Groceries standard 5% GST (2.5% CGST + 2.5% SGST)
  const gstRate = 5;
  const taxableSubtotal = Number((finalTotal / (1 + gstRate / 100)).toFixed(2));
  const totalGst = Number((finalTotal - taxableSubtotal).toFixed(2));
  const cgstAmount = Number((totalGst / 2).toFixed(2));
  const sgstAmount = Number((totalGst / 2).toFixed(2));

  const invoiceItems: InvoiceItem[] = items.map((i: any, idx: number) => {
    const productName = i.product?.name || i.product_name || `Item #${i.product_id || idx + 1}`;
    const unitPrice = i.product?.price ?? i.unit_price ?? 0;
    const quantity = i.quantity || 1;
    const lineTotal = Number((unitPrice * quantity).toFixed(2));
    const itemTaxable = Number((lineTotal / (1 + gstRate / 100)).toFixed(2));
    const itemGst = Number((lineTotal - itemTaxable).toFixed(2));

    return {
      id: idx + 1,
      product_name: productName,
      hsn_code: getHsnCode(productName),
      quantity,
      unit_price: unitPrice,
      taxable_amount: itemTaxable,
      gst_rate: gstRate,
      gst_amount: itemGst,
      line_total: lineTotal,
    };
  });

  const gst: GstBreakdown = {
    taxableSubtotal,
    cgstRate: 2.5,
    cgstAmount,
    sgstRate: 2.5,
    sgstAmount,
    igstAmount: 0,
    totalGst,
  };

  const defaultAddr: UserAddressRecord = {
    id: 1,
    user_id: 1,
    name: customerName || "Maya Sterling",
    phone: customerPhone || "+91 98765 43210",
    street_address: "Penthouse 4B, 742 Evergreen Terrace",
    landmark: "Near Pine Valley Tech Park",
    city: "Bangalore",
    pincode: "560103",
    type: "Home",
    is_default: true,
  };

  const finalAddr = deliveryAddress ? {
    ...defaultAddr,
    ...deliveryAddress,
    name: deliveryAddress.name || deliveryAddress.recipient_name || customerName || defaultAddr.name,
    street_address: deliveryAddress.street_address || deliveryAddress.street || defaultAddr.street_address,
    city: deliveryAddress.city || defaultAddr.city,
    pincode: deliveryAddress.pincode || deliveryAddress.zip_code || defaultAddr.pincode,
  } : defaultAddr;

  return {
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(finalOrderId).padStart(4, "0")}`,
    orderId: finalOrderId,
    paymentId: finalPaymentId,
    date: new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    storeName: "CartWise Organics Pvt Ltd",
    storeGstin: "29AAACC1206D1ZM",
    storeFssai: "11223334000555",
    storeAddress: "Eco Space Business Park, Outer Ring Rd, Bellandur, Bangalore - 560103",
    customerName: finalAddr.name,
    customerEmail,
    customerPhone: finalAddr.phone,
    deliveryAddress: finalAddr,
    deliverySlot,
    paymentMethod,
    items: invoiceItems,
    subtotal,
    discountAmount,
    discountCode,
    gst,
    deliveryFee: 0,
    finalTotal,
  };
}
