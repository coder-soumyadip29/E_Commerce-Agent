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
  // 0. CORE MENTOR ORGANIC HARVEST (IDs 1 - 32) - Formulated at 1 USD = 83 INR
  // ==========================================
  [1, "Organic Raw Honey", "food-health", "grocery-staples", 1244.17, 1659.17, "Pure organic raw honey, unfiltered and cold-pressed", 1, "/images/honey.png", 20],
  [2, "Wildflower Honey", "food-health", "grocery-staples", 1078.17, 1410.17, "Natural wildflower honey from local beekeepers", 0, "/images/wildflower_honey.png", 20],
  [3, "Organic Manuka Honey", "food-health", "grocery-staples", 2489.17, 3319.17, "Premium organic Manuka honey from New Zealand", 1, "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80", 20],
  [4, "Clover Honey", "food-health", "grocery-staples", 746.17, 995.17, "Classic clover honey, smooth and sweet", 0, "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80", 20],
  [5, "Organic Buckwheat Honey", "food-health", "grocery-staples", 1576.17, 2074.17, "Dark and robust organic buckwheat honey, antioxidant-rich", 1, "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80", 20],
  [6, "Orange Blossom Honey", "food-health", "grocery-staples", 1327.17, 1659.17, "Light and floral orange blossom honey", 0, "/images/orange_blossom_honey.png", 0],
  [7, "Organic Acacia Honey", "food-health", "grocery-staples", 1493.17, 1908.17, "Light and mild organic acacia honey, low glycemic index", 1, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", 20],
  [8, "Creamed Honey", "food-health", "grocery-staples", 995.17, 1244.17, "Smooth creamed honey with spreadable texture", 0, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80", 20],
  [9, "Organic Extra Virgin Olive Oil", "food-health", "oils-ghee", 1410.17, 1825.17, "Cold-pressed organic EVOO from Mediterranean olives", 1, "/images/olive_oil.png", 20],
  [10, "Coconut Oil", "food-health", "oils-ghee", 1036.67, 1327.17, "Refined coconut oil, great for high-heat cooking", 0, "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80", 20],
  [11, "Organic Flaxseed Oil", "food-health", "oils-ghee", 1244.17, 1576.17, "Cold-pressed organic flaxseed oil, rich in omega-3", 1, "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80", 20],
  [12, "Avocado Oil", "food-health", "oils-ghee", 1576.17, 1991.17, "Cold-pressed avocado oil, high smoke point", 0, "/images/avocado_oil.png", 20],
  [13, "Organic Almonds", "food-health", "dry-fruits", 995.17, 1244.17, "Raw organic almonds, unsalted, non-GMO certified", 1, "https://images.unsplash.com/photo-1508061252445-b95013cb7c5b?auto=format&fit=crop&w=600&q=80", 20],
  [14, "Roasted Cashews", "food-health", "dry-fruits", 829.17, 1078.17, "Lightly salted dry-roasted cashews", 0, "https://images.unsplash.com/photo-1536591375315-19895696d506?auto=format&fit=crop&w=600&q=80", 20],
  [15, "Organic Chia Seeds", "food-health", "grocery-staples", 704.67, 912.17, "Organic black chia seeds, high in fiber and omega-3", 1, "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80", 20],
  [16, "Mixed Nuts", "food-health", "dry-fruits", 1161.17, 1493.17, "Premium mix of walnuts, pecans, almonds and Brazil nuts", 0, "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80", 20],
  [17, "Organic Quinoa", "food-health", "grocery-staples", 912.17, 1161.17, "Organic white quinoa, complete protein, gluten-free", 1, "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80", 20],
  [18, "Rolled Oats", "food-health", "grocery-staples", 455.67, 663.17, "Whole grain rolled oats, great for porridge and baking", 0, "/images/rolled_oats.png", 20],
  [19, "Organic Brown Rice", "food-health", "grocery-staples", 663.17, 829.17, "Long-grain organic brown rice, naturally gluten-free", 1, "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80", 20],
  [20, "Steel-Cut Oats", "food-health", "grocery-staples", 580.17, 746.17, "Traditional steel-cut oats, low GI, hearty texture", 0, "/images/steel_cut_oats.png", 20],
  [21, "Organic Green Tea", "food-health", "grocery-staples", 1078.17, 1327.17, "Japanese organic sencha green tea, 50 bags", 1, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80", 20],
  [22, "Chamomile Tea", "food-health", "grocery-staples", 746.17, 995.17, "Dried chamomile flowers, caffeine-free, soothing", 0, "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80", 20],
  [23, "Organic Ethiopian Coffee", "food-health", "grocery-staples", 1410.17, 1825.17, "Single-origin organic Arabica, medium roast whole bean", 1, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80", 20],
  [24, "Dark Roast Espresso Blend", "food-health", "grocery-staples", 1202.67, 1576.17, "Bold dark roast espresso blend, ground", 0, "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80", 0],
  [25, "Organic Granola", "food-health", "grocery-staples", 829.17, 1078.17, "Organic oat granola with honey, almonds and dried cranberries", 1, "https://images.unsplash.com/photo-1517093707577-4402eb0ea685?auto=format&fit=crop&w=600&q=80", 20],
  [26, "Rice Cakes", "food-health", "grocery-staples", 372.67, 497.17, "Lightly salted brown rice cakes, low calorie", 0, "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80", 20],
  [27, "Organic Dried Mango", "food-health", "dry-fruits", 663.17, 829.17, "Unsweetened organic dried mango slices, no preservatives", 1, "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80", 20],
  [28, "Trail Mix", "food-health", "dry-fruits", 704.67, 912.17, "Classic trail mix with raisins, M&Ms, peanuts and sunflower seeds", 0, "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=600&q=80", 20],
  [29, "Organic Almond Milk", "food-health", "grocery-staples", 414.17, 538.67, "Unsweetened organic almond milk, fortified with calcium", 1, "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80", 20],
  [30, "Oat Milk", "food-health", "grocery-staples", 372.67, 497.17, "Barista-style oat milk, great for coffee", 0, "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80", 20],
  [31, "Organic Coconut Milk", "food-health", "grocery-staples", 331.17, 414.17, "Full-fat organic coconut milk, great for curries", 1, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80", 20],
  [32, "Soy Milk", "food-health", "grocery-staples", 289.67, 372.67, "Unsweetened soy milk, high protein", 0, "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80", 20],

  // ==========================================
  // 1. MOBILES (mobiles)
  // ==========================================
  [101, "Motorola edge 70 Fusion (12GB RAM, 256GB)", "mobiles", "smartphones", 29999, 34999, "144Hz 3D Curved pOLED Display, Sony LYTIA 700C Camera with OIS, IP68 Underwater Protection", 0, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", 40],
  [102, "Apple iPhone 15 (Blue, 128GB)", "mobiles", "smartphones", 63999, 79900, "Dynamic Island, 48MP Main Camera, 2x Telephoto, All-Day Battery Life, USB-C Charging", 0, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", 25],
  [103, "OnePlus 12R 5G (Cool Blue, 16GB, 256GB)", "mobiles", "smartphones", 39999, 45999, "Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz ProXDR Display, 5500 mAh Battery, 100W SUPERVOOC", 0, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80", 30],
  [104, "Samsung Galaxy S24 5G (Onyx Black, 256GB)", "mobiles", "smartphones", 74999, 89999, "Galaxy AI, 50MP Dual Telephoto, Dynamic AMOLED 2X Display with Armor Aluminum 2.0", 0, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80", 18],
  [105, "Realme K14 Plus 5G (Submarine Blue, 128GB)", "mobiles", "smartphones", 25999, 29999, "Periscope Portrait Camera, Luxury Watch Design, 120Hz Curved Vision OLED Display", 0, "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80", 50],
  [106, "POCO X6 Pro 5G (Racing Yellow, 512GB)", "mobiles", "smartphones", 26999, 31999, "Dimensity 8300 Ultra processor, 1.5K 120Hz AMOLED, 64MP OIS Triple Camera", 0, "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80", 35],
  [107, "Google Pixel 8a (Bay Blue, 128GB)", "mobiles", "smartphones", 44999, 52999, "Google Tensor G3, Actua OLED Display, 64MP Camera with Magic Eraser & Best Take", 0, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", 30],
  [108, "Xiaomi 14 Ultra (Titanium Black, 512GB)", "mobiles", "smartphones", 99999, 119999, "Leica Quad Camera with 1-inch sensor, Snapdragon 8 Gen 3, WQHD+ 120Hz AMOLED", 0, "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80", 15],
  [109, "Apple iPad Pro 11-inch M4 (Space Black, 256GB)", "mobiles", "tablets", 99900, 109900, "Ultra Retina XDR Tandem OLED, M4 chip, ProMotion 120Hz, Thunderbolt USB-4", 0, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80", 20],
  [110, "Samsung Galaxy Tab S9 FE (Mint, 128GB Wi-Fi)", "mobiles", "tablets", 34999, 44999, "10.9-inch 90Hz Display, Exynos 1380, S Pen included, IP68 water & dust resistance", 0, "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=600&q=80", 25],
  [111, "Spigen Ultra Hybrid MagFit Case for iPhone 15", "mobiles", "mobile-accessories", 1899, 2499, "Crystal clear TPU bumper with built-in magnetic ring for MagSafe charging compatibility", 0, "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80", 80],
  [112, "Anker 737 Power Bank (PowerCore 24K, 140W Fast Charge)", "mobiles", "mobile-accessories", 9999, 13999, "24,000mAh Ultra-Powerful 3-Port portable charger with smart digital display", 0, "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80", 35],

  // ==========================================
  // 2. ELECTRONICS & LAPTOPS (electronics)
  // ==========================================
  [201, "ASUS Vivobook 15 OLED Laptop (Intel Core i5 13th Gen, 16GB, 512GB SSD)", "electronics", "laptops", 59990, 74990, "15.6-inch FHD OLED 600nits HDR display, Thin & Light 1.7kg, Windows 11 + MS Office 2024", 0, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80", 15],
  [202, "TCL 43-inch 4K Ultra HD Smart QLED Google TV (43C645)", "electronics", "televisions", 25999, 39990, "QLED 4K with Dolby Vision & Atmos, 120Hz DLG Game Master, Hands-Free Voice Control", 0, "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80", 20],
  [203, "OnePlus Bullets Wireless Z2 Bluetooth Neckband (Acoustic Red)", "electronics", "audio", 1499, 2299, "12.4mm Bass Drivers, 30 Hours Playtime, Fast 10-Min Charge = 20 Hours Battery, IP55 Sweatproof", 0, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", 100],
  [204, "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones", "electronics", "audio", 28990, 34990, "Industry Leading ANC with 8 Mics, Auto NC Optimizer, Hi-Res Audio LDAC, 30h Battery", 0, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80", 12],
  [205, "Apple iPad Air M2 (11-inch, Wi-Fi, 128GB, Space Grey)", "electronics", "tablets", 57900, 59900, "Apple M2 chip, Liquid Retina display with P3 wide color, 12MP Center Stage Front Camera", 0, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80", 22],
  [206, "Noise ColorFit Pulse 4 Smart Watch with Bluetooth Calling", "electronics", "wearables", 1799, 4999, "1.85-inch Advanced AMOLED display, 7-day battery, 100+ Sports Modes, Health Tracking", 0, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", 80],
  [207, "MacBook Air 15-inch M3 (Midnight, 16GB RAM, 512GB SSD)", "electronics", "laptops", 154900, 174900, "Liquid Retina display, MagSafe charging, 18-hour battery, Fanless silent design", 0, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80", 12],
  [208, "Lenovo Legion Pro 5i Gaming Laptop (Core i7 14th Gen, RTX 4060)", "electronics", "laptops", 134990, 169990, "16-inch WQXGA 240Hz 500nits, 32GB DDR5 RAM, 1TB NVMe Gen4 SSD, Legion Coldfront 5.0", 0, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80", 14],
  [209, "Samsung 55-inch Crystal 4K Vivid Pro Ultra HD Smart TV", "electronics", "televisions", 44990, 68900, "Crystal Processor 4K, PurColor, SolarCell Remote, Q-Symphony Audio Integration", 0, "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80", 22],
  [210, "LG 65-inch 4K OLED evo C3 Smart TV", "electronics", "televisions", 174990, 249990, "Self-lit OLED pixels, α9 AI Processor Gen6, Dolby Vision IQ & Atmos, 0.1ms Gaming", 0, "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80", 10],
  [211, "Apple AirPods Pro (2nd Generation with MagSafe USB-C)", "electronics", "audio", 22990, 24900, "H2 chip, Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio", 0, "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80", 50],
  [212, "JBL Charge 5 Portable Waterproof Bluetooth Speaker", "electronics", "audio", 14999, 18999, "Original Pro Sound with long excursion driver, separate tweeter, 20 hours playtime, IP67", 0, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80", 40],
  [213, "Samsung Galaxy Watch6 LTE (44mm, Graphite)", "electronics", "wearables", 24999, 36999, "Sapphire Crystal glass, Advanced Sleep Coaching, ECG & Blood Pressure Monitoring, Wear OS", 0, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80", 30],
  [214, "Logitech MX Master 3S Wireless Performance Mouse", "electronics", "wearables", 8995, 10995, "8K DPI Any-surface tracking, Quiet Clicks, MagSpeed electromagnetic scrolling wheel", 0, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80", 60],

  // ==========================================
  // 3. APPLIANCES (appliances)
  // ==========================================
  [301, "LG 190L 4-Star Smart Inverter Direct Cool Single Door Refrigerator", "appliances", "refrigerators", 16990, 22499, "Smart Inverter Compressor, Fastest in Ice Making, Toughened Glass Shelves, Works without Stabilizer", 0, "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80", 15],
  [302, "Voltas 1.5 Ton 5-Star Adjustable Inverter Split AC (185V Vectra Elite)", "appliances", "air-conditioners", 34990, 67990, "4-in-1 Adjustable Cooling Modes, 100% Copper Condenser, Anti-dust Filter, Stabilizer Free", 0, "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80", 10],
  [303, "Philips Digital Air Fryer HD9252/90 (4.1 Liter, 1400W)", "appliances", "kitchen-appliances", 7499, 11995, "Rapid Air Technology for 90% Less Fat, Touch Screen with 7 Pre-set Menus, Dishwasher Safe", 0, "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80", 25],
  [304, "Prestige Induction Cooktop PIC 20 (1600 Watt with Indian Menu Options)", "appliances", "kitchen-appliances", 2399, 3645, "Push Button Controls, Automatic Voltage Regulator, Anti-Magnetic Wall, Feather Touch Control", 0, "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80", 40],
  [305, "Samsung 653L Frost-Free Double Door Convertible Side-by-Side Refrigerator", "appliances", "refrigerators", 74990, 112900, "Twin Cooling Plus, 5-in-1 Convertible Modes, Digital Inverter with 20-Year Warranty, Wi-Fi", 0, "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80", 10],
  [306, "Whirlpool 240L Triple Door Multi-Door Refrigerator (Protton Royale)", "appliances", "refrigerators", 25490, 34250, "Microblock Technology, Active Fresh Zone for fruit retention, Moisture Retention Crisper", 0, "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80", 20],
  [307, "Daikin 1.5 Ton 5-Star Inverter Split AC (PM 2.5 Filter)", "appliances", "air-conditioners", 45490, 66400, "Dew Clean Technology, Coanda Airflow, Triple Display, 100% Copper with Anti-Corrosion", 0, "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80", 15],
  [308, "IFB 8 Kg 5-Star Front Load Washing Machine (Senator Smart)", "appliances", "kitchen-appliances", 36990, 48990, "AI Powered Powered Wash, 9 Swirl Wash, Steam Wash at 95°C for 99.9% Germ Protection", 0, "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80", 18],
  [309, "LG 28L Charcoal Convection Microwave Oven (MJ2886BWUM)", "appliances", "kitchen-appliances", 19990, 26990, "Charcoal Lighting Heater for tandoori roasting, Diet Fry for 88% less oil cooking", 0, "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80", 25],
  [310, "Dyson V12 Detect Slim Cordless Vacuum Cleaner", "appliances", "kitchen-appliances", 44900, 55900, "Laser reveals invisible dust, Piezo sensor counts particles, 150AW suction, LCD screen", 0, "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80", 12],
  [311, "Morphy Richards 24L Digital Oven Toaster Griller (OTG)", "appliances", "kitchen-appliances", 8499, 11995, "Motorized Rotisserie, Convection baking technology, Digital timer and temperature display", 0, "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80", 30],

  // ==========================================
  // 4. FASHION (fashion)
  // ==========================================
  [401, "Levi's Men 511 Slim Fit Stretchable Denim Jeans (Dark Indigo)", "fashion", "mens-clothing", 2499, 3999, "Classic 5-pocket styling, Cotton-elastane blend for flexibility and premium everyday durability", 0, "https://images.unsplash.com/photo-1542272604-780c96856478?auto=format&fit=crop&w=600&q=80", 50],
  [402, "Puma Flyer Runner Running & Training Shoes for Men (Black-White)", "fashion", "footwear", 2199, 3499, "SoftFoam+ comfort sockliner for instant step-in cushioning, breathable mesh upper", 0, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", 60],
  [403, "Titan Neo Analog Dial Quartz Watch for Men (Stainless Steel Strap)", "fashion", "watches", 4295, 5995, "Midnight blue sunray dial, Mineral glass, 50m water resistance, 2-year manufacturer warranty", 0, "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80", 30],
  [404, "U.S. Polo Assn. Solid Slim Fit Pure Cotton Polo T-Shirt", "fashion", "mens-clothing", 999, 1799, "100% Pique Cotton, Signature brand embroidery, Ribbed collar and sleeve hems", 0, "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80", 75],
  [405, "Nike Air Jordan 1 Low Retro Sneakers (Gym Red/White)", "fashion", "footwear", 8995, 11495, "Encapsulated Air-Sole unit for lightweight cushioning, genuine leather upper, rubber cupsole", 0, "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80", 35],
  [406, "Adidas Ultraboost Light Running Shoes for Men", "fashion", "footwear", 11999, 18999, "Light BOOST midsole cushioning, PRIMEKNIT+ textile upper, Continental rubber grip outsole", 0, "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80", 40],
  [407, "Tommy Hilfiger Classic Oxford Cotton Button-Down Shirt", "fashion", "mens-clothing", 3999, 5999, "100% Premium organic oxford cotton, embroidered flag logo on chest, regular tailored fit", 0, "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80", 45],
  [408, "Zara Structured Tailored Blazer Jacket", "fashion", "mens-clothing", 6990, 9990, "Peak lapel collar, double-welt front pockets, premium crease-resistant blended fabric", 0, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80", 25],
  [409, "Fossil Grant Chronograph Leather Watch for Men", "fashion", "watches", 9995, 14995, "Roman numeral dial with 3 sub-dials, rich genuine amber leather strap, 50m water resistant", 0, "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80", 35],
  [410, "Casio G-Shock GA-2100 Carbon Core Guard Watch (All Black)", "fashion", "watches", 8995, 10995, "Octagonal retro bezel, 200m water resistance, shock-absorbent carbon fiber reinforced resin", 0, "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80", 50],
  [411, "Ray-Ban Aviator Classic Polarized Sunglasses (Gold Frame, Green Lens)", "fashion", "mens-clothing", 8590, 10990, "Crystal green polarized lenses, timeless teardrop metal frame, 100% UV400 protection", 0, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80", 30],
  [412, "Samsonite GuardIT 2.0 Laptop Backpack (Black 27L)", "fashion", "mens-clothing", 4500, 6500, "Padded 15.6-inch laptop compartment, ergonomic shoulder straps, water-repellent ballistic nylon", 0, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", 55],

  // ==========================================
  // 5. BEAUTY & HEALTH (beauty)
  // ==========================================
  [501, "Minimalist 10% Niacinamide Face Serum with Zinc (30ml)", "beauty", "skincare", 599, 649, "Clinically tested for blemish marks reduction, sebum control, and pore refining", 1, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80", 65],
  [502, "Cetaphil Gentle Skin Cleanser for Sensitive & Dry Skin (250ml)", "beauty", "skincare", 499, 575, "Dermatologist recommended, Soap-free, Fragrance-free hydrating cleanser with Niacinamide", 0, "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80", 80],
  [503, "Maybelline SuperStay Matte Ink Liquid Lipstick (Pioneer 20)", "beauty", "makeup", 549, 699, "Up to 16 Hours intense matte color payoff, smudge-proof, transfer-resistant precision applicator", 0, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80", 90],
  [504, "COSRX Advanced Snail 96 Mucin Power Essence (100ml)", "beauty", "skincare", 1299, 1450, "96% Snail Secretion Filtrate for deep hydration, skin elasticity, and radiant glass-skin glow", 1, "https://images.unsplash.com/photo-1608248597359-58b387e38e1b?auto=format&fit=crop&w=600&q=80", 60],
  [505, "The Ordinary Hyaluronic Acid 2% + B5 Hydration Serum (30ml)", "beauty", "skincare", 850, 990, "Multi-depth hydration with 3 forms of hyaluronic acid and Vitamin B5 for plump skin", 0, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80", 80],
  [506, "La Roche-Posay Anthelios SPF 50+ Invisible Fluid Sunscreen", "beauty", "skincare", 1950, 2450, "Broad spectrum UVA/UVB protection, ultra-resistant to water, sweat, and sand, non-greasy", 0, "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80", 50],
  [507, "L'Oreal Paris Extraordinary Oil Hair Serum (100ml)", "beauty", "haircare", 499, 649, "Infused with 6 precious floral oils for instant 6x shine, frizz control, and heat protection", 0, "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80", 95],
  [508, "MAC Matte Lipstick (Ruby Woo 3g)", "beauty", "makeup", 1950, 2300, "Iconic vivid blue-red shade with long-wearing non-feathering retro matte finish", 0, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80", 70],
  [509, "Forest Essentials Ayurvedic Soundarya Radiance Cream with 24K Gold", "beauty", "skincare", 3975, 4800, "Pure 24 Karat Gold Bhasma and saffron infused in rich unrefined sweet almond oil", 1, "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80", 30],
  [510, "Dior Sauvage Eau De Parfum for Men (100ml)", "beauty", "makeup", 11500, 13900, "Radiant Calabrian bergamot, sensual Papua New Guinean vanilla absolute, smoky ambery sillage", 0, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80", 20],

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
  [609, "Nutraj Signature Premium California Walnuts (Kernels 500g)", "food-health", "dry-fruits", 699, 899, "Extra-light walnut halves, rich source of plant-based Omega-3 ALA, vacuum nitrogen flushed", 1, "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80", 65],
  [610, "Organic India Tulsi Green Tea Classic (100 Tea Bags Tin)", "food-health", "grocery-staples", 425, 525, "Certified organic blend of Rama, Krishna & Vana Tulsi with delicate sencha green tea", 1, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80", 90],
  [611, "Pintola All Natural Creamy Peanut Butter (100% Roasted Peanuts, 1kg)", "food-health", "nutrition-supplements", 399, 499, "Zero added sugar, zero hydrogenated oil, 30g protein per 100g, pure roasted peanuts", 1, "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80", 80],
  [612, "Daawat Rozana Super Basmati Rice (5kg Bag)", "food-health", "grocery-staples", 485, 599, "Aged long-grain basmati with sweet aroma and fluffy non-sticky texture for daily cooking", 1, "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80", 100],
  [613, "Saffola Total Pro Heart Pro-Blend Edible Cooking Oil (5 Liter Can)", "food-health", "oils-ghee", 989, 1250, "Dual seed technology (Rice bran & Safflower), Oryzanol power for healthy cholesterol", 0, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80", 70],
  [614, "Dabur Chyawanprash with 2X Immunity 40+ Herbs (1kg Jar)", "food-health", "grocery-staples", 385, 450, "Traditional Ayurvedic formulation backed by clinical trials, rich in Amla Vitamin C", 1, "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80", 110],
  [615, "MuscleBlaze Biozyme Performance Whey (Rich Chocolate, 2kg)", "food-health", "nutrition-supplements", 4499, 5799, "Enhanced Absorption Formula (EAF), 25g Protein, 5.51g BCAA, Informed-Choice certified", 0, "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80", 40],
  [616, "True Elements 7-in-1 Super Seeds Mix (Chia, Flax, Pumpkin, Sunflower 500g)", "food-health", "dry-fruits", 449, 575, "Lightly roasted crunchy mix of 7 nutritious seeds, rich in zinc, magnesium, and dietary fiber", 1, "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80", 85],

  // ==========================================
  // 7. HOME & KITCHEN (home)
  // ==========================================
  [701, "Milton Thermosteel Flip Lid 1000ml Vacuum Insulated Flask", "home", "kitchen-dining", 949, 1320, "24 Hours Hot & Cold retention, 100% Food grade 304 Stainless steel with carry bag", 0, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80", 60],
  [702, "Wakefit Orthopedic Memory Foam King Size Mattress (78x72x6 Inch)", "home", "furniture", 13499, 18999, "Next-Gen memory foam with differential pressure zone support, breathable 100% cotton cover", 0, "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80", 15],
  [703, "Solimo Microfiber Reversible Comforter / Blanket (Double Bed, Aqua Blue)", "home", "bedding", 1499, 2500, "200 GSM hollow siliconized polyester filling, lightweight warmth, hypoallergenic", 0, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80", 40],
  [704, "Prestige Omega Deluxe Granite Non-Stick 3-Piece Cookware Set", "home", "kitchen-dining", 2499, 3600, "Omni Tawa, Fry Pan & Kadai with Glass Lid, 5-layer durable German granite coating", 0, "https://images.unsplash.com/photo-1584990347449-39976378c3b2?auto=format&fit=crop&w=600&q=80", 45],
  [705, "Pigeon by Stovekraft Sheen Stainless Steel 3-Burner Gas Stove", "home", "kitchen-dining", 3299, 4995, "High-efficiency tri-pin brass burners, designer stainless steel body, ISI certified", 0, "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80", 30],
  [706, "SleepyCat Hybrid Latex Orthopedic CoolGel Memory Foam Pillow", "home", "bedding", 1899, 2999, "Contours to neck alignment, infused cooling gel beads, removable washable bamboo cover", 0, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80", 50],
  [707, "Spaces 100% Pure Egyptian Cotton 400 TC King Bed Sheet Set", "home", "bedding", 2799, 4499, "Sateen weave with silky smooth touch, breathable natural cotton, includes 2 pillow covers", 0, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80", 40],
  [708, "Green Soul Monster Ultimate Ergonomic Gaming & Work Chair", "home", "furniture", 16990, 24990, "Breathable spandex fabric, magnetic memory foam neck pillow, 4D adjustable armrests", 0, "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80", 20],
  [709, "Wipro Garnet 12W Smart LED B22 WiFi Color Bulb with Voice Control", "home", "furniture", 699, 1290, "16 Million colors with dimming, works with Alexa & Google Assistant, music sync mode", 0, "https://images.unsplash.com/photo-1550524514-648b26f582f3?auto=format&fit=crop&w=600&q=80", 90],
  [710, "Borosil Prime Glass Mixing Bowl Set with Lids (Pack of 3)", "home", "kitchen-dining", 999, 1495, "100% Borosilicate glass, oven and microwave safe up to 350°C, air-tight BPA-free lids", 0, "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80", 60],

  // ==========================================
  // 8. TOYS & BABY CARE (toys-baby)
  // ==========================================
  [801, "LEGO Classic Medium Creative Brick Box Building Set (484 Pieces)", "toys-baby", "toys-games", 2499, 3299, "Inspires open-ended creativity with 35 vibrant brick colors, windows, eyes, and tires", 0, "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80", 30],
  [802, "Pampers All Round Protection Pants Diapers (Large, 74 Count)", "toys-baby", "baby-care", 1199, 1499, "Up to 12 hours absorption with magic gel technology and lotion with aloe vera", 0, "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80", 50],
  [803, "LEGO Technic Bugatti Bolide Agile Race Car Model Building Kit", "toys-baby", "toys-games", 4499, 5999, "Working W16 engine, steering, scissor doors, realistic yellow and black finish with decals", 0, "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80", 25],
  [804, "Hot Wheels 10-Car Gift Pack of 1:64 Scale Vehicles", "toys-baby", "toys-games", 1199, 1499, "Authentic die-cast sports and muscle cars with rolling wheels and detailed racing decos", 0, "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80", 60],
  [805, "Himalaya Total Baby Care Gentle Gift Basket (7 Baby Care Essentials)", "toys-baby", "baby-care", 899, 1199, "Gentle baby massage oil, powder, cream, wipes, soap, shampoo with natural herb extracts", 1, "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80", 75],
  [806, "LuvLap Sunshine Baby Stroller & Pram with Reversible Handle", "toys-baby", "baby-care", 4299, 6499, "3-position reclining seat, 5-point safety harness, 360-degree front swivel lock wheels", 0, "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80", 20],
  [807, "Mattel Scrabble Original Crossword Board Game for Families", "toys-baby", "toys-games", 899, 1299, "Classic wordplay board game with letter tiles, tile racks, score pad, and rule guide", 0, "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80", 50],
  [808, "Chicco Natural Sensation Baby Shampoo & Body Wash (300ml)", "toys-baby", "baby-care", 599, 799, "Soap-free tearless formula with aloe vera & chamomile, tested by pediatricians", 0, "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80", 65],

  // ==========================================
  // 9. AUTO ACCESSORIES (auto-accessories)
  // ==========================================
  [901, "Steelbird SB-50 Adonis Full Face Helmet with Visor (Matte Black, L)", "auto-accessories", "helmets-gear", 1499, 2199, "ISI Certified (IS:4151), High impact ABS shell, breathable multi-pore interior padding", 0, "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 40],
  [902, "70mai Smart Dash Cam 1S (1080P Full HD, Night Vision, G-Sensor)", "auto-accessories", "car-electronics", 3999, 5499, "Sony IMX307 sensor, 130-degree wide angle, voice control and emergency auto-recording", 0, "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80", 25],
  [903, "Vega Crux Half Face Helmet with Smoke Visor (Glossy Black, M)", "auto-accessories", "helmets-gear", 1099, 1499, "ISI certified shell, quick release metallic buckle, removable odor-resistant cheek pads", 0, "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 50],
  [904, "Qubo Smart Tire Inflator Portable Air Compressor for Car & Bike", "auto-accessories", "car-electronics", 2799, 3990, "Auto shutoff with real-time digital pressure gauge, 150 PSI max, built-in LED torch", 0, "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80", 40],
  [905, "Bergmann Typhoon Heavy Duty Metal Car Vacuum Cleaner 150W", "auto-accessories", "car-electronics", 1499, 2250, "100% Pure copper motor, medical grade HEPA filter, 5-meter power cord with accessories", 0, "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80", 35],
  [906, "3M Large Car Care Auto Wash Shampoo (1 Liter)", "auto-accessories", "helmets-gear", 399, 540, "High foaming pH-balanced formula removes dirt without stripping wax coating", 0, "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80", 80],
  [907, "TVS Motor Premium Weather-Resistant Two-Wheeler Body Cover", "auto-accessories", "helmets-gear", 699, 999, "100% Water-resistant polyester with mirror pockets and buckle strap lock", 0, "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80", 60],
  [908, "All-Weather Heavy Duty Anti-Skid Rubber 7D Car Floor Mats", "auto-accessories", "helmets-gear", 2999, 4499, "Laser cut custom tailored design with curly heel pad, waterproof and easy to clean", 0, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80", 30],

  // ==========================================
  // 10. SPORTS & FITNESS (sports-fitness)
  // ==========================================
  [1001, "Yonex Muscle Power 29 Light Graphite Badminton Racquet", "sports-fitness", "badminton", 2199, 3490, "High modulus graphite frame, Isometric head shape with Muscle Power shock absorption", 0, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80", 45],
  [1002, "Boldfit Anti-Skid Yoga Mat 6mm with Carrying Strap (Navy Blue)", "sports-fitness", "fitness-accessories", 799, 1499, "Eco-friendly TPE material, double-sided non-slip grip, sweat-resistant & easy to clean", 1, "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80", 60],
  [1003, "Nivia Storm Football Rubber Moulded Size 5 Official Match Ball", "sports-fitness", "badminton", 599, 850, "Rubber moulded exterior for hard surfaces, 32-panel aerodynamic construction", 0, "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80", 60],
  [1004, "Kobo Hexagonal Rubber Encased Dumbbell Pair (5kg x 2)", "sports-fitness", "fitness-accessories", 2199, 3200, "Heavy duty cast iron encased in natural virgin rubber with contoured chrome handles", 0, "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=600&q=80", 35],
  [1005, "Decathlon Domyos Adjustable Resistance Loop Band Set (3-Pack)", "sports-fitness", "fitness-accessories", 699, 999, "Light, Medium, and Heavy resistance elastic bands for strength and mobility training", 0, "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80", 70],
  [1006, "SG Savage Edition English Willow Cricket Bat (Full Size Men)", "sports-fitness", "badminton", 7999, 11999, "Grade 3 hand-crafted English Willow with thick edges, massive sweet spot, toe guard", 0, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80", 15],
  [1007, "Fitkit FK001 Steel Wire High-Speed Skipping Jump Rope with Ball Bearings", "sports-fitness", "fitness-accessories", 299, 599, "Tangle-free 360-degree ball bearing rotation with anti-slip aluminum alloy handles", 0, "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80", 90],
  [1008, "Firefox Bikes Cyclone 27.5T 21-Speed Alloy Mountain Bicycle", "sports-fitness", "fitness-accessories", 16499, 21990, "Lightweight 6061 alloy hardtail frame, Zoom front suspension fork, Shimano Tourney gears", 0, "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80", 12],
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
  [107, 5.0, "Arjun Verma", "Pixel 8a camera and AI features are unreal! Outstanding value for money."],
  [201, 4.9, "Siddharth Roy", "ASUS Vivobook 15 OLED display is stunning for video editing and movies. Best laptop under 60k."],
  [202, 4.8, "Kavita Rao", "TCL 43 inch QLED picture quality and Google TV UI is super smooth. Incredible value."],
  [203, 4.7, "Vikas Gupta", "OnePlus Bullets Z2 has thunderous bass and battery lasts for almost a week on single charge."],
  [207, 5.0, "Neha Kapur", "MacBook Air M3 handles 4K video rendering silently. Battery easily lasts 2 full days."],
  [301, 4.9, "Ananya Sen", "LG Smart Inverter fridge cools quickly, low power consumption and runs smoothly."],
  [308, 5.0, "Meera Sen", "IFB Front Load washing machine cleans tough stains effortlessly with steam wash."],
  [401, 4.8, "Deepak Joshi", "Original Levi's 511 fit is perfect with great stretch and comfort."],
  [405, 5.0, "Kabir Khan", "Air Jordan 1 Low is 100% original verified. Super comfortable and stylish."],
  [501, 4.9, "Sneha Mukherjee", "Minimalist Niacinamide serum cleared my acne marks within 3 weeks. Genuine product."],
  [504, 5.0, "Ananya Ghosh", "COSRX Snail Mucin gives instant glass skin hydration. HG skincare product!"],
  [601, 5.0, "Vikram Malhotra", "Best organic raw honey I have tasted. 100% authentic and unadulterated."],
  [603, 4.9, "Arjun Kapoor", "Optimum Nutrition Gold Standard Whey is 100% authentic with scratch verification code."],
  [611, 5.0, "Rohit Deshmukh", "Pintola natural peanut butter is pure peanuts with no palm oil or added sugar. Perfect protein boost."],
  [704, 5.0, "Sunita Patel", "Prestige granite cookware set works seamlessly on induction and gas. Truly non-stick."],
  [803, 5.0, "Karan Johar", "LEGO Bugatti Bolide was an incredible build experience. Working pistons are amazing."],
  [904, 5.0, "Deepak Joshi", "Qubo tire inflator saved me on the highway! Inflated a car tire from 20 to 35 PSI in 3 minutes."],
  [1004, 5.0, "Manish Tiwari", "Kobo rubber dumbbells have great grip and protect tiled floors from drops."],
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
  2155.51,
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

insertOrderItem.run(1039, 1, "Organic Raw Honey", 1244.17, 1);
insertOrderItem.run(1039, 18, "Rolled Oats", 455.67, 2);

console.log(`Database seeded with ${products.length} products across 10 Cartwise Plus categories, ratings, reviews, and test orders.`);
db.close();
