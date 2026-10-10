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
import { AssistantMessage, ChatMessage, Product, AgentTrace, RecipeIngredient } from "../types";

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
      riderName: "Ramesh Kumar",
      riderPhone: "+91 98451 22890",
      riderVehicle: "Ather 450X EV (KA-03-HA-8821)",
      riderRating: 4.9,
      originCoords: { lat: 12.9279, lng: 77.6271 },
      destinationCoords: { lat: 12.9378, lng: 77.6248 },
      currentCoords: { lat: 12.9328, lng: 77.6291 },
      speedKmh: 31,
      batteryPercent: 84,
      routeProgress: 0.45,
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

  // 5. Recipe & Meal-to-Cart Bundler Intent
  if (
    lowerQuery.includes("recipe") ||
    lowerQuery.includes("meal") ||
    lowerQuery.includes("cook") ||
    lowerQuery.includes("breakfast bowl") ||
    lowerQuery.includes("smoothie") ||
    lowerQuery.includes("ingredients for") ||
    lowerQuery.includes("pantry bundle") ||
    (lowerQuery.includes("oats") && (lowerQuery.includes("bowl") || lowerQuery.includes("breakfast"))) ||
    (lowerQuery.includes("high protein") && (lowerQuery.includes("breakfast") || lowerQuery.includes("recipe") || lowerQuery.includes("diet")))
  ) {
    const isSaladOrLunch =
      lowerQuery.includes("salad") ||
      lowerQuery.includes("quinoa") ||
      lowerQuery.includes("mediterranean") ||
      lowerQuery.includes("lunch");

    if (isSaladOrLunch) {
      const quinoa = getProductById(17);
      const oliveOil = getProductById(9);
      const almonds = getProductById(13);
      const chia = getProductById(15);

      const ingredients: RecipeIngredient[] = [
        quinoa && {
          product: quinoa,
          requiredQty: 1,
          unit: "500g Pack",
          purpose: "Complete plant-based protein with all 9 essential amino acids",
        },
        oliveOil && {
          product: oliveOil,
          requiredQty: 1,
          unit: "500ml Bottle",
          purpose: "Cold-pressed heart-healthy monounsaturated fats & dressing",
        },
        almonds && {
          product: almonds,
          requiredQty: 1,
          unit: "250g Pack",
          purpose: "Toasted crunch with vitamin E and healthy micronutrients",
        },
        chia && {
          product: chia,
          requiredQty: 1,
          unit: "200g Pack",
          purpose: "Omega-3 superfood nutrient booster",
        },
      ].filter(Boolean) as RecipeIngredient[];

      const rawSubtotal = ingredients.reduce((sum, item) => sum + item.product.price * item.requiredQty, 0);
      const discount = 10;
      const discountedPrice = Math.round(rawSubtotal * (1 - discount / 100));

      return {
        type: "recipe_bundle",
        recipeName: "Mediterranean Superfood Quinoa & Nut Salad",
        dishType: "High-Energy Organic Lunch",
        servings: 2,
        prepTime: "15 mins",
        caloriesPerServing: 385,
        nutrition: {
          protein: "16g",
          carbs: "48g",
          fats: "14g",
          fiber: "8g",
        },
        dietaryTags: ["100% Certified Organic", "Gluten-Free", "Plant Power", "Heart Healthy"],
        instructions: [
          "Rinse 1 cup of Organic Quinoa in cold water and simmer in 2 cups of boiling water for 15 minutes until light and fluffy.",
          "Let quinoa cool to room temperature, then toss gently with 2 tablespoons of Organic Extra Virgin Olive Oil.",
          "Chop Organic Almonds coarsely and toast lightly on a dry pan for 2 minutes for enhanced aroma.",
          "Fold in the toasted almonds and a tablespoon of Organic Chia Seeds with fresh herbs and lemon juice.",
          "Serve fresh for sustained afternoon cognitive clarity and zero afternoon slump!",
        ],
        ingredients,
        totalBundlePrice: discountedPrice,
        originalBundlePrice: rawSubtotal,
        bundleDiscountPercent: discount,
        text: "Here is your chef-curated Mediterranean Quinoa superfood recipe! All ingredients are verified in stock from our organic farm suppliers. You can customize your pantry checklist and bundle everything to your cart in 1 click:",
        trace: {
          query: rawQuery,
          parsed_intent: "Identify meal prep recipe intent and construct organic pantry bundle grounded in SQLite",
          filters: { category: "food-health", dietary: "organic, gluten-free", recipe_type: "mediterranean_salad" },
          sql_query: "SELECT * FROM products WHERE id IN (17, 9, 13, 15) AND stock > 0",
          results_count: ingredients.length,
          steps: [
            { title: "Culinary Parsing", detail: "Parsed lunch salad recipe with macro portioning", status: "complete" },
            { title: "SQLite Stock Verification", detail: `Verified stock for ${ingredients.length} organic pantry ingredients`, status: "complete" },
            { title: "Nutritional Computation", detail: "Computed 385 kcal, 16g protein, and 8g fiber per serving", status: "complete" },
            { title: "Bundle Discount", detail: "Applied 10% pantry bundle discount with deterministic product IDs", status: "complete" },
          ],
        },
      };
    } else {
      // Default: Power Protein Superfood Oats Breakfast Bowl
      const oats = getProductById(604) || getProductById(18);
      const honey = getProductById(601) || getProductById(1);
      const almonds = getProductById(13);
      const chia = getProductById(15);

      const ingredients: RecipeIngredient[] = [
        oats && {
          product: oats,
          requiredQty: 1,
          unit: "1kg Pouch (Yields 20+ bowls)",
          purpose: "Slow-release complex carbohydrates & beta-glucan heart fiber",
        },
        honey && {
          product: honey,
          requiredQty: 1,
          unit: "500g Glass Jar",
          purpose: "Raw enzymatic sweetener with natural immunity antioxidants",
        },
        almonds && {
          product: almonds,
          requiredQty: 1,
          unit: "250g Pack",
          purpose: "Crunchy plant protein, vitamin E, and essential healthy fats",
        },
        chia && {
          product: chia,
          requiredQty: 1,
          unit: "200g Pack",
          purpose: "Superfood omega-3 fatty acids and soluble dietary fiber",
        },
      ].filter(Boolean) as RecipeIngredient[];

      const rawSubtotal = ingredients.reduce((sum, item) => sum + item.product.price * item.requiredQty, 0);
      const discount = 12;
      const discountedPrice = Math.round(rawSubtotal * (1 - discount / 100));

      return {
        type: "recipe_bundle",
        recipeName: "Power Protein Superfood Oats Breakfast Bowl",
        dishType: "High-Protein Superfood Breakfast",
        servings: 2,
        prepTime: "10 mins",
        caloriesPerServing: 420,
        nutrition: {
          protein: "22g",
          carbs: "54g",
          fats: "12g",
          fiber: "9g",
        },
        dietaryTags: ["100% Certified Organic", "High-Fiber", "Heart Healthy", "Gluten-Free Option"],
        instructions: [
          "Simmer 1 cup of whole grain rolled oats with 2 cups of water or warm almond milk for 5-7 minutes until creamy.",
          "Fold in 1 tablespoon of organic chia seeds and let rest for 2 minutes to lock in omega-3 fatty acids.",
          "Ladle into 2 serving bowls and drizzle 1 generous tablespoon of cold-extracted raw forest honey across each bowl.",
          "Top with a handful of crushed raw organic almonds and fresh banana or strawberry slices.",
          "Serve warm for clean, sustained morning energy and zero mid-day blood sugar crashes!",
        ],
        ingredients,
        totalBundlePrice: discountedPrice,
        originalBundlePrice: rawSubtotal,
        bundleDiscountPercent: discount,
        text: "Here is your chef-curated high-protein breakfast recipe! All ingredients are 100% verified in stock in our organic pantry. Check what you need, uncheck what you already have at home, and bundle everything into your cart in 1 click:",
        trace: {
          query: rawQuery,
          parsed_intent: "Identify breakfast recipe intent and construct organic pantry bundle grounded in SQLite",
          filters: { category: "food-health", dietary: "organic, high-protein", recipe_type: "oats_bowl" },
          sql_query: "SELECT * FROM products WHERE id IN (604, 601, 13, 15) AND stock > 0",
          results_count: ingredients.length,
          steps: [
            { title: "Culinary Parsing", detail: "Parsed high-protein breakfast recipe with macro portioning", status: "complete" },
            { title: "SQLite Stock Verification", detail: `Verified stock for ${ingredients.length} organic pantry ingredients`, status: "complete" },
            { title: "Nutritional Computation", detail: "Computed 420 kcal, 22g protein, and 9g fiber per serving", status: "complete" },
            { title: "Bundle Discount", detail: "Applied 12% pantry bundle discount with deterministic product IDs", status: "complete" },
          ],
        },
      };
    }
  }

  // 6. Comparison Intent
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
  const dollarMatch =
    lowerQuery.match(/(?:under|below|less than|within|budget)\s*\$\s*(\d+[\d,]*)/i) ||
    lowerQuery.match(/(?:under|below|less than|within|budget)\s*(\d+[\d,]*)\s*(?:dollars?|usd)/i);
  if (dollarMatch) {
    // Formulate price according to Indian market: 1 USD = 83 INR
    maxPrice = Number(dollarMatch[1].replace(/,/g, "")) * 83;
  } else {
    const priceMatch = lowerQuery.match(/(?:under|below|less than|within|budget)\s*(?:rs\.?|inr|₹)?\s*(\d+[\d,]*)/i);
    if (priceMatch) {
      maxPrice = Number(priceMatch[1].replace(/,/g, ""));
    }
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
  if (/\b(mobile|mobiles|phone|phones|smartphone|smartphones|5g|iphone|motorola|samsung|oneplus|realme|poco)\b/i.test(lowerQuery)) {
    detectedCategory = "mobiles";
  } else if (/\b(laptop|laptops|electronic|electronics|tv|tvs|television|televisions|headphone|headphones|earphone|earphones|neckband|neckbands|tablet|tablets|ipad|ipads|smartwatch|smartwatches)\b/i.test(lowerQuery)) {
    detectedCategory = "electronics";
  } else if (/\b(appliance|appliances|fridge|fridges|refrigerator|refrigerators|ac|air conditioner|air conditioners|air fryer|air fryers|induction|cooktop)\b/i.test(lowerQuery)) {
    detectedCategory = "appliances";
  } else if (/\b(serum|serums|skincare|cleanser|cleansers|facewash|lipstick|lipsticks|makeup|beauty)\b/i.test(lowerQuery)) {
    detectedCategory = "beauty";
  } else if (/\b(honey|ghee|oil|oils|olive|oat|oats|almond|almonds|nut|nuts|atta|dal|wheat|flour|whey|protein|grocery|food|foods)\b/i.test(lowerQuery)) {
    detectedCategory = "food-health";
  } else if (/\b(fashion|jeans|jean|denim|shoes|shoe|sneaker|sneakers|shirt|shirts|t-shirt|polo|clothing)\b/i.test(lowerQuery)) {
    detectedCategory = "fashion";
  } else if (/\b(flask|flasks|bottle|bottles|milton|mattress|bedding|comforter|blanket|furniture|home)\b/i.test(lowerQuery)) {
    detectedCategory = "home";
  } else if (/\b(toy|toys|lego|diaper|diapers|pampers|baby)\b/i.test(lowerQuery)) {
    detectedCategory = "toys-baby";
  } else if (/\b(helmet|helmets|dash cam|dashcam|auto|car)\b/i.test(lowerQuery)) {
    detectedCategory = "auto-accessories";
  } else if (/\b(badminton|racquet|racquets|yoga|mat|fitness|sport|sports)\b/i.test(lowerQuery)) {
    detectedCategory = "sports-fitness";
  }

  // Clean Search Term
  let searchTerm = rawQuery
    .replace(/(?:find|show|search|give|get|i want|looking for|best|top|cheap|cheaper|deals on|items|products|please|me|some|any|can you|what are|available|recommend|suggest|do you have|tell me about)\s+/gi, "")
    .replace(/(?:under|below|less than|within|budget)\s*(?:rs\.?|inr|₹|\$)?\s*\d+[\d,]*(?:\s*(?:dollars?|usd))?/gi, "")
    .replace(/(?:top rated|best rated|4\.8\+|4\.5\+|5 star|organic)/gi, "")
    .trim();

  // Multilingual keyword translation
  if (lowerQuery.includes("মধু") || lowerQuery.includes("शहद")) searchTerm = "honey";
  if (lowerQuery.includes("ঘি") || lowerQuery.includes("घी")) searchTerm = "ghee";
  if (lowerQuery.includes("চাল") || lowerQuery.includes("चावल") || lowerQuery.includes("আটা") || lowerQuery.includes("आटा")) searchTerm = "atta";
  if (lowerQuery.includes("ফোন") || lowerQuery.includes("फोन")) searchTerm = "phone";
  if (lowerQuery.includes("ল্যাপটপ") || lowerQuery.includes("लैपटॉप")) searchTerm = "laptop";
  if (lowerQuery.includes("জুতো") || lowerQuery.includes("जूते")) searchTerm = "shoes";

  // If query is just the generic category name itself (e.g. "phones", "laptops", "shoes"), search by category filter instead of strict word match
  const isGenericCategoryWord = /^(phones?|mobiles?|smartphones?|laptops?|electronics?|tvs?|televisions?|appliances?|grocer(y|ies)|foods?|fashion|clothes|shoes?|sneakers?|beauty|makeup|toys?|cars?|sports?)$/i.test(searchTerm);
  const effectiveQuery = isGenericCategoryWord ? undefined : (searchTerm.length > 1 ? searchTerm : undefined);

  // Execute Dynamic Search against SQLite Catalog
  const { products, sql } = searchProducts({
    query: effectiveQuery,
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
