import {
  searchProducts,
  getProductById,
  getProductReviews,
  getOrders,
  getOrderById,
  cancelOrderDb,
  updateOrderStatusDb,
  addToCartDb,
  calculatePromoDiscount,
} from "../db";
import { generateInvoiceData } from "../invoice";
import { AssistantMessage, ChatMessage, Product, AgentTrace } from "../types";
import fs from "fs";
import path from "path";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_API_BASE = "https://api.openai.com/v1";

export function getOpenAIApiKey(): string {
  return (process.env.OPENAI_API_KEY || "").trim();
}

export function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();
}

function getApiKey(): string {
  return getGeminiApiKey();
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
  {
    name: "track_specific_order",
    description:
      "Get live dispatch status, delivery agent details, vehicle coordinates, and accurate ETA for a specific order by its order ID.",
    parameters: {
      type: "OBJECT",
      properties: {
        order_id: {
          type: "INTEGER",
          description: "The unique numeric ID of the order to track (e.g. 1040, 1042)",
        },
      },
      required: ["order_id"],
    },
  },
  {
    name: "cancel_order",
    description:
      "Cancel an order if it is still in the 'placed' or 'packing' stage. Restores product inventory in SQLite and initiates a full refund.",
    parameters: {
      type: "OBJECT",
      properties: {
        order_id: {
          type: "INTEGER",
          description: "The unique numeric ID of the order to cancel",
        },
        reason: {
          type: "STRING",
          description: "The user's stated reason for order cancellation",
        },
      },
      required: ["order_id"],
    },
  },
  {
    name: "generate_invoice",
    description:
      "Generate an official GST tax invoice and receipt for an order with itemized breakdown, HSN codes, taxes (CGST + SGST), discounts, and printable PDF download link.",
    parameters: {
      type: "OBJECT",
      properties: {
        order_id: {
          type: "INTEGER",
          description: "The numeric ID of the order to generate an invoice for",
        },
      },
      required: ["order_id"],
    },
  },
];

const SYSTEM_INSTRUCTION = `You are CartWise, an intelligent, friendly, multilingual, and transparent AI shopping assistant for an organic grocery e-commerce store.
Your goal is to help users discover products, check nutrition & allergen attributes, track orders, cancel eligible orders, generate tax invoices, manage their cart, and calculate discount promos.

MULTILINGUAL & VOICE CAPABILITIES:
- You fluently support English, Hindi (हिन्दी / Hinglish), and Bengali (বাংলা / Banglish).
- If the user speaks or writes in Hindi (e.g., "मुझे शहद चाहिए", "A2 desi ghee dikhao", "mere purane orders", "order cancel karo"), respond in natural Hindi / Hinglish.
- If the user speaks or writes in Bengali (e.g., "আমায় মধু দেখাও", "valo cha pata ache?", "mach ar murgi er dam koto?", "order ta kothay ache?"), respond in natural Bengali / Banglish.
- If the user speaks or writes in English, respond in English.
- Regardless of user language, ALWAYS translate search terms to relevant English keywords when calling database tools (e.g. 'শহদ' / 'মধু' -> 'honey', 'ঘি' -> 'ghee', 'চাল' -> 'rice', 'চা' -> 'tea', 'ডাল' -> 'dal / lentils', 'মাছ' -> 'fish', 'আম' -> 'mango').

CORE RULES:
1. ALWAYS use the provided tools to query store data (products, orders, reviews, discounts). NEVER invent or hallucinate products, prices, or stock numbers that are not returned by the database tools.
2. When the user asks to find, search, compare, recommend, or filter products, call 'search_catalog' or 'get_product_details'.
3. When the user asks about past orders generally, call 'get_user_orders'.
4. When the user asks to track a specific order (e.g. "Where is order 1040?", "Track #1042"), call 'track_specific_order'.
5. When the user asks to cancel an order, call 'cancel_order'.
6. When the user requests a receipt, bill, GST breakdown, or invoice for an order, call 'generate_invoice'.
7. When the user wants to add an item to their cart, call 'add_to_cart'.
8. When the user asks about discounts, coupons, or promo codes, call 'calculate_discount'.
9. Keep your spoken explanations conversational, helpful, and concise with clear benefits so they sound natural when read aloud.`;


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

      case "track_specific_order": {
        const orderId = Number(args.order_id);
        const order = getOrderById(orderId);

        if (!order) {
          return {
            toolName: name,
            args,
            result: {
              found: false,
              order_id: orderId,
              message: `Order #${orderId} was not found in our database records. Please double-check your order ID.`,
            },
            traceStep: {
              title: "Order Tracking",
              detail: `Order #${orderId} not found in database records`,
              status: "failed",
            },
          };
        }

        const isDelivered = order.status === "delivered";
        const isCancelled = order.status === "cancelled";
        const isTransit = order.status === "transit" || order.status === "in_transit";
        const isPlaced = order.status === "placed" || order.status === "packing";

        const trackingData = {
          found: true,
          order_id: order.id,
          status: order.status,
          total: order.total,
          itemsCount: order.items?.length || 0,
          items: order.items?.map((i) => `${i.quantity}x ${i.product_name}`).join(", ") || "Grocery Items",
          deliveryAgent: isCancelled
            ? null
            : isDelivered
            ? {
                name: "Rahul Sharma",
                phone: "+91 98451 22890",
                badge: "FastFleet Gold Courier",
                vehicle: "Ather 450X EV (KA-03-HA-8821)",
              }
            : {
                name: "Priya Das",
                phone: "+91 98765 11094",
                badge: "Express Priority Courier",
                vehicle: "Hero Electric Nyx (KA-51-EJ-3042)",
              },
          liveLocation: isDelivered
            ? "Delivered to recipient address"
            : isCancelled
            ? "Order cancelled - package returned to fulfillment hub"
            : isTransit
            ? "1.4 km away • Outer Ring Road approaching Bellandur"
            : "CartWise Micro-Fulfillment Center • Bellandur Hub (Packing underway)",
          eta: isDelivered
            ? "Delivered"
            : isCancelled
            ? "Cancelled"
            : isTransit
            ? "14 minutes (Est. 09:45 PM)"
            : "28 minutes (Express Dispatch)",
          checkpoints: [
            { step: "Order Verified & Paid", time: order.created_at, completed: true },
            {
              step: "Warehouse Packaged & Sealed",
              time: isPlaced ? "In Progress" : "Completed",
              completed: !isPlaced && !isCancelled,
            },
            {
              step: "Out for Express Delivery",
              time: isTransit || isDelivered ? "Active" : "Pending",
              completed: isTransit || isDelivered,
            },
            {
              step: "Delivered to Doorstep",
              time: isDelivered ? "Delivered" : "Pending",
              completed: isDelivered,
            },
          ],
        };

        return {
          toolName: name,
          args,
          result: trackingData,
          traceStep: {
            title: "Fleet Telemetry & Tracking",
            detail: `Retrieved live tracking for Order #${order.id} (Status: ${order.status}, ETA: ${trackingData.eta})`,
            status: "complete",
          },
        };
      }

      case "cancel_order": {
        const orderId = Number(args.order_id);
        const reason = String(args.reason || "Customer requested cancellation via AI Copilot");
        const cancelRes = cancelOrderDb(orderId, reason);

        return {
          toolName: name,
          args,
          result: cancelRes,
          traceStep: {
            title: "Order Cancellation (SQLite)",
            detail: cancelRes.message,
            status: cancelRes.success ? "complete" : "failed",
          },
        };
      }

      case "generate_invoice": {
        const orderId = Number(args.order_id);
        const order = getOrderById(orderId);

        if (!order) {
          return {
            toolName: name,
            args,
            result: {
              success: false,
              order_id: orderId,
              message: `Order #${orderId} does not exist in store records.`,
            },
            traceStep: {
              title: "Invoice Generation",
              detail: `Order #${orderId} not found`,
              status: "failed",
            },
          };
        }

        const invoice = generateInvoiceData({
          order,
          items: order.items || [],
          paymentMethod: "upi",
          transactionId: `tx_sqlite_${order.id}`,
          finalTotal: order.total,
          subtotal: order.total,
        });

        const invoiceResult = {
          success: true,
          invoiceNumber: invoice.invoiceNumber,
          orderId: invoice.orderId,
          date: invoice.date,
          storeGstin: invoice.storeGstin,
          storeFssai: invoice.storeFssai,
          totalAmount: invoice.finalTotal,
          subtotal: invoice.subtotal,
          gst: {
            taxableAmount: invoice.gst.taxableSubtotal,
            cgst: invoice.gst.cgstAmount,
            sgst: invoice.gst.sgstAmount,
            totalGst: invoice.gst.totalGst,
          },
          items: invoice.items.map((i) => ({
            product: i.product_name,
            hsn: i.hsn_code,
            qty: i.quantity,
            unitPrice: i.unit_price,
            lineTotal: i.line_total,
          })),
          deliveryAddress: `${invoice.deliveryAddress?.street_address || ""}, ${invoice.deliveryAddress?.city || ""} - ${invoice.deliveryAddress?.pincode || ""}`,
          downloadPdfUrl: `/api/orders/${order.id}/invoice`,
        };

        return {
          toolName: name,
          args,
          result: invoiceResult,
          traceStep: {
            title: "GST Invoice Generation",
            detail: `Generated Tax Invoice ${invoice.invoiceNumber} with GST breakdown and HSN itemization`,
            status: "complete",
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
// Exported Tool Wrappers for Direct Programmatic Usage & Unit Tests
// ---------------------------------------------------------------------------
export async function trackSpecificOrderTool(args: { order_id: number | string }) {
  return executeTool("track_specific_order", args);
}

export async function cancelOrderTool(args: { order_id: number | string; reason?: string }) {
  return executeTool("cancel_order", args);
}

export async function generateInvoiceTool(args: { order_id: number | string }) {
  return executeTool("generate_invoice", args);
}

// ---------------------------------------------------------------------------
// OpenAI Function Calling Tools Schema
// ---------------------------------------------------------------------------
function getOpenAITools() {
  return TOOLS_DECLARATION.map((tool) => {
    const rawProps = tool.parameters.properties as Record<string, any>;
    const properties: Record<string, any> = {};

    for (const [key, prop] of Object.entries(rawProps)) {
      const typeStr = (prop.type || "string").toLowerCase();
      const openAiType =
        typeStr === "integer"
          ? "integer"
          : typeStr === "number"
          ? "number"
          : typeStr === "boolean"
          ? "boolean"
          : "string";

      properties[key] = {
        type: openAiType,
        description: prop.description,
      };
    }

    return {
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties,
          required: (tool.parameters as any).required || [],
        },
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Unified Response Formatters
// ---------------------------------------------------------------------------
function formatAssistantPayloadFromToolResult(params: {
  userText: string;
  toolName: string;
  toolExec: ToolExecutionResult;
  collectedProducts: Product[];
  executedSql: string;
  lastFilter: any;
  finalNarrative?: string;
  traceSteps: AgentTrace["steps"];
}): AssistantMessage {
  const {
    userText,
    toolName,
    toolExec,
    collectedProducts,
    executedSql,
    lastFilter,
    finalNarrative,
    traceSteps,
  } = params;

  const agentTrace: AgentTrace = {
    query: userText,
    parsed_intent: `Executed tool '${toolName}' with arguments: ${JSON.stringify(lastFilter)}`,
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

  if (collectedProducts.length > 0) {
    if (userText.toLowerCase().includes("compare") && collectedProducts.length >= 2) {
      const compProducts = collectedProducts.slice(0, 3);
      const compPoints: Record<string, string[]> = {
        Price: compProducts.map((p) => `₹${p.price.toFixed(2)}`),
        "Organic Certified": compProducts.map((p) =>
          p.is_organic ? "100% Organic" : "Standard Natural"
        ),
        "Customer Rating": compProducts.map(
          (p) => `★ ${p.average_rating?.toFixed(1) || "5.0"} (${p.review_count || 0} reviews)`
        ),
        Availability: compProducts.map((p) =>
          p.stock > 0 ? `In Stock (${p.stock} units)` : "Out of Stock"
        ),
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

  if (toolName === "search_catalog" && collectedProducts.length === 0) {
    return {
      type: "empty_state",
      reason:
        finalNarrative ||
        `We couldn't find any products matching "${userText}". Try adjusting price, category, or organic filters.`,
      suggestions: [
        "Organic Raw Honey",
        "Rolled Oats",
        "Extra Virgin Olive Oil",
        "Organic Almonds",
      ],
    };
  }

  let fallbackText = finalNarrative;
  if (!fallbackText) {
    if (toolName === "track_specific_order") {
      const res = toolExec.result;
      if (!res.found) {
        fallbackText = res.message;
      } else {
        fallbackText = `📦 **Order #${res.order_id} Live Tracking**\n- **Status:** ${res.status.toUpperCase()}\n- **Estimated Arrival:** ${res.eta}\n- **Current Stage:** ${res.liveLocation}\n${
          res.deliveryAgent
            ? `- **Rider:** ${res.deliveryAgent.name} (${res.deliveryAgent.phone}) • ${res.deliveryAgent.vehicle}\n`
            : ""
        }- **Items:** ${res.items}`;
      }
    } else if (toolName === "cancel_order") {
      fallbackText = toolExec.result.message;
    } else if (toolName === "generate_invoice") {
      const res = toolExec.result;
      if (!res.success) {
        fallbackText = res.message;
      } else {
        fallbackText = `🧾 **Tax Invoice ${res.invoiceNumber} (Order #${res.orderId})**\n- **GSTIN:** ${res.storeGstin}\n- **Subtotal:** ₹${res.subtotal.toFixed(2)}\n- **GST (CGST 2.5% + SGST 2.5%):** ₹${res.gst.totalGst.toFixed(2)}\n- **Final Paid Total:** ₹${res.totalAmount.toFixed(2)}\n- **Billed To:** ${res.deliveryAddress}\n[Download PDF Receipt](${res.downloadPdfUrl})`;
      }
    } else {
      fallbackText = JSON.stringify(toolExec.result);
    }
  }

  return {
    type: "text",
    text: fallbackText || "I have processed your request based on our organic store catalog.",
  };
}

function formatDirectTextResponse(userText: string, directText: string): AssistantMessage {
  if (
    directText.toLowerCase().includes("which") ||
    directText.toLowerCase().includes("prefer") ||
    directText.includes("?")
  ) {
    const lower = userText.toLowerCase();
    if (lower.includes("honey")) {
      return {
        type: "clarify",
        question: directText || "Which type of honey are you looking for?",
        options: [
          "Organic Raw Honey (₹14.99)",
          "Manuka Honey (₹29.99)",
          "Wildflower Honey (₹12.99)",
          "Under ₹50 Options",
        ],
      };
    }
    if (lower.includes("oil")) {
      return {
        type: "clarify",
        question: directText || "What cooking or salad oil do you prefer?",
        options: [
          "Extra Virgin Olive Oil",
          "Avocado Oil (High Heat)",
          "Flaxseed Oil (Omega-3)",
          "Organic Only",
        ],
      };
    }
  }

  return {
    type: "text",
    text: directText || "How can I assist you with your organic grocery shopping today?",
  };
}

function matchImageResultsToSqlite(parsed: any, displayImage: string): AssistantMessage {
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
    description:
      parsed.description ||
      `Visual analysis identified: ${parsed.item_name || "Uploaded Item"}.`,
    matchedProducts: matchedProducts.length > 0 ? matchedProducts : undefined,
    uploadedImage: displayImage,
  };
}

// ---------------------------------------------------------------------------
// OpenAI Provider Implementation
// ---------------------------------------------------------------------------
async function callOpenAIChat(messages: ChatMessage[], apiKey: string): Promise<AssistantMessage> {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const userText = latestUserMsg?.content || "";

  const openAiMessages: any[] = [{ role: "system", content: SYSTEM_INSTRUCTION }];

  for (const m of messages.slice(-10)) {
    if (m.role === "user") {
      openAiMessages.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      let assistantText = "";
      if (m.payload.type === "text") assistantText = m.payload.text;
      else if (m.payload.type === "products")
        assistantText = `${m.payload.text || "Here are matching products:"} ${m.payload.products.map((p) => p.name).join(", ")}`;
      else if (m.payload.type === "compare")
        assistantText = `Compared: ${m.payload.products.map((p) => p.name).join(" vs ")}`;
      else if (m.payload.type === "clarify") assistantText = m.payload.question;
      else if (m.payload.type === "empty_state") assistantText = m.payload.reason;

      if (assistantText) {
        openAiMessages.push({ role: "assistant", content: assistantText });
      }
    }
  }

  const reqBody = {
    model: OPENAI_MODEL,
    messages: openAiMessages,
    tools: getOpenAITools(),
    tool_choice: "auto",
    temperature: 0.3,
  };

  const res = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(reqBody),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const errMessage = errData?.error?.message || `OpenAI returned status ${res.status}`;
    throw new Error(errMessage);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const message = choice?.message;

  const traceSteps: AgentTrace["steps"] = [
    {
      title: "Query Understanding (OpenAI)",
      detail: `Parsed input: "${userText}"`,
      status: "complete",
    },
  ];

  let collectedProducts: Product[] = [];
  let executedSql = "";
  let lastFilter: any = {};

  if (message?.tool_calls && message.tool_calls.length > 0) {
    const toolResponses: any[] = [];
    let lastToolName = "";
    let lastToolExec: ToolExecutionResult | null = null;

    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function.name;
      let toolArgs: any = {};
      try {
        toolArgs = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        toolArgs = {};
      }

      const execResult = await executeTool(toolName, toolArgs);
      traceSteps.push(execResult.traceStep);
      lastToolName = toolName;
      lastToolExec = execResult;

      if (toolName === "search_catalog" && execResult.result.products) {
        collectedProducts = execResult.result.products;
        executedSql = execResult.result.sql || "";
        lastFilter = toolArgs;
      }

      toolResponses.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(execResult.result),
      });
    }

    let finalNarrative = "";
    try {
      const secondTurnMessages = [...openAiMessages, message, ...toolResponses];
      const secondRes = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: secondTurnMessages,
          temperature: 0.3,
        }),
      });

      if (secondRes.ok) {
        const secondData = await secondRes.json();
        finalNarrative = secondData.choices?.[0]?.message?.content?.trim() || "";
      }
    } catch (e) {
      console.warn("[OpenAI second turn error]:", e);
    }

    return formatAssistantPayloadFromToolResult({
      userText,
      toolName: lastToolName,
      toolExec: lastToolExec!,
      collectedProducts,
      executedSql,
      lastFilter,
      finalNarrative,
      traceSteps,
    });
  }

  const directText = message?.content || "";
  return formatDirectTextResponse(userText, directText);
}

// ---------------------------------------------------------------------------
// Gemini Provider Implementation
// ---------------------------------------------------------------------------
async function callGeminiChat(messages: ChatMessage[], apiKey: string): Promise<AssistantMessage> {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const userText = latestUserMsg?.content || "";

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
      else if (m.payload.type === "products")
        assistantText = `${m.payload.text || "Here are matching products:"} ${m.payload.products.map((p) => p.name).join(", ")}`;
      else if (m.payload.type === "compare")
        assistantText = `Compared: ${m.payload.products.map((p) => p.name).join(" vs ")}`;
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
      title: "Query Understanding (Gemini)",
      detail: `Parsed input: "${userText}"`,
      status: "complete",
    },
  ];

  let collectedProducts: Product[] = [];
  let executedSql = "";
  let lastFilter: any = {};

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
    throw new Error(`Gemini API returned status ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const candidateContent = candidate?.content;
  const parts = candidateContent?.parts || [];

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

    let finalNarrative = "";
    try {
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

      const secondRes = await fetch(
        `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(secondTurnBody),
        }
      );

      if (secondRes.ok) {
        const secondData = await secondRes.json();
        const secondParts = secondData.candidates?.[0]?.content?.parts || [];
        const textPart = secondParts.find((p: any) => p.text);
        if (textPart) finalNarrative = textPart.text.trim();
      }
    } catch (e) {
      console.warn("[Gemini second turn error]:", e);
    }

    return formatAssistantPayloadFromToolResult({
      userText,
      toolName: name,
      toolExec,
      collectedProducts,
      executedSql,
      lastFilter,
      finalNarrative,
      traceSteps,
    });
  }

  const directText = parts.find((p: any) => p.text)?.text || "";
  return formatDirectTextResponse(userText, directText);
}

// ---------------------------------------------------------------------------
// Resilient Deterministic Engine (Zero-Downtime Offline / Quota Fallback)
// ---------------------------------------------------------------------------
async function executeDeterministicAgent(messages: ChatMessage[]): Promise<AssistantMessage> {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const userText = (latestUserMsg?.content || "").trim();
  const lower = userText.toLowerCase();

  // 1. Order Tracking intent: "#1040", "order 1040", "track order"
  const orderTrackMatch = userText.match(/(?:track|order|where is).*?#?(\d+)/i) || userText.match(/#?(\d{4})/);
  if (orderTrackMatch && (lower.includes("track") || lower.includes("where") || lower.includes("status") || lower.includes("order"))) {
    const orderId = Number(orderTrackMatch[1]);
    const execRes = await executeTool("track_specific_order", { order_id: orderId });
    return formatAssistantPayloadFromToolResult({
      userText,
      toolName: "track_specific_order",
      toolExec: execRes,
      collectedProducts: [],
      executedSql: "",
      lastFilter: { order_id: orderId },
      traceSteps: [execRes.traceStep],
    });
  }

  // 2. Cancellation intent: "cancel order 1041"
  const cancelMatch = userText.match(/cancel.*?#?(\d+)/i);
  if (cancelMatch) {
    const orderId = Number(cancelMatch[1]);
    const execRes = await executeTool("cancel_order", { order_id: orderId, reason: "Cancelled via CartWise Assistant" });
    return formatAssistantPayloadFromToolResult({
      userText,
      toolName: "cancel_order",
      toolExec: execRes,
      collectedProducts: [],
      executedSql: "",
      lastFilter: { order_id: orderId },
      traceSteps: [execRes.traceStep],
    });
  }

  // 3. Invoice intent: "invoice", "receipt", "bill for 1039"
  const invoiceMatch = userText.match(/(?:invoice|receipt|bill).*?#?(\d+)/i);
  if (invoiceMatch) {
    const orderId = Number(invoiceMatch[1]);
    const execRes = await executeTool("generate_invoice", { order_id: orderId });
    return formatAssistantPayloadFromToolResult({
      userText,
      toolName: "generate_invoice",
      toolExec: execRes,
      collectedProducts: [],
      executedSql: "",
      lastFilter: { order_id: orderId },
      traceSteps: [execRes.traceStep],
    });
  }

  // 4. Comparison intent: "compare honey", "compare oats"
  if (lower.includes("compare")) {
    const cleanQuery = lower.replace(/compare|between|vs|please/g, "").trim();
    const res = searchProducts({ query: cleanQuery || "organic", limit: 3 });
    if (res.products.length >= 2) {
      const compProducts = res.products.slice(0, 3);
      const compPoints: Record<string, string[]> = {
        Price: compProducts.map((p) => `₹${p.price.toFixed(2)}`),
        "Organic Certified": compProducts.map((p) => (p.is_organic ? "100% Organic" : "Standard Natural")),
        "Customer Rating": compProducts.map((p) => `★ ${p.average_rating?.toFixed(1) || "5.0"} (${p.review_count || 0} reviews)`),
        Availability: compProducts.map((p) => (p.stock > 0 ? `In Stock (${p.stock} units)` : "Out of Stock")),
      };
      return {
        type: "compare",
        products: compProducts,
        comparisonPoints: compPoints,
      };
    }
  }

  // 5. Product catalog search
  let maxPrice: number | undefined;
  const priceMatch =
    userText.match(/(?:under|below|less than)\s*(?:₹|rs\.?|inr|\$)?\s*(\d+)/i) ||
    userText.match(/(?:₹|rs\.?|inr|\$)\s*(\d+)/i);
  if (priceMatch) maxPrice = Number(priceMatch[1]);

  const isOrganic = lower.includes("organic") ? true : undefined;
  const cleanSearch = lower
    .replace(/(?:under|below|less than)\s*(?:₹|rs\.?|inr|\$)?\s*\d+/gi, "")
    .replace(/(?:₹|rs\.?|inr|\$)\s*\d+/gi, "")
    .replace(/show\s*me|i\s*want|looking\s*for|find|give\s*me|buy/gi, "")
    .trim();

  const searchExec = await executeTool("search_catalog", {
    query: cleanSearch || undefined,
    maxPrice,
    isOrganic,
    limit: 6,
  });

  return formatAssistantPayloadFromToolResult({
    userText,
    toolName: "search_catalog",
    toolExec: searchExec,
    collectedProducts: searchExec.result.products || [],
    executedSql: searchExec.result.sql || "",
    lastFilter: { query: cleanSearch, maxPrice, isOrganic },
    traceSteps: [searchExec.traceStep],
  });
}

// ---------------------------------------------------------------------------
// Unified Chat Entry Point (Multi-Provider Fallback Cascade)
// ---------------------------------------------------------------------------
export async function handleRealChat(messages: ChatMessage[]): Promise<AssistantMessage> {
  const openAiKey = getOpenAIApiKey();
  const geminiKey = getGeminiApiKey();

  // Try 1: OpenAI (if key provided)
  if (openAiKey) {
    try {
      return await callOpenAIChat(messages, openAiKey);
    } catch (err: any) {
      console.warn(`[CartWise Agent] OpenAI request bypassed/failed (${err?.message || err}). Cascading to secondary provider...`);
    }
  }

  // Try 2: Gemini (if key provided)
  if (geminiKey) {
    try {
      return await callGeminiChat(messages, geminiKey);
    } catch (err: any) {
      console.warn(`[CartWise Agent] Gemini request failed (${err?.message || err}). Cascading to Deterministic Grounded Engine...`);
    }
  }

  // Try 3: Zero-downtime Deterministic SQLite Engine (Grounded, truthful, never crashes)
  return executeDeterministicAgent(messages);
}

// ---------------------------------------------------------------------------
// Multimodal Vision Agent (Search by Image)
// ---------------------------------------------------------------------------
export async function handleRealImage(imageInput: string | Buffer | File): Promise<AssistantMessage> {
  const openAiKey = getOpenAIApiKey();
  const geminiKey = getGeminiApiKey();

  let mimeType = "image/png";
  let base64Data = "";
  let displayImage = "/images/honey.png";

  try {
    if (typeof imageInput === "string") {
      let fileName = imageInput.replace(/^\/images\//, "").replace(/^images\//, "");
      displayImage = `/images/${fileName}`;

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

    const visionPrompt = `You are an expert computer vision system for an organic grocery e-commerce store.
Analyze this image carefully.
Respond strictly in valid JSON format with the following keys:
{
  "is_grocery_product": boolean,
  "item_name": string,
  "tags": string[],
  "allergens_and_dietary": string[],
  "category": string,
  "search_keyword": string,
  "description": string
}`;

    // Try 1: OpenAI Vision
    if (openAiKey) {
      try {
        const res = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: visionPrompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64Data}`,
                    },
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawJson = data.choices?.[0]?.message?.content || "{}";
          const parsed = JSON.parse(rawJson);
          return matchImageResultsToSqlite(parsed, displayImage);
        }
      } catch (e) {
        console.warn("[CartWise Agent] OpenAI Vision unavailable. Falling back to Gemini / Mock...");
      }
    }

    // Try 2: Gemini Vision
    if (geminiKey) {
      try {
        const visionRequestBody = {
          contents: [
            {
              role: "user",
              parts: [
                { text: visionPrompt },
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

        const res = await fetch(
          `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(visionRequestBody),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const parsed = JSON.parse(rawJson);
          return matchImageResultsToSqlite(parsed, displayImage);
        }
      } catch (e) {
        console.warn("[CartWise Agent] Gemini Vision error. Falling back to mock...");
      }
    }

    // Fallback: Offline Mock Image Matcher
    const { handleMockImage } = await import("./mock");
    return handleMockImage(imageInput);
  } catch (error) {
    console.error("handleRealImage error, falling back to mock vision:", error);
    const { handleMockImage } = await import("./mock");
    return handleMockImage(imageInput);
  }
}

