import { connectToDatabase } from "./mongodb";
import { UserModel, IUser } from "./models/User";
import { UserProfile, UserAddress, UserPreferences, Product } from "./types";
import { searchProducts } from "./db";
import {
  hashPassword,
  verifyPassword,
  generateVerificationCode,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email";
import { INITIAL_USERS } from "./storeData";

// Helper to convert Mongoose document to UserProfile
function toUserProfile(user: any): UserProfile {
  return {
    id: user.numericId,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    vip_level: user.vip_level,
    default_address_id: user.default_address_id,
    preferences: {
      dietary_tags: user.preferences?.dietary_tags || ["Certified Organic"],
      health_goals: user.preferences?.health_goals || ["Clean Eating"],
      copilot_tone: user.preferences?.copilot_tone || "wholesale-deal-finder",
      max_spend_budget: user.preferences?.max_spend_budget || 350,
      preferred_categories: user.preferences?.preferred_categories || [],
    },
    addresses: (user.addresses || []).map((addr: any) => ({
      id: addr.id,
      user_id: user.numericId,
      label: addr.label,
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zip_code,
      country: addr.country,
      is_default: addr.is_default,
    })),
    isVerified: user.isVerified,
  };
}

// In-memory fallback if MongoDB connection fails
let memoryUsers: any[] = JSON.parse(JSON.stringify(INITIAL_USERS)).map((u: any) => ({
  ...u,
  numericId: u.id,
  isVerified: true,
}));

// Initialize seed user (Maya Sterling) in MongoDB if collection is empty
export async function ensureSeedUser(): Promise<void> {
  try {
    await connectToDatabase();
    const count = await UserModel.countDocuments();
    if (count === 0) {
      const defaultUser = INITIAL_USERS[0];
      const { hash, salt } = hashPassword("password123");

      await UserModel.create({
        numericId: 1,
        name: defaultUser.name,
        email: defaultUser.email.toLowerCase(),
        passwordHash: hash,
        passwordSalt: salt,
        isVerified: true, // Demo account is pre-verified
        avatar_url: defaultUser.avatar_url,
        vip_level: defaultUser.vip_level,
        default_address_id: defaultUser.default_address_id,
        preferences: defaultUser.preferences,
        addresses: defaultUser.addresses.map((a) => ({
          ...a,
          id: a.id,
        })),
      });
      console.log("🌱 Seeded initial VIP user (Maya Sterling) into MongoDB");
    }
  } catch (err) {
    console.warn("MongoDB connection warning in ensureSeedUser:", (err as Error).message);
  }
}

export async function getUserProfile(userId: number = 1): Promise<UserProfile | null> {
  try {
    await connectToDatabase();
    await ensureSeedUser();
    const user = await UserModel.findOne({ numericId: userId }).lean();
    if (user) {
      return toUserProfile(user);
    }
  } catch (e) {
    console.warn("Falling back to in-memory getUserProfile:", (e as Error).message);
  }

  const found = memoryUsers.find((u) => (u.numericId || u.id) === userId);
  return found ? toUserProfile(found) : null;
}

export async function registerUser(
  name: string,
  email: string,
  password?: string,
  dietaryTags: string[] = ["Certified Organic"]
): Promise<{
  success: boolean;
  user?: UserProfile;
  verificationCode?: string;
  devMode?: boolean;
  error?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || !cleanEmail) {
    return { success: false, error: "Name and a valid email are required." };
  }

  const code = generateVerificationCode();
  const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  try {
    await connectToDatabase();
    await ensureSeedUser();

    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in.",
      };
    }

    // Determine next numericId
    const highestUser = await UserModel.findOne().sort({ numericId: -1 }).select("numericId");
    const newId = highestUser ? highestUser.numericId + 1 : 1;

    let hash = "";
    let salt = "";
    if (password) {
      const hashed = hashPassword(password);
      hash = hashed.hash;
      salt = hashed.salt;
    }

    const defaultAddress = {
      id: 1,
      label: "Home",
      recipient_name: cleanName,
      phone: "+1 (555) 019-2834",
      street: "100 Market Street, Suite 400",
      city: "San Francisco",
      state: "CA",
      zip_code: "94105",
      country: "United States",
      is_default: true,
    };

    const newUser = await UserModel.create({
      numericId: newId,
      name: cleanName,
      email: cleanEmail,
      passwordHash: hash,
      passwordSalt: salt,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires: codeExpires,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      vip_level: "Verified VIP Buyer",
      default_address_id: 1,
      preferences: {
        dietary_tags: dietaryTags.length > 0 ? dietaryTags : ["Certified Organic", "Clean Eating"],
        health_goals: ["Immunity & Longevity", "Clean Eating"],
        copilot_tone: "wholesale-deal-finder",
        max_spend_budget: 350,
      },
      addresses: [defaultAddress],
    });

    const emailResult = await sendVerificationEmail(cleanEmail, code, cleanName);

    return {
      success: true,
      user: toUserProfile(newUser),
      verificationCode: code,
      devMode: emailResult.devMode,
    };
  } catch (err) {
    console.warn("MongoDB register failed, using in-memory fallback:", (err as Error).message);
    // In-memory fallback
    const existing = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: "An account with this email already exists. Please sign in." };
    }

    const newId = memoryUsers.length > 0 ? Math.max(...memoryUsers.map((u) => u.numericId || u.id)) + 1 : 1;
    const fallbackUser = {
      numericId: newId,
      id: newId,
      name: cleanName,
      email: cleanEmail,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires: codeExpires,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      vip_level: "Verified VIP Buyer",
      default_address_id: 1,
      preferences: {
        dietary_tags: dietaryTags,
        health_goals: ["Clean Eating"],
        copilot_tone: "wholesale-deal-finder",
        max_spend_budget: 350,
      },
      addresses: [
        {
          id: 1,
          user_id: newId,
          label: "Home",
          recipient_name: cleanName,
          phone: "+1 (555) 019-2834",
          street: "100 Market Street, Suite 400",
          city: "San Francisco",
          state: "CA",
          zip_code: "94105",
          country: "United States",
          is_default: true,
        },
      ],
    };
    memoryUsers.push(fallbackUser);
    sendVerificationEmail(cleanEmail, code, cleanName);

    return {
      success: true,
      user: toUserProfile(fallbackUser),
      verificationCode: code,
      devMode: true,
    };
  }
}

export async function verifyUserEmail(
  email: string,
  code: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanCode = (code || "").trim();

  if (!cleanEmail || !cleanCode) {
    return { success: false, error: "Email and verification code are required." };
  }

  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      return { success: false, error: "Account not found." };
    }

    if (user.isVerified) {
      return { success: true, user: toUserProfile(user) };
    }

    if (user.verificationCode !== cleanCode) {
      return { success: false, error: "Invalid verification code. Please check and try again." };
    }

    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return { success: false, error: "Verification code has expired. Please request a new one." };
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return { success: true, user: toUserProfile(user) };
  } catch (err) {
    console.warn("MongoDB verify failed, fallback:", (err as Error).message);
    const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return { success: false, error: "Account not found." };

    if (user.verificationCode === cleanCode) {
      user.isVerified = true;
      delete user.verificationCode;
      return { success: true, user: toUserProfile(user) };
    }
    return { success: false, error: "Invalid verification code." };
  }
}

export async function resendVerificationCode(
  email: string
): Promise<{ success: boolean; code?: string; devMode?: boolean; error?: string }> {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) return { success: false, error: "Valid email is required." };

  const code = generateVerificationCode();
  const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) return { success: false, error: "No account found with this email." };

    user.verificationCode = code;
    user.verificationCodeExpires = codeExpires;
    await user.save();

    const emailResult = await sendVerificationEmail(cleanEmail, code, user.name);
    return {
      success: true,
      code,
      devMode: emailResult.devMode,
    };
  } catch (err) {
    const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return { success: false, error: "No account found." };
    user.verificationCode = code;
    sendVerificationEmail(cleanEmail, code, user.name);
    return { success: true, code, devMode: true };
  }
}

export async function loginUser(
  email: string,
  password?: string
): Promise<{
  success: boolean;
  user?: UserProfile;
  needsVerification?: boolean;
  error?: string;
}> {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: "Please provide a valid email." };
  }

  try {
    await connectToDatabase();
    await ensureSeedUser();

    let user = await UserModel.findOne({ email: cleanEmail });

    // Fallback demo account alias: if typing "maya", connect to seed
    if (!user && cleanEmail.includes("maya")) {
      user = await UserModel.findOne({ numericId: 1 });
    }

    if (!user) {
      return {
        success: false,
        error: "No account found with this email. Please create an account.",
      };
    }

    // Check password if provided and user has a password hash
    if (password && user.passwordHash && user.passwordSalt) {
      const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
      if (!isValid) {
        return { success: false, error: "Incorrect password. Please try again." };
      }
    }

    // Check if account is verified
    if (!user.isVerified) {
      // Send fresh code if expired or missing
      if (!user.verificationCode) {
        const code = generateVerificationCode();
        user.verificationCode = code;
        user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        await sendVerificationEmail(cleanEmail, code, user.name);
      }
      return {
        success: false,
        needsVerification: true,
        user: toUserProfile(user),
        error: "Your email is not verified yet. Please enter the verification code sent to your email.",
      };
    }

    return { success: true, user: toUserProfile(user) };
  } catch (err) {
    console.warn("MongoDB login failed, fallback:", (err as Error).message);
    let user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user && cleanEmail.includes("maya")) user = memoryUsers[0];
    if (!user) return { success: false, error: "No account found with this email." };

    if (!user.isVerified) {
      return {
        success: false,
        needsVerification: true,
        user: toUserProfile(user),
        error: "Please verify your email address to continue.",
      };
    }

    return { success: true, user: toUserProfile(user) };
  }
}

export async function addUserAddress(
  userId: number,
  addressData: Omit<UserAddress, "id" | "user_id">
): Promise<{ success: boolean; address?: UserAddress; error?: string }> {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ numericId: userId });
    if (!user) return { success: false, error: "User account not found." };

    const newAddrId =
      user.addresses.length > 0 ? Math.max(...user.addresses.map((a) => a.id)) + 1 : 1;

    const newAddress = {
      ...addressData,
      id: newAddrId,
    };

    if (newAddress.is_default) {
      user.addresses.forEach((a) => (a.is_default = false));
      user.default_address_id = newAddrId;
    }

    user.addresses.push(newAddress as any);
    await user.save();

    return {
      success: true,
      address: {
        ...newAddress,
        user_id: userId,
      },
    };
  } catch (err) {
    console.warn("MongoDB add address fallback:", (err as Error).message);
    const user = memoryUsers.find((u) => (u.numericId || u.id) === userId);
    if (!user) return { success: false, error: "User not found." };
    const newAddrId = user.addresses.length > 0 ? Math.max(...user.addresses.map((a: any) => a.id)) + 1 : 1;
    const addr = { ...addressData, id: newAddrId, user_id: userId };
    if (addr.is_default) {
      user.addresses.forEach((a: any) => (a.is_default = false));
      user.default_address_id = newAddrId;
    }
    user.addresses.push(addr);
    return { success: true, address: addr };
  }
}

export async function setDefaultAddress(
  userId: number,
  addressId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ numericId: userId });
    if (!user) return { success: false, error: "User not found." };

    const exists = user.addresses.some((a) => a.id === addressId);
    if (!exists) return { success: false, error: "Address not found." };

    user.addresses.forEach((a) => {
      a.is_default = a.id === addressId;
    });
    user.default_address_id = addressId;
    await user.save();

    return { success: true };
  } catch (err) {
    const user = memoryUsers.find((u) => (u.numericId || u.id) === userId);
    if (!user) return { success: false, error: "User not found." };
    user.addresses.forEach((a: any) => (a.is_default = a.id === addressId));
    user.default_address_id = addressId;
    return { success: true };
  }
}

export async function deleteUserAddress(
  userId: number,
  addressId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ numericId: userId });
    if (!user) return { success: false, error: "User not found." };

    user.addresses = user.addresses.filter((a) => a.id !== addressId) as any;
    if (user.default_address_id === addressId && user.addresses.length > 0) {
      user.addresses[0].is_default = true;
      user.default_address_id = user.addresses[0].id;
    }
    await user.save();

    return { success: true };
  } catch (err) {
    const user = memoryUsers.find((u) => (u.numericId || u.id) === userId);
    if (!user) return { success: false, error: "User not found." };
    user.addresses = user.addresses.filter((a: any) => a.id !== addressId);
    if (user.default_address_id === addressId && user.addresses.length > 0) {
      user.addresses[0].is_default = true;
      user.default_address_id = user.addresses[0].id;
    }
    return { success: true };
  }
}

export async function updateUserPreferences(
  userId: number,
  preferences: Partial<UserPreferences>
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ numericId: userId });
    if (!user) return { success: false, error: "User not found." };

    user.preferences = {
      dietary_tags: preferences.dietary_tags ?? user.preferences.dietary_tags,
      health_goals: preferences.health_goals ?? user.preferences.health_goals,
      copilot_tone: preferences.copilot_tone ?? user.preferences.copilot_tone,
      max_spend_budget: preferences.max_spend_budget ?? user.preferences.max_spend_budget,
      preferred_categories: preferences.preferred_categories ?? user.preferences.preferred_categories,
    };

    await user.save();
    return { success: true, user: toUserProfile(user) };
  } catch (err) {
    const user = memoryUsers.find((u) => (u.numericId || u.id) === userId);
    if (!user) return { success: false, error: "User not found." };
    user.preferences = { ...user.preferences, ...preferences };
    return { success: true, user: toUserProfile(user) };
  }
}

export async function getPersonalizedProducts(userId: number = 1): Promise<Product[]> {
  const user = await getUserProfile(userId);
  const tags = user?.preferences?.dietary_tags || ["Certified Organic"];

  // Match preferences against verified catalog in SQLite
  const isOrganic = tags.some((t) => t.toLowerCase().includes("organic"));
  const isVegan = tags.some((t) => t.toLowerCase().includes("vegan"));

  let searchResults = searchProducts({
    isOrganic: isOrganic ? true : undefined,
    limit: 8,
  }).products;

  if (searchResults.length === 0) {
    searchResults = searchProducts({ limit: 6 }).products;
  }

  return searchResults;
}

// ---------------------------------------------------------------------------
// Facebook-style Password Recovery Functions
// ---------------------------------------------------------------------------

function maskEmailAddress(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  const first = name[0];
  const last = name[name.length - 1];
  const maskLength = Math.max(1, Math.min(name.length - 2, 4));
  return `${first}${"*".repeat(maskLength)}${last}@${domain}`;
}

export interface FoundAccountPreview {
  id: number;
  name: string;
  email: string;
  maskedEmail: string;
  avatar_url?: string;
  vip_level?: string;
}

export async function searchAccountByEmail(email: string): Promise<{
  success: boolean;
  found: boolean;
  account?: FoundAccountPreview;
  error?: string;
}> {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, found: false, error: "Please enter an email address." };
  }

  try {
    await connectToDatabase();
    await ensureSeedUser();
    const user = await UserModel.findOne({ email: cleanEmail }).lean();
    if (user) {
      return {
        success: true,
        found: true,
        account: {
          id: user.numericId,
          name: user.name,
          email: user.email,
          maskedEmail: maskEmailAddress(user.email),
          avatar_url: user.avatar_url,
          vip_level: user.vip_level,
        },
      };
    }
  } catch (err) {
    console.warn("MongoDB fallback in searchAccountByEmail:", (err as Error).message);
  }

  const memoryUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (memoryUser) {
    return {
      success: true,
      found: true,
      account: {
        id: memoryUser.numericId || memoryUser.id,
        name: memoryUser.name,
        email: memoryUser.email,
        maskedEmail: maskEmailAddress(memoryUser.email),
        avatar_url: memoryUser.avatar_url,
        vip_level: memoryUser.vip_level,
      },
    };
  }

  return {
    success: true,
    found: false,
    error: "No account found matching this email address.",
  };
}

export async function sendPasswordResetOtp(email: string): Promise<{
  success: boolean;
  code?: string;
  devMode?: boolean;
  message?: string;
  error?: string;
}> {
  const cleanEmail = (email || "").trim().toLowerCase();
  const code = generateVerificationCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  try {
    await connectToDatabase();
    await ensureSeedUser();
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      return { success: false, error: "Account not found." };
    }

    user.resetPasswordOtp = code;
    user.resetPasswordOtpExpires = expires;
    await user.save();

    const emailRes = await sendPasswordResetEmail(user.email, code, user.name);
    return {
      success: true,
      code: emailRes.code,
      devMode: emailRes.devMode,
      message: `A 6-digit password reset code was sent to ${user.email}.`,
    };
  } catch (err) {
    console.warn("MongoDB fallback in sendPasswordResetOtp:", (err as Error).message);
    const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: "Account not found." };
    }
    user.resetPasswordOtp = code;
    user.resetPasswordOtpExpires = expires;

    const emailRes = await sendPasswordResetEmail(user.email, code, user.name);
    return {
      success: true,
      code: emailRes.code,
      devMode: emailRes.devMode,
      message: `A 6-digit password reset code was generated for ${user.email}.`,
    };
  }
}

export async function resetPasswordWithOtp(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanCode = (code || "").trim();

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const { hash, salt } = hashPassword(newPassword);

  try {
    await connectToDatabase();
    await ensureSeedUser();
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      return { success: false, error: "Account not found." };
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanCode) {
      return { success: false, error: "Invalid password reset code. Please check and try again." };
    }

    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires < new Date()) {
      return { success: false, error: "This password reset code has expired. Please request a new one." };
    }

    user.passwordHash = hash;
    user.passwordSalt = salt;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.isVerified = true;
    await user.save();

    return { success: true, user: toUserProfile(user) };
  } catch (err) {
    console.warn("MongoDB fallback in resetPasswordWithOtp:", (err as Error).message);
    const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: "Account not found." };
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanCode) {
      return { success: false, error: "Invalid password reset code." };
    }

    user.passwordHash = hash;
    user.passwordSalt = salt;
    delete user.resetPasswordOtp;
    delete user.resetPasswordOtpExpires;
    user.isVerified = true;

    return { success: true, user: toUserProfile(user) };
  }
}
