import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "store.db");

// Ensure the data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open the database
const db = new Database(dbPath);

console.log("Setting up database at", dbPath);

// Enable foreign keys and WAL mode
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// Drop existing tables to support fresh schema migrations
db.exec(`
  DROP VIEW IF EXISTS ratings_summary;
  DROP TABLE IF EXISTS cart_items;
  DROP TABLE IF EXISTS order_items;
  DROP TABLE IF EXISTS orders;
  DROP TABLE IF EXISTS reviews;
  DROP TABLE IF EXISTS products;
`);

// Setup Tables with category & sub_category support
db.exec(`
  CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT,
      price REAL NOT NULL,
      original_price REAL,
      description TEXT,
      is_organic INTEGER DEFAULT 0,
      image_url TEXT,
      stock INTEGER NOT NULL DEFAULT 20
  );

  CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      rating REAL,
      reviewer_name TEXT,
      review_text TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'delivered',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      payment_id TEXT,
      payment_method TEXT,
      delivery_address_json TEXT,
      delivery_slot TEXT,
      tracking_status TEXT DEFAULT 'placed',
      estimated_delivery_time TEXT,
      cancellation_reason TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(session_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS user_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street_address TEXT NOT NULL,
      landmark TEXT,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      type TEXT CHECK(type IN ('Home', 'Work', 'Other')) DEFAULT 'Home',
      is_default INTEGER DEFAULT 0,
      created_at DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default addresses
const insertAddr = db.prepare(`
  INSERT INTO user_addresses (user_id, name, phone, street_address, landmark, city, pincode, type, is_default, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertAddr.run(1, "Rahul Sharma", "+91 98765 43210", "Flat 4B, Greenwood Park, Action Area 2", "Near City Center 2", "Kolkata", "700156", "Home", 1, "2026-03-01 10:00:00");
insertAddr.run(1, "Rahul Sharma (Work)", "+91 98765 43210", "EcoSpace IT Park, Block 3A, Sector V", "Opposite Tata Medical Center", "Kolkata", "700160", "Work", 0, "2026-03-02 14:30:00");

// Setup Views
db.exec(`
  DROP VIEW IF EXISTS ratings_summary;
  CREATE VIEW ratings_summary AS
  SELECT 
      product_id,
      ROUND(AVG(rating), 2) as average_rating,
      COUNT(id) as review_count
  FROM reviews
  GROUP BY product_id;
`);

// Clear tables for re-seeding
db.exec(`
  DELETE FROM cart_items;
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM reviews;
  DELETE FROM products;
`);

// Comprehensive Real-World Cartwise Plus Catalog across Categories
// [id, name, category, sub_category, price, original_price, description, is_organic, image_url, stock]
const products: Array<[number, string, string, string, number, number, string, number, string, number]> = [
  // ==========================================
  // 1. MOBILES (mobiles)
  // ==========================================
  [101, "Motorola edge 70 Fusion (12GB RAM, 256GB)", "mobiles", "smartphones", 29999, 34999, "144Hz 3D Curved pOLED Display, Sony LYTIA 700C Camera with OIS, IP68 Underwater Protection", 0, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", 40],
  [102, "Apple iPhone 15 (Blue, 128GB)", "mobiles", "smartphones", 63999, 79900, "Dynamic Island, 48MP Main Camera, 2x Telephoto, All-Day Battery Life, USB-C Charging", 0, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", 25],
  [103, "OnePlus 12R 5G (Cool Blue, 16GB, 256GB)", "mobiles", "smartphones", 39999, 45999, "Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz ProXDR Display, 5500 mAh Battery, 100W SUPERVOOC", 0, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80", 30],
  [104, "Samsung Galaxy S24 5G (Onyx Black, 256GB)", "mobiles", "smartphones", 74999, 89999, "Galaxy AI, 50MP Dual Telephoto, Dynamic AMOLED 2X Display with Armor Aluminum 2.0", 0, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80", 18],
  [105, "Realme K14 Plus 5G (Submarine Blue, 128GB)", "mobiles", "smartphones", 25999, 29999, "Periscope Portrait Camera, Luxury Watch Design, 120Hz Curved Vision OLED Display", 0, "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80", 50],
  [106, "POCO X6 Pro 5G (Racing Yellow, 512GB)", "mobiles", "smartphones", 26999, 31999, "Dimensity 8300 Ultra processor, 1.5K 120Hz AMOLED, 64MP OIS Triple Camera", 0, "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80", 35],

  // ==========================================
  // 2. ELECTRONICS & LAPTOPS (electronics)
  // ==========================================
  [201, "ASUS Vivobook 15 OLED Laptop (Intel Core i5 13th Gen, 16GB, 512GB SSD)", "electronics", "laptops", 59990, 74990, "15.6-inch FHD OLED 600nits HDR display, Thin & Light 1.7kg, Windows 11 + MS Office 2024", 0, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80", 15],
  [202, "TCL 43-inch 4K Ultra HD Smart QLED Google TV (43C645)", "electronics", "televisions", 25999, 39990, "QLED 4K with Dolby Vision & Atmos, 120Hz DLG Game Master, Hands-Free Voice Control", 0, "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80", 20],
  [203, "OnePlus Bullets Wireless Z2 Bluetooth Neckband (Acoustic Red)", "electronics", "audio", 1499, 2299, "12.4mm Bass Drivers, 30 Hours Playtime, Fast 10-Min Charge = 20 Hours Battery, IP55 Sweatproof", 0, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", 100],
  [204, "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones", "electronics", "audio", 28990, 34990, "Industry Leading ANC with 8 Mics, Auto NC Optimizer, Hi-Res Audio LDAC, 30h Battery", 0, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80", 12],
  [205, "Apple iPad Air M2 (11-inch, Wi-Fi, 128GB, Space Grey)", "electronics", "tablets", 57900, 59900, "Apple M2 chip, Liquid Retina display with P3 wide color, 12MP Center Stage Front Camera", 0, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80", 22],
  [206, "Noise ColorFit Pulse 4 Smart Watch with Bluetooth Calling", "electronics", "wearables", 1799, 4999, "1.85-inch Advanced AMOLED display, 7-day battery, 100+ Sports Modes, Health Tracking", 0, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", 80],

  // ==========================================
  // 3. APPLIANCES (appliances)
  // ==========================================
  [301, "LG 190L 4-Star Smart Inverter Direct Cool Single Door Refrigerator", "appliances", "refrigerators", 16990, 22499, "Smart Inverter Compressor, Fastest in Ice Making, Toughened Glass Shelves, Works without Stabilizer", 0, "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80", 15],
  [302, "Voltas 1.5 Ton 5-Star Adjustable Inverter Split AC (185V Vectra Elite)", "appliances", "air-conditioners", 34990, 67990, "4-in-1 Adjustable Cooling Modes, 100% Copper Condenser, Anti-dust Filter, Stabilizer Free", 0, "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80", 10],
  [303, "Philips Digital Air Fryer HD9252/90 (4.1 Liter, 1400W)", "appliances", "kitchen-appliances", 7499, 11995, "Rapid Air Technology for 90% Less Fat, Touch Screen with 7 Pre-set Menus, Dishwasher Safe", 0, "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80", 25],
  [304, "Prestige Induction Cooktop PIC 20 (1600 Watt with Indian Menu Options)", "appliances", "kitchen-appliances", 2399, 3645, "Push Button Controls, Automatic Voltage Regulator, Anti-Magnetic Wall, Feather Touch Control", 0, "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80", 40],

  // ==========================================
  // 4. FASHION (fashion)
  // ==========================================
  [401, "Levi's Men 511 Slim Fit Stretchable Denim Jeans (Dark Indigo)", "fashion", "mens-clothing", 2499, 3999, "Classic 5-pocket styling, Cotton-elastane blend for flexibility and premium everyday durability", 0, "https://images.unsplash.com/photo-1542272604-780c96856478?auto=format&fit=crop&w=600&q=80", 50],
  [402, "Puma Flyer Runner Running & Training Shoes for Men (Black-White)", "fashion", "footwear", 2199, 3499, "SoftFoam+ comfort sockliner for instant step-in cushioning, breathable mesh upper", 0, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", 60],
  [403, "Titan Neo Analog Dial Quartz Watch for Men (Stainless Steel Strap)", "fashion", "watches", 4295, 5995, "Midnight blue sunray dial, Mineral glass, 50m water resistance, 2-year manufacturer warranty", 0, "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80", 30],
  [404, "U.S. Polo Assn. Solid Slim Fit Pure Cotton Polo T-Shirt", "fashion", "mens-clothing", 999, 1799, "100% Pique Cotton, Signature brand embroidery, Ribbed collar and sleeve hems", 0, "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80", 75],

  // ==========================================
  // 5. BEAUTY & HEALTH (beauty)
  // ==========================================
  [501, "Minimalist 10% Niacinamide Face Serum with Zinc (30ml)", "beauty", "skincare", 599, 649, "Clinically tested for blemish marks reduction, sebum control, and pore refining", 1, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80", 65],
  [502, "Cetaphil Gentle Skin Cleanser for Sensitive & Dry Skin (250ml)", "beauty", "skincare", 499, 575, "Dermatologist recommended, Soap-free, Fragrance-free hydrating cleanser with Niacinamide", 0, "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80", 80],
  [503, "Maybelline SuperStay Matte Ink Liquid Lipstick (Pioneer 20)", "beauty", "makeup", 549, 699, "Up to 16 Hours intense matte color payoff, smudge-proof, transfer-resistant precision applicator", 0, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80", 90],

  // ==========================================
  // 6. FOOD & HEALTH / GROCERY (food-health)
  // ==========================================
  [601, "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)", "food-health", "grocery-staples", 349, 499, "Unheated, unfiltered wild forest honey directly extracted from certified natural reserves", 1, "/images/honey.png", 55],
  [602, "Cold-Pressed Extra Virgin Olive Oil (1 Liter Glass Bottle)", "food-health", "oils-ghee", 999, 1450, "First cold-pressed Spanish olives, rich in healthy monounsaturated fats & Vitamin E", 1, "/images/avocado_oil.png", 40],
  [603, "Optimum Nutrition (ON) Gold Standard 100% Whey Protein (Double Rich Chocolate 1kg)", "food-health", "nutrition-supplements", 3299, 3999, "24g Whey protein per scoop, 5.5g BCAAs, Primary source Whey Isolate, Instantized for easy mixing", 0, "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80", 35],
  [604, "Whole Grain Rolled Oats (High Fiber, 1kg Pouch)", "food-health", "grocery-staples", 289, 399, "100% whole grain gluten-free oats, rich in beta-glucan fiber for daily heart and gut wellness", 1, "/images/oats.png", 70],
  [605, "California Jumbo Raw Almonds (500g Fresh Pack)", "food-health", "dry-fruits", 499, 699, "Vacuum packed premium crunchy California almonds rich in plant protein and healthy fats", 1, "https://images.unsplash.com/photo-1508061252445-b95013cb7c5b?auto=format&fit=crop&w=600&q=80", 50],
  [606, "Aashirvaad Shudh Chakki Atta (100% Whole Wheat, 10kg)", "food-health", "grocery-staples", 445, 495, "Crafted from golden grains using traditional 4-step chakki process for soft, fluffy rotis", 1, "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80", 120],
  [607, "Tata Sampann Unpolished Toor Dal / Arhar Dal (1kg)", "food-health", "grocery-staples", 189, 230, "Unpolished natural toor dal sourced from certified farms, rich in wholesome protein", 1, "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80", 90],
  [608, "Amul Pure Cow Ghee (1 Liter Tin)", "food-health", "oils-ghee", 620, 675, "Traditional granular texture and authentic aroma, rich source of Vitamin A, D, E & K", 1, "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80", 60],

  // ==========================================
  // 7. HOME & KITCHEN (home)
  // ==========================================
  [701, "Milton Thermosteel Flip Lid 1000ml Vacuum Insulated Flask", "home", "kitchen-dining", 949, 1320, "24 Hours Hot & Cold retention, 100% Food grade 304 Stainless steel with carry bag", 0, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80", 60],
  [702, "Wakefit Orthopedic Memory Foam King Size Mattress (78x72x6 Inch)", "home", "furniture", 13499, 18999, "Next-Gen memory foam with differential pressure zone support, breathable 100% cotton cover", 0, "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80", 15],
  [703, "Solimo Microfiber Reversible Comforter / Blanket (Double Bed, Aqua Blue)", "home", "bedding", 1499, 2500, "200 GSM hollow siliconized polyester filling, lightweight warmth, hypoallergenic", 0, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80", 40],

  // ==========================================
  // 8. TOYS & BABY CARE (toys-baby)
  // ==========================================
  [801, "LEGO Classic Medium Creative Brick Box Building Set (484 Pieces)", "toys-baby", "toys-games", 2499, 3299, "Inspires open-ended creativity with 35 vibrant brick colors, windows, eyes, and tires", 0, "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80", 30],
  [802, "Pampers All Round Protection Pants Diapers (Large, 74 Count)", "toys-baby", "baby-care", 1199, 1499, "Up to 12 hours absorption with magic gel technology and lotion with aloe vera", 0, "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80", 50],

  // ==========================================
  // 9. AUTO ACCESSORIES (auto-accessories)
  // ==========================================
  [901, "Steelbird SB-50 Adonis Full Face Helmet with Visor (Matte Black, L)", "auto-accessories", "helmets-gear", 1499, 2199, "ISI Certified (IS:4151), High impact ABS shell, breathable multi-pore interior padding", 0, "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 40],
  [902, "70mai Smart Dash Cam 1S (1080P Full HD, Night Vision, G-Sensor)", "auto-accessories", "car-electronics", 3999, 5499, "Sony IMX307 sensor, 130-degree wide angle, voice control and emergency auto-recording", 0, "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80", 25],

  // ==========================================
  // 10. SPORTS & FITNESS (sports-fitness)
  // ==========================================
  [1001, "Yonex Muscle Power 29 Light Graphite Badminton Racquet", "sports-fitness", "badminton", 2199, 3490, "High modulus graphite frame, Isometric head shape with Muscle Power shock absorption", 0, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80", 45],
  [1002, "Boldfit Anti-Skid Yoga Mat 6mm with Carrying Strap (Navy Blue)", "sports-fitness", "fitness-accessories", 799, 1499, "Eco-friendly TPE material, double-sided non-slip grip, sweat-resistant & easy to clean", 1, "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80", 60],
];

// Insert Products
const insertProduct = db.prepare(`
  INSERT INTO products (id, name, category, sub_category, price, original_price, description, is_organic, image_url, stock)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of products) {
  insertProduct.run(...p);
}

// Insert Reviews
const reviews: Array<[number, number, string, string]> = [
  [101, 5.0, "Amit Chatterjee", "Motorola edge 70 Fusion has the best curved screen and camera in under ₹30,000! Super fast delivery."],
  [102, 5.0, "Priya Nair", "iPhone 15 is worth every rupee. Brilliant camera and 15-minute quick delivery was unbelievable!"],
  [103, 4.8, "Rohan Verma", "OnePlus 12R battery backup is immense. Charges in 25 mins with 100W SUPERVOOC."],
  [201, 4.9, "Siddharth Roy", "ASUS Vivobook 15 OLED display is stunning for video editing and movies. Best laptop under 60k."],
  [202, 4.8, "Kavita Rao", "TCL 43 inch QLED picture quality and Google TV UI is super smooth. Incredible value."],
  [203, 4.7, "Vikas Gupta", "OnePlus Bullets Z2 has thunderous bass and battery lasts for almost a week on single charge."],
  [301, 4.9, "Ananya Sen", "LG Smart Inverter fridge cools quickly, low power consumption and runs smoothly."],
  [401, 4.8, "Deepak Joshi", "Original Levi's 511 fit is perfect with great stretch and comfort."],
  [501, 4.9, "Sneha Mukherjee", "Minimalist Niacinamide serum cleared my acne marks within 3 weeks. Genuine product."],
  [601, 5.0, "Vikram Malhotra", "Best organic raw honey I have tasted. 100% authentic and unadulterated."],
  [603, 4.9, "Arjun Kapoor", "Optimum Nutrition Gold Standard Whey is 100% authentic with scratch verification code."],
];

const insertReview = db.prepare(`
  INSERT INTO reviews (product_id, rating, reviewer_name, review_text)
  VALUES (?, ?, ?, ?)
`);

for (const r of reviews) {
  insertReview.run(...r);
}

// Seed initial orders
const insertOrder = db.prepare(`
  INSERT INTO orders (id, total, status, created_at, payment_id, payment_method, delivery_address_json, delivery_slot, tracking_status, estimated_delivery_time)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertOrderItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
  VALUES (?, ?, ?, ?, ?)
`);

insertOrder.run(
  1040,
  349.00,
  "out_for_delivery",
  "2026-03-07 11:30:00",
  "pay_upi_gpay_1040",
  "upi",
  JSON.stringify({
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    street_address: "Flat 4B, Greenwood Park, Action Area 2",
    city: "Kolkata",
    pincode: "700156",
    type: "Home",
  }),
  "15-Min Express Delivery",
  "out_for_delivery",
  "12 mins"
);

insertOrderItem.run(1040, 601, "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)", 349.00, 1);

insertOrder.run(
  1039,
  1499.00,
  "delivered",
  "2026-03-05 09:15:00",
  "pay_card_1039",
  "card",
  JSON.stringify({
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    street_address: "Flat 4B, Greenwood Park, Action Area 2",
    city: "Kolkata",
    pincode: "700156",
    type: "Home",
  }),
  "Morning Slot (7 AM - 10 AM)",
  "delivered",
  "Delivered"
);

insertOrderItem.run(1039, 203, "OnePlus Bullets Wireless Z2 Bluetooth Neckband", 1499.00, 1);

console.log(`Database seeded with ${products.length} products across 10 Cartwise Plus categories, ratings, reviews, and test orders.`);
db.close();
