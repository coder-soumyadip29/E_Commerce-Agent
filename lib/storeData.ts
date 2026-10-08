import { Product, Review, Order, UserProfile, UserAddress, UserAddressRecord } from "./types";

export function getProductImageUrl(name: string, category: string, subCategory?: string): string {
  const lower = (name + " " + category + " " + (subCategory || "")).toLowerCase();

  // Mobiles & Smartphones
  if (lower.includes("motorola") || lower.includes("edge 70")) return "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("iphone") || lower.includes("apple phone")) return "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("oneplus 12") || lower.includes("oneplus")) return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("galaxy") || lower.includes("samsung")) return "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("k14") || lower.includes("realme") || lower.includes("poco")) return "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("smartphone") || lower.includes("mobile")) return "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80";

  // Electronics, Laptops, TV & Audio
  if (lower.includes("vivobook") || lower.includes("asus") || lower.includes("laptop")) return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("tcl") || lower.includes("qled") || lower.includes("tv") || lower.includes("television")) return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("neckband") || lower.includes("bullets")) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("headphone") || lower.includes("wh-1000xm") || lower.includes("sony")) return "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("ipad") || lower.includes("tablet")) return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("smart watch") || lower.includes("smartwatch") || lower.includes("noise")) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

  // Appliances
  if (lower.includes("refrigerator") || lower.includes("fridge") || lower.includes("lg")) return "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("air conditioner") || lower.includes("ac") || lower.includes("voltas")) return "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("air fryer") || lower.includes("fryer") || lower.includes("philips")) return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("induction") || lower.includes("cooktop") || lower.includes("prestige")) return "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80";

  // Fashion & Apparel
  if (lower.includes("jean") || lower.includes("levi")) return "https://images.unsplash.com/photo-1542272604-780c96856478?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("puma")) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("watch") || lower.includes("titan")) return "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("shirt") || lower.includes("t-shirt") || lower.includes("polo")) return "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80";

  // Beauty & Personal Care
  if (lower.includes("serum") || lower.includes("niacinamide") || lower.includes("minimalist")) return "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("cleanser") || lower.includes("cetaphil") || lower.includes("facewash")) return "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("lipstick") || lower.includes("maybelline")) return "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80";

  // Food & Grocery
  if (lower.includes("honey")) return "/images/honey.png";
  if (lower.includes("olive oil") || lower.includes("avocado")) return "/images/avocado_oil.png";
  if (lower.includes("oat")) return "/images/oats.png";
  if (lower.includes("whey") || lower.includes("protein")) return "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("almond") || lower.includes("cashew") || lower.includes("nut")) return "https://images.unsplash.com/photo-1508061252445-b95013cb7c5b?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("atta") || lower.includes("flour") || lower.includes("rice") || lower.includes("dal")) return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("ghee")) return "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80";

  // Home & Kitchen
  if (lower.includes("flask") || lower.includes("bottle") || lower.includes("milton")) return "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("mattress") || lower.includes("wakefit")) return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("comforter") || lower.includes("blanket")) return "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80";

  // Toys & Baby
  if (lower.includes("lego") || lower.includes("toy")) return "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("diaper") || lower.includes("pampers") || lower.includes("baby")) return "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80";

  // Auto & Sports
  if (lower.includes("helmet") || lower.includes("steelbird")) return "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("dash cam") || lower.includes("camera")) return "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("badminton") || lower.includes("yonex") || lower.includes("racquet")) return "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("yoga") || lower.includes("mat")) return "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80";

  return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
}

export const SEED_PRODUCTS_RAW: Array<[number, string, string, string, number, string, number, number, number, number]> = [
  // id, name, category, sub_category, price, description, is_organic, stock, average_rating, review_count
  // ==========================================
  // 0. CORE MENTOR ORGANIC HARVEST (IDs 1 - 32)
  // ==========================================
  [1, "Organic Raw Honey", "food-health", "grocery-staples", 14.99, "Pure organic raw honey, unfiltered and cold-pressed", 1, 20, 4.6, 12],
  [2, "Wildflower Honey", "food-health", "grocery-staples", 12.99, "Natural wildflower honey from local beekeepers", 0, 20, 3.8, 8],
  [3, "Organic Manuka Honey", "food-health", "grocery-staples", 29.99, "Premium organic Manuka honey from New Zealand", 1, 20, 4.8, 15],
  [4, "Clover Honey", "food-health", "grocery-staples", 8.99, "Classic clover honey, smooth and sweet", 0, 20, 3.5, 6],
  [5, "Organic Buckwheat Honey", "food-health", "grocery-staples", 18.99, "Dark and robust organic buckwheat honey, antioxidant-rich", 1, 20, 4.6, 9],
  [6, "Orange Blossom Honey", "food-health", "grocery-staples", 15.99, "Light and floral orange blossom honey", 0, 0, 4.2, 7],
  [7, "Organic Acacia Honey", "food-health", "grocery-staples", 17.99, "Light and mild organic acacia honey, low glycemic index", 1, 20, 4.8, 11],
  [8, "Creamed Honey", "food-health", "grocery-staples", 11.99, "Smooth creamed honey with spreadable texture", 0, 20, 4.0, 5],
  [9, "Organic Extra Virgin Olive Oil", "food-health", "oils-ghee", 16.99, "Cold-pressed organic EVOO from Mediterranean olives", 1, 20, 4.7, 14],
  [10, "Coconut Oil", "food-health", "oils-ghee", 12.49, "Refined coconut oil, great for high-heat cooking", 0, 20, 4.1, 8],
  [11, "Organic Flaxseed Oil", "food-health", "oils-ghee", 14.99, "Cold-pressed organic flaxseed oil, rich in omega-3", 1, 20, 4.5, 10],
  [12, "Avocado Oil", "food-health", "oils-ghee", 18.99, "Cold-pressed avocado oil, high smoke point", 0, 20, 4.6, 9],
  [13, "Organic Almonds", "food-health", "dry-fruits", 11.99, "Raw organic almonds, unsalted, non-GMO certified", 1, 20, 4.8, 16],
  [14, "Roasted Cashews", "food-health", "dry-fruits", 9.99, "Lightly salted dry-roasted cashews", 0, 20, 4.3, 11],
  [15, "Organic Chia Seeds", "food-health", "grocery-staples", 8.49, "Organic black chia seeds, high in fiber and omega-3", 1, 20, 4.7, 13],
  [16, "Mixed Nuts", "food-health", "dry-fruits", 13.99, "Premium mix of walnuts, pecans, almonds and Brazil nuts", 0, 20, 4.4, 9],
  [17, "Organic Quinoa", "food-health", "grocery-staples", 10.99, "Organic white quinoa, complete protein, gluten-free", 1, 20, 4.6, 12],
  [18, "Rolled Oats", "food-health", "grocery-staples", 5.49, "Whole grain rolled oats, great for porridge and baking", 0, 20, 4.5, 14],
  [19, "Organic Brown Rice", "food-health", "grocery-staples", 7.99, "Long-grain organic brown rice, naturally gluten-free", 1, 20, 4.3, 8],
  [20, "Steel-Cut Oats", "food-health", "grocery-staples", 6.99, "Traditional steel-cut oats, low GI, hearty texture", 0, 20, 4.4, 10],
  [21, "Organic Green Tea", "food-health", "grocery-staples", 12.99, "Japanese organic sencha green tea, 50 bags", 1, 20, 4.7, 15],
  [22, "Chamomile Tea", "food-health", "grocery-staples", 8.99, "Dried chamomile flowers, caffeine-free, soothing", 0, 20, 4.2, 7],
  [23, "Organic Ethiopian Coffee", "food-health", "grocery-staples", 16.99, "Single-origin organic Arabica, medium roast whole bean", 1, 20, 4.9, 18],
  [24, "Dark Roast Espresso Blend", "food-health", "grocery-staples", 14.49, "Bold dark roast espresso blend, ground", 0, 0, 4.1, 6],
  [25, "Organic Granola", "food-health", "grocery-staples", 9.99, "Organic oat granola with honey, almonds and dried cranberries", 1, 20, 4.6, 11],
  [26, "Rice Cakes", "food-health", "grocery-staples", 4.49, "Lightly salted brown rice cakes, low calorie", 0, 20, 3.9, 5],
  [27, "Organic Dried Mango", "food-health", "dry-fruits", 7.99, "Unsweetened organic dried mango slices, no preservatives", 1, 20, 4.8, 17],
  [28, "Trail Mix", "food-health", "dry-fruits", 8.49, "Classic trail mix with raisins, M&Ms, peanuts and sunflower seeds", 0, 20, 4.3, 8],
  [29, "Organic Almond Milk", "food-health", "grocery-staples", 4.99, "Unsweetened organic almond milk, fortified with calcium", 1, 20, 4.5, 12],
  [30, "Oat Milk", "food-health", "grocery-staples", 4.49, "Barista-style oat milk, great for coffee", 0, 20, 4.6, 14],
  [31, "Organic Coconut Milk", "food-health", "grocery-staples", 3.99, "Full-fat organic coconut milk, great for curries", 1, 20, 4.7, 10],
  [32, "Soy Milk", "food-health", "grocery-staples", 3.49, "Unsweetened soy milk, high protein", 0, 20, 4.1, 7],

  // ==========================================
  // 1. MOBILES (mobiles)
  // ==========================================
  [101, "Motorola edge 70 Fusion (12GB RAM, 256GB)", "mobiles", "smartphones", 29999, "144Hz 3D Curved pOLED Display, Sony LYTIA 700C Camera with OIS, IP68 Protection", 0, 40, 4.9, 1420],
  [102, "Apple iPhone 15 (Blue, 128GB)", "mobiles", "smartphones", 63999, "Dynamic Island, 48MP Main Camera, 2x Telephoto, All-Day Battery Life, USB-C Charging", 0, 25, 4.9, 3890],
  [103, "OnePlus 12R 5G (Cool Blue, 16GB, 256GB)", "mobiles", "smartphones", 39999, "Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz ProXDR Display, 5500 mAh Battery, 100W SUPERVOOC", 0, 30, 4.8, 980],
  [104, "Samsung Galaxy S24 5G (Onyx Black, 256GB)", "mobiles", "smartphones", 74999, "Galaxy AI, 50MP Dual Telephoto, Dynamic AMOLED 2X Display with Armor Aluminum 2.0", 0, 18, 4.9, 560],
  [105, "Realme K14 Plus 5G (Submarine Blue, 128GB)", "mobiles", "smartphones", 25999, "Periscope Portrait Camera, Luxury Watch Design, 120Hz Curved Vision OLED Display", 0, 50, 4.7, 720],
  [106, "POCO X6 Pro 5G (Racing Yellow, 512GB)", "mobiles", "smartphones", 26999, "Dimensity 8300 Ultra processor, 1.5K 120Hz AMOLED, 64MP OIS Triple Camera", 0, 35, 4.8, 640],

  // ==========================================
  // 2. ELECTRONICS & LAPTOPS (electronics)
  // ==========================================
  [201, "ASUS Vivobook 15 OLED Laptop (Intel Core i5 13th Gen, 16GB, 512GB SSD)", "electronics", "laptops", 59990, "15.6-inch FHD OLED 600nits HDR display, Thin & Light 1.7kg, Windows 11 + MS Office 2024", 0, 15, 4.9, 310],
  [202, "TCL 43-inch 4K Ultra HD Smart QLED Google TV (43C645)", "electronics", "televisions", 25999, "QLED 4K with Dolby Vision & Atmos, 120Hz DLG Game Master, Hands-Free Voice Control", 0, 20, 4.8, 420],
  [203, "OnePlus Bullets Wireless Z2 Bluetooth Neckband (Acoustic Red)", "electronics", "audio", 1499, "12.4mm Bass Drivers, 30 Hours Playtime, Fast 10-Min Charge = 20 Hours Battery, IP55", 0, 100, 4.7, 2150],
  [204, "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones", "electronics", "audio", 28990, "Industry Leading ANC with 8 Mics, Auto NC Optimizer, Hi-Res Audio LDAC, 30h Battery", 0, 12, 5.0, 180],
  [205, "Apple iPad Air M2 (11-inch, Wi-Fi, 128GB, Space Grey)", "electronics", "tablets", 57900, "Apple M2 chip, Liquid Retina display with P3 wide color, 12MP Center Stage Camera", 0, 22, 4.9, 140],
  [206, "Noise ColorFit Pulse 4 Smart Watch with Bluetooth Calling", "electronics", "wearables", 1799, "1.85-inch Advanced AMOLED display, 7-day battery, 100+ Sports Modes, Health Tracking", 0, 80, 4.6, 920],

  // ==========================================
  // 3. APPLIANCES (appliances)
  // ==========================================
  [301, "LG 190L 4-Star Smart Inverter Direct Cool Single Door Refrigerator", "appliances", "refrigerators", 16990, "Smart Inverter Compressor, Fastest in Ice Making, Toughened Glass Shelves, Works without Stabilizer", 0, 15, 4.9, 580],
  [302, "Voltas 1.5 Ton 5-Star Adjustable Inverter Split AC (185V Vectra Elite)", "appliances", "air-conditioners", 34990, "4-in-1 Adjustable Cooling Modes, 100% Copper Condenser, Anti-dust Filter, Stabilizer Free", 0, 10, 4.8, 290],
  [303, "Philips Digital Air Fryer HD9252/90 (4.1 Liter, 1400W)", "appliances", "kitchen-appliances", 7499, "Rapid Air Technology for 90% Less Fat, Touch Screen with 7 Pre-set Menus, Dishwasher Safe", 0, 25, 4.8, 340],
  [304, "Prestige Induction Cooktop PIC 20 (1600 Watt with Indian Menu Options)", "appliances", "kitchen-appliances", 2399, "Push Button Controls, Automatic Voltage Regulator, Anti-Magnetic Wall, Feather Touch Control", 0, 40, 4.7, 480],

  // ==========================================
  // 4. FASHION (fashion)
  // ==========================================
  [401, "Levi's Men 511 Slim Fit Stretchable Denim Jeans (Dark Indigo)", "fashion", "mens-clothing", 2499, "Classic 5-pocket styling, Cotton-elastane blend for flexibility and premium everyday durability", 0, 50, 4.8, 620],
  [402, "Puma Flyer Runner Running & Training Shoes for Men (Black-White)", "fashion", "footwear", 2199, "SoftFoam+ comfort sockliner for instant step-in cushioning, breathable mesh upper", 0, 60, 4.7, 850],
  [403, "Titan Neo Analog Dial Quartz Watch for Men (Stainless Steel Strap)", "fashion", "watches", 4295, "Midnight blue sunray dial, Mineral glass, 50m water resistance, 2-year warranty", 0, 30, 4.8, 290],
  [404, "U.S. Polo Assn. Solid Slim Fit Pure Cotton Polo T-Shirt", "fashion", "mens-clothing", 999, "100% Pique Cotton, Signature brand embroidery, Ribbed collar and sleeve hems", 0, 75, 4.6, 410],

  // ==========================================
  // 5. BEAUTY & HEALTH (beauty)
  // ==========================================
  [501, "Minimalist 10% Niacinamide Face Serum with Zinc (30ml)", "beauty", "skincare", 599, "Clinically tested for blemish marks reduction, sebum control, and pore refining", 1, 65, 4.9, 1200],
  [502, "Cetaphil Gentle Skin Cleanser for Sensitive & Dry Skin (250ml)", "beauty", "skincare", 499, "Dermatologist recommended, Soap-free, Fragrance-free hydrating cleanser with Niacinamide", 0, 80, 4.8, 980],
  [503, "Maybelline SuperStay Matte Ink Liquid Lipstick (Pioneer 20)", "beauty", "makeup", 549, "Up to 16 Hours intense matte color payoff, smudge-proof, transfer-resistant precision applicator", 0, 90, 4.7, 760],

  // ==========================================
  // 6. FOOD & HEALTH (food-health)
  // ==========================================
  [601, "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)", "food-health", "grocery-staples", 349, "Unheated, unfiltered wild forest honey directly extracted from certified natural reserves", 1, 55, 5.0, 342],
  [602, "Cold-Pressed Extra Virgin Olive Oil (1 Liter Glass Bottle)", "food-health", "oils-ghee", 999, "First cold-pressed Spanish olives, rich in healthy monounsaturated fats & Vitamin E", 1, 40, 4.9, 210],
  [603, "Optimum Nutrition (ON) Gold Standard 100% Whey Protein (Double Rich Chocolate 1kg)", "food-health", "nutrition-supplements", 3299, "24g Whey protein per scoop, 5.5g BCAAs, Primary source Whey Isolate, Instantized for easy mixing", 0, 35, 4.9, 1540],
  [604, "Whole Grain Rolled Oats (High Fiber, 1kg Pouch)", "food-health", "grocery-staples", 289, "100% whole grain gluten-free oats, rich in beta-glucan fiber for daily heart and gut wellness", 1, 70, 4.8, 480],
  [605, "California Jumbo Raw Almonds (500g Fresh Pack)", "food-health", "dry-fruits", 499, "Vacuum packed premium crunchy California almonds rich in plant protein and healthy fats", 1, 50, 4.9, 520],
  [606, "Aashirvaad Shudh Chakki Atta (100% Whole Wheat, 10kg)", "food-health", "grocery-staples", 445, "Crafted from golden grains using traditional 4-step chakki process for soft, fluffy rotis", 1, 120, 4.9, 2100],
  [607, "Tata Sampann Unpolished Toor Dal / Arhar Dal (1kg)", "food-health", "grocery-staples", 189, "Unpolished natural toor dal sourced from certified farms, rich in wholesome protein", 1, 90, 4.8, 890],
  [608, "Amul Pure Cow Ghee (1 Liter Tin)", "food-health", "oils-ghee", 620, "Traditional granular texture and authentic aroma, rich source of Vitamin A, D, E & K", 1, 60, 4.9, 1780],

  // ==========================================
  // 7. HOME & KITCHEN (home)
  // ==========================================
  [701, "Milton Thermosteel Flip Lid 1000ml Vacuum Insulated Flask", "home", "kitchen-dining", 949, "24 Hours Hot & Cold retention, 100% Food grade 304 Stainless steel with carry bag", 0, 60, 4.8, 640],
  [702, "Wakefit Orthopedic Memory Foam King Size Mattress (78x72x6 Inch)", "home", "furniture", 13499, "Next-Gen memory foam with differential pressure zone support, breathable 100% cotton cover", 0, 15, 4.9, 410],
  [703, "Solimo Microfiber Reversible Comforter / Blanket (Double Bed, Aqua Blue)", "home", "bedding", 1499, "200 GSM hollow siliconized polyester filling, lightweight warmth, hypoallergenic", 0, 40, 4.7, 320],

  // ==========================================
  // 8. TOYS & BABY CARE (toys-baby)
  // ==========================================
  [801, "LEGO Classic Medium Creative Brick Box Building Set (484 Pieces)", "toys-baby", "toys-games", 2499, "Inspires open-ended creativity with 35 vibrant brick colors, windows, eyes, and tires", 0, 30, 4.9, 290],
  [802, "Pampers All Round Protection Pants Diapers (Large, 74 Count)", "toys-baby", "baby-care", 1199, "Up to 12 hours absorption with magic gel technology and lotion with aloe vera", 0, 50, 4.8, 840],

  // ==========================================
  // 9. AUTO ACCESSORIES (auto-accessories)
  // ==========================================
  [901, "Steelbird SB-50 Adonis Full Face Helmet with Visor (Matte Black, L)", "auto-accessories", "helmets-gear", 1499, "ISI Certified (IS:4151), High impact ABS shell, breathable multi-pore interior padding", 0, 40, 4.8, 510],
  [902, "70mai Smart Dash Cam 1S (1080P Full HD, Night Vision, G-Sensor)", "auto-accessories", "car-electronics", 3999, "Sony IMX307 sensor, 130-degree wide angle, voice control and emergency auto-recording", 0, 25, 4.7, 180],

  // ==========================================
  // 10. SPORTS & FITNESS (sports-fitness)
  // ==========================================
  [1001, "Yonex Muscle Power 29 Light Graphite Badminton Racquet", "sports-fitness", "badminton", 2199, "High modulus graphite frame, Isometric head shape with Muscle Power shock absorption", 0, 45, 4.8, 380],
  [1002, "Boldfit Anti-Skid Yoga Mat 6mm with Carrying Strap (Navy Blue)", "sports-fitness", "fitness-accessories", 799, "Eco-friendly TPE material, double-sided non-slip grip, sweat-resistant & easy to clean", 1, 60, 4.7, 490],
];

export const INITIAL_PRODUCTS: Product[] = SEED_PRODUCTS_RAW.map(p => ({
  id: p[0],
  name: p[1],
  category: p[2],
  sub_category: p[3],
  price: p[4],
  description: p[5],
  is_organic: Boolean(p[6]),
  stock: p[7],
  average_rating: p[8],
  review_count: p[9],
  image_url: getProductImageUrl(p[1], p[2], p[3]),
}));

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    vip_level: "Cartwise Plus Member",
    preferences: {
      dietary_tags: ["100% Genuine", "Certified Organic", "Best Value"],
      health_goals: ["Top Tech Deals", "Immunity & Wellness", "Daily Essentials"],
      max_spend_budget: 25000,
      copilot_tone: "wholesale-deal-finder",
    },
    addresses: [
      {
        id: 1,
        user_id: 1,
        label: "Home",
        recipient_name: "Rahul Sharma",
        phone: "+91 98765 43210",
        street: "Flat 4B, Greenwood Park, Action Area 2",
        city: "Kolkata",
        state: "West Bengal",
        zip_code: "700156",
        country: "India",
        is_default: true,
      },
    ],
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    product_id: 101,
    rating: 5,
    reviewer_name: "Amit Chatterjee",
    review_text: "Motorola edge 70 Fusion has the best curved screen and camera in under ₹30,000! Super fast delivery.",
  },
  {
    id: 2,
    product_id: 102,
    rating: 5,
    reviewer_name: "Priya Nair",
    review_text: "iPhone 15 is worth every rupee. Brilliant camera and 15-minute delivery was unbelievable!",
  },
  {
    id: 3,
    product_id: 201,
    rating: 5,
    reviewer_name: "Siddharth Roy",
    review_text: "ASUS Vivobook 15 OLED display is stunning for video editing and movies. Best laptop under 60k.",
  },
  {
    id: 4,
    product_id: 601,
    rating: 5,
    reviewer_name: "Vikram Malhotra",
    review_text: "Best organic raw honey I have tasted. 100% authentic and unadulterated.",
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1040,
    user_id: 1,
    total: 349.0,
    status: "delivered",
    tracking_status: "out_for_delivery",
    created_at: "2026-03-07 11:30:00",
    payment_id: "pay_upi_gpay_1040",
    payment_method: "upi",
    delivery_slot: "15-Min Express Delivery",
    estimated_delivery_time: "12 mins",
    delivery_partner: {
      name: "Ramesh Kumar",
      phone: "+91 98451 22890",
      vehicle: "Ather 450X EV (WB-02-HA-8821)",
      badge: "CartWise Delivery Partner",
      rating: 4.9,
    },
    items: [
      {
        id: 1,
        order_id: 1040,
        product_id: 601,
        product_name: "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)",
        unit_price: 349.0,
        quantity: 1,
      },
    ],
  },
  {
    id: 1039,
    user_id: 1,
    total: 25.97,
    status: "delivered",
    tracking_status: "delivered",
    created_at: "2026-03-05 09:15:00",
    payment_id: "pay_card_1039",
    payment_method: "card",
    delivery_slot: "Morning Slot (7 AM - 10 AM)",
    estimated_delivery_time: "Delivered",
    items: [
      {
        id: 1,
        order_id: 1039,
        product_id: 1,
        product_name: "Organic Raw Honey",
        unit_price: 14.99,
        quantity: 1,
      },
      {
        id: 2,
        order_id: 1039,
        product_id: 18,
        product_name: "Rolled Oats",
        unit_price: 5.49,
        quantity: 2,
      },
    ],
  },
];

export const INITIAL_USER_ADDRESSES: UserAddressRecord[] = [
  {
    id: 1,
    user_id: 1,
    name: "Maya Sterling",
    phone: "+91 98765 43210",
    street_address: "Penthouse 4B, 742 Evergreen Terrace",
    landmark: "Bellandur Outer Ring Road",
    city: "Bengaluru",
    pincode: "560103",
    type: "Home",
    is_default: true,
    created_at: "2026-03-01 10:00:00",
  },
  {
    id: 2,
    user_id: 1,
    name: "Maya Sterling (Work)",
    phone: "+91 98765 43210",
    street_address: "BioTech Innovation Hub, Block 3A, Ecospace",
    landmark: "Opposite Tech Park Gate 2",
    city: "Bengaluru",
    pincode: "560103",
    type: "Work",
    is_default: false,
    created_at: "2026-03-02 14:30:00",
  },
];
