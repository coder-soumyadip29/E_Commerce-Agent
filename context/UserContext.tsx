"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserAddress, UserPreferences, Product } from "@/lib/types";

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeAddress: UserAddress | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: "signin" | "signup";
  setAuthModalTab: (tab: "signin" | "signup") => void;
  isAddressModalOpen: boolean;
  setIsAddressModalOpen: (open: boolean) => void;
  isPersonalisationModalOpen: boolean;
  setIsPersonalisationModalOpen: (open: boolean) => void;
  personalizedProducts: Product[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, dietaryTags?: string[]) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addAddress: (address: Omit<UserAddress, "id" | "user_id">) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (addressId: number) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (addressId: number) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string }>;
  refreshPersonalized: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPersonalisationModalOpen, setIsPersonalisationModalOpen] = useState(false);
  const [personalizedProducts, setPersonalizedProducts] = useState<Product[]>([]);

  // Load initial default VIP user (Maya Sterling) on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth?userId=1");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    }
    loadUser();
  }, []);

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
      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed." };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
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
        isAddressModalOpen,
        setIsAddressModalOpen,
        isPersonalisationModalOpen,
        setIsPersonalisationModalOpen,
        personalizedProducts,
        login,
        register,
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
