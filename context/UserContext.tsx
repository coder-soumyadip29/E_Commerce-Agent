"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserAddress, UserPreferences, Product } from "@/lib/types";

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeAddress: UserAddress | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: "signin" | "signup" | "verify" | "forgot_password";
  setAuthModalTab: (tab: "signin" | "signup" | "verify" | "forgot_password") => void;
  pendingVerificationEmail: string;
  setPendingVerificationEmail: (email: string) => void;
  lastGeneratedCode: string | null;
  setLastGeneratedCode: (code: string | null) => void;
  isAddressModalOpen: boolean;
  setIsAddressModalOpen: (open: boolean) => void;
  isPersonalisationModalOpen: boolean;
  setIsPersonalisationModalOpen: (open: boolean) => void;
  personalizedProducts: Product[];
  login: (email: string, password?: string) => Promise<{ success: boolean; needsVerification?: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, dietaryTags?: string[]) => Promise<{ success: boolean; verificationCode?: string; error?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendCode: (email: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  searchAccount: (email: string) => Promise<{ success: boolean; account?: any; error?: string }>;
  sendPasswordResetOtp: (email: string) => Promise<{ success: boolean; code?: string; devMode?: boolean; message?: string; error?: string }>;
  resetPasswordWithOtp: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; user?: any; error?: string }>;
  logout: () => void;
  addAddress: (address: Omit<UserAddress, "id" | "user_id">) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (addressId: number) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (addressId: number) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string }>;
  refreshPersonalized: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "cartwise_auth_user_id";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup" | "verify" | "forgot_password">("signin");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPersonalisationModalOpen, setIsPersonalisationModalOpen] = useState(false);
  const [personalizedProducts, setPersonalizedProducts] = useState<Product[]>([]);

  // Load saved session or prompt login / create account on app start
  useEffect(() => {
    async function loadUser() {
      try {
        let storedId: number | null = null;
        if (typeof window !== "undefined") {
          // Clear any legacy auto-seeded demo user session
          localStorage.removeItem("cartwise_current_user_id");

          const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (saved) {
            const parsed = Number(saved);
            if (!isNaN(parsed) && parsed > 0) {
              storedId = parsed;
            }
          }
        }

        // Only auto-restore if the user previously logged into their own verified account
        if (storedId) {
          const res = await fetch(`/api/auth?userId=${storedId}`);
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            return;
          }
        }

        // When starting the web app without an active logged-in session,
        // ALWAYS start logged out and prompt for login or registration!
        setUser(null);
        setAuthModalTab("signin");
        setIsAuthModalOpen(true);
      } catch (err) {
        console.error("Failed to load user profile", err);
        setUser(null);
        setAuthModalTab("signin");
        setIsAuthModalOpen(true);
      }
    }
    loadUser();
  }, []);

  // Save session when user changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user?.id) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, String(user.id));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    }
  }, [user]);

  // Load personalized products whenever user changes or updates preferences
  const refreshPersonalized = async () => {
    try {
      const userId = user?.id || 1;
      const res = await fetch(`/api/user/preferences?userId=${userId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.personalizedProducts)) {
        setPersonalizedProducts(data.personalizedProducts);
      }
    } catch (e) {
      console.error("Failed to load personalized products", e);
    }
  };

  useEffect(() => {
    refreshPersonalized();
  }, [user?.id, user?.preferences]);

  const activeAddress = React.useMemo(() => {
    if (!user || !user.addresses || user.addresses.length === 0) return null;
    return user.addresses.find((a) => a.id === user.default_address_id) || user.addresses[0];
  }, [user]);

  const login = async (email: string, password?: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();

      if (data.needsVerification) {
        setPendingVerificationEmail(email);
        setAuthModalTab("verify");
        return {
          success: false,
          needsVerification: true,
          error: "Please enter your 6-digit email verification code.",
        };
      }

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const register = async (name: string, email: string, password?: string, dietaryTags?: string[]) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", name, email, password, dietaryTags }),
      });
      const data = await res.json();

      if (data.success) {
        setPendingVerificationEmail(email);
        if (data.verificationCode) {
          setLastGeneratedCode(data.verificationCode);
        }
        // Switch to verification tab so user enters OTP
        setAuthModalTab("verify");
        return { success: true, verificationCode: data.verificationCode };
      }
      return { success: false, error: data.error || "Registration failed." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, code }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthModalOpen(false);
        setLastGeneratedCode(null);
        setPendingVerificationEmail("");
        return { success: true };
      }
      return { success: false, error: data.error || "Verification failed." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const resendCode = async (email: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", email }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.code) {
          setLastGeneratedCode(data.code);
        }
        return { success: true, code: data.code };
      }
      return { success: false, error: data.error || "Failed to resend code." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const searchAccount = async (email: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search_account", email }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        return { success: true, account: data.account };
      }
      return { success: false, error: data.error || "Account not found." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const sendPasswordResetOtp = async (email: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_reset_otp", email }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.code) {
          setLastGeneratedCode(data.code);
        }
        return {
          success: true,
          code: data.code,
          devMode: data.devMode,
          message: data.message,
        };
      }
      return { success: false, error: data.error || "Failed to send reset code." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const resetPasswordWithOtp = async (email: string, code: string, newPassword: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", email, code, newPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, String(data.user.id));
        }
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Password reset failed." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem("cartwise_current_user_id");
    }
    setAuthModalTab("signin");
    setIsAuthModalOpen(true);
  };

  const addAddress = async (addressData: Omit<UserAddress, "id" | "user_id">) => {
    try {
      const userId = user?.id || 1;
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, address: addressData }),
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setUser((prev) => (prev ? { ...prev, addresses: data.addresses } : prev));
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to add address." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const setDefaultAddress = async (addressId: number) => {
    try {
      const userId = user?.id || 1;
      const res = await fetch("/api/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, addressId }),
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                addresses: data.addresses,
                default_address_id: data.defaultAddressId,
              }
            : prev
        );
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to set default address." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const deleteAddress = async (addressId: number) => {
    try {
      const userId = user?.id || 1;
      const res = await fetch(`/api/addresses?userId=${userId}&addressId=${addressId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setUser((prev) => (prev ? { ...prev, addresses: data.addresses } : prev));
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to delete address." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const userId = user?.id || 1;
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, preferences: prefs }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.personalizedProducts) {
          setPersonalizedProducts(data.personalizedProducts);
        }
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to update preferences." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        activeAddress,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        lastGeneratedCode,
        setLastGeneratedCode,
        isAddressModalOpen,
        setIsAddressModalOpen,
        isPersonalisationModalOpen,
        setIsPersonalisationModalOpen,
        personalizedProducts,
        login,
        register,
        verifyEmail,
        resendCode,
        searchAccount,
        sendPasswordResetOtp,
        resetPasswordWithOtp,
        logout,
        addAddress,
        setDefaultAddress,
        deleteAddress,
        updatePreferences,
        refreshPersonalized,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
