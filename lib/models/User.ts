import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserAddress {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface IUserPreferences {
  dietary_tags: string[];
  health_goals: string[];
  copilot_tone: string;
  max_spend_budget: number;
  preferred_categories?: string[];
}

export interface IUser extends Document {
  numericId: number;
  name: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  avatar_url?: string;
  vip_level: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | "MANAGER" | "SUPPORT";
  permissions?: string[];
  default_address_id: number;
  preferences: IUserPreferences;
  addresses: IUserAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IUserAddress>(
  {
    id: { type: Number, required: true },
    label: { type: String, required: true, default: "Home" },
    recipient_name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    country: { type: String, required: true, default: "United States" },
    is_default: { type: Boolean, default: false },
  },
  { _id: false }
);

const PreferencesSchema = new Schema<IUserPreferences>(
  {
    dietary_tags: { type: [String], default: ["Certified Organic", "Clean Eating"] },
    health_goals: { type: [String], default: ["Immunity & Longevity", "Clean Eating"] },
    copilot_tone: { type: String, default: "wholesale-deal-finder" },
    max_spend_budget: { type: Number, default: 350 },
    preferred_categories: { type: [String], default: [] },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    numericId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    passwordSalt: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
    avatar_url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    vip_level: { type: String, default: "Verified VIP Buyer" },
    role: {
      type: String,
      enum: ["CUSTOMER", "SELLER", "ADMIN", "SUPER_ADMIN", "MANAGER", "SUPPORT"],
      default: "CUSTOMER",
    },
    permissions: { type: [String], default: [] },
    default_address_id: { type: Number, default: 1 },
    preferences: { type: PreferencesSchema, default: () => ({}) },
    addresses: { type: [AddressSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error during Next.js hot module reloading
export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
