import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { Product, Order, Review, OrderItem } from "./types";

let dbInstance: Database.Database | null = null;

export const CATEGORIES_DATA = [
  {
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    sub_categories: [
      { name: "Fresh Fruits", slug: "fresh-fruits" },
      { name: "Fresh Vegetables", slug: "fresh-vegetables" },
      { name: "Leafy Greens & Herbs", slug: "leafy-greens-herbs" }
    ]
  },
  {
    name: "Staples",
    slug: "staples",
    sub_categories: [
      { name: "Rice & Rice Products", slug: "rice-rice-products" },
      { name: "Atta, Flours & Sooji", slug: "atta-flours-sooji" },
      { name: "Pulses & Lentils", slug: "pulses-lentils" },
      { name: "Millets & Oats", slug: "millets-oats" },
      { name: "Salt, Sugar & Jaggery", slug: "salt-sugar-jaggery" }
    ]
  },
  {
    name: "Spices & Masalas",
    slug: "spices-masalas",
    sub_categories: [
      { name: "Whole Spices", slug: "whole-spices" },
      { name: "Ground Spices", slug: "ground-spices" },
      { name: "Masala Blends", slug: "masala-blends" }
    ]
  },
  {
    name: "Oils & Ghee",
    slug: "oils-ghee",
    sub_categories: [
      { name: "Cooking Oils", slug: "cooking-oils" },
      { name: "Ghee", slug: "ghee" }
    ]
  },
  {
    name: "Dry Fruits & Nuts",
    slug: "dry-fruits-nuts",
    sub_categories: [
      { name: "Nuts", slug: "nuts" },
      { name: "Dried Fruits", slug: "dried-fruits" },
      { name: "Seeds", slug: "seeds" }
    ]
  },
  {
    name: "Dairy & Eggs",
    slug: "dairy-eggs",
    sub_categories: [
      { name: "Milk, Curd & Beverages", slug: "milk-curd-beverages" },
      { name: "Paneer, Butter & Cheese", slug: "paneer-butter-cheese" },
      { name: "Eggs", slug: "eggs" }
    ]
  },
  {
    name: "Meat & Fish",
    slug: "meat-fish",
    sub_categories: [
      { name: "Chicken", slug: "chicken" },
      { name: "Mutton", slug: "mutton" },
      { name: "Fish & Seafood", slug: "fish-seafood" }
    ]
  },
  {
    name: "Beverages",
    slug: "beverages",
    sub_categories: [
      { name: "Tea & Coffee", slug: "tea-coffee" },
      { name: "Juices & Water", slug: "juices-water" }
    ]
  },
  {
    name: "Snacks & Packaged Foods",
    slug: "snacks-packaged-foods",
    sub_categories: [
      { name: "Biscuits & Snacks", slug: "biscuits-snacks" },
      { name: "Noodles, Pasta & Cereals", slug: "noodles-pasta-cereals" },
      { name: "Spreads, Sauces & Pickles", slug: "spreads-sauces-pickles" }
    ]
  },
  {
    name: "Bakery & Breads",
    slug: "bakery-breads",
    sub_categories: [
      { name: "Breads & Buns", slug: "breads-buns" }
    ]
  }
];

function getProductImageUrl(name: string, category: string, subCategory?: string): string {
  const lower = (name + " " + category + " " + (subCategory || "")).toLowerCase();
  if (lower.includes("avocado")) return "/images/avocado_oil.png";
  if (lower.includes("oil") || lower.includes("ghee")) return "/images/olive_oil.png";
  if (lower.includes("oat") || lower.includes("grain") || lower.includes("rice") || lower.includes("flour") || lower.includes("bread") || lower.includes("cereal") || lower.includes("pasta") || lower.includes("dal") || lower.includes("lentil") || lower.includes("seed") || lower.includes("nut") || lower.includes("snack") || lower.includes("cookie")) return "/images/oats.png";
  if (lower.includes("wildflower")) return "/images/wildflower_honey.png";
  if (lower.includes("orange")) return "/images/orange_blossom_honey.png";
  if (lower.includes("honey") || lower.includes("sweetener") || lower.includes("sugar") || lower.includes("jaggery") || lower.includes("syrup") || lower.includes("spread")) return "/images/honey.png";
  if (lower.includes("fruit") || lower.includes("vegetable") || lower.includes("mango") || lower.includes("apple") || lower.includes("spinach") || lower.includes("tomato") || lower.includes("onion")) return "/images/honey.png";
  return "/images/honey.png";
}

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const primaryPath = path.join(process.cwd(), "data", "store.db");
  const dataDir = path.dirname(primaryPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbInstance = new Database(primaryPath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("foreign_keys = ON");
  return dbInstance;
}

export interface SearchProductsOptions {
  query?: string;
  category?: string;
  subCategory?: string;
  maxPrice?: number;
  isOrganic?: boolean;
  minRating?: number;
  limit?: number;
}

export function searchProducts(options: SearchProductsOptions = {}): {
  products: Product[];
  sql: string;
} {
  const db = getDb();
  let sql = `
    SELECT p.id, p.name, p.category, p.sub_category, p.price, p.description, p.is_organic, p.stock,
           rs.average_rating,
           rs.review_count
    FROM products p
    LEFT JOIN ratings_summary rs ON p.id = rs.product_id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (options.query) {
    sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR p.sub_category LIKE ?)`;
    const like = `%${options.query}%`;
    params.push(like, like, like, like);
  }

  if (options.category) {
    sql += ` AND (p.category = ? OR p.category LIKE ?)`;
    params.push(options.category, `%${options.category}%`);
  }

  if (options.subCategory) {
    sql += ` AND (p.sub_category = ? OR p.sub_category LIKE ?)`;
    params.push(options.subCategory, `%${options.subCategory}%`);
  }

  if (options.maxPrice !== undefined) {
    sql += ` AND p.price <= ?`;
    params.push(options.maxPrice);
  }

  if (options.isOrganic !== undefined) {
    sql += ` AND p.is_organic = ?`;
    params.push(options.isOrganic ? 1 : 0);
  }

  if (options.minRating !== undefined) {
    sql += ` AND rs.average_rating >= ?`;
    params.push(options.minRating);
  }

  sql += ` ORDER BY p.id ASC`;

  if (options.limit !== undefined) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as Array<{
    id: number;
    name: string;
    category: string;
    sub_category: string | null;
    price: number;
    description: string;
    is_organic: number;
    stock: number;
    average_rating: number | null;
    review_count: number | null;
  }>;

  const products: Product[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    sub_category: r.sub_category || undefined,
    price: r.price,
    description: r.description,
    is_organic: Boolean(r.is_organic),
    stock: r.stock,
    average_rating: r.average_rating ? Number(r.average_rating) : 0,
    review_count: r.review_count || 0,
    image_url: getProductImageUrl(r.name, r.category, r.sub_category || undefined),
  }));

  return { products, sql };
}

export function getProductById(id: number): Product | null {
  const db = getDb();
  const sql = `
    SELECT p.id, p.name, p.category, p.sub_category, p.price, p.description, p.is_organic, p.stock,
           rs.average_rating,
           rs.review_count
    FROM products p
    LEFT JOIN ratings_summary rs ON p.id = rs.product_id
    WHERE p.id = ?
  `;
  const row = db.prepare(sql).get(id) as {
    id: number;
    name: string;
    category: string;
    sub_category: string | null;
    price: number;
    description: string;
    is_organic: number;
    stock: number;
    average_rating: number | null;
    review_count: number | null;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    sub_category: row.sub_category || undefined,
    price: row.price,
    description: row.description,
    is_organic: Boolean(row.is_organic),
    stock: row.stock,
    average_rating: row.average_rating ? Number(row.average_rating) : 0,
    review_count: row.review_count || 0,
    image_url: getProductImageUrl(row.name, row.category, row.sub_category || undefined),
  };
}

export function createOrder(productId: number): { order: Order; success: boolean } {
  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} does not exist in store.`);
  }

  const db = getDb();
  let orderRow: Order | null = null;

  db.transaction(() => {
    const stmt = db.prepare(
      "INSERT INTO orders (total, status) VALUES (?, ?)"
    );
    const info = stmt.run(product.price, 'delivered');
    
    const itemStmt = db.prepare(
      "INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)"
    );
    itemStmt.run(info.lastInsertRowid, product.id, product.name, product.price, 1);

    const orderStmt = db.prepare("SELECT * FROM orders WHERE id = ?");
    orderRow = orderStmt.get(info.lastInsertRowid) as Order;
    
    if (orderRow) {
      const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
      orderRow.items = itemsStmt.all(orderRow.id) as OrderItem[];
    }
  })();

  return { order: orderRow!, success: true };
}

export function getOrders(): Order[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM orders ORDER BY id DESC");
  const orders = stmt.all() as Order[];

  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  for (const order of orders) {
    order.items = itemsStmt.all(order.id) as OrderItem[];
  }

  return orders;
}

export function getProductReviews(productId: number): Review[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY rating DESC");
  return stmt.all(productId) as Review[];
}

export function addToCartDb(
  sessionId: string,
  productId: number,
  quantity: number = 1
): { success: boolean; message: string; cartCount: number; product?: Product } {
  const db = getDb();
  const product = getProductById(productId);
  if (!product) {
    return { success: false, message: `Product ID ${productId} not found in catalog.`, cartCount: 0 };
  }
  if (product.stock < quantity) {
    return { success: false, message: `Item '${product.name}' is out of stock or only has ${product.stock} units left.`, cartCount: 0, product };
  }

  const existingStmt = db.prepare("SELECT quantity FROM cart_items WHERE session_id = ? AND product_id = ?");
  const existing = existingStmt.get(sessionId, productId) as { quantity: number } | undefined;
  const newTotalQuantity = (existing?.quantity || 0) + quantity;

  if (newTotalQuantity > product.stock) {
    return {
      success: false,
      message: `Cannot add ${quantity} more. Total in cart would exceed available stock (${product.stock}).`,
      cartCount: existing?.quantity || 0,
      product
    };
  }

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?")
      .run(newTotalQuantity, sessionId, productId);
  } else {
    db.prepare("INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)")
      .run(sessionId, productId, quantity);
  }

  const countStmt = db.prepare("SELECT SUM(quantity) as count FROM cart_items WHERE session_id = ?");
  const countRow = countStmt.get(sessionId) as { count: number | null };

  return {
    success: true,
    message: `Added ${quantity}x '${product.name}' ($${product.price}) to cart.`,
    cartCount: countRow?.count || newTotalQuantity,
    product
  };
}

export function calculatePromoDiscount(
  promoCode: string,
  cartSubtotal: number
): {
  code: string;
  valid: boolean;
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
  message: string;
} {
  const codeClean = (promoCode || "").trim().toUpperCase();
  let discountPercentage = 0;
  let fixedDiscount = 0;

  if (codeClean === "SAVE10" || codeClean === "ORGANIC10") {
    discountPercentage = 10;
  } else if (codeClean === "SAVE20" || codeClean === "ORGANIC20") {
    discountPercentage = 20;
  } else if (codeClean === "WELCOME5" || codeClean === "FIRST5") {
    fixedDiscount = 5.00;
  } else {
    return {
      code: promoCode,
      valid: false,
      discountPercentage: 0,
      discountAmount: 0,
      finalTotal: cartSubtotal,
      message: `Promo code '${promoCode}' is invalid or expired. Try SAVE10 (10% off) or ORGANIC20 (20% off).`,
    };
  }

  let discountAmount = 0;
  if (discountPercentage > 0) {
    discountAmount = Math.round((cartSubtotal * (discountPercentage / 100)) * 100) / 100;
  } else if (fixedDiscount > 0) {
    discountAmount = Math.min(fixedDiscount, cartSubtotal);
  }

  const finalTotal = Math.max(0, Math.round((cartSubtotal - discountAmount) * 100) / 100);

  return {
    code: codeClean,
    valid: true,
    discountPercentage,
    discountAmount,
    finalTotal,
    message: `Promo code '${codeClean}' applied! You saved $${discountAmount.toFixed(2)}. New total: $${finalTotal.toFixed(2)}.`,
  };
}
