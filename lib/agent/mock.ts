import {
  searchProducts,
  getProductById,
  getProductReviews,
  getOrderById,
  cancelOrderDb,
  getOrders,
  calculatePromoDiscount,
} from "../db";
import { generateInvoiceData } from "../invoice";
import { AssistantMessage, ChatMessage, Product, AgentTrace } from "../types";

export async function handleMockChat(messages: ChatMessage[]): Promise<AssistantMessage> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUserMessage) {
    return {
      type: "empty_state",
      reason: "No query provided. Ask for any product across Mobiles, Electronics, Fashion, or Groceries.",
      suggestions: ["Motorola edge 70 Fusion", "Apple iPhone 15", "ASUS Vivobook 15 OLED", "Organic Raw Forest Honey"],
    };
  }

  const rawQuery = lastUserMessage.content.trim();
  const lowerQuery = rawQuery.toLowerCase();

  // 1. Order Cancellation intent
  if (lowerQuery.includes("cancel")) {
    const idMatch = lowerQuery.match(/\b(\d+)\b/);
    const orderId = idMatch ? Number(idMatch[1]) : (getOrders()[0]?.id || 1040);
    const cancelRes = cancelOrderDb(orderId, "Customer requested cancellation via Cartwise AI Copilot");
    return {
      type: "text",
      text: cancelRes.message,
    };
  }

  // 2. Invoice / Tax Receipt generation intent
  if (lowerQuery.includes("invoice") || lowerQuery.includes("receipt") || lowerQuery.includes("bill") || lowerQuery.includes("gst")) {
    const idMatch = lowerQuery.match(/\b(\d+)\b/);
    const orderId = idMatch ? Number(idMatch[1]) : (getOrders()[0]?.id || 1040);
    const order = getOrderById(orderId);
    if (!order) {
      return {
        type: "text",
        text: `Order #${orderId} was not found in our store database records.`,
      };
    }
    const inv = generateInvoiceData({
      order,
      items: order.items || [],
      paymentMethod: "upi",
      transactionId: `tx_${order.id}`,
      finalTotal: order.total,
      subtotal: order.total,
    });
    return {
      type: "text",
      text: `🧾 **Tax Invoice ${inv.invoiceNumber} (Order #${inv.orderId})**\n- **GSTIN:** ${inv.storeGstin}\n- **Subtotal:** ₹${inv.subtotal.toFixed(2)}\n- **GST (CGST 9% + SGST 9%):** ₹${inv.gst.totalGst.toFixed(2)}\n- **Total Amount:** ₹${inv.finalTotal.toFixed(2)}\n- **Delivery Address:** ${inv.deliveryAddress?.street_address}, ${inv.deliveryAddress?.city} - ${inv.deliveryAddress?.pincode}\n[Download PDF Receipt](/api/orders/${order.id}/invoice)`,
    };
  }

  // 3. Live Order Tracking intent
  if (
    lowerQuery.includes("track") ||
    lowerQuery.includes("where is my order") ||
    lowerQuery.includes("delivery status") ||
    lowerQuery.includes("1040") ||
    lowerQuery.includes("rider")
  ) {
    const order = getOrderById(1040) || getOrders()[0];
    const honey = getProductById(601) || getProductById(101);

    const trackingInfo = {
      orderId: "#1040",
      productName: order?.items?.[0]?.product_name || "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)",
      carrier: "Cartwise Express Rider (Ramesh Kumar - Ather 450X EV)",
      status: "OUT FOR DELIVERY" as const,
      estimatedArrival: "Today in 12 mins (by 3:45 PM)",
      step: "out_for_delivery" as const,
    };

    const promoInfo = {
      code: "SAVE10",
      savings: 34.9,
      finalTotal: 314.1,
    };

    return {
      type: "products",
      text: "Synced your live 15-minute dispatch status with Satellite Rider telemetry:",
      products: honey ? [honey] : [],
      orderTracking: trackingInfo,
      promoArbitrage: promoInfo,
      trace: {
        query: rawQuery,
        parsed_intent: "Query live order dispatch and Satellite GPS location for Order #1040",
        filters: { order_id: 1040, tracking_stage: "out_for_delivery" },
        sql_query: "SELECT * FROM orders WHERE id = 1040",
        results_count: 1,
        steps: [
          { title: "Intent Parsing", detail: "Parsed tracking request for active delivery order #1040", status: "complete" },
          { title: "Database Query", detail: "Fetched order details from SQLite orders table", status: "complete" },
          { title: "Rider Telemetry", detail: "Connected to Ather 450X EV GPS feed (Rider: Ramesh Kumar)", status: "complete" },
          { title: "ETA Calculation", detail: "Computed doorstep delivery time: 12 minutes", status: "complete" },
        ],
      },
    };
  }

  // 4. Promo / Voucher calculation intent
  if (lowerQuery.includes("save10") || lowerQuery.includes("coupon") || lowerQuery.includes("promo") || lowerQuery.includes("discount")) {
    const discountRes = calculatePromoDiscount("SAVE10", 29999);
    return {
      type: "text",
      text: `🎉 **Cartwise Plus Promo Validated: SAVE10**\n- **Discount Applied:** Flat 10% Instant Savings\n- **Estimated Savings:** ₹${discountRes.discountAmount.toLocaleString("en-IN")}\n- **Bank Offers:** Applicable across SBI, HDFC & Axis Bank credit/debit cards.\nUse code **SAVE10** at checkout to claim your discount!`,
    };
  }

  // 5. Comparison Intent
  if (lowerQuery.includes("compare") || lowerQuery.includes("vs") || lowerQuery.includes("difference")) {
    let compProducts: Product[] = [];

    if (lowerQuery.includes("iphone") || lowerQuery.includes("apple") || lowerQuery.includes("motorola") || lowerQuery.includes("edge 70") || lowerQuery.includes("phone") || lowerQuery.includes("mobile")) {
      const p1 = getProductById(101); // Motorola edge 70
      const p2 = getProductById(102); // iPhone 15
      const p3 = getProductById(103); // OnePlus 12R
      compProducts = [p1, p2, p3].filter(Boolean) as Product[];
    } else if (lowerQuery.includes("laptop") || lowerQuery.includes("vivobook") || lowerQuery.includes("tv")) {
      const p1 = getProductById(201); // Vivobook 15
      const p2 = getProductById(202); // TCL 43" QLED
      const p3 = getProductById(205); // iPad Air
      compProducts = [p1, p2, p3].filter(Boolean) as Product[];
    } else {
      const { products } = searchProducts({ limit: 3 });
      compProducts = products.slice(0, 3);
    }

    if (compProducts.length >= 2) {
      return {
        type: "compare",
        products: compProducts,
        comparisonPoints: {
          Price: compProducts.map((p) => `₹${p.price.toLocaleString("en-IN")}`),
          Rating: compProducts.map((p) => `★ ${p.average_rating || 4.8} (${p.review_count || 300} reviews)`),
          Category: compProducts.map((p) => `${p.category} (${p.sub_category || "Standard"})`),
          Stock: compProducts.map((p) => (p.stock > 0 ? `In Stock (${p.stock} units)` : "Out of Stock")),
          Highlight: compProducts.map((p) => p.description.slice(0, 75) + "..."),
        },
      };
    }
  }

  // 6. Natural Language Filters Extraction (Price, Rating, Category, Organic)
  let maxPrice: number | undefined = undefined;
  const priceMatch = lowerQuery.match(/(?:under|below|less than|within|budget)\s*(?:rs\.?|inr|₹)?\s*(\d+[\d,]*)/i);
  if (priceMatch) {
    maxPrice = Number(priceMatch[1].replace(/,/g, ""));
  }

  let minRating: number | undefined = undefined;
  if (lowerQuery.includes("top rated") || lowerQuery.includes("best rated") || lowerQuery.includes("highest rated") || lowerQuery.includes("4.8") || lowerQuery.includes("5 star")) {
    minRating = 4.8;
  } else if (lowerQuery.includes("4.5") || lowerQuery.includes("4 star")) {
    minRating = 4.5;
  }

  const isOrganic = lowerQuery.includes("organic") ? true : undefined;

  // Category Detection
  let detectedCategory: string | undefined = undefined;
  if (/\b(mobile|phone|smartphone|5g|iphone|motorola|samsung|oneplus|realme|poco)\b/i.test(lowerQuery)) {
    detectedCategory = "mobiles";
  } else if (/\b(laptop|electronic|tv|television|headphone|earphone|neckband|tablet|ipad|smartwatch)\b/i.test(lowerQuery)) {
    detectedCategory = "electronics";
  } else if (/\b(appliance|fridge|refrigerator|ac|air conditioner|air fryer|induction|cooktop)\b/i.test(lowerQuery)) {
    detectedCategory = "appliances";
  } else if (/\b(serum|skincare|cleanser|facewash|lipstick|makeup|beauty)\b/i.test(lowerQuery)) {
    detectedCategory = "beauty";
  } else if (/\b(honey|ghee|oil|olive|oat|oats|almond|nut|atta|dal|wheat|flour|whey|protein|grocery|food)\b/i.test(lowerQuery)) {
    detectedCategory = "food-health";
  } else if (/\b(fashion|jeans|jean|denim|shoes|shoe|sneaker|sneakers|shirt|t-shirt|polo|clothing)\b/i.test(lowerQuery)) {
    detectedCategory = "fashion";
  } else if (/\b(flask|bottle|milton|mattress|bedding|comforter|blanket|furniture|home)\b/i.test(lowerQuery)) {
    detectedCategory = "home";
  } else if (/\b(toy|lego|diaper|diapers|pampers|baby)\b/i.test(lowerQuery)) {
    detectedCategory = "toys-baby";
  } else if (/\b(helmet|dash cam|dashcam|auto|car)\b/i.test(lowerQuery)) {
    detectedCategory = "auto-accessories";
  } else if (/\b(badminton|racquet|yoga|mat|fitness|sport|sports)\b/i.test(lowerQuery)) {
    detectedCategory = "sports-fitness";
  }

  // Clean Search Term
  let searchTerm = rawQuery
    .replace(/(?:find|show|search|give|get|i want|looking for|best|top|cheap|cheaper|deals on|items|products|please|me)\s+/gi, "")
    .replace(/(?:under|below|less than|within|budget)\s*(?:rs\.?|inr|₹)?\s*\d+[\d,]*/gi, "")
    .replace(/(?:top rated|best rated|4\.8\+|4\.5\+|5 star|organic)/gi, "")
    .trim();

  // Multilingual keyword translation
  if (lowerQuery.includes("মধু") || lowerQuery.includes("शहद")) searchTerm = "honey";
  if (lowerQuery.includes("ঘি") || lowerQuery.includes("घी")) searchTerm = "ghee";
  if (lowerQuery.includes("চাল") || lowerQuery.includes("चावल") || lowerQuery.includes("আটা") || lowerQuery.includes("आटा")) searchTerm = "atta";
  if (lowerQuery.includes("ফোন") || lowerQuery.includes("फोन")) searchTerm = "phone";
  if (lowerQuery.includes("ল্যাপটপ") || lowerQuery.includes("लैपटॉप")) searchTerm = "laptop";
  if (lowerQuery.includes("জুতো") || lowerQuery.includes("जूते")) searchTerm = "shoes";

  // Execute Dynamic Search against SQLite Catalog
  const { products, sql } = searchProducts({
    query: searchTerm.length > 1 ? searchTerm : undefined,
    category: detectedCategory,
    maxPrice,
    minRating,
    isOrganic,
    limit: 6,
  });

  // If products found, format exact response
  if (products.length > 0) {
    const primaryItem = products[0];
    const discount = primaryItem.price * 0.1;
    const finalPrice = primaryItem.price - discount;

    const promoInfo = {
      code: "SAVE10",
      savings: Number(discount.toFixed(0)),
      finalTotal: Number(finalPrice.toFixed(0)),
    };

    return {
      type: "products",
      text: `Found ${products.length} exact matching item${products.length > 1 ? "s" : ""} in Cartwise Plus inventory:`,
      products,
      promoArbitrage: promoInfo,
      trace: {
        query: rawQuery,
        parsed_intent: `Search ${detectedCategory || "all catalog"} for '${searchTerm || rawQuery}' with budget & rating constraints`,
        filters: {
          keyword: searchTerm || undefined,
          category: detectedCategory,
          max_price: maxPrice,
          min_rating: minRating,
          is_organic: isOrganic,
        },
        sql_query: sql.trim(),
        results_count: products.length,
        steps: [
          { title: "Semantic Parsing", detail: `Extracted intent: category=${detectedCategory || "all"}, search='${searchTerm}', maxPrice=₹${maxPrice || "Any"}`, status: "complete" },
          { title: "SQLite Catalog Scan", detail: `Retrieved ${products.length} verified products matching database indexes`, status: "complete" },
          { title: "Live Inventory & Pricing", detail: `Confirmed in-stock inventory and calculated instant SAVE10 promo arbitrage`, status: "complete" },
        ],
      },
    };
  }

  // Fallback: If strict query gave no result, try broad search across all products
  const broadSearch = searchProducts({ query: searchTerm.split(" ")[0] || rawQuery.split(" ")[0], limit: 4 });
  if (broadSearch.products.length > 0) {
    return {
      type: "products",
      text: `Here are the closest items found for "${rawQuery}":`,
      products: broadSearch.products,
      trace: {
        query: rawQuery,
        parsed_intent: "Fuzzy keyword recovery search",
        filters: { keyword: searchTerm },
        sql_query: broadSearch.sql.trim(),
        results_count: broadSearch.products.length,
        steps: [
          { title: "Fuzzy Fallback", detail: `Executed broad keyword search across all 11 Cartwise Plus categories`, status: "complete" },
        ],
      },
    };
  }

  // Clean empty state with real store suggestions
  return {
    type: "empty_state",
    reason: `We couldn't find any products matching "${rawQuery}" in store inventory. Try exploring popular flagship categories:`,
    suggestions: [
      "Motorola edge 70 Fusion",
      "Apple iPhone 15",
      "ASUS Vivobook 15 OLED",
      "Organic Raw Forest Honey",
      "Levi's 511 Denim Jeans",
      "Puma Running Shoes",
    ],
  };
}

export async function handleMockImage(file: string | Buffer | File): Promise<AssistantMessage> {
  const fileName = typeof file === "string" ? file.toLowerCase() : "";

  if (fileName.includes("honey")) {
    const honey = getProductById(601) || getProductById(101);
    return {
      type: "image_analysis",
      tags: ["Organic Raw Honey", "Cold-Extracted", "Pure Forest Harvest", "100% Genuine"],
      description: "Identified premium Raw Forest Honey. Cold-extracted unheated wild honey with rich natural antioxidants.",
      matchedProducts: honey ? [honey] : [],
      uploadedImage: "/images/honey.png",
    };
  }

  if (fileName.includes("oat")) {
    const oats = getProductById(604) || getProductById(601);
    return {
      type: "image_analysis",
      tags: ["Whole Grain Oats", "Gluten-Free", "High Fiber", "Breakfast Staple"],
      description: "Identified Whole Grain Rolled Oats. High in beta-glucan soluble fiber for heart and metabolic wellness.",
      matchedProducts: oats ? [oats] : [],
      uploadedImage: "/images/oats.png",
    };
  }

  if (fileName.includes("oil") || fileName.includes("avocado")) {
    const oil = getProductById(602) || getProductById(608);
    return {
      type: "image_analysis",
      tags: ["Extra Virgin Olive Oil", "Cold-Pressed", "Heart Healthy", "Spanish Olives"],
      description: "Identified Cold-Pressed Extra Virgin Olive Oil. Rich in healthy monounsaturated fatty acids and Vitamin E.",
      matchedProducts: oil ? [oil] : [],
      uploadedImage: "/images/avocado_oil.png",
    };
  }

  // Generic image analysis fallback
  const { products } = searchProducts({ limit: 2 });
  return {
    type: "image_analysis",
    tags: ["Verified Product", "Cartwise Plus Assured", "In Stock"],
    description: "Visual analysis complete. Matched with store catalog records.",
    matchedProducts: products,
    uploadedImage: "/images/honey.png",
  };
}
