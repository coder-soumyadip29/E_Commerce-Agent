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

// Setup Tables with sub_category support
db.exec(`
  CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT,
      price REAL NOT NULL,
      description TEXT,
      is_organic INTEGER DEFAULT 0,
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
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
`);

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

// Comprehensive Product Catalog matching user categories & sub-categories
// [id, name, category, sub_category, price, description, is_organic, stock]
const products: Array<[number, string, string, string, number, string, number, number]> = [
  // 1. Fruits & Vegetables (fruits-vegetables)
  // Fresh Fruits (fresh-fruits)
  [1,  "Organic Alphonso Mangoes (1kg)",        "fruits-vegetables", "fresh-fruits",        12.99, "Naturally ripened sweet organic Alphonso mangoes from Ratnagiri", 1, 25],
  [2,  "Shimla Royal Red Apples (1kg)",         "fruits-vegetables", "fresh-fruits",         5.99, "Crisp, sweet, and juicy handpicked royal red apples",             0, 30],
  [3,  "Organic Cavendish Bananas (1 Dozen)",   "fruits-vegetables", "fresh-fruits",         3.49, "Farm fresh sweet organic bananas rich in potassium",              1, 40],
  [4,  "Nagpur Sweet Oranges (1kg)",            "fruits-vegetables", "fresh-fruits",         4.99, "Juicy and tangy sweet oranges rich in Vitamin C",                 0, 25],
  [5,  "Organic Pomegranate (500g)",            "fruits-vegetables", "fresh-fruits",         6.49, "Ruby-red antioxidant-rich organic pomegranate pearls",            1, 20],
  [6,  "Fresh Strawberries (250g Box)",         "fruits-vegetables", "fresh-fruits",         4.99, "Sweet aromatic farm-picked fresh red strawberries",               1, 15],
  [7,  "Organic Papaya (1 unit)",               "fruits-vegetables", "fresh-fruits",         3.99, "Sweet digestive-friendly ripe organic papaya",                    1, 20],
  [8,  "Seedless Watermelon (Whole ~2.5kg)",    "fruits-vegetables", "fresh-fruits",         5.49, "Crisp, ultra-hydrating sweet red seedless watermelon",            0, 15],

  // Fresh Vegetables (fresh-vegetables)
  [9,  "Farm Fresh Hybrid Tomatoes (1kg)",      "fruits-vegetables", "fresh-vegetables",     2.99, "Plump, ripe red tomatoes ideal for curries and salads",          0, 50],
  [10, "Organic Red Onions (1kg)",              "fruits-vegetables", "fresh-vegetables",     3.29, "Crisp and pungent organic red onions, kitchen essential",         1, 45],
  [11, "Russet Potatoes (1kg)",                 "fruits-vegetables", "fresh-vegetables",     2.49, "All-purpose fresh earthy potatoes for baking and cooking",        0, 60],
  [12, "Organic Orange Carrots (500g)",         "fruits-vegetables", "fresh-vegetables",     2.99, "Sweet crunchy organic carrots rich in beta-carotene",             1, 35],
  [13, "Green Bell Peppers (Capsicum 500g)",    "fruits-vegetables", "fresh-vegetables",     3.49, "Crisp vibrant green bell peppers, great for stir-fries",          0, 25],
  [14, "Organic Broccoli Florets (400g)",       "fruits-vegetables", "fresh-vegetables",     4.49, "Nutrient-packed crisp organic green broccoli florets",            1, 20],
  [15, "English Seedless Cucumbers (500g)",     "fruits-vegetables", "fresh-vegetables",     2.29, "Cool refreshing thin-skinned English cucumbers",                  0, 30],

  // Leafy Greens & Herbs (leafy-greens-herbs)
  [16, "Organic Baby Spinach (250g)",           "fruits-vegetables", "leafy-greens-herbs",   3.99, "Tender pesticide-free organic baby spinach leaves",               1, 25],
  [17, "Fresh Organic Coriander (Bunch)",       "fruits-vegetables", "leafy-greens-herbs",   1.49, "Aromatic fresh green cilantro leaves for garnishing",             1, 40],
  [18, "Fresh Garden Mint Leaves (Bunch)",      "fruits-vegetables", "leafy-greens-herbs",   1.49, "Cool invigorating fresh mint leaves for teas and chutneys",       0, 35],
  [19, "Organic Tuscan Kale (200g)",            "fruits-vegetables", "leafy-greens-herbs",   4.29, "Hearty superfood dark green organic kale leaves",                 1, 20],

  // 2. Staples (staples)
  // Rice & Rice Products (rice-rice-products)
  [20, "Royal Aged Basmati Rice (5kg)",         "staples",           "rice-rice-products",  18.99, "Extra-long grain aromatic aged basmati rice for biryanis",        0, 30],
  [21, "Organic Brown Rice (1kg)",              "staples",           "rice-rice-products",   7.99, "Nutritious whole grain long-grain organic brown rice",            1, 25],
  [22, "Sona Masoori Raw Rice (5kg)",           "staples",           "rice-rice-products",  14.49, "Lightweight daily-use South Indian aromatic white rice",          0, 30],
  [23, "Organic Thick Poha / Flattened Rice (500g)", "staples",      "rice-rice-products",   2.99, "Clean wholesome organic flattened rice for quick breakfast",      1, 25],

  // Atta, Flours & Sooji (atta-flours-sooji)
  [24, "Organic 100% Whole Wheat Atta (5kg)",   "staples",           "atta-flours-sooji",   12.99, "Stone-ground organic whole wheat flour for soft rotis",           1, 35],
  [25, "Multigrain Super Flour (5kg)",          "staples",           "atta-flours-sooji",   14.99, "Enriched flour blend with ragi, oats, chana, and wheat",          1, 25],
  [26, "Organic Besan / Gram Flour (1kg)",      "staples",           "atta-flours-sooji",    4.49, "Fine milled pure organic chickpea gram flour",                    1, 30],
  [27, "Roasted Semolina / Sooji (1kg)",        "staples",           "atta-flours-sooji",    3.49, "Pre-roasted granulated wheat sooji for halwa and upma",           0, 25],

  // Pulses & Lentils (pulses-lentils)
  [28, "Organic Toor / Arhar Dal (1kg)",        "staples",           "pulses-lentils",       5.49, "Unpolished protein-rich organic yellow pigeon peas",              1, 40],
  [29, "Organic Yellow Moong Dal (1kg)",        "staples",           "pulses-lentils",       4.99, "Split yellow moong dal, easy to digest and nutritious",           1, 35],
  [30, "Organic Chana Dal (1kg)",               "staples",           "pulses-lentils",       4.29, "High-fiber split Bengal gram lentils",                            1, 30],
  [31, "Whole Black Urad Dal (1kg)",            "staples",           "pulses-lentils",       4.99, "Premium whole black gram for authentic Dal Makhani",              0, 25],
  [32, "Organic Masoor Dal / Red Lentils (1kg)","staples",           "pulses-lentils",       3.99, "Quick-cooking organic split red lentils",                         1, 30],

  // Millets & Oats (millets-oats)
  [33, "Organic Whole Grain Rolled Oats (1kg)", "staples",           "millets-oats",         5.49, "Heart-healthy 100% whole grain rolled oats for porridge",         1, 40],
  [34, "Traditional Steel-Cut Oats (1kg)",      "staples",           "millets-oats",         6.99, "Coarse hearty steel-cut oats with low glycemic index",            0, 30],
  [35, "Organic Foxtail Millet (1kg)",          "staples",           "millets-oats",         5.99, "Ancient gluten-free grain rich in minerals and fiber",            1, 25],
  [36, "Organic Ragi / Finger Millet Flour (1kg)","staples",         "millets-oats",         4.49, "Calcium-rich sprouted organic finger millet flour",               1, 30],

  // Salt, Sugar & Jaggery (salt-sugar-jaggery)
  [37, "Himalayan Pink Salt (1kg)",             "staples",           "salt-sugar-jaggery",   3.99, "100% natural unrefined mineral-rich pink rock salt",              1, 50],
  [38, "Organic Raw Cane Sugar (1kg)",          "staples",           "salt-sugar-jaggery",   4.49, "Unbleached organic granulated cane sugar",                        1, 40],
  [39, "Pure Organic Jaggery Powder (1kg)",     "staples",           "salt-sugar-jaggery",   4.99, "Traditional unrefined organic gur powder sweetener",              1, 35],

  // 3. Spices & Masalas (spices-masalas)
  // Whole Spices (whole-spices)
  [40, "Green Cardamom / Elaichi (100g)",       "spices-masalas",    "whole-spices",         8.99, "Fragrant green cardamom pods from Kerala hills",                  1, 25],
  [41, "Organic Whole Black Pepper (100g)",     "spices-masalas",    "whole-spices",         4.99, "Bold Malabar organic whole black peppercorns",                    1, 30],
  [42, "Ceylon Cinnamon Sticks (100g)",         "spices-masalas",    "whole-spices",         5.49, "True sweet aromatic organic Ceylon cinnamon quills",              1, 25],
  [43, "Organic Cumin Seeds / Jeera (200g)",    "spices-masalas",    "whole-spices",         3.99, "Sun-dried aromatic whole cumin seeds",                            1, 40],
  [44, "Whole Cloves / Laung (100g)",           "spices-masalas",    "whole-spices",         4.49, "Handpicked premium whole aromatic cloves",                        0, 30],

  // Ground Spices (ground-spices)
  [45, "Organic Lakadong Turmeric Powder (200g)","spices-masalas",   "ground-spices",        4.99, "High-curcumin organic Meghalaya turmeric powder",                 1, 40],
  [46, "Kashmiri Red Chilli Powder (200g)",     "spices-masalas",    "ground-spices",        4.49, "Vibrant natural red color with mild aromatic heat",               0, 35],
  [47, "Organic Coriander Powder / Dhaniya (200g)","spices-masalas", "ground-spices",        3.49, "Freshly ground fragrant organic coriander seed powder",           1, 35],

  // Masala Blends (masala-blends)
  [48, "Royal Biryani Masala Blend (100g)",     "spices-masalas",    "masala-blends",        3.99, "Authentic blend of 15 royal spices for fragrant biryani",         0, 30],
  [49, "Organic Garam Masala (100g)",           "spices-masalas",    "masala-blends",        4.29, "Traditional roasted whole spice blend for curries",               1, 30],
  [50, "Madras Sambhar Masala (100g)",          "spices-masalas",    "masala-blends",        3.49, "Authentic South Indian aromatic roasted lentil & spice mix",      0, 25],

  // 4. Oils & Ghee (oils-ghee)
  // Cooking Oils (cooking-oils)
  [51, "Organic Extra Virgin Olive Oil (500ml)","oils-ghee",         "cooking-oils",        16.99, "Cold-pressed unfiltered organic EVOO from Mediterranean olives",  1, 20],
  [52, "Cold-Pressed Virgin Coconut Oil (500ml)","oils-ghee",        "cooking-oils",        12.49, "Pure raw cold-pressed organic coconut oil for cooking & skin",    1, 25],
  [53, "Cold-Pressed Mustard Oil / Kachi Ghani (1L)","oils-ghee",    "cooking-oils",         6.99, "Pungent traditional cold-pressed mustard seed oil",              0, 30],
  [54, "Organic Cold-Pressed Groundnut Oil (1L)","oils-ghee",        "cooking-oils",         8.99, "Pure wood-pressed peanut oil with high smoke point",              1, 20],
  [55, "Cold-Pressed Avocado Oil (500ml)",      "oils-ghee",         "cooking-oils",        18.99, "Premium extra virgin avocado oil with 500°F smoke point",         0, 15],

  // Ghee (ghee)
  [56, "Pure Desi Cow Ghee (A2 Bilona 500ml)",  "oils-ghee",         "ghee",                19.99, "Traditional Vedic bilona churned A2 cow milk ghee, golden & nutty",1, 20],
  [57, "Organic Cultured Grass-Fed Ghee (500ml)","oils-ghee",        "ghee",                17.49, "Clarified butter made from certified organic pasture-fed cream",   1, 25],

  // 5. Dry Fruits & Nuts (dry-fruits-nuts)
  // Nuts (nuts)
  [58, "Organic California Almonds (500g)",     "dry-fruits-nuts",   "nuts",                11.99, "Raw, crunchy, unpasteurized premium organic almonds",            1, 35],
  [59, "Whole Roasted Cashews (500g)",          "dry-fruits-nuts",   "nuts",                 9.99, "Lightly sea-salted dry-roasted jumbo cashew nuts",                0, 30],
  [60, "Raw California Walnut Kernels (250g)",  "dry-fruits-nuts",   "nuts",                 7.99, "Omega-3 rich fresh halves and pieces of raw walnuts",             1, 25],
  [61, "Roasted Salted Pistachios (250g)",      "dry-fruits-nuts",   "nuts",                 6.99, "In-shell lightly salted crunchy roasted pistachios",              0, 25],

  // Dried Fruits (dried-fruits)
  [62, "Premium Medjool Dates (500g)",          "dry-fruits-nuts",   "dried-fruits",         8.99, "Large, soft, and caramel-sweet organic Medjool dates",            1, 30],
  [63, "Organic Dried Mango Slices (200g)",     "dry-fruits-nuts",   "dried-fruits",         7.99, "Unsweetened chewy organic dried mango slices, no sulfites",       1, 25],
  [64, "Golden Afghani Raisins / Kishmish (250g)","dry-fruits-nuts", "dried-fruits",         4.49, "Seedless sweet sun-dried golden raisins",                         0, 30],
  [65, "Organic Dried Turkish Figs / Anjeer (250g)","dry-fruits-nuts","dried-fruits",        8.49, "High-fiber soft and sweet organic sun-dried figs",                1, 20],

  // Seeds (seeds)
  [66, "Organic Black Chia Seeds (250g)",       "dry-fruits-nuts",   "seeds",                8.49, "Organic raw chia seeds packed with fiber and omega-3s",           1, 40],
  [67, "Raw Pumpkin Seeds (250g)",              "dry-fruits-nuts",   "seeds",                5.99, "Zinc-rich unsalted raw green pumpkin seed kernels",               1, 30],
  [68, "Roasted Sunflower Seeds (250g)",        "dry-fruits-nuts",   "seeds",                4.49, "Crisp lightly toasted sunflower seeds for snacks and salads",     0, 35],

  // 6. Dairy & Eggs (dairy-eggs)
  // Milk, Curd & Beverages (milk-curd-beverages)
  [69, "Organic Whole Pasteurized Milk (1L)",   "dairy-eggs",        "milk-curd-beverages",  3.49, "Fresh pasture-raised organic whole milk with cream top",          1, 40],
  [70, "Organic Almond Milk (Unsweetened 1L)",  "dairy-eggs",        "milk-curd-beverages",  4.99, "Fortified plant-based organic almond milk with zero added sugar", 1, 35],
  [71, "Barista Style Oat Milk (1L)",           "dairy-eggs",        "milk-curd-beverages",  4.49, "Creamy foaming oat milk designed for lattes and smoothies",       0, 30],
  [72, "Artisan Greek Yogurt / Dahi (400g)",    "dairy-eggs",        "milk-curd-beverages",  3.99, "Thick, protein-dense probiotic strained Greek yogurt",            1, 25],

  // Paneer, Butter & Cheese (paneer-butter-cheese)
  [73, "Fresh Malai Paneer (200g)",             "dairy-eggs",        "paneer-butter-cheese", 3.99, "Soft, melt-in-mouth cottage cheese paneer blocks",                 0, 30],
  [74, "Organic Unsalted Grass-Fed Butter (250g)","dairy-eggs",      "paneer-butter-cheese", 4.99, "Rich golden butter churned from grass-fed organic cream",         1, 25],
  [75, "Aged White Cheddar Cheese (200g)",      "dairy-eggs",        "paneer-butter-cheese", 5.99, "Sharp and tangy 12-month aged white cheddar cheese",             0, 20],

  // Eggs (eggs)
  [76, "Organic Free-Range Brown Eggs (Pack of 12)","dairy-eggs",    "eggs",                 5.99, "Certified humane pasture-raised organic brown eggs with golden yolks",1, 40],
  [77, "Farm Fresh White Eggs (Pack of 6)",     "dairy-eggs",        "eggs",                 2.49, "Daily fresh farm-collected grade A white eggs",                   0, 50],

  // 7. Meat & Fish (meat-fish)
  // Chicken (chicken)
  [78, "Fresh Boneless Chicken Breast (500g)",  "meat-fish",         "chicken",              6.99, "Antibiotic-free tender skinless chicken breast fillets",          0, 25],
  [79, "Organic Free-Range Chicken Curry Cut (500g)","meat-fish",    "chicken",              7.49, "Freshly cut skinless organic chicken with bones for curries",     1, 20],

  // Mutton (mutton)
  [80, "Tender Goat Mutton Curry Cut (500g)",   "meat-fish",         "mutton",              11.99, "Freshly trimmed tender bone-in goat mutton pieces",               0, 15],
  [81, "Fresh Lean Mutton Keema / Mince (500g)","meat-fish",         "mutton",              12.99, "Finely ground fresh mutton mince for kebabs and keema curry",     0, 15],

  // Fish & Seafood (fish-seafood)
  [82, "Fresh Atlantic Salmon Fillet (300g)",   "meat-fish",         "fish-seafood",        14.99, "Rich in omega-3 wild-caught fresh salmon fillet portion",        0, 15],
  [83, "Cleaned & Deveined Tiger Prawns (250g)","meat-fish",         "fish-seafood",        10.99, "Fresh sweet jumbo tiger prawns ready to cook",                   0, 20],
  [84, "Fresh Rohu Fish Steaks (500g)",         "meat-fish",         "fish-seafood",         7.99, "Freshwater clean-cut rohu fish steaks for traditional fish curry",0, 20],

  // 8. Beverages (beverages)
  // Tea & Coffee (tea-coffee)
  [85, "Organic Japanese Sencha Green Tea (50 Bags)","beverages",    "tea-coffee",          12.99, "High-antioxidant steamed Japanese green tea bags",                1, 30],
  [86, "Assam Golden CTC Black Tea (500g)",     "beverages",         "tea-coffee",           8.49, "Strong, brisk, full-bodied black tea for traditional Masala Chai",0, 35],
  [87, "Organic Chamomile Herbal Tea (30 Bags)","beverages",         "tea-coffee",           8.99, "Calming caffeine-free whole chamomile flower infusion",           1, 25],
  [88, "Single-Origin Ethiopian Arabica Beans (250g)","beverages",   "tea-coffee",          16.99, "Medium roast whole bean coffee with floral & citrus notes",       1, 20],
  [89, "Dark Roast Italian Espresso Blend (250g)","beverages",       "tea-coffee",          14.49, "Bold ground espresso blend with notes of dark chocolate",         0, 25],

  // Juices & Water (juices-water)
  [90, "100% Cold-Pressed Valencia Orange Juice (1L)","beverages",   "juices-water",         5.99, "Pure raw squeezed orange juice with pulp, no added sugar",        1, 25],
  [91, "Natural Sparkling Mineral Water (750ml)","beverages",        "juices-water",         2.99, "Effervescent mountain spring water in glass bottle",              0, 40],
  [92, "Organic Tender Coconut Water (330ml)",  "beverages",         "juices-water",         3.29, "Electrolyte-rich pure organic coconut water",                     1, 35],

  // 9. Snacks & Packaged Foods (snacks-packaged-foods)
  // Biscuits & Snacks (biscuits-snacks)
  [93, "Organic Oat & Honey Crunch Cookies (200g)","snacks-packaged-foods","biscuits-snacks",4.49,"Wholesome whole oat cookies sweetened with pure honey",          1, 30],
  [94, "Roasted Multigrain Makhana / Foxnuts (100g)","snacks-packaged-foods","biscuits-snacks",3.99,"Light crunchy roasted lotus seeds with pink salt",             1, 35],
  [95, "Gourmet Trail Mix with Nuts & Berries (250g)","snacks-packaged-foods","biscuits-snacks",8.49,"Premium mix of almonds, cranberries, pumpkin seeds, and M&Ms",0, 25],

  // Noodles, Pasta & Cereals (noodles-pasta-cereals)
  [96, "Organic Whole Wheat Fusilli Pasta (500g)","snacks-packaged-foods","noodles-pasta-cereals",4.99,"Italian bronze-cut durum whole wheat spiral pasta",          1, 30],
  [97, "Multi-Millet Hakka Noodles (200g)",     "snacks-packaged-foods","noodles-pasta-cereals",3.49,"Air-dried non-fried noodles made from ragi, jowar and wheat",   1, 25],
  [98, "Organic Honey Almond Granola (400g)",   "snacks-packaged-foods","noodles-pasta-cereals",9.99,"Toasted oat clusters with sliced almonds and raw wildflower honey",1, 25],

  // Spreads, Sauces & Pickles (spreads-sauces-pickles)
  [99, "Organic Raw Forest Honey (500g)",       "snacks-packaged-foods","spreads-sauces-pickles",14.99,"Unfiltered cold-extracted raw wild forest honey",            1, 30],
  [100,"Organic Manuka Honey UMF 10+ (250g)",   "snacks-packaged-foods","spreads-sauces-pickles",29.99,"Medical-grade certified raw New Zealand Manuka honey",        1, 15],
  [101,"All-Natural Crunchy Peanut Butter (500g)","snacks-packaged-foods","spreads-sauces-pickles",5.99,"100% roasted peanuts, zero palm oil or hydrogenated fats", 1, 35],
  [102,"Traditional Mango Pickle in Mustard Oil (300g)","snacks-packaged-foods","spreads-sauces-pickles",3.99,"Authentic sun-cured spiced raw mango pickle",        0, 30],

  // 10. Bakery & Breads (bakery-breads)
  // Breads & Buns (breads-buns)
  [103,"100% Whole Wheat Sourdough Loaf (450g)","bakery-breads",    "breads-buns",          5.49, "Naturally fermented artisan sourdough with crispy crust",         1, 20],
  [104,"Artisan 7-Grain Multigrain Bread (400g)","bakery-breads",   "breads-buns",          4.99, "Soft sliced loaf crusted with flax, oats, and sunflower seeds",   1, 25],
  [105,"Brioche Gourmet Burger Buns (Pack of 4)","bakery-breads",   "breads-buns",          3.99, "Buttery, golden, glossy French brioche hamburger buns",           0, 20],
];

const insertProduct = db.prepare(
  "INSERT INTO products (id, name, category, sub_category, price, description, is_organic, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

db.transaction(() => {
  for (const p of products) {
    insertProduct.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]);
  }
})();

console.log(`Inserted ${products.length} products across all 10 categories and sub-categories.`);

// Reviews Seeding
const sampleReviews: Array<[number, number, string, string]> = [
  [1,  5.0, "Priya S.",    "Best Alphonso mangoes I've ever ordered online! So sweet and aromatic."],
  [1,  4.5, "Rahul K.",    "Very fresh and juicy. Delivered without any bruises."],
  [3,  5.0, "Amit M.",     "Fresh sweet bananas, perfect for daily smoothies."],
  [9,  4.5, "Anjali R.",   "Firm red tomatoes, lasted almost two weeks in the fridge."],
  [16, 5.0, "Vikram N.",   "Very crisp and clean organic baby spinach."],
  [20, 5.0, "Sunita D.",   "Incredible fragrance and long grains for my Sunday biryani."],
  [24, 5.0, "Rohan G.",    "Rotis come out so soft and fluffy with this organic atta."],
  [28, 4.5, "Meera T.",    "Authentic unpolished toor dal, cooks very fast."],
  [33, 5.0, "Daniel B.",   "Great everyday breakfast oats, high fiber and very fresh."],
  [40, 5.0, "Kavita S.",   "Super fragrant green cardamom pods, excellent quality."],
  [45, 5.0, "Arun V.",     "High curcumin turmeric, beautiful vibrant golden color."],
  [51, 5.0, "Elena M.",    "Best cold-pressed extra virgin olive oil for salad dressings."],
  [56, 5.0, "Rajesh P.",   "Pure A2 Vedic desi cow ghee, amazing aroma and granular texture!"],
  [58, 5.0, "Nate W.",     "Crunchy, fresh, and large size organic almonds."],
  [62, 5.0, "Sarah H.",    "Soft, caramel-like sweet Medjool dates. Highest quality."],
  [69, 4.5, "David C.",    "Tastes like real farm milk, so rich and fresh."],
  [76, 5.0, "Jessica T.",  "Golden orange yolks, best organic pasture-raised eggs."],
  [85, 5.0, "Taro K.",     "Very authentic Japanese sencha green tea flavor."],
  [99, 5.0, "Alice M.",    "Amazing raw honey! Pure and unfiltered."],
  [103,5.0, "Marcus L.",   "Perfect sourdough crust and airy texture, love this bakery bread."]
];

const insertReview = db.prepare(
  "INSERT INTO reviews (product_id, rating, reviewer_name, review_text) VALUES (?, ?, ?, ?)"
);

db.transaction(() => {
  for (const r of sampleReviews) {
    insertReview.run(r[0], r[1], r[2], r[3]);
  }
})();

// Historic orders seeding
db.exec("UPDATE sqlite_sequence SET seq = 1038 WHERE name = 'orders'");
db.exec("INSERT OR IGNORE INTO sqlite_sequence (name, seq) VALUES ('orders', 1038)");

const insertOrder = db.prepare(
  "INSERT INTO orders (id, total, status, created_at) VALUES (?, ?, ?, ?)"
);
const insertOrderItem = db.prepare(
  "INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)"
);

db.transaction(() => {
  // Order #1039
  insertOrder.run(1039, 25.97, "delivered", "2024-09-20 14:30:00");
  insertOrderItem.run(1039, 99, "Organic Raw Forest Honey (500g)", 14.99, 1);
  insertOrderItem.run(1039, 33, "Organic Whole Grain Rolled Oats (1kg)", 5.49, 2);

  // Order #1040
  insertOrder.run(1040, 21.98, "transit", "2024-09-25 10:15:00");
  insertOrderItem.run(1040, 85, "Organic Japanese Sencha Green Tea (50 Bags)", 12.99, 1);
  insertOrderItem.run(1040, 87, "Organic Chamomile Herbal Tea (30 Bags)", 8.99, 1);

  // Order #1041
  insertOrder.run(1041, 20.48, "delivered", "2024-09-28 09:45:00");
  insertOrderItem.run(1041, 58, "Organic California Almonds (500g)", 11.99, 1);
  insertOrderItem.run(1041, 66, "Organic Black Chia Seeds (250g)", 8.49, 1);
})();

db.exec("UPDATE sqlite_sequence SET seq = 1041 WHERE name = 'orders'");

console.log("Database seeded successfully with all 10 categories!");
