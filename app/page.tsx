"use client";

import React, { useState, useEffect, useRef } from "react";
import { CartProvider, useCart } from "@/context/CartContext";
import { VoiceProvider, useVoice } from "@/context/VoiceContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { Navbar } from "@/components/Navbar";
import { ChatInput } from "@/components/ChatInput";
import { EmptyChatPrompt } from "@/components/chat/EmptyChatPrompt";
import { UserBubble } from "@/components/chat/UserBubble";
import { TextMessage } from "@/components/chat/TextMessage";
import { ProductsMessage } from "@/components/chat/ProductsMessage";
import { ImageAnalysisMessage } from "@/components/chat/ImageAnalysisMessage";
import { ClarifyMessage } from "@/components/chat/ClarifyMessage";
import { CompareMessage } from "@/components/chat/CompareMessage";
import { EmptyStateMessage } from "@/components/chat/EmptyStateMessage";
import { ThinkingMessage } from "@/components/chat/ThinkingMessage";
import { AgentTraceModal } from "@/components/chat/AgentTraceModal";
import { SatelliteGpsModal } from "@/components/chat/SatelliteGpsModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { OrdersView } from "@/components/orders/OrdersView";
import { AuthModal } from "@/components/auth/AuthModal";
import { AddressModal } from "@/components/auth/AddressModal";
import { PersonalisationModal } from "@/components/auth/PersonalisationModal";
import { ProductDetailModal } from "@/components/product/ProductDetailModal";
import { ChatMessage, AssistantMessage, Product, OrderTrackingInfo } from "@/lib/types";
import {
  Sparkles,
  Bot,
  Zap,
  ShoppingBag,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Heart,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw as ReturnIcon,
  CreditCard,
  MessageSquare,
  Camera,
  Mic,
  Plus,
  Tag,
  ArrowRight,
  Filter,
  Eye,
} from "lucide-react";

// Dynamic Subcategory & Filter Presets for Each Category (Flipkart / Amazon style)
const CATEGORY_CHIP_PRESETS: Record<string, Array<{ id: string; label: string; isRating?: boolean }>> = {
  all: [
    { id: "all", label: "All Items" },
    { id: "top-rated", label: "Top Rated (4.8★+)", isRating: true },
    { id: "under-2k", label: "Under ₹2,000" },
    { id: "under-30k", label: "Under ₹30,000" },
    { id: "organic", label: "100% Organic" },
  ],
  mobiles: [
    { id: "all", label: "All Mobiles" },
    { id: "smartphones", label: "Smartphones" },
    { id: "under-30k", label: "Under ₹30,000" },
    { id: "top-rated", label: "Top Rated (4.8★+)", isRating: true },
  ],
  electronics: [
    { id: "all", label: "All Electronics" },
    { id: "laptops", label: "Laptops" },
    { id: "televisions", label: "Smart TVs" },
    { id: "audio", label: "Audio & Headphones" },
    { id: "tablets", label: "Tablets" },
    { id: "wearables", label: "Smartwatches" },
  ],
  appliances: [
    { id: "all", label: "All Appliances" },
    { id: "refrigerators", label: "Refrigerators" },
    { id: "air-conditioners", label: "Air Conditioners" },
    { id: "kitchen-appliances", label: "Kitchen Appliances" },
  ],
  fashion: [
    { id: "all", label: "All Fashion" },
    { id: "mens-clothing", label: "Men's Clothing" },
    { id: "footwear", label: "Footwear & Shoes" },
    { id: "watches", label: "Watches" },
    { id: "under-2k", label: "Under ₹2,000" },
  ],
  beauty: [
    { id: "all", label: "All Beauty" },
    { id: "skincare", label: "Skincare Serums" },
    { id: "makeup", label: "Makeup & Lipsticks" },
    { id: "top-rated", label: "Top Rated (4.8★+)", isRating: true },
  ],
  "food-health": [
    { id: "all", label: "All Food & Health" },
    { id: "grocery-staples", label: "Grocery & Staples" },
    { id: "oils-ghee", label: "Oils & Pure Ghee" },
    { id: "dry-fruits", label: "Dry Fruits & Nuts" },
    { id: "nutrition-supplements", label: "Protein & Supplements" },
    { id: "organic", label: "100% Organic" },
  ],
  home: [
    { id: "all", label: "All Home" },
    { id: "kitchen-dining", label: "Kitchen & Dining" },
    { id: "furniture", label: "Mattresses & Furniture" },
    { id: "bedding", label: "Bedding & Comforters" },
  ],
  "toys-baby": [
    { id: "all", label: "All Toys & Baby" },
    { id: "toys-games", label: "Building Toys & LEGO" },
    { id: "baby-care", label: "Baby Care & Diapers" },
  ],
  "auto-accessories": [
    { id: "all", label: "All Auto" },
    { id: "helmets-gear", label: "Helmets & Gear" },
    { id: "car-electronics", label: "Dash Cams & Tech" },
  ],
  "sports-fitness": [
    { id: "all", label: "All Sports & Fitness" },
    { id: "badminton", label: "Badminton" },
    { id: "fitness-accessories", label: "Yoga & Fitness" },
  ],
};

// Top Tech Deals for Cartwise Plus
const CARTWISE_TOP_TECH_DEALS = [
  {
    id: 101,
    title: "edge 70 Fusion",
    offerTag: "From ₹29,999*",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    category: "mobiles",
    product: {
      id: 101,
      name: "Motorola edge 70 Fusion (12GB RAM, 256GB)",
      category: "mobiles",
      sub_category: "smartphones",
      price: 29999,
      description: "144Hz 3D Curved pOLED Display, Sony LYTIA 700C Camera with OIS, IP68 Protection",
      is_organic: false,
      stock: 40,
      average_rating: 4.9,
      review_count: 1420,
      image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    }
  },
  {
    id: 201,
    title: "Vivobook 15",
    offerTag: "From ₹59,990*",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
    category: "electronics",
    product: {
      id: 201,
      name: "ASUS Vivobook 15 OLED Laptop (Intel Core i5 13th Gen, 16GB, 512GB SSD)",
      category: "electronics",
      sub_category: "laptops",
      price: 59990,
      description: "15.6-inch FHD OLED 600nits HDR display, Thin & Light 1.7kg, Windows 11 + MS Office 2024",
      is_organic: false,
      stock: 15,
      average_rating: 4.9,
      review_count: 310,
      image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
    }
  },
  {
    id: 202,
    title: "TCL 43\" QLED",
    offerTag: "Just ₹25,999*",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
    category: "electronics",
    product: {
      id: 202,
      name: "TCL 43-inch 4K Ultra HD Smart QLED Google TV (43C645)",
      category: "electronics",
      sub_category: "televisions",
      price: 25999,
      description: "QLED 4K with Dolby Vision & Atmos, 120Hz DLG Game Master, Hands-Free Voice Control",
      is_organic: false,
      stock: 20,
      average_rating: 4.8,
      review_count: 420,
      image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
    }
  },
  {
    id: 102,
    title: "iPhone 15",
    offerTag: "From ₹63,999*",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    category: "mobiles",
    product: {
      id: 102,
      name: "Apple iPhone 15 (Blue, 128GB)",
      category: "mobiles",
      sub_category: "smartphones",
      price: 63999,
      description: "Dynamic Island, 48MP Main Camera, 2x Telephoto, All-Day Battery Life, USB-C Charging",
      is_organic: false,
      stock: 25,
      average_rating: 4.9,
      review_count: 3890,
      image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    }
  },
  {
    id: 203,
    title: "Neckbands",
    offerTag: "Under ₹1,999",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    category: "electronics",
    product: {
      id: 203,
      name: "OnePlus Bullets Wireless Z2 Bluetooth Neckband (Acoustic Red)",
      category: "electronics",
      sub_category: "audio",
      price: 1499,
      description: "12.4mm Bass Drivers, 30 Hours Playtime, Fast 10-Min Charge = 20 Hours Battery, IP55",
      is_organic: false,
      stock: 100,
      average_rating: 4.7,
      review_count: 2150,
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    }
  },
  {
    id: 301,
    title: "Most Loved (Fridge)",
    offerTag: "From ₹16,990*",
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80",
    category: "appliances",
    product: {
      id: 301,
      name: "LG 190L 4-Star Smart Inverter Direct Cool Single Door Refrigerator",
      category: "appliances",
      sub_category: "refrigerators",
      price: 16990,
      description: "Smart Inverter Compressor, Fastest in Ice Making, Toughened Glass Shelves, Works without Stabilizer",
      is_organic: false,
      stock: 15,
      average_rating: 4.9,
      review_count: 580,
      image_url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80",
    }
  },
  {
    id: 105,
    title: "K14 Plus 5G",
    offerTag: "From ₹25,999*",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    category: "mobiles",
    product: {
      id: 105,
      name: "Realme K14 Plus 5G (Submarine Blue, 128GB)",
      category: "mobiles",
      sub_category: "smartphones",
      price: 25999,
      description: "Periscope Portrait Camera, Luxury Watch Design, 120Hz Curved Vision OLED Display",
      is_organic: false,
      stock: 50,
      average_rating: 4.7,
      review_count: 720,
      image_url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    }
  },
  {
    id: 601,
    title: "Raw Forest Honey",
    offerTag: "Just ₹349*",
    image: "/images/honey.png",
    category: "food-health",
    product: {
      id: 601,
      name: "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)",
      category: "food-health",
      sub_category: "grocery-staples",
      price: 349,
      description: "Unheated, unfiltered wild forest honey directly extracted from certified natural reserves",
      is_organic: true,
      stock: 55,
      average_rating: 5.0,
      review_count: 342,
      image_url: "/images/honey.png",
    }
  }
];

function MainApp() {
  const { activeTab, selectedTrace, setSelectedTrace, addToCart, setIsCartOpen, cart, updateQuantity } = useCart();
  const { speak, isAutoSpeakEnabled } = useVoice();
  const { user, personalizedProducts, setIsPersonalisationModalOpen } = useUser();
  const [mobileView, setMobileView] = useState<"store" | "copilot">("store");

  const initialUserMessage: ChatMessage = {
    id: "usr-init-1",
    role: "user",
    content: "Find me top deals on edge 70 Fusion and organic honey.",
    timestamp: Date.now() - 1000 * 60 * 12,
  };

  const initialAssistantMessage: ChatMessage = {
    id: "ast-init-1",
    role: "assistant",
    timestamp: Date.now() - 1000 * 60 * 12 + 1500,
    payload: {
      type: "products",
      text: "Found top revealed tech & pantry deals with instant discount coupon SAVE10:",
      products: [
        {
          id: 101,
          name: "Motorola edge 70 Fusion (12GB RAM, 256GB)",
          category: "mobiles",
          sub_category: "smartphones",
          price: 29999.0,
          description: "144Hz 3D Curved pOLED Display, Sony LYTIA 700C Camera with OIS, IP68 Underwater Protection",
          is_organic: false,
          average_rating: 4.9,
          review_count: 1420,
          image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
          stock: 40,
        },
        {
          id: 601,
          name: "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)",
          category: "food-health",
          sub_category: "grocery-staples",
          price: 349.0,
          description: "Unfiltered cold-extracted raw wild forest honey from deep natural reserves",
          is_organic: true,
          average_rating: 5.0,
          review_count: 342,
          image_url: "/images/honey.png",
          stock: 55,
        }
      ],
      orderTracking: {
        orderId: "#1040",
        productName: "Organic Raw Forest Honey (500g)",
        carrier: "Cartwise Express Rider",
        status: "OUT FOR DELIVERY",
        estimatedArrival: "Today by 3:45 PM",
        step: "out_for_delivery",
      },
      promoArbitrage: {
        code: "SAVE10",
        savings: 3034.8,
        finalTotal: 27313.2,
      },
      trace: {
        query: "Find me top deals on edge 70 Fusion and organic honey.",
        parsed_intent: "Search multi-category products across Mobiles & Grocery",
        filters: { keyword: "edge 70, honey" },
        sql_query: "SELECT * FROM products WHERE (name LIKE '%edge 70%' OR name LIKE '%honey%')",
        results_count: 2,
        steps: [
          { title: "Query Parsing", detail: "Parsed multi-category search: Smartphones + Organic Harvest", status: "complete" },
          { title: "Catalog Lookups", detail: "Retrieved Motorola edge 70 Fusion (ID: 101) & Raw Forest Honey (ID: 601)", status: "complete" },
          { title: "Price Arbitrage", detail: "Calculated SAVE10 voucher arbitrage with net total ₹27,313.20", status: "complete" },
        ],
      },
    },
  };

  const getChatStorageKey = (userId?: number | null) =>
    userId ? `cartwise_chat_user_${userId}` : "cartwise_chat_guest";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const hasLoadedChatRef = useRef(false);

  // Sync messages when user changes (e.g. login, logout, new account creation)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = getChatStorageKey(user?.id);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          hasLoadedChatRef.current = true;
          return;
        }
      } catch (err) {
        // Fallback
      }
    }

    // Default messages for VIP user Maya (id 1) if nothing saved yet;
    // brand new users (id > 1) or guest start with a clean empty chat!
    if (user?.id === 1) {
      setMessages([initialUserMessage, initialAssistantMessage]);
    } else {
      setMessages([]);
    }
    hasLoadedChatRef.current = true;
  }, [user?.id]);

  // Persist messages per user
  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedChatRef.current) return;
    const storageKey = getChatStorageKey(user?.id);
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, user?.id]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState("Searching Cartwise Plus product catalog…");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [wishlistActive, setWishlistActive] = useState<Record<number, boolean>>({});
  const [activeCopilotTab, setActiveCopilotTab] = useState<"chat" | "snap" | "voice">("chat");
  const [activeTrackingModal, setActiveTrackingModal] = useState<OrderTrackingInfo | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [activeFilterTag, setActiveFilterTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");

  // Derived filtered & sorted products with real-time category & search filter
  const displayedProducts = React.useMemo(() => {
    let list = [...catalogProducts];

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.sub_category && p.sub_category.toLowerCase().includes(q))
      );
    }

    // Filter Tag
    if (activeFilterTag === "top-rated") {
      list = list.filter((p) => (p.average_rating || 0) >= 4.8);
    } else if (activeFilterTag === "under-2k") {
      list = list.filter((p) => p.price <= 2000);
    } else if (activeFilterTag === "under-30k") {
      list = list.filter((p) => p.price <= 30000);
    } else if (activeFilterTag === "organic") {
      list = list.filter((p) => p.is_organic);
    } else if (activeFilterTag !== "all") {
      list = list.filter((p) => p.sub_category === activeFilterTag || p.category === activeFilterTag);
    }

    // Sort
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    return list;
  }, [catalogProducts, activeFilterTag, sortBy, searchQuery]);

  // Carousel scroll ref
  const dealsScrollRef = useRef<HTMLDivElement>(null);

  const scrollDeals = (direction: "left" | "right") => {
    if (dealsScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      dealsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Fetch Storefront Products based on Category
  useEffect(() => {
    async function loadCatalog() {
      try {
        const url = selectedCategory === "all" ? "/api/products" : `/api/products?category=${selectedCategory}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setCatalogProducts(data.products);
        }
      } catch (e) {
        console.error("Error loading products", e);
      }
    }
    loadCatalog();
  }, [selectedCategory]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    if (text.toLowerCase().includes("phone") || text.toLowerCase().includes("edge") || text.toLowerCase().includes("iphone")) {
      setThinkingLabel("Finding smartphone deals & specifications…");
    } else if (text.toLowerCase().includes("compare") || text.includes("तुलना")) {
      setThinkingLabel("Comparing features, ratings & pricing…");
    } else if (text.toLowerCase().includes("track") || text.toLowerCase().includes("order")) {
      setThinkingLabel("Querying live order tracking & dispatch…");
    } else {
      setThinkingLabel("Searching product catalog…");
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          payload: data.message as AssistantMessage,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (isAutoSpeakEnabled) {
          const payload = data.message as AssistantMessage;
          if (payload.type === "text") {
            speak(payload.text);
          } else if (payload.type === "products") {
            speak(payload.text || `Found ${payload.products.length} matching products.`);
          } else if (payload.type === "clarify") {
            speak(payload.question);
          } else if (payload.type === "empty_state") {
            speak(payload.reason);
          }
        }

        if ((data.message as any).trace) {
          setSelectedTrace((data.message as any).trace);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackErrorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        payload: {
          type: "empty_state",
          reason: "An unexpected error occurred while communicating with the catalog. Please try again.",
          suggestions: ["Motorola edge 70", "iPhone 15", "ASUS Vivobook 15", "Organic Raw Honey"],
        },
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendImage = async (imagePathOrFile: string | File) => {
    let imageUrl = "/images/honey.png";
    let imageName = "honey.png";

    if (typeof imagePathOrFile === "string") {
      imageName = imagePathOrFile;
      imageUrl = `/images/${imagePathOrFile}`;
    } else {
      imageName = imagePathOrFile.name;
      imageUrl = URL.createObjectURL(imagePathOrFile);
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: `Searching by photo: ${imageName}`,
      image: imageUrl,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setThinkingLabel("Analyzing visual attributes & product features…");

    try {
      const res = await fetch("/api/image-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageName, url: imageUrl }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          payload: data.message as AssistantMessage,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (isAutoSpeakEnabled && (data.message as any).description) {
          speak((data.message as any).description);
        }
      }
    } catch (e) {
      console.error("Image search error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      const storageKey = getChatStorageKey(user?.id);
      localStorage.removeItem(storageKey);
    }
  };

  const toggleWishlist = (id: number) => {
    setWishlistActive((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCartQuantity = (productId: number) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        onNewChat={handleNewChat}
        onOpenTrace={() =>
          setSelectedTrace(
            selectedTrace || {
              query: "Recent Product Catalog Scan",
              parsed_intent: "Real-time inventory lookup across Cartwise Plus product catalog",
              filters: { keyword: "mobiles, tech" },
              sql_query: "SELECT * FROM products WHERE stock > 0 ORDER BY price DESC",
              steps: [
                { title: "Intent Parsing", detail: "Analyzed search keywords and customer preference filters", status: "complete" },
                { title: "Catalog Match", detail: "Scanned SQLite store records with index optimization", status: "complete" },
                { title: "Pricing & Stock Check", detail: "Verified real-time inventory and instant discounts", status: "complete" },
              ],
            }
          )
        }
        onSearch={(term) => {
          setSearchQuery(term);
          handleSendMessage(term);
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveFilterTag("all");
          setSearchQuery("");
        }}
        selectedCategory={selectedCategory}
      />

      {/* Main Content Layout */}
      {activeTab === "orders" ? (
        <OrdersView />
      ) : (
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 pb-24 sm:pb-8">
          {/* Mobile View Toggle Switcher (< lg screens) */}
          <div className="lg:hidden flex items-center p-1 bg-white border border-slate-200 rounded-xl mb-3 shadow-xs">
            <button
              onClick={() => setMobileView("store")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === "store"
                  ? "bg-slate-950 text-amber-400 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products</span>
            </button>
            <button
              onClick={() => setMobileView("copilot")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === "copilot"
                  ? "bg-slate-950 text-amber-400 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* 1. TOP TECH DEALS BANNER (Sleek Onyx Black & Gold)        */}
          {/* ======================================================== */}
          <section className="mb-4 rounded-2xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-950 border border-amber-500/30 p-3 sm:p-5 text-white shadow-md relative">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  Top tech deals revealed
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950">
                  BIG SAVINGS
                </span>
              </div>

              {/* Scroll Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollDeals("left")}
                  aria-label="Previous Deals"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollDeals("right")}
                  aria-label="Next Deals"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Carousel Cards */}
            <div
              ref={dealsScrollRef}
              className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none pb-1 scroll-smooth"
            >
              {CARTWISE_TOP_TECH_DEALS.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => {
                    setSelectedProductForModal(deal.product as any);
                  }}
                  className="w-36 sm:w-44 md:w-48 flex-shrink-0 bg-white rounded-xl p-2.5 sm:p-3 flex flex-col justify-between items-center text-center text-slate-900 cursor-pointer group hover:shadow-lg hover:scale-102 transition-all duration-200 border border-transparent hover:border-amber-400/40"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-28 sm:h-32 rounded-lg bg-slate-50 flex items-center justify-center p-1.5 mb-2 overflow-hidden">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/honey.png";
                      }}
                    />
                  </div>

                  {/* Price Tag Pill */}
                  <div className="w-full bg-slate-950 text-amber-400 border border-amber-500/40 py-1 px-1.5 rounded-lg text-[11px] font-black mb-1">
                    {deal.offerTag}
                  </div>

                  {/* Product Title */}
                  <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-amber-600">
                    {deal.title}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dual-Column Storefront + Copilot Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* ======================================================== */}
            {/* LEFT / MAIN STOREFRONT COLUMN (7-8 cols on Desktop)       */}
            {/* ======================================================== */}
            <div className={`space-y-4 lg:col-span-7 xl:col-span-8 ${mobileView === "store" ? "block" : "hidden lg:block"}`}>
              {/* 4 Value Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">15-Min Delivery</div>
                    <div className="text-[10px] text-slate-500">Free over ₹199</div>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">100% Genuine</div>
                    <div className="text-[10px] text-slate-500">Brand authorized</div>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Best Prices</div>
                    <div className="text-[10px] text-slate-500">Direct deal rates</div>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <ReturnIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">7-Day Return</div>
                    <div className="text-[10px] text-slate-500">Instant refund</div>
                  </div>
                </div>
              </div>

              {/* Bank Offer Ribbon */}
              <div className="rounded-xl bg-slate-950 border border-amber-500/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong className="text-amber-400">Cartwise Exclusive:</strong> Flat 10% Instant Discount on SBI, HDFC &amp; Axis Bank Cards. Use coupon <strong className="text-slate-950 font-mono font-black bg-gradient-to-r from-amber-400 to-yellow-400 px-1.5 py-0.2 rounded">SAVE10</strong>.
                  </span>
                </div>
                <button
                  onClick={() => handleSendMessage("Apply promo voucher SAVE10")}
                  className="text-amber-400 hover:text-amber-300 font-bold text-xs shrink-0 cursor-pointer underline underline-offset-2"
                >
                  Apply Code
                </button>
              </div>

              {/* Main Product Catalog Grid & Quick Filters */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full inline-block" />
                    <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight capitalize">
                      {selectedCategory === "all" ? "Featured Products & Top Deals" : `${selectedCategory.replace("-", " ")} Catalog`}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {displayedProducts.length} Items
                    </span>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
                    >
                      <option value="featured">Featured Deals</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Customer Rating</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Subcategory & Price Filter Chips (Adapts per selected category) */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 text-xs">
                  {(CATEGORY_CHIP_PRESETS[selectedCategory] || CATEGORY_CHIP_PRESETS.all).map((chip) => {
                    const isSelected = activeFilterTag === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setActiveFilterTag(chip.id)}
                        className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1 ${
                          isSelected
                            ? "bg-slate-950 text-amber-400 border border-amber-500/40 shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {chip.isRating && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-2.5 py-1 rounded-full text-rose-600 bg-rose-50 border border-rose-200 text-[11px] font-bold shrink-0 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Clear "{searchQuery}" ✕
                    </button>
                  )}
                </div>

                {/* Adaptive Product Cards Grid (1 col on mobile, 2 on sm, 3 on md/lg, up to 4 on ultra-wide) */}
                {displayedProducts.length === 0 ? (
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
                    <p className="text-sm font-bold text-slate-800">No products match this filter tag.</p>
                    <button
                      onClick={() => setActiveFilterTag("all")}
                      className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                    >
                      Clear Filter &amp; View All Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                    {displayedProducts.map((product) => {
                      const isWishlisted = Boolean(wishlistActive[product.id]);
                      const originalPrice = (product.price * 1.25).toFixed(0);
                      const discountPercent = 20;
                      const quantityInCart = getCartQuantity(product.id);

                      return (
                        <div
                          key={product.id}
                          className="group bg-white border border-slate-200 hover:border-amber-400/80 rounded-xl p-3 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-lg"
                        >
                          <div>
                            {/* Card Top: Tag & Wishlist */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                                {product.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setSelectedProductForModal(product)}
                                  className="p-1 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                  title="Quick View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => toggleWishlist(product.id)}
                                  className="p-1 rounded-full text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                                  title="Add to Wishlist"
                                >
                                  <Heart
                                    className={`w-4 h-4 ${
                                      isWishlisted ? "text-rose-500 fill-rose-500" : "text-slate-300"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Image (Click opens modal) */}
                            <div
                              onClick={() => setSelectedProductForModal(product)}
                              className="relative w-full h-36 rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center p-2 mb-2 cursor-pointer"
                            >
                              <img
                                src={product.image_url || "/images/honey.png"}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/honey.png";
                                }}
                              />
                              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/90 text-amber-400 border border-amber-400/30">
                                ⚡ 15 MINS
                              </span>
                            </div>

                            {/* Ratings */}
                            <div className="flex items-center gap-1 mb-1">
                              <div className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-slate-900 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                <span>{product.average_rating || 4.8}</span>
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              </div>
                              <span className="text-[11px] text-slate-400">
                                ({product.review_count || 320})
                              </span>
                            </div>

                            {/* Title (Click opens modal) */}
                            <h3
                              onClick={() => setSelectedProductForModal(product)}
                              className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors cursor-pointer"
                            >
                              {product.name}
                            </h3>

                            <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          </div>

                          {/* Price & Add to Cart button */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex items-baseline justify-between">
                              <div>
                                <span className="font-black text-sm sm:text-base text-slate-950">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[11px] text-slate-400 line-through ml-1.5">
                                  ₹{Number(originalPrice).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
                                {discountPercent}% off
                              </span>
                            </div>

                            {quantityInCart > 0 ? (
                              <div className="flex items-center justify-between bg-slate-950 border border-amber-500/30 rounded-lg p-1">
                                <button
                                  onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                                  className="w-7 h-7 rounded bg-slate-900 text-amber-400 font-bold flex items-center justify-center shadow-xs cursor-pointer hover:bg-slate-800"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-amber-400">
                                  {quantityInCart} in cart
                                </span>
                                <button
                                  onClick={() => addToCart(product, 1)}
                                  className="w-7 h-7 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xs cursor-pointer hover:bg-amber-400"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product, 1)}
                                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-amber-400 bg-slate-950 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 transition-colors flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer shadow-xs"
                              >
                                <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                                <span>ADD TO CART</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Trust Footer */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shadow-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    <strong>100% Payment Protection:</strong> UPI, Credit/Debit Cards, Netbanking &amp; Cash on Delivery.
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Cartwise Plus Verified
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT / AI SHOPPING ASSISTANT SIDEBAR (4-5 cols on Desktop) */}
            {/* ======================================================== */}
            <div
              className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[740px] lg:h-[calc(100vh-130px)] lg:min-h-[640px] lg:max-h-[920px] lg:sticky top-28 lg:col-span-5 xl:col-span-4 ${
                mobileView === "copilot" ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Copilot Header */}
              <div className="p-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-amber-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-white">Cartwise AI Assistant</h3>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-xs">
                        LIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-amber-200/80">
                      <span>Instant comparison &amp; price arbitrage</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setSelectedTrace(
                        selectedTrace || {
                          query: "Recent Product Catalog Scan",
                          parsed_intent: "Verified catalog retrieval with SQLite",
                          filters: { keyword: "mobiles" },
                          sql_query: "SELECT * FROM products WHERE category = 'mobiles'",
                          steps: [
                            { title: "Query Parsing", detail: "Parsed user search filters and intent", status: "complete" },
                            { title: "Database Query", detail: "Scanned SQLite products with index lookups", status: "complete" },
                            { title: "Review Aggregation", detail: "Aggregated customer ratings and star counts", status: "complete" },
                          ],
                        }
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Agent Trace Inspector"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNewChat}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Clear Chat / New Thread"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mode Tabs: [Chat & Search] [Snap Search] [Voice] */}
              <div className="px-3 pt-2 pb-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveCopilotTab("chat")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      activeCopilotTab === "chat"
                        ? "bg-slate-950 text-amber-400 border border-amber-500/40 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat &amp; Find</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCopilotTab("snap");
                      handleSendImage("honey.png");
                    }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      activeCopilotTab === "snap"
                        ? "bg-slate-950 text-amber-400 border border-amber-500/40 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>Photo Search</span>
                  </button>

                  <button
                    onClick={() => setActiveCopilotTab("voice")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      activeCopilotTab === "voice"
                        ? "bg-slate-950 text-amber-400 border border-amber-500/40 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  ⚡ 15-Min Delivery
                </div>
              </div>

              {/* Chat Stream (Scrollable message area) */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin bg-slate-50/50">
                {messages.length === 0 ? (
                  <EmptyChatPrompt onSelectPrompt={handleSendMessage} />
                ) : (
                  <>
                    <div className="text-center text-[10px] text-slate-400 font-medium py-1">
                      Real-time retail assistant • Grounded in store inventory
                    </div>

                    {messages.map((msg) => {
                      if (msg.role === "user") {
                        return <UserBubble key={msg.id} message={msg} />;
                      }

                      const { payload } = msg;
                      switch (payload.type) {
                        case "text":
                          return <TextMessage key={msg.id} text={payload.text} />;

                        case "products":
                          return (
                            <ProductsMessage
                              key={msg.id}
                              products={payload.products}
                              text={payload.text}
                              trace={payload.trace}
                              orderTracking={payload.orderTracking}
                              promoArbitrage={payload.promoArbitrage}
                              onOpenTrace={(trace) => setSelectedTrace(trace)}
                              onOpenGpsFeed={(tracking) => setActiveTrackingModal(tracking)}
                              onInstantPay={(amount, product) => {
                                addToCart(product, 1);
                                setIsCartOpen(true);
                              }}
                            />
                          );

                        case "image_analysis":
                          return (
                            <ImageAnalysisMessage
                              key={msg.id}
                              tags={payload.tags}
                              description={payload.description}
                              matchedProducts={payload.matchedProducts}
                              uploadedImage={payload.uploadedImage}
                              onOpenTrace={(trace) => setSelectedTrace(trace)}
                            />
                          );

                        case "clarify":
                          return (
                            <ClarifyMessage
                              key={msg.id}
                              question={payload.question}
                              options={payload.options}
                              onSelectOption={handleSendMessage}
                            />
                          );

                        case "compare":
                          return (
                            <CompareMessage
                              key={msg.id}
                              products={payload.products}
                              comparisonPoints={payload.comparisonPoints}
                            />
                          );

                        case "empty_state":
                          return (
                            <EmptyStateMessage
                              key={msg.id}
                              reason={payload.reason}
                              suggestions={payload.suggestions}
                              onSelectSuggestion={handleSendMessage}
                            />
                          );

                        default:
                          return null;
                      }
                    })}

                    {isLoading && <ThinkingMessage label={thinkingLabel} />}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input Bar */}
              <ChatInput
                onSendMessage={handleSendMessage}
                onSendImage={handleSendImage}
                disabled={isLoading}
                onSelectSuggestion={handleSendMessage}
              />
            </div>
          </div>
        </main>
      )}

      {/* Global Modals */}
      <CartDrawer />
      <AuthModal />
      <AddressModal />
      <PersonalisationModal />
      <AgentTraceModal trace={selectedTrace} onClose={() => setSelectedTrace(null)} />
      <SatelliteGpsModal
        isOpen={Boolean(activeTrackingModal)}
        onClose={() => setActiveTrackingModal(null)}
        orderId={activeTrackingModal?.orderId}
        productName={activeTrackingModal?.productName}
        carrier={activeTrackingModal?.carrier}
        estimatedArrival={activeTrackingModal?.estimatedArrival}
      />
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAskAI={handleSendMessage}
      />
    </div>
  );
}

export default function Home() {
  return (
    <UserProvider>
      <CartProvider>
        <VoiceProvider>
          <MainApp />
        </VoiceProvider>
      </CartProvider>
    </UserProvider>
  );
}
