import {
  searchProducts,
  getProductById,
  getProductReviews,
  getOrders,
  addToCartDb,
  calculatePromoDiscount,
} from "../db";
import { AssistantMessage, ChatMessage, Product, AgentTrace } from "../types";
import fs from "fs";
import path from "path";

const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function getApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();
}

// ---------------------------------------------------------------------------
// Tool Definitions for Gemini Function Calling
// ---------------------------------------------------------------------------
const TOOLS_DECLARATION = [
  {
    name: "search_catalog",
    description:
      "Search the organic e-commerce grocery catalog in SQLite database with optional filters. Returns matching products grounded in store inventory.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description: "Search keyword for product name or description, e.g. 'raw honey', 'oats', 'olive oil', 'tea', 'almonds'",
        },
        category: {
          type: "STRING",
          description: "Category filter: 'fruits-vegetables', 'staples', 'spices-masalas', 'oils-ghee', 'dry-fruits-nuts', 'dairy-eggs', 'meat-fish', 'beverages', 'snacks-packaged-foods', 'bakery-breads'",
        },
        subCategory: {
          type: "STRING",
          description: "Subcategory filter, e.g. 'fresh-fruits', 'fresh-vegetables', 'leafy-greens-herbs', 'rice-rice-products', 'atta-flours-sooji', 'pulses-lentils', 'millets-oats', 'whole-spices', 'ground-spices', 'cooking-oils', 'ghee', 'nuts', 'seeds', 'milk-curd-beverages', 'eggs', 'chicken', 'fish-seafood', 'tea-coffee', 'breads-buns', etc.",
        },
        maxPrice: {
          type: "NUMBER",
          description: "Maximum budget or price in USD",
        },
        isOrganic: {
          type: "BOOLEAN",
          description: "Filter strictly for 100% certified organic products",
        },
        minRating: {
          type: "NUMBER",
          description: "Minimum average customer star rating (e.g., 4.0 or 4.5)",
        },
        limit: {
          type: "INTEGER",
          description: "Maximum number of items to return (default 8)",
        },
      },
    },
  },

  {
    name: "get_product_details",
    description: "Get detailed product specifications, stock status, and customer reviews for a specific product by ID.",
    parameters: {
      type: "OBJECT",
      properties: {
        productId: {
          type: "INTEGER",
          description: "The unique numeric ID of the product",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "get_user_orders",
    description: "Retrieve all past orders placed by the user, including order IDs, line items, totals, dates, and live delivery statuses ('delivered' or 'transit').",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "add_to_cart",
    description: "Directly add a product item and quantity to the user's active shopping cart session.",
    parameters: {
      type: "OBJECT",
      properties: {
        productId: {
          type: "INTEGER",
          description: "The product ID to add to cart",
        },
        quantity: {
          type: "INTEGER",
          description: "Quantity of items to add (default is 1)",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "calculate_discount",
    description: "Validate a promotional discount coupon code (e.g. 'SAVE10', 'ORGANIC20', 'WELCOME5') against a cart subtotal and calculate the discounted total.",
    parameters: {
      type: "OBJECT",
      properties: {
        promoCode: {
          type: "STRING",
          description: "The discount coupon code",
        },
        cartSubtotal: {
          type: "NUMBER",
          description: "Subtotal dollar amount of items in the cart",
        },
      },
      required: ["promoCode", "cartSubtotal"],
    },
  },
];

const SYSTEM_INSTRUCTION = `You are CartWise, an intelligent, friendly, multilingual, and transparent AI shopping assistant for an organic grocery e-commerce store.
Your goal is to help users discover products, check nutrition & allergen attributes, track orders, manage their cart, and calculate discount promos.

MULTILINGUAL & VOICE CAPABILITIES:
- You fluently support English, Hindi (हिन्दी / Hinglish), and Bengali (বাংলা / Banglish).
- If the user speaks or writes in Hindi (e.g., "मुझे शहद चाहिए", "A2 desi ghee dikhao", "mere purane orders"), respond in natural Hindi / Hinglish.
- If the user speaks or writes in Bengali (e.g., "আমায় মধু দেখাও", "valo cha pata ache?", "mach ar murgi er dam koto?"), respond in natural Bengali / Banglish.
- If the user speaks or writes in English, respond in English.
- Regardless of user language, ALWAYS translate search terms to relevant English keywords when calling database tools (e.g. 'শহদ' / 'মধু' -> 'honey', 'ঘি' -> 'ghee', 'চাল' -> 'rice', 'চা' -> 'tea', 'ডাল' -> 'dal / lentils', 'মাছ' -> 'fish', 'আম' -> 'mango').

CORE RULES:
1. ALWAYS use the provided tools to query store data (products, orders, reviews, discounts). NEVER invent or hallucinate products, prices, or stock numbers that are not returned by the database tools.
2. When the user asks to find, search, compare, recommend, or filter products, call the 'search_catalog' or 'get_product_details' tool.
3. When the user asks about past orders, order status, shipment tracking, or delivery dates, call 'get_user_orders'.
4. When the user wants to add an item to their cart, call 'add_to_cart'.
5. When the user asks about discounts, coupons, or promo codes, call 'calculate_discount'.
6. Keep your spoken explanations conversational, helpful, and concise with clear benefits so they sound natural when read aloud.`;


// ---------------------------------------------------------------------------
// Tool Execution Router
// ---------------------------------------------------------------------------
interface ToolExecutionResult {
  toolName: string;
  args: any;
  result: any;
  traceStep: { title: string; detail: string; status: "complete" | "running" | "failed" };
}

async function executeTool(name: string, args: any, sessionId: string = "default-session"): Promise<ToolExecutionResult> {
  try {
    switch (name) {
      case "search_catalog": {
        const queryRes = searchProducts({
          query: args.query,
          category: args.category,
          subCategory: args.subCategory,
          maxPrice: args.maxPrice !== undefined ? Number(args.maxPrice) : undefined,
          isOrganic: args.isOrganic !== undefined ? Boolean(args.isOrganic) : undefined,
          minRating: args.minRating !== undefined ? Number(args.minRating) : undefined,
          limit: args.limit !== undefined ? Number(args.limit) : 8,
        });


        return {
          toolName: name,
          args,
          result: {
            count: queryRes.products.length,
            products: queryRes.products,
            sql: queryRes.sql,
          },
          traceStep: {
            title: "Catalog Search (SQLite)",
            detail: `Found ${queryRes.products.length} items matching criteria (SQL: ${queryRes.sql.replace(/\s+/g, " ").trim()})`,
            status: "complete",
          },
        };
      }

      case "get_product_details": {
        const productId = Number(args.productId);
        const product = getProductById(productId);
        const reviews = product ? getProductReviews(productId) : [];

        return {
          toolName: name,
          args,
          result: {
            product,
            reviews,
          },
          traceStep: {
            title: "Product Specs & Reviews",
            detail: product ? `Fetched specs & ${reviews.length} reviews for '${product.name}'` : `Product ${productId} not found`,
            status: product ? "complete" : "failed",
          },
        };
      }

      case "get_user_orders": {
        const orders = getOrders();
        return {
          toolName: name,
          args,
          result: {
            orders,
            totalOrders: orders.length,
          },
          traceStep: {
            title: "Order History Lookup",
            detail: `Retrieved ${orders.length} past order records from database`,
            status: "complete",
          },
        };
      }

      case "add_to_cart": {
        const productId = Number(args.productId);
        const quantity = Number(args.quantity) || 1;
        const cartRes = addToCartDb(sessionId, productId, quantity);

        return {
          toolName: name,
          args,
          result: cartRes,
          traceStep: {
            title: "Cart Direct Action",
            detail: cartRes.message,
            status: cartRes.success ? "complete" : "failed",
          },
        };
      }

      case "calculate_discount": {
        const promoCode = String(args.promoCode || "");
        const subtotal = Number(args.cartSubtotal) || 0;
        const discountRes = calculatePromoDiscount(promoCode, subtotal);

        return {
          toolName: name,
          args,
          result: discountRes,
          traceStep: {
            title: "Promo Code Calculation",
            detail: discountRes.message,
            status: discountRes.valid ? "complete" : "failed",
          },
        };
      }

      default:
        return {
          toolName: name,
          args,
          result: { error: `Unknown tool '${name}'` },
          traceStep: {
            title: `Tool Error`,
            detail: `Unknown tool ${name}`,
            status: "failed",
          },
        };
    }
  } catch (err: any) {
    return {
      toolName: name,
      args,
      result: { error: err?.message || "Execution error" },
      traceStep: {
        title: `Error in ${name}`,
        detail: err?.message || "Execution failed",
        status: "failed",
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Real Chat Agent with Multi-Turn Tool Calling
// ---------------------------------------------------------------------------
export async function handleRealChat(messages: ChatMessage[]): Promise<AssistantMessage> {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Fallback if no API key is provided
    const { handleMockChat } = await import("./mock");
    return handleMockChat(messages);
  }

  const latestUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const userText = latestUserMsg?.content || "";

  // Convert ChatMessage history to Gemini contents format
  const contents: any[] = [];
  for (const m of messages.slice(-10)) {
    if (m.role === "user") {
      contents.push({
        role: "user",
        parts: [{ text: m.content }],
      });
    } else if (m.role === "assistant") {
      let assistantText = "";
      if (m.payload.type === "text") assistantText = m.payload.text;
      else if (m.payload.type === "products") assistantText = `${m.payload.text || "Here are matching products:"} ${m.payload.products.map(p => p.name).join(", ")}`;
      else if (m.payload.type === "compare") assistantText = `Compared: ${m.payload.products.map(p => p.name).join(" vs ")}`;
      else if (m.payload.type === "clarify") assistantText = m.payload.question;
      else if (m.payload.type === "empty_state") assistantText = m.payload.reason;

      if (assistantText) {
        contents.push({
          role: "model",
          parts: [{ text: assistantText }],
        });
      }
    }
  }

  const traceSteps: AgentTrace["steps"] = [
    {
      title: "Query Understanding",
      detail: `Parsed user input: "${userText}"`,
      status: "complete",
    },
  ];

  let collectedProducts: Product[] = [];
  let executedSql = "";
  let lastFilter: any = {};

  try {
    // Step 1: Send request to Gemini with tool definitions
    const requestBody = {
      contents,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      tools: [
        {
          functionDeclarations: TOOLS_DECLARATION,
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    };

    const res = await fetch(`${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const candidateContent = candidate?.content;
    const parts = candidateContent?.parts || [];

    // Check if the model made one or more function calls
    const functionCallPart = parts.find((p: any) => p.functionCall);

    if (functionCallPart && functionCallPart.functionCall) {
      const { name, args } = functionCallPart.functionCall;
      const toolExec = await executeTool(name, args || {});
      traceSteps.push(toolExec.traceStep);

      if (name === "search_catalog" && toolExec.result.products) {
        collectedProducts = toolExec.result.products;
        executedSql = toolExec.result.sql || "";
        lastFilter = args || {};
      }

      // Step 2: Send tool response back to Gemini to synthesize final user-facing text
      const secondTurnContents = [
        ...contents,
        candidateContent,
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name,
                response: toolExec.result,
              },
            },
          ],
        },
      ];

      const secondTurnBody = {
        contents: secondTurnContents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      };

      const secondRes = await fetch(`${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(secondTurnBody),
      });

      let finalNarrative = "";
      if (secondRes.ok) {
        const secondData = await secondRes.json();
        const secondParts = secondData.candidates?.[0]?.content?.parts || [];
        const textPart = secondParts.find((p: any) => p.text);
        if (textPart) finalNarrative = textPart.text.trim();
      }

      // Build AgentTrace
      const agentTrace: AgentTrace = {
        query: userText,
        parsed_intent: `Executed tool '${name}' with arguments: ${JSON.stringify(args)}`,
        filters: {
          keyword: lastFilter.query || undefined,
          max_price: lastFilter.maxPrice || undefined,
          is_organic: lastFilter.isOrganic || undefined,
          min_rating: lastFilter.minRating || undefined,
        },
        sql_query: executedSql || undefined,
        results_count: collectedProducts.length,
        steps: traceSteps,
      };

      // Construct appropriate message type
      if (collectedProducts.length > 0) {
        // If user asked to compare multiple products
        if (userText.toLowerCase().includes("compare") && collectedProducts.length >= 2) {
          const compProducts = collectedProducts.slice(0, 3);
          const compPoints: Record<string, string[]> = {
            "Price": compProducts.map((p) => `$${p.price.toFixed(2)}`),
            "Organic Certified": compProducts.map((p) => (p.is_organic ? "100% Organic" : "Standard Natural")),
            "Customer Rating": compProducts.map((p) => `★ ${p.average_rating?.toFixed(1) || "5.0"} (${p.review_count || 0} reviews)`),
            "Availability": compProducts.map((p) => (p.stock > 0 ? `In Stock (${p.stock} units)` : "Out of Stock")),
          };

          return {
            type: "compare",
            products: compProducts,
            comparisonPoints: compPoints,
          };
        }

        return {
          type: "products",
          products: collectedProducts,
          text: finalNarrative || `Found ${collectedProducts.length} matching organic items:`,
          trace: agentTrace,
        };
      }

      if (name === "search_catalog" && collectedProducts.length === 0) {
        return {
          type: "empty_state",
          reason: finalNarrative || `We couldn't find any products matching "${userText}". Try adjusting price, category, or organic filters.`,
          suggestions: ["Organic Raw Honey", "Rolled Oats", "Extra Virgin Olive Oil", "Organic Almonds"],
        };
      }

      // If text response from order/cart/discount tools
      return {
        type: "text",
        text: finalNarrative || JSON.stringify(toolExec.result),
      };
    }

    // If Gemini returned a direct text response without calling tools
    const directText = parts.find((p: any) => p.text)?.text || "";

    // Check if clarification options are suitable
    if (directText.toLowerCase().includes("which") || directText.toLowerCase().includes("prefer") || directText.includes("?")) {
      const lower = userText.toLowerCase();
      if (lower.includes("honey")) {
        return {
          type: "clarify",
          question: directText || "Which type of honey are you looking for?",
          options: ["Organic Raw Honey ($14.99)", "Manuka Honey ($29.99)", "Wildflower Honey ($12.99)", "Under $15 Options"],
        };
      }
      if (lower.includes("oil")) {
        return {
          type: "clarify",
          question: directText || "What cooking or salad oil do you prefer?",
          options: ["Extra Virgin Olive Oil", "Avocado Oil (High Heat)", "Flaxseed Oil (Omega-3)", "Organic Only"],
        };
      }
    }

    return {
      type: "text",
      text: directText || "How can I assist you with your organic grocery shopping today?",
    };
  } catch (error: any) {
    console.error("handleRealChat error, falling back to database search:", error);
    // Graceful fallback to SQLite catalog search
    const fallbackRes = searchProducts({ query: userText });
    if (fallbackRes.products.length > 0) {
      return {
        type: "products",
        products: fallbackRes.products,
        text: `Here are the matching items from our store:`,
        trace: {
          query: userText,
          parsed_intent: "Direct SQLite keyword search",
          sql_query: fallbackRes.sql,
          results_count: fallbackRes.products.length,
          steps: [
            { title: "Direct SQLite Search", detail: fallbackRes.sql, status: "complete" },
          ],
        },
      };
    }

    return {
      type: "empty_state",
      reason: `No items matched your query. Please try exploring popular categories.`,
      suggestions: ["Organic Raw Honey", "Rolled Oats", "Extra Virgin Olive Oil", "Organic Green Tea"],
    };
  }
}

// ---------------------------------------------------------------------------
// Multimodal Vision Agent (Search by Image)
// ---------------------------------------------------------------------------
export async function handleRealImage(imageInput: string | Buffer | File): Promise<AssistantMessage> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const { handleMockImage } = await import("./mock");
    return handleMockImage(imageInput);
  }

  let mimeType = "image/png";
  let base64Data = "";
  let displayImage = "/images/honey.png";

  try {
    // 1. Resolve image input into base64
    if (typeof imageInput === "string") {
      let fileName = imageInput.replace(/^\/images\//, "").replace(/^images\//, "");
      displayImage = `/images/${fileName}`;

      // Check in public/images or test-images/
      const possiblePaths = [
        path.join(process.cwd(), "public", "images", fileName),
        path.join(process.cwd(), "test-images", fileName),
        path.join(process.cwd(), "public", fileName),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const buffer = fs.readFileSync(p);
          base64Data = buffer.toString("base64");
          if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
          else if (fileName.endsWith(".webp")) mimeType = "image/webp";
          break;
        }
      }
    } else if (Buffer.isBuffer(imageInput)) {
      base64Data = imageInput.toString("base64");
    } else if (imageInput && typeof (imageInput as any).arrayBuffer === "function") {
      const ab = await (imageInput as File).arrayBuffer();
      const buffer = Buffer.from(ab);
      base64Data = buffer.toString("base64");
      mimeType = (imageInput as File).type || "image/png";
      displayImage = `/images/${(imageInput as File).name || "uploaded.png"}`;
    }

    if (!base64Data) {
      const { handleMockImage } = await import("./mock");
      return handleMockImage(imageInput);
    }

    // 2. Call Gemini Vision
    const prompt = `You are an expert computer vision system for an organic grocery e-commerce store.
Analyze this image carefully.
Respond strictly in valid JSON format with the following keys:
{
  "is_grocery_product": boolean (true if it's a food, grocery, ingredient, or packaging, false if it's a non-grocery object like animals, vehicles, buildings, electronics, etc.),
  "item_name": string (concise name of the detected item),
  "tags": string[] (3-5 relevant descriptive tags, e.g. ["honey", "raw", "organic", "glass jar", "sweetener"] or ["wildlife", "african elephant", "non-grocery"]),
  "allergens_and_dietary": string[] (e.g. ["gluten-free", "vegan", "raw", "organic", "nut-free"]),
  "category": string (one of: 'honey', 'oil', 'nuts', 'seeds', 'grains', 'tea', 'coffee', 'snacks', 'dairy-alt', or 'none'),
  "search_keyword": string (best 1-2 words to search store database, e.g. 'honey', 'oats', 'olive oil', 'avocado oil', or '' if not a grocery product),
  "description": string (1-2 sentences describing the visual characteristics, packaging, labels, and quality).
}`;

    const visionRequestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    };

    const res = await fetch(`${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visionRequestBody),
    });

    if (!res.ok) {
      console.error("Gemini Vision API error:", res.status, await res.text());
      const { handleMockImage } = await import("./mock");
      return handleMockImage(imageInput);
    }

    const data = await res.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(rawJson);

    // 3. Match against SQLite inventory
    let matchedProducts: Product[] = [];

    if (parsed.is_grocery_product) {
      const queryTerm = parsed.search_keyword || parsed.item_name || "";
      const categoryTerm = parsed.category !== "none" ? parsed.category : undefined;

      const dbRes = searchProducts({
        query: queryTerm,
        category: categoryTerm,
        limit: 4,
      });
      matchedProducts = dbRes.products;

      // If no exact match with query, try broader search with category or tags
      if (matchedProducts.length === 0 && Array.isArray(parsed.tags)) {
        for (const tag of parsed.tags) {
          const tagSearch = searchProducts({ query: tag, limit: 4 });
          if (tagSearch.products.length > 0) {
            matchedProducts = tagSearch.products;
            break;
          }
        }
      }
    }

    const tags = Array.isArray(parsed.tags) ? parsed.tags : ["grocery", "natural"];
    if (Array.isArray(parsed.allergens_and_dietary)) {
      for (const diet of parsed.allergens_and_dietary) {
        if (!tags.includes(diet)) tags.push(diet);
      }
    }

    return {
      type: "image_analysis",
      tags: tags.slice(0, 5),
      description: parsed.description || `Visual analysis identified: ${parsed.item_name || "Uploaded Item"}.`,
      matchedProducts: matchedProducts.length > 0 ? matchedProducts : undefined,
      uploadedImage: displayImage,
    };
  } catch (error) {
    console.error("handleRealImage error, falling back to mock vision:", error);
    const { handleMockImage } = await import("./mock");
    return handleMockImage(imageInput);
  }
}
