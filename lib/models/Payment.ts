import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface IPaymentRecord extends Document {
  orderId: string; // Gateway Order ID (e.g. order_rzp_...)
  paymentId?: string; // Gateway Payment ID (e.g. pay_...)
  signature?: string;
  userId?: number;
  amount: number; // Final verified total
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  currency: string;
  status: "created" | "paid" | "failed" | "cod_pending";
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
  paymentDetails?: {
    upiId?: string;
    cardLast4?: string;
    cardBrand?: string;
    bank?: string;
  };
  items: IPaymentItem[];
  sqliteOrderId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentItemSchema = new Schema<IPaymentItem>(
  {
    productId: { type: Number, required: true },
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const PaymentRecordSchema = new Schema<IPaymentRecord>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, sparse: true, index: true },
    signature: { type: String },
    userId: { type: Number, default: 1 },
    amount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    discountCode: { type: String },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "cod_pending"],
      default: "created",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "cod"],
      required: true,
    },
    paymentDetails: {
      upiId: { type: String },
      cardLast4: { type: String },
      cardBrand: { type: String },
      bank: { type: String },
    },
    items: { type: [PaymentItemSchema], required: true },
    sqliteOrderId: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const PaymentModel: Model<IPaymentRecord> =
  mongoose.models.PaymentRecord ||
  mongoose.model<IPaymentRecord>("PaymentRecord", PaymentRecordSchema);
