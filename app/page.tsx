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
} from "lucide-react";

function MainApp() {
  const { activeTab, selectedTrace, setSelectedTrace, addToCart, setIsCartOpen } = useCart();
  const { speak, isAutoSpeakEnabled } = useVoice();
  const { user, personalizedProducts, setIsPersonalisationModalOpen } = useUser();
  const [mobileView, setMobileView] = useState<"store" | "copilot">("store");

  // Initial screenshot match conversation state
  const initialUserMessage: ChatMessage = {
    id: "usr-init-1",
    role: "user",
    content: "Find me top organic honey under $20 and track order #1040.",
    timestamp: Date.now() - 1000 * 60 * 12,
  };

  const initialAssistantMessage: ChatMessage = {
    id: "ast-init-1",
    role: "assistant",
    timestamp: Date.now() - 1000 * 60 * 12 + 1500,
    payload: {
      type: "products",
      text: "Found top organic honey under $20 and synced your live shipment dispatch:",
      products: [
        {
          id: 99,
          name: "Organic Raw Forest Honey (500g)",
          category: "snacks-packaged-foods",
          sub_category: "spreads-sauces-pickles",
          price: 14.99,
          description: "Unfiltered cold-extracted raw wild forest honey from deep reserves",
          is_organic: true,
          average_rating: 5.0,
          review_count: 30,
          image_url: "/images/honey.png",
          stock: 30,
        },
      ],
      orderTracking: {
        orderId: "#1040",
        productName: "Organic Japanese Sencha Green Tea",
        carrier: "CartWise FastFleet",
        status: "OUT FOR DELIVERY",
        estimatedArrival: "Today by 3:45 PM",
        step: "out_for_delivery",
      },
      promoArbitrage: {
        code: "SAVE10",
        savings: 1.5,
        finalTotal: 13.49,
      },
      trace: {
        query: "Find me top organic honey under $20 and track order #1040.",
        parsed_intent: "Find organic honey under $20 and track live order",
        filters: { keyword: "honey", max_price: 20, is_organic: true },
        sql_query:
          "SELECT * FROM products WHERE (name LIKE '%honey%' OR category = 'spreads-sauces-pickles') AND price <= 20",
        results_count: 1,
        steps: [
          { title: "Query Parsing", detail: "Parsed dual intent: Product search + Live order dispatch lookup", status: "complete" },
          { title: "Database Query", detail: "Selected Organic Raw Forest Honey (ID: 99) in SQLite catalog", status: "complete" },
          { title: "Fleet Telemetry", detail: "Connected to FastFleet Satellite GPS for Order #1040", status: "complete" },
          { title: "Price Arbitrage", detail: "Calculated SAVE10 voucher arbitrage with net price $13.49", status: "complete" },
        ],
      },
    },
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialUserMessage, initialAssistantMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState("Searching organic catalog…");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [wishlistActive, setWishlistActive] = useState<Record<number, boolean>>({});
  const [activeCopilotTab, setActiveCopilotTab] = useState<"chat" | "snap" | "voice">("chat");
  const [activeTrackingModal, setActiveTrackingModal] = useState<OrderTrackingInfo | null>(null);

  // Live Countdown Timer (Screenshot match: Ends in 08h : 42m : 19s)
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 42, seconds: 19 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Storefront Featured Deals
  useEffect(() => {
    async function loadCatalog() {
      try {
        const url = selectedCategory === "all" ? "/api/products" : `/api/products?category=${selectedCategory}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setCatalogProducts(data.products.slice(0, 6));
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

    if (text.toLowerCase().includes("honey") || text.includes("मधु")) {
      setThinkingLabel("Finding organic honeys from local apiaries…");
    } else if (text.toLowerCase().includes("compare") || text.includes("तुलना")) {
      setThinkingLabel("Synthesizing nutritional comparison matrix…");
    } else if (text.toLowerCase().includes("track") || text.toLowerCase().includes("order")) {
      setThinkingLabel("Querying FastFleet Satellite Telemetry…");
    } else {
      setThinkingLabel("Searching organic grocery catalog…");
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
          suggestions: ["Organic Raw Honey", "Rolled Oats", "Extra Virgin Olive Oil"],
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
    setThinkingLabel("Analyzing visual attributes & labels…");

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
  };

  const toggleWishlist = (id: number) => {
    setWishlistActive((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatCountdown = () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(timeLeft.hours)}h : ${pad(timeLeft.minutes)}m : ${pad(timeLeft.seconds)}s`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0a0e17] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar with Search and Categories */}
      <Navbar
        onNewChat={handleNewChat}
        onOpenTrace={() =>
          setSelectedTrace(
            selectedTrace || {
              query: "Recent Agent Execution",
              parsed_intent: "Verified catalog retrieval with SQLite",
              filters: { keyword: "organic" },
              sql_query: "SELECT * FROM products WHERE is_organic = 1",
              steps: [
                { title: "Query Parsing", detail: "Parsed user search filters and intent", status: "complete" },
                { title: "Database Query", detail: "Scanned SQLite products with index lookups", status: "complete" },
                { title: "Review Aggregation", detail: "Aggregated customer ratings and star counts", status: "complete" },
              ],
            }
          )
        }
        onSearch={handleSendMessage}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        selectedCategory={selectedCategory}
      />

      {/* Main Dual-Column Content Layout */}
      {activeTab === "orders" ? (
        <OrdersView />
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {/* Mobile View Toggle Switcher (< lg screens) */}
          <div className="lg:hidden flex items-center p-1 bg-[#121828] border border-white/10 rounded-2xl mb-4 shadow-lg">
            <button
              onClick={() => setMobileView("store")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === "store"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Store Catalog</span>
            </button>
            <button
              onClick={() => setMobileView("copilot")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileView === "copilot"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Copilot & Chat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ======================================================== */}
            {/* LEFT / MAIN STOREFRONT COLUMN (7 cols on Desktop)         */}
            {/* ======================================================== */}
            <div className={`space-y-4 lg:col-span-7 ${mobileView === "store" ? "block" : "hidden lg:block"}`}>
              {/* 1. Hero Feature Banner ("MEGA SAVINGS DAYS • LIVE NOW") */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#12192a] via-[#101625] to-[#0c101c] border border-white/10 p-5 sm:p-7 shadow-2xl">
                {/* Background glow orb */}
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="space-y-4 max-w-md">
                    {/* Live countdown pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162137] border border-cyan-500/30 text-xs font-bold text-cyan-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>MEGA SAVINGS DAYS • LIVE NOW</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-300 font-mono">Ends in {formatCountdown()}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                      Up to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">30% Off</span> Flagship Organic Harvest & Cold-Pressed Staples
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Exclusive pre-negotiated farm-direct wholesale rates. Instant checkout tokenized by your personal copilot with 1-tap price protection guarantee.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <button
                        onClick={() => handleSendMessage("Show me top featured deals under $20")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Shop Featured Deals</span>
                      </button>

                      <button
                        onClick={() => handleSendMessage("What are your best organic picks today?")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-slate-200 bg-[#162035] hover:bg-[#1c2944] border border-white/10 active:scale-95 transition-all cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ask AI for Best Picks</span>
                      </button>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Authentic
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-cyan-400" /> Free Express 2-Hour Delivery
                      </span>
                      <span className="flex items-center gap-1">
                        <ReturnIcon className="w-3.5 h-3.5 text-purple-400" /> 14-Day Free Returns
                      </span>
                    </div>
                  </div>

                  {/* Right Bestseller Showcase Card inside Hero */}
                  <div className="w-full md:w-56 bg-[#131b2d] border border-white/10 rounded-2xl p-3 space-y-2.5 flex-shrink-0 shadow-xl group hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/60 text-cyan-300 border border-cyan-500/30">
                        BESTSELLER #1
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">In Stock</span>
                    </div>

                    <div className="relative w-full h-36 rounded-xl bg-[#090d16] overflow-hidden flex items-center justify-center p-2 border border-white/5">
                      <img
                        src={catalogProducts[0]?.image_url || "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80"}
                        alt={catalogProducts[0]?.name || "Organic Bestseller"}
                        className="max-h-full max-w-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-xs text-white truncate">
                        {catalogProducts[0]?.name || "Organic Alphonso Mangoes (1kg)"}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-extrabold text-emerald-400">
                          ${catalogProducts[0]?.price.toFixed(2) || "12.99"}
                        </span>
                        <div className="text-[11px] text-slate-500 line-through">
                          ${((catalogProducts[0]?.price || 12.99) * 1.25).toFixed(2)}{" "}
                          <span className="text-emerald-400 font-bold ml-0.5">-25%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const item = catalogProducts[0];
                          if (item) addToCart(item, 1);
                        }}
                        className="w-full py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Bank Offer Bar (Screenshot match) */}
              <div className="rounded-2xl bg-[#111726] border border-white/10 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-300 shadow-md">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong className="text-white">Bank Offer:</strong> Instant 10% Discount up to $50 on Apple Card, HDFC & Chase Infinite
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>• No Cost EMI available</span>
                  <span>• CartWise 5% Unlimited Cashback</span>
                  <button
                    onClick={() => alert("Bank Offer Terms: 10% instant off on select cards for orders over $30.")}
                    className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    View T&C
                  </button>
                </div>
              </div>

              {/* 3. Section: "Best Deals on Organic Harvest & Pantry Essentials" */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                        Best Deals on Organic Harvest & Pantry Essentials
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 pl-8">
                      Curated by CartWise AI based on real-time price drops across SQLite store catalog
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-[#151c2d] hover:bg-[#1a243a] border border-white/10 transition-colors cursor-pointer"
                  >
                    <span>View All Deals</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3-Card Grid Matching Screenshot Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {catalogProducts.map((product, idx) => {
                    const isWishlisted = Boolean(wishlistActive[product.id]);
                    const originalPrice = (product.price * 1.25).toFixed(2);
                    const badges = ["98% AI MATCH", "HOT DEAL", "ORGANIC HARVEST", "BEST VALUE"];
                    const subTags = ["🛡️ Prime Choice", "⚡ Mega Savings Drop", "🌿 Pure Cold-Pressed", "🌾 Whole Grain"];
                    const badge = badges[idx % badges.length];
                    const subTag = subTags[idx % subTags.length];

                    return (
                      <div
                        key={product.id}
                        className="group bg-[#121827] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-cyan-500/10"
                      >
                        <div>
                          {/* Card Top: Badge & Heart Wishlist */}
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                idx === 0
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : idx === 1
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-indigo-500/20 text-cyan-300 border border-indigo-500/30"
                              }`}
                            >
                              {badge}
                            </span>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="p-1 rounded-full text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Add to Wishlist"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isWishlisted ? "text-rose-500 fill-rose-500" : "text-slate-400"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Product Image */}
                          <div className="relative w-full h-36 rounded-xl bg-[#0a0e17] overflow-hidden flex items-center justify-center p-2 mb-2 border border-white/5">
                            <img
                              src={product.image_url || "/images/honey.png"}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/honey.png";
                              }}
                            />
                          </div>

                          {/* Tag & Non-Truncated Title */}
                          <div className="text-[10px] font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                            <span>{subTag}</span>
                          </div>

                          <h3 className="font-bold text-xs sm:text-sm text-white leading-snug break-words mb-1">
                            {product.name}
                          </h3>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                            {product.description}
                          </p>
                        </div>

                        {/* Price & Add to Cart button */}
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="font-extrabold text-sm sm:text-base text-emerald-400">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-[11px] text-slate-500 line-through ml-1.5">
                                ${originalPrice}
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-300" />
                              <span>{product.average_rating || 4.8}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart(product, 1)}
                            className="w-full py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-[#182136] hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 border border-white/10 hover:border-transparent transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-cyan-300" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Section: "Personalised for [User Name]" */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                        Personalised for {user?.name || "You"}
                      </h2>
                      {user?.vip_level && (
                        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {user.vip_level}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 pl-8 flex-wrap">
                      <span className="text-xs text-slate-400">Dietary regimen:</span>
                      {(user?.preferences?.dietary_tags || ["Certified Organic", "Clean Eating"]).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPersonalisationModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-[#151c2d] hover:bg-[#1a243a] border border-white/10 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Customise Diet</span>
                  </button>
                </div>

                {/* Personalized Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(personalizedProducts.length > 0 ? personalizedProducts : catalogProducts).slice(0, 3).map((product, idx) => {
                    const isWishlisted = Boolean(wishlistActive[product.id]);
                    const originalPrice = (product.price * 1.25).toFixed(2);

                    return (
                      <div
                        key={`pers-${product.id}`}
                        className="group bg-[#121827] border border-emerald-500/20 hover:border-emerald-400/50 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-emerald-500/10"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ✨ AI RECOM 99%
                            </span>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="p-1 rounded-full text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isWishlisted ? "text-rose-500 fill-rose-500" : "text-slate-400"
                                }`}
                              />
                            </button>
                          </div>

                          <div className="relative w-full h-36 rounded-xl bg-[#0a0e17] overflow-hidden flex items-center justify-center p-2 mb-2 border border-white/5">
                            <img
                              src={product.image_url || "/images/honey.png"}
                              alt={product.name}
                              className="max-h-full max-w-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/honey.png";
                              }}
                            />
                          </div>

                          <div className="text-[10px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                            <span>🌿 Verified Organic Match</span>
                          </div>

                          <h3 className="font-bold text-xs sm:text-sm text-white leading-snug break-words mb-1">
                            {product.name}
                          </h3>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                            {product.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="font-extrabold text-sm sm:text-base text-emerald-400">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-[11px] text-slate-500 line-through ml-1.5">
                                ${originalPrice}
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-300" />
                              <span>{product.average_rating || 4.9}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart(product, 1)}
                            className="w-full py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-white" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT / AURA AI COPILOT SIDEBAR PANEL (5 cols on Desktop) */}
            {/* ======================================================== */}
            <div
              className={`bg-[#0f1422] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[780px] lg:sticky top-24 lg:col-span-5 ${
                mobileView === "copilot" ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Copilot Header */}
              <div className="p-3.5 sm:p-4 bg-[#131b2e] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow">
                    <Bot className="w-4 h-4 text-cyan-300" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f1422] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-white">CartWise AI Copilot</h3>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-400/20">
                        v3.8
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Online & Listening</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setSelectedTrace(
                        selectedTrace || {
                          query: "Live Copilot Reasoning",
                          parsed_intent: "Verified catalog retrieval with SQLite",
                          filters: { keyword: "organic" },
                          sql_query: "SELECT * FROM products WHERE is_organic = 1",
                          steps: [
                            { title: "Query Parsing", detail: "Parsed user search filters and intent", status: "complete" },
                            { title: "Database Query", detail: "Scanned SQLite products with index lookups", status: "complete" },
                            { title: "Review Aggregation", detail: "Aggregated customer ratings and star counts", status: "complete" },
                          ],
                        }
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Agent Trace Inspector"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNewChat}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Clear Chat / New Thread"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mode Tabs: [Chat & Search] [Snap Search] [Voice] */}
              <div className="px-3 pt-2 pb-1.5 bg-[#0d121f] border-b border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveCopilotTab("chat")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      activeCopilotTab === "chat"
                        ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat & Search</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCopilotTab("snap");
                      handleSendImage("honey.png");
                    }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      activeCopilotTab === "snap"
                        ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>Snap Search</span>
                  </button>

                  <button
                    onClick={() => setActiveCopilotTab("voice")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      activeCopilotTab === "voice"
                        ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  Synced: 105 Items
                </div>
              </div>

              {/* Chat Stream (Scrollable message area) */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin">
                {messages.length === 0 ? (
                  <EmptyChatPrompt onSelectPrompt={handleSendMessage} />
                ) : (
                  <>
                    <div className="text-center text-[10px] text-slate-500 font-mono py-1">
                      AI Agent synced with SQLite Store Nodes • Zero Hallucination
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
        </div>
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
