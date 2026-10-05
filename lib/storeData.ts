import { Product, Review, Order, UserProfile, UserAddress } from "./types";

export function getProductImageUrl(name: string, category: string, subCategory?: string): string {
  const lower = (name + " " + category + " " + (subCategory || "")).toLowerCase();

  // Test local images priority
  if (lower.includes("avocado") && lower.includes("oil")) return "/images/avocado_oil.png";
  if (lower.includes("sunflower")) return "/images/sunflower_oil.png";
  if (lower.includes("steel-cut") || lower.includes("steel cut")) return "/images/steel_cut_oats.png";
  if (lower.includes("rolled oat") || lower.includes("rolled")) return "/images/rolled_oats.png";
  if (lower.includes("wildflower honey")) return "/images/wildflower_honey.png";
  if (lower.includes("orange blossom honey")) return "/images/orange_blossom_honey.png";
  if (lower.includes("raw forest honey") || lower.includes("raw honey")) return "/images/honey.png";
  if (lower.includes("olive oil") || (lower.includes("olive") && lower.includes("oil"))) return "/images/olive_oil.png";

  // Real food photography URLs matching specific organic products
  if (lower.includes("mango") && !lower.includes("dried")) return "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("apple")) return "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("banana")) return "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("orange") && !lower.includes("honey")) return "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("pomegranate")) return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("strawberr")) return "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("papaya")) return "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("watermelon")) return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("tomato")) return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("onion")) return "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("potato")) return "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("carrot")) return "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("bell pepper") || lower.includes("capsicum")) return "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("broccoli")) return "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("cucumber")) return "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("spinach")) return "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("coriander") || lower.includes("cilantro")) return "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("mint")) return "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("kale")) return "https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?auto=format&fit=crop&w=600&q=80";

  // Staples & Grains
  if (lower.includes("basmati") || lower.includes("sona masoori") || lower.includes("white rice")) return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("brown rice")) return "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("poha") || lower.includes("flattened rice")) return "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("atta") || lower.includes("flour") || lower.includes("besan") || lower.includes("sooji") || lower.includes("semolina")) return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("dal") || lower.includes("lentil") || lower.includes("urad") || lower.includes("chana") || lower.includes("moong") || lower.includes("toor")) return "https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("millet") || lower.includes("ragi")) return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("oat")) return "/images/rolled_oats.png";
  if (lower.includes("salt")) return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("sugar") || lower.includes("jaggery")) return "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=600&q=80";

  // Spices & Masalas
  if (lower.includes("cardamom") || lower.includes("clove") || lower.includes("cinnamon") || lower.includes("cumin") || lower.includes("pepper")) return "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("turmeric") || lower.includes("chilli") || lower.includes("dhaniya") || lower.includes("masala") || lower.includes("sambhar")) return "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80";

  // Oils & Ghee
  if (lower.includes("coconut oil")) return "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("ghee")) return "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("oil")) return "/images/olive_oil.png";

  // Dry Fruits & Nuts
  if (lower.includes("almond")) return "https://images.unsplash.com/photo-1508061252445-5350f31934b0?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("cashew")) return "https://images.unsplash.com/photo-1536591375315-1b83681498b8?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("walnut")) return "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("pistachio")) return "https://images.unsplash.com/photo-1577003833619-76bbd7f82948?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("date")) return "https://images.unsplash.com/photo-1562080340-9759c5d18d45?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("dried mango") || lower.includes("raisin") || lower.includes("fig") || lower.includes("chia") || lower.includes("pumpkin") || lower.includes("sunflower seed")) return "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80";

  // Dairy & Eggs
  if (lower.includes("milk")) return "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("yogurt") || lower.includes("curd") || lower.includes("paneer")) return "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("butter")) return "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("cheese") || lower.includes("cheddar")) return "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("egg")) return "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80";

  // Meat & Fish
  if (lower.includes("chicken")) return "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("mutton") || lower.includes("goat") || lower.includes("meat")) return "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("salmon") || lower.includes("fish") || lower.includes("prawn")) return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80";

  // Beverages
  if (lower.includes("tea")) return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("coffee") || lower.includes("espresso") || lower.includes("arabica")) return "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("juice") || lower.includes("coconut water") || lower.includes("water")) return "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80";

  // Snacks & Bakery
  if (lower.includes("cookie") || lower.includes("biscuit") || lower.includes("makhana") || lower.includes("trail mix")) return "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("pasta") || lower.includes("noodle") || lower.includes("granola")) return "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("manuka honey") || lower.includes("honey")) return "/images/honey.png";
  if (lower.includes("peanut butter")) return "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("pickle")) return "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80";
  if (lower.includes("sourdough") || lower.includes("bread") || lower.includes("bun") || lower.includes("brioche")) return "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80";

  // Category-level fallback with distinct high-definition photography
  if (category.includes("fruit") || category.includes("veg")) {
    return "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80";
  }
  if (category.includes("staple") || category.includes("grain")) {
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
  }
  if (category.includes("spice") || category.includes("masala")) {
    return "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80";
  }
  if (category.includes("oil") || category.includes("ghee")) {
    return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80";
  }
  if (category.includes("nut") || category.includes("dry-fruit")) {
    return "https://images.unsplash.com/photo-1508061252445-5350f31934b0?auto=format&fit=crop&w=600&q=80";
  }
  if (category.includes("dairy") || category.includes("egg")) {
    return "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80";
  }
  if (category.includes("meat") || category.includes("fish")) {
    return "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80";
  }
  if (category.includes("beverage") || category.includes("tea") || category.includes("coffee")) {
    return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80";
  }
  if (category.includes("baker") || category.includes("bread")) {
    return "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
}

export const SEED_PRODUCTS_RAW: Array<[number, string, string, string, number, string, number, number, number, number]> = [
  // id, name, category, sub_category, price, description, is_organic, stock, average_rating, review_count
  [1,  "Organic Alphonso Mangoes (1kg)",        "fruits-vegetables", "fresh-fruits",        12.99, "Naturally ripened sweet organic Alphonso mangoes from Ratnagiri", 1, 25, 4.75, 2],
  [2,  "Shimla Royal Red Apples (1kg)",         "fruits-vegetables", "fresh-fruits",         5.99, "Crisp, sweet, and juicy handpicked royal red apples",             0, 30, 4.3, 1],
  [3,  "Organic Cavendish Bananas (1 Dozen)",   "fruits-vegetables", "fresh-fruits",         3.49, "Farm fresh sweet organic bananas rich in potassium",              1, 40, 5.0, 1],
  [4,  "Nagpur Sweet Oranges (1kg)",            "fruits-vegetables", "fresh-fruits",         4.99, "Juicy and tangy sweet oranges rich in Vitamin C",                 0, 25, 4.2, 1],
  [5,  "Organic Pomegranate (500g)",            "fruits-vegetables", "fresh-fruits",         6.49, "Ruby-red antioxidant-rich organic pomegranate pearls",            1, 20, 4.6, 1],
  [6,  "Fresh Strawberries (250g Box)",         "fruits-vegetables", "fresh-fruits",         4.99, "Sweet aromatic farm-picked fresh red strawberries",               1, 0, 4.5, 1],
  [7,  "Organic Papaya (1 unit)",               "fruits-vegetables", "fresh-fruits",         3.99, "Sweet digestive-friendly ripe organic papaya",                    1, 20, 4.4, 1],
  [8,  "Seedless Watermelon (Whole ~2.5kg)",    "fruits-vegetables", "fresh-fruits",         5.49, "Crisp, ultra-hydrating sweet red seedless watermelon",            0, 15, 4.1, 1],
  [9,  "Farm Fresh Hybrid Tomatoes (1kg)",      "fruits-vegetables", "fresh-vegetables",     2.99, "Plump, ripe red tomatoes ideal for curries and salads",          0, 50, 4.5, 1],
  [10, "Organic Red Onions (1kg)",              "fruits-vegetables", "fresh-vegetables",     3.29, "Crisp and pungent organic red onions, kitchen essential",         1, 45, 4.3, 1],
  [11, "Russet Potatoes (1kg)",                 "fruits-vegetables", "fresh-vegetables",     2.49, "All-purpose fresh earthy potatoes for baking and cooking",        0, 60, 4.0, 1],
  [12, "Organic Orange Carrots (500g)",         "fruits-vegetables", "fresh-vegetables",     2.99, "Sweet crunchy organic carrots rich in beta-carotene",             1, 35, 4.4, 1],
  [13, "Green Bell Peppers (Capsicum 500g)",    "fruits-vegetables", "fresh-vegetables",     3.49, "Crisp vibrant green bell peppers, great for stir-fries",          0, 25, 4.2, 1],
  [14, "Organic Broccoli Florets (400g)",       "fruits-vegetables", "fresh-vegetables",     4.49, "Nutrient-packed crisp organic green broccoli florets",            1, 20, 4.6, 1],
  [15, "English Seedless Cucumbers (500g)",     "fruits-vegetables", "fresh-vegetables",     2.29, "Cool refreshing thin-skinned English cucumbers",                  0, 30, 4.3, 1],
  [16, "Organic Baby Spinach (250g)",           "fruits-vegetables", "leafy-greens-herbs",   3.99, "Tender pesticide-free organic baby spinach leaves",               1, 25, 5.0, 1],
  [17, "Fresh Organic Coriander (Bunch)",       "fruits-vegetables", "leafy-greens-herbs",   1.49, "Aromatic fresh green cilantro leaves for garnishing",             1, 40, 4.5, 1],
  [18, "Fresh Garden Mint Leaves (Bunch)",      "fruits-vegetables", "leafy-greens-herbs",   1.49, "Cool invigorating fresh mint leaves for teas and chutneys",       0, 35, 4.4, 1],
  [19, "Organic Tuscan Kale (200g)",            "fruits-vegetables", "leafy-greens-herbs",   4.29, "Hearty superfood dark green organic kale leaves",                 1, 20, 4.7, 1],
  [20, "Royal Aged Basmati Rice (5kg)",         "staples",           "rice-rice-products",  18.99, "Extra-long grain aromatic aged basmati rice for biryanis",        0, 30, 5.0, 1],
  [21, "Organic Brown Rice (1kg)",              "staples",           "rice-rice-products",   7.99, "Nutritious whole grain long-grain organic brown rice",            1, 25, 4.6, 1],
  [22, "Sona Masoori Raw Rice (5kg)",           "staples",           "rice-rice-products",  14.49, "Lightweight daily-use South Indian aromatic white rice",          0, 30, 4.4, 1],
  [23, "Organic Thick Poha / Flattened Rice (500g)", "staples",      "rice-rice-products",   2.99, "Clean wholesome organic flattened rice for quick breakfast",      1, 25, 4.5, 1],
  [24, "Organic 100% Whole Wheat Atta (5kg)",   "staples",           "atta-flours-sooji",   12.99, "Stone-ground organic whole wheat flour for soft rotis",           1, 35, 5.0, 1],
  [25, "Multigrain Super Flour (5kg)",          "staples",           "atta-flours-sooji",   14.99, "Enriched flour blend with ragi, oats, chana, and wheat",          1, 25, 4.6, 1],
  [26, "Organic Besan / Gram Flour (1kg)",      "staples",           "atta-flours-sooji",    4.49, "Fine milled pure organic chickpea gram flour",                    1, 30, 4.5, 1],
  [27, "Roasted Semolina / Sooji (1kg)",        "staples",           "atta-flours-sooji",    3.49, "Pre-roasted granulated wheat sooji for halwa and upma",           0, 25, 4.2, 1],
  [28, "Organic Toor / Arhar Dal (1kg)",        "staples",           "pulses-lentils",       5.49, "Unpolished protein-rich organic yellow pigeon peas",              1, 40, 4.5, 1],
  [29, "Organic Yellow Moong Dal (1kg)",        "staples",           "pulses-lentils",       4.99, "Split yellow moong dal, easy to digest and nutritious",           1, 35, 4.7, 1],
  [30, "Organic Chana Dal (1kg)",               "staples",           "pulses-lentils",       4.29, "High-fiber split Bengal gram lentils",                            1, 30, 4.4, 1],
  [31, "Whole Black Urad Dal (1kg)",            "staples",           "pulses-lentils",       4.99, "Premium whole black gram for authentic Dal Makhani",              0, 25, 4.5, 1],
  [32, "Organic Masoor Dal / Red Lentils (1kg)","staples",           "pulses-lentils",       3.99, "Quick-cooking organic split red lentils",                         1, 30, 4.6, 1],
  [33, "Organic Whole Grain Rolled Oats (1kg)", "staples",           "millets-oats",         5.49, "Heart-healthy 100% whole grain rolled oats for porridge",         1, 40, 5.0, 1],
  [34, "Traditional Steel-Cut Oats (1kg)",      "staples",           "millets-oats",         6.99, "Coarse hearty steel-cut oats with low glycemic index",            0, 30, 4.8, 1],
  [35, "Organic Foxtail Millet (1kg)",          "staples",           "millets-oats",         5.99, "Ancient gluten-free grain rich in minerals and fiber",            1, 25, 4.4, 1],
  [36, "Organic Ragi / Finger Millet Flour (1kg)","staples",         "millets-oats",         4.49, "Calcium-rich sprouted organic finger millet flour",               1, 30, 4.6, 1],
  [37, "Himalayan Pink Salt (1kg)",             "staples",           "salt-sugar-jaggery",   3.99, "100% natural unrefined mineral-rich pink rock salt",              1, 50, 4.9, 1],
  [38, "Organic Raw Cane Sugar (1kg)",          "staples",           "salt-sugar-jaggery",   4.49, "Unbleached organic granulated cane sugar",                        1, 40, 4.5, 1],
  [39, "Pure Organic Jaggery Powder (1kg)",     "staples",           "salt-sugar-jaggery",   4.99, "Traditional unrefined organic gur powder sweetener",              1, 35, 4.7, 1],
  [40, "Green Cardamom / Elaichi (100g)",       "spices-masalas",    "whole-spices",         8.99, "Fragrant green cardamom pods from Kerala hills",                  1, 25, 5.0, 1],
  [41, "Organic Whole Black Pepper (100g)",     "spices-masalas",    "whole-spices",         4.99, "Bold Malabar organic whole black peppercorns",                    1, 30, 4.8, 1],
  [42, "Ceylon Cinnamon Sticks (100g)",         "spices-masalas",    "whole-spices",         5.49, "True sweet aromatic organic Ceylon cinnamon quills",              1, 25, 4.7, 1],
  [43, "Organic Cumin Seeds / Jeera (200g)",    "spices-masalas",    "whole-spices",         3.99, "Sun-dried aromatic whole cumin seeds",                            1, 40, 4.5, 1],
  [44, "Whole Cloves / Laung (100g)",           "spices-masalas",    "whole-spices",         4.49, "Handpicked premium whole aromatic cloves",                        0, 30, 4.6, 1],
  [45, "Organic Lakadong Turmeric Powder (200g)","spices-masalas",   "ground-spices",        4.99, "High-curcumin organic Meghalaya turmeric powder",                 1, 40, 5.0, 1],
  [46, "Kashmiri Red Chilli Powder (200g)",     "spices-masalas",    "ground-spices",        4.49, "Vibrant natural red color with mild aromatic heat",               0, 35, 4.6, 1],
  [47, "Organic Coriander Powder / Dhaniya (200g)","spices-masalas", "ground-spices",        3.49, "Freshly ground fragrant organic coriander seed powder",           1, 35, 4.5, 1],
  [48, "Royal Biryani Masala Blend (100g)",     "spices-masalas",    "masala-blends",        3.99, "Authentic blend of 15 royal spices for fragrant biryani",         0, 30, 4.8, 1],
  [49, "Organic Garam Masala (100g)",           "spices-masalas",    "masala-blends",        4.29, "Traditional roasted whole spice blend for curries",               1, 30, 4.7, 1],
  [50, "Madras Sambhar Masala (100g)",          "spices-masalas",    "masala-blends",        3.49, "Authentic South Indian aromatic roasted lentil & spice mix",      0, 25, 4.4, 1],
  [51, "Organic Extra Virgin Olive Oil (500ml)","oils-ghee",         "cooking-oils",        16.99, "Cold-pressed unfiltered organic EVOO from Mediterranean olives",  1, 20, 5.0, 1],
  [52, "Cold-Pressed Virgin Coconut Oil (500ml)","oils-ghee",        "cooking-oils",        12.49, "Pure raw cold-pressed organic coconut oil for cooking & skin",    1, 25, 4.8, 1],
  [53, "Cold-Pressed Mustard Oil / Kachi Ghani (1L)","oils-ghee",    "cooking-oils",         6.99, "Pungent traditional cold-pressed mustard seed oil",              0, 30, 4.5, 1],
  [54, "Organic Cold-Pressed Groundnut Oil (1L)","oils-ghee",        "cooking-oils",         8.99, "Pure wood-pressed peanut oil with high smoke point",              1, 20, 4.7, 1],
  [55, "Cold-Pressed Avocado Oil (500ml)",      "oils-ghee",         "cooking-oils",        18.99, "Premium extra virgin avocado oil with 500°F smoke point",         0, 15, 4.9, 1],
  [56, "Pure Desi Cow Ghee (A2 Bilona 500ml)",  "oils-ghee",         "ghee",                19.99, "Traditional Vedic bilona churned A2 cow milk ghee, golden & nutty",1, 20, 5.0, 1],
  [57, "Organic Cultured Grass-Fed Ghee (500ml)","oils-ghee",        "ghee",                17.49, "Clarified butter made from certified organic pasture-fed cream",   1, 25, 4.8, 1],
  [58, "Organic California Almonds (500g)",     "dry-fruits-nuts",   "nuts",                11.99, "Raw, crunchy, unpasteurized premium organic almonds",            1, 35, 5.0, 1],
  [59, "Whole Roasted Cashews (500g)",          "dry-fruits-nuts",   "nuts",                 9.99, "Lightly sea-salted dry-roasted jumbo cashew nuts",                0, 30, 4.6, 1],
  [60, "Raw California Walnut Kernels (250g)",  "dry-fruits-nuts",   "nuts",                 7.99, "Omega-3 rich fresh halves and pieces of raw walnuts",             1, 25, 4.7, 1],
  [61, "Roasted Salted Pistachios (250g)",      "dry-fruits-nuts",   "nuts",                 6.99, "In-shell lightly salted crunchy roasted pistachios",              0, 25, 4.5, 1],
  [62, "Premium Medjool Dates (500g)",          "dry-fruits-nuts",   "dried-fruits",         8.99, "Large, soft, and caramel-sweet organic Medjool dates",            1, 30, 5.0, 1],
  [63, "Organic Dried Mango Slices (200g)",     "dry-fruits-nuts",   "dried-fruits",         7.99, "Unsweetened chewy organic dried mango slices, no sulfites",       1, 25, 4.6, 1],
  [64, "Golden Afghani Raisins / Kishmish (250g)","dry-fruits-nuts", "dried-fruits",         4.49, "Seedless sweet sun-dried golden raisins",                         0, 30, 4.4, 1],
  [65, "Organic Dried Turkish Figs / Anjeer (250g)","dry-fruits-nuts","dried-fruits",        8.49, "High-fiber soft and sweet organic sun-dried figs",                1, 20, 4.7, 1],
  [66, "Organic Black Chia Seeds (250g)",       "dry-fruits-nuts",   "seeds",                8.49, "Organic raw chia seeds packed with fiber and omega-3s",           1, 40, 4.9, 1],
  [67, "Raw Pumpkin Seeds (250g)",              "dry-fruits-nuts",   "seeds",                5.99, "Zinc-rich unsalted raw green pumpkin seed kernels",               1, 30, 4.6, 1],
  [68, "Roasted Sunflower Seeds (250g)",        "dry-fruits-nuts",   "seeds",                4.49, "Crisp lightly toasted sunflower seeds for snacks and salads",     0, 35, 4.5, 1],
  [69, "Organic Whole Pasteurized Milk (1L)",   "dairy-eggs",        "milk-curd-beverages",  3.49, "Fresh pasture-raised organic whole milk with cream top",          1, 40, 4.5, 1],
  [70, "Organic Almond Milk (Unsweetened 1L)",  "dairy-eggs",        "milk-curd-beverages",  4.99, "Fortified plant-based organic almond milk with zero added sugar", 1, 35, 4.6, 1],
  [71, "Barista Style Oat Milk (1L)",           "dairy-eggs",        "milk-curd-beverages",  4.49, "Creamy foaming oat milk designed for lattes and smoothies",       0, 30, 4.8, 1],
  [72, "Artisan Greek Yogurt / Dahi (400g)",    "dairy-eggs",        "milk-curd-beverages",  3.99, "Thick, protein-dense probiotic strained Greek yogurt",            1, 25, 4.7, 1],
  [73, "Fresh Malai Paneer (200g)",             "dairy-eggs",        "paneer-butter-cheese", 3.99, "Soft, melt-in-mouth cottage cheese paneer blocks",                 0, 30, 4.8, 1],
  [74, "Organic Unsalted Grass-Fed Butter (250g)","dairy-eggs",      "paneer-butter-cheese", 4.99, "Rich golden butter churned from grass-fed organic cream",         1, 25, 4.9, 1],
  [75, "Aged White Cheddar Cheese (200g)",      "dairy-eggs",        "paneer-butter-cheese", 5.99, "Sharp and tangy 12-month aged white cheddar cheese",             0, 20, 4.7, 1],
  [76, "Organic Free-Range Brown Eggs (Pack of 12)","dairy-eggs",    "eggs",                 5.99, "Certified humane pasture-raised organic brown eggs with golden yolks",1, 40, 5.0, 1],
  [77, "Farm Fresh White Eggs (Pack of 6)",     "dairy-eggs",        "eggs",                 2.49, "Daily fresh farm-collected grade A white eggs",                   0, 50, 4.2, 1],
  [78, "Fresh Boneless Chicken Breast (500g)",  "meat-fish",         "chicken",              6.99, "Antibiotic-free tender skinless chicken breast fillets",          0, 25, 4.5, 1],
  [79, "Organic Free-Range Chicken Curry Cut (500g)","meat-fish",    "chicken",              7.49, "Freshly cut skinless organic chicken with bones for curries",     1, 20, 4.7, 1],
  [80, "Tender Goat Mutton Curry Cut (500g)",   "meat-fish",         "mutton",              11.99, "Freshly trimmed tender bone-in goat mutton pieces",               0, 15, 4.6, 1],
  [81, "Fresh Lean Mutton Keema / Mince (500g)","meat-fish",         "mutton",              12.99, "Finely ground fresh mutton mince for kebabs and keema curry",     0, 15, 4.8, 1],
  [82, "Fresh Atlantic Salmon Fillet (300g)",   "meat-fish",         "fish-seafood",        14.99, "Rich in omega-3 wild-caught fresh salmon fillet portion",        0, 15, 4.9, 1],
  [83, "Cleaned & Deveined Tiger Prawns (250g)","meat-fish",         "fish-seafood",        10.99, "Fresh sweet jumbo tiger prawns ready to cook",                   0, 20, 4.7, 1],
  [84, "Fresh Rohu Fish Steaks (500g)",         "meat-fish",         "fish-seafood",         7.99, "Freshwater clean-cut rohu fish steaks for traditional fish curry",0, 20, 4.4, 1],
  [85, "Organic Japanese Sencha Green Tea (50 Bags)","beverages",    "tea-coffee",          12.99, "High-antioxidant steamed Japanese green tea bags",                1, 30, 5.0, 1],
  [86, "Assam Golden CTC Black Tea (500g)",     "beverages",         "tea-coffee",           8.49, "Strong, brisk, full-bodied black tea for traditional Masala Chai",0, 35, 4.8, 1],
  [87, "Organic Chamomile Herbal Tea (30 Bags)","beverages",         "tea-coffee",           8.99, "Calming caffeine-free whole chamomile flower infusion",           1, 25, 4.7, 1],
  [88, "Single-Origin Ethiopian Arabica Beans (250g)","beverages",   "tea-coffee",          16.99, "Medium roast whole bean coffee with floral & citrus notes",       1, 20, 4.9, 1],
  [89, "Dark Roast Italian Espresso Blend (250g)","beverages",       "tea-coffee",          14.49, "Bold ground espresso blend with notes of dark chocolate",         0, 25, 4.6, 1],
  [90, "100% Cold-Pressed Valencia Orange Juice (1L)","beverages",   "juices-water",         5.99, "Pure raw squeezed orange juice with pulp, no added sugar",        1, 25, 4.7, 1],
  [91, "Natural Sparkling Mineral Water (750ml)","beverages",        "juices-water",         2.99, "Effervescent mountain spring water in glass bottle",              0, 40, 4.5, 1],
  [92, "Organic Tender Coconut Water (330ml)",  "beverages",         "juices-water",         3.29, "Electrolyte-rich pure organic coconut water",                     1, 35, 4.8, 1],
  [93, "Organic Oat & Honey Crunch Cookies (200g)","snacks-packaged-foods","biscuits-snacks",4.49,"Wholesome whole oat cookies sweetened with pure honey",          1, 30, 4.6, 1],
  [94, "Roasted Multigrain Makhana / Foxnuts (100g)","snacks-packaged-foods","biscuits-snacks",3.99,"Light crunchy roasted lotus seeds with pink salt",             1, 35, 4.5, 1],
  [95, "Gourmet Trail Mix with Nuts & Berries (250g)","snacks-packaged-foods","biscuits-snacks",8.49,"Premium mix of almonds, cranberries, pumpkin seeds, and M&Ms",0, 25, 4.7, 1],
  [96, "Organic Whole Wheat Fusilli Pasta (500g)","snacks-packaged-foods","noodles-pasta-cereals",4.99,"Italian bronze-cut durum whole wheat spiral pasta",          1, 30, 4.6, 1],
  [97, "Multi-Millet Hakka Noodles (200g)",     "snacks-packaged-foods","noodles-pasta-cereals",3.49,"Air-dried non-fried noodles made from ragi, jowar and wheat",   1, 25, 4.4, 1],
  [98, "Organic Honey Almond Granola (400g)",   "snacks-packaged-foods","noodles-pasta-cereals",9.99,"Toasted oat clusters with sliced almonds and raw wildflower honey",1, 25, 4.8, 1],
  [99, "Organic Raw Forest Honey (500g)",       "snacks-packaged-foods","spreads-sauces-pickles",14.99,"Unfiltered cold-extracted raw wild forest honey",            1, 30, 5.0, 1],
  [100,"Organic Manuka Honey UMF 10+ (250g)",   "snacks-packaged-foods","spreads-sauces-pickles",29.99,"Medical-grade certified raw New Zealand Manuka honey",        1, 15, 4.9, 1],
  [101,"All-Natural Crunchy Peanut Butter (500g)","snacks-packaged-foods","spreads-sauces-pickles",5.99,"100% roasted peanuts, zero palm oil or hydrogenated fats", 1, 35, 4.7, 1],
  [102,"Traditional Mango Pickle in Mustard Oil (300g)","snacks-packaged-foods","spreads-sauces-pickles",3.99,"Authentic sun-cured spiced raw mango pickle",        0, 30, 4.5, 1],
  [103,"100% Whole Wheat Sourdough Loaf (450g)","bakery-breads",    "breads-buns",          5.49, "Naturally fermented artisan sourdough with crispy crust",         1, 20, 5.0, 1],
  [104,"Artisan 7-Grain Multigrain Bread (400g)","bakery-breads",   "breads-buns",          4.99, "Soft sliced loaf crusted with flax, oats, and sunflower seeds",   1, 25, 4.8, 1],
  [105,"Brioche Gourmet Burger Buns (Pack of 4)","bakery-breads",   "breads-buns",          3.99, "Buttery, golden, glossy French brioche hamburger buns",           0, 20, 4.6, 1],
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
    name: "Maya Sterling",
    email: "maya.sterling@aura.ai",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    vip_level: "Verified VIP Buyer",
    default_address_id: 1,
    preferences: {
      dietary_tags: ["Certified Organic", "Raw & Cold-Pressed", "Gluten-Free", "Zero Preservatives"],
      health_goals: ["Immunity & Longevity", "Clean Eating", "Sustained Energy"],
      copilot_tone: "wholesale-deal-finder",
      max_spend_budget: 300,
    },
    addresses: [
      {
        id: 1,
        user_id: 1,
        label: "Home Penthouse",
        recipient_name: "Maya Sterling",
        phone: "+1 (415) 890-4122",
        street: "742 Evergreen Terrace, Apt 14B",
        city: "San Francisco",
        state: "CA",
        zip_code: "94107",
        country: "United States",
        is_default: true,
      },
      {
        id: 2,
        user_id: 1,
        label: "Aura AI Lab",
        recipient_name: "Maya Sterling",
        phone: "+1 (415) 890-9941",
        street: "500 Howard Street, Suite 800",
        city: "San Francisco",
        state: "CA",
        zip_code: "94105",
        country: "United States",
        is_default: false,
      },
    ],
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1040,
    total: 21.98,
    status: "transit",
    created_at: "2024-09-25 10:15:00",
    items: [
      { id: 1, order_id: 1040, product_id: 85, product_name: "Organic Japanese Sencha Green Tea (50 Bags)", unit_price: 12.99, quantity: 1 },
      { id: 2, order_id: 1040, product_id: 87, product_name: "Organic Chamomile Herbal Tea (30 Bags)", unit_price: 8.99, quantity: 1 }
    ]
  },
  {
    id: 1039,
    total: 25.97,
    status: "delivered",
    created_at: "2024-09-20 14:30:00",
    items: [
      { id: 3, order_id: 1039, product_id: 99, product_name: "Organic Raw Forest Honey (500g)", unit_price: 14.99, quantity: 1 },
      { id: 4, order_id: 1039, product_id: 33, product_name: "Organic Whole Grain Rolled Oats (1kg)", unit_price: 5.49, quantity: 2 }
    ]
  },
  {
    id: 1041,
    total: 20.48,
    status: "delivered",
    created_at: "2024-09-28 09:45:00",
    items: [
      { id: 5, order_id: 1041, product_id: 58, product_name: "Organic California Almonds (500g)", unit_price: 11.99, quantity: 1 },
      { id: 6, order_id: 1041, product_id: 66, product_name: "Organic Black Chia Seeds (250g)", unit_price: 8.49, quantity: 1 }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  { id: 1, product_id: 1, rating: 5.0, reviewer_name: "Priya S.", review_text: "Best Alphonso mangoes I've ever ordered online! So sweet and aromatic." },
  { id: 2, product_id: 1, rating: 4.5, reviewer_name: "Rahul K.", review_text: "Very fresh and juicy. Delivered without any bruises." },
  { id: 3, product_id: 3, rating: 5.0, reviewer_name: "Amit M.", review_text: "Fresh sweet bananas, perfect for daily smoothies." },
  { id: 4, product_id: 99, rating: 5.0, reviewer_name: "Alice M.", review_text: "Amazing raw honey! Pure and unfiltered." },
  { id: 5, product_id: 33, rating: 5.0, reviewer_name: "Daniel B.", review_text: "Great everyday breakfast oats, high fiber and very fresh." },
  { id: 6, product_id: 51, rating: 5.0, reviewer_name: "Elena M.", review_text: "Best cold-pressed extra virgin olive oil for salad dressings." },
  { id: 7, product_id: 56, rating: 5.0, reviewer_name: "Rajesh P.", review_text: "Pure A2 Vedic desi cow ghee, amazing aroma and granular texture!" },
  { id: 8, product_id: 85, rating: 5.0, reviewer_name: "Taro K.", review_text: "Very authentic Japanese sencha green tea flavor." }
];
