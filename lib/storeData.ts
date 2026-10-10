import { Product, Review, Order, UserProfile, UserAddress, UserAddressRecord } from "./types";

export function getFallbackImageUrl(category?: string): string {
  switch (category?.toLowerCase()) {
    case "mobiles":
      return "/images/mobiles_fallback.svg";
    case "electronics":
      return "/images/electronics_fallback.svg";
    case "appliances":
      return "/images/appliances_fallback.svg";
    case "fashion":
      return "/images/fashion_fallback.svg";
    case "beauty":
      return "/images/beauty_fallback.svg";
    case "food-health":
      return "/images/food_health_fallback.svg";
    case "home":
      return "/images/home_fallback.svg";
    case "toys-baby":
      return "/images/toys_baby_fallback.svg";
    case "auto-accessories":
      return "/images/auto_fallback.svg";
    case "sports-fitness":
      return "/images/sports_fallback.svg";
    default:
      return "/images/placeholder_low_bandwidth.svg";
  }
}

export const PRODUCT_UNIQUE_IMAGES: Record<number, string> = {
  // 0. Core Pantry & Staples (1 - 32)
  1: "/images/honey.png",
  2: "/images/wildflower_honey.png",
  3: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
  4: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80",
  5: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80",
  6: "/images/orange_blossom_honey.png",
  7: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
  8: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
  9: "/images/olive_oil.png",
  10: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80",
  11: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
  12: "/images/avocado_oil.png",
  13: "https://images.unsplash.com/photo-1508061252445-b95013cb7c5b?auto=format&fit=crop&w=600&q=80",
  14: "https://images.unsplash.com/photo-1536591375315-19895696d506?auto=format&fit=crop&w=600&q=80",
  15: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80",
  16: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
  17: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  18: "/images/rolled_oats.png",
  19: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
  20: "/images/steel_cut_oats.png",
  21: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
  22: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80",
  23: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
  24: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80",
  25: "https://images.unsplash.com/photo-1517093707577-4402eb0ea685?auto=format&fit=crop&w=600&q=80",
  26: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80",
  27: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
  28: "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=600&q=80",
  29: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
  30: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
  31: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
  32: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80",

  // 1. Mobiles (101 - 112)
  101: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
  102: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
  103: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
  104: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
  105: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
  106: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
  107: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=600&q=80",
  108: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80",
  109: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
  110: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=600&q=80",
  111: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80",
  112: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80",

  // 2. Electronics (201 - 214)
  201: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
  202: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
  203: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  204: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
  205: "https://images.unsplash.com/photo-1585792180666-f7547c6a62b9?auto=format&fit=crop&w=600&q=80",
  206: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
  207: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
  208: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
  209: "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&q=80",
  210: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
  211: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
  212: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
  213: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80",
  214: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",

  // 3. Appliances (301 - 311)
  301: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=600&q=80",
  302: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
  303: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
  304: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80",
  305: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80",
  306: "https://images.unsplash.com/photo-1536353284924-9240cebc500a?auto=format&fit=crop&w=600&q=80",
  307: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
  308: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
  309: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80",
  310: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
  311: "https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=600&q=80",

  // 4. Fashion (401 - 412)
  401: "https://images.unsplash.com/photo-1542272604-780c96856478?auto=format&fit=crop&w=600&q=80",
  402: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  403: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80",
  404: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80",
  405: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80",
  406: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80",
  407: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80",
  408: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
  409: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
  410: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
  411: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
  412: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",

  // 5. Beauty (501 - 510)
  501: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
  502: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
  503: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80",
  504: "https://images.unsplash.com/photo-1608248597359-58b387e38e1b?auto=format&fit=crop&w=600&q=80",
  505: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
  506: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
  507: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80",
  508: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
  509: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
  510: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",

  // 6. Food & Health / Grocery (601 - 616)
  601: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
  602: "/images/olive_oil.png",
  603: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80",
  604: "/images/rolled_oats.png",
  605: "https://images.unsplash.com/photo-1508061252445-b95013cb7c5b?auto=format&fit=crop&w=600&q=80",
  606: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  607: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
  608: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
  609: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80",
  610: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
  611: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80",
  612: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
  613: "/images/sunflower_oil.png",
  614: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
  615: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80",
  616: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80",

  // 7. Home & Kitchen (701 - 710)
  701: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
  702: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
  703: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
  704: "https://images.unsplash.com/photo-1584990347449-39976378c3b2?auto=format&fit=crop&w=600&q=80",
  705: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
  706: "https://images.unsplash.com/photo-1629949009765-40fc74c95018?auto=format&fit=crop&w=600&q=80",
  707: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  708: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80",
  709: "https://images.unsplash.com/photo-1550524514-648b26f582f3?auto=format&fit=crop&w=600&q=80",
  710: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80",

  // 8. Toys & Baby (801 - 808)
  801: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80",
  802: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80",
  803: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80",
  804: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80",
  805: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
  806: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80",
  807: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80",
  808: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",

  // 9. Auto (901 - 908)
  901: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80",
  902: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80",
  903: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
  904: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
  905: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80",
  906: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80",
  907: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80",
  908: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",

  // 10. Sports (1001 - 1008)
  1001: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80",
  1002: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80",
  1003: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80",
  1004: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=600&q=80",
  1005: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80",
  1006: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80",
  1007: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
  1008: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
};

export function getProductImageUrl(
  idOrName: number | string,
  nameOrCategory?: string,
  categoryOrSub?: string,
  subCategory?: string
): string {
  if (typeof idOrName === "number" && PRODUCT_UNIQUE_IMAGES[idOrName]) {
    return PRODUCT_UNIQUE_IMAGES[idOrName];
  }

  const numId = Number(idOrName);
  if (!isNaN(numId) && PRODUCT_UNIQUE_IMAGES[numId]) {
    return PRODUCT_UNIQUE_IMAGES[numId];
  }

  const name = typeof idOrName === "string" ? idOrName : (nameOrCategory || "");
  const category = typeof idOrName === "string" ? (nameOrCategory || "") : (categoryOrSub || "");
  const subCat = typeof idOrName === "string" ? (categoryOrSub || "") : (subCategory || "");
  const lower = `${name} ${category} ${subCat}`.toLowerCase();

  // Mobiles & Smartphones
  if (lower.includes("motorola") || lower.includes("edge 70")) return PRODUCT_UNIQUE_IMAGES[101];
  if (lower.includes("iphone 15") || lower.includes("iphone")) return PRODUCT_UNIQUE_IMAGES[102];
  if (lower.includes("oneplus 12") || lower.includes("oneplus")) return PRODUCT_UNIQUE_IMAGES[103];
  if (lower.includes("galaxy s24") || lower.includes("s24")) return PRODUCT_UNIQUE_IMAGES[104];
  if (lower.includes("k14") || lower.includes("realme")) return PRODUCT_UNIQUE_IMAGES[105];
  if (lower.includes("poco")) return PRODUCT_UNIQUE_IMAGES[106];
  if (lower.includes("pixel")) return PRODUCT_UNIQUE_IMAGES[107];
  if (lower.includes("xiaomi")) return PRODUCT_UNIQUE_IMAGES[108];
  if (lower.includes("ipad pro")) return PRODUCT_UNIQUE_IMAGES[109];
  if (lower.includes("tab s9")) return PRODUCT_UNIQUE_IMAGES[110];
  if (lower.includes("spigen") || lower.includes("case")) return PRODUCT_UNIQUE_IMAGES[111];
  if (lower.includes("power bank") || lower.includes("anker")) return PRODUCT_UNIQUE_IMAGES[112];

  // Electronics & Laptops
  if (lower.includes("vivobook") || lower.includes("asus")) return PRODUCT_UNIQUE_IMAGES[201];
  if (lower.includes("tcl") || lower.includes("qled")) return PRODUCT_UNIQUE_IMAGES[202];
  if (lower.includes("neckband") || lower.includes("bullets")) return PRODUCT_UNIQUE_IMAGES[203];
  if (lower.includes("wh-1000xm") || lower.includes("sony")) return PRODUCT_UNIQUE_IMAGES[204];
  if (lower.includes("ipad air")) return PRODUCT_UNIQUE_IMAGES[205];
  if (lower.includes("colorfit") || lower.includes("noise")) return PRODUCT_UNIQUE_IMAGES[206];
  if (lower.includes("macbook")) return PRODUCT_UNIQUE_IMAGES[207];
  if (lower.includes("legion")) return PRODUCT_UNIQUE_IMAGES[208];
  if (lower.includes("crystal 4k") || (lower.includes("samsung") && lower.includes("tv"))) return PRODUCT_UNIQUE_IMAGES[209];
  if (lower.includes("oled") || (lower.includes("lg") && lower.includes("tv"))) return PRODUCT_UNIQUE_IMAGES[210];
  if (lower.includes("airpods")) return PRODUCT_UNIQUE_IMAGES[211];
  if (lower.includes("jbl") || lower.includes("speaker")) return PRODUCT_UNIQUE_IMAGES[212];
  if (lower.includes("watch6")) return PRODUCT_UNIQUE_IMAGES[213];
  if (lower.includes("mouse") || lower.includes("mx master")) return PRODUCT_UNIQUE_IMAGES[214];

  // Appliances
  if (lower.includes("refrigerator") || lower.includes("fridge")) {
    if (lower.includes("samsung") || lower.includes("653l")) return PRODUCT_UNIQUE_IMAGES[305];
    if (lower.includes("whirlpool")) return PRODUCT_UNIQUE_IMAGES[306];
    return PRODUCT_UNIQUE_IMAGES[301];
  }
  if (lower.includes("air conditioner") || lower.includes("ac")) {
    if (lower.includes("daikin")) return PRODUCT_UNIQUE_IMAGES[307];
    return PRODUCT_UNIQUE_IMAGES[302];
  }
  if (lower.includes("air fryer") || lower.includes("fryer")) return PRODUCT_UNIQUE_IMAGES[303];
  if (lower.includes("induction")) return PRODUCT_UNIQUE_IMAGES[304];
  if (lower.includes("washing machine") || lower.includes("ifb")) return PRODUCT_UNIQUE_IMAGES[308];
  if (lower.includes("microwave") || lower.includes("oven")) return PRODUCT_UNIQUE_IMAGES[309];
  if (lower.includes("vacuum") || lower.includes("dyson")) return PRODUCT_UNIQUE_IMAGES[310];
  if (lower.includes("otg") || lower.includes("toaster")) return PRODUCT_UNIQUE_IMAGES[311];

  // Fashion
  if (lower.includes("jean") || lower.includes("levi")) return PRODUCT_UNIQUE_IMAGES[401];
  if (lower.includes("flyer runner") || (lower.includes("puma") && lower.includes("shoe"))) return PRODUCT_UNIQUE_IMAGES[402];
  if (lower.includes("titan")) return PRODUCT_UNIQUE_IMAGES[403];
  if (lower.includes("polo")) return PRODUCT_UNIQUE_IMAGES[404];
  if (lower.includes("jordan") || lower.includes("nike")) return PRODUCT_UNIQUE_IMAGES[405];
  if (lower.includes("ultraboost") || lower.includes("adidas")) return PRODUCT_UNIQUE_IMAGES[406];
  if (lower.includes("shirt") || lower.includes("hilfiger")) return PRODUCT_UNIQUE_IMAGES[407];
  if (lower.includes("blazer") || lower.includes("zara")) return PRODUCT_UNIQUE_IMAGES[408];
  if (lower.includes("fossil")) return PRODUCT_UNIQUE_IMAGES[409];
  if (lower.includes("g-shock") || lower.includes("casio")) return PRODUCT_UNIQUE_IMAGES[410];
  if (lower.includes("sunglass") || lower.includes("ray-ban")) return PRODUCT_UNIQUE_IMAGES[411];
  if (lower.includes("backpack") || lower.includes("samsonite")) return PRODUCT_UNIQUE_IMAGES[412];

  // Beauty
  if (lower.includes("niacinamide") || lower.includes("minimalist")) return PRODUCT_UNIQUE_IMAGES[501];
  if (lower.includes("cleanser") || lower.includes("cetaphil")) return PRODUCT_UNIQUE_IMAGES[502];
  if (lower.includes("maybelline")) return PRODUCT_UNIQUE_IMAGES[503];
  if (lower.includes("snail") || lower.includes("cosrx")) return PRODUCT_UNIQUE_IMAGES[504];
  if (lower.includes("hyaluronic") || lower.includes("ordinary")) return PRODUCT_UNIQUE_IMAGES[505];
  if (lower.includes("sunscreen") || lower.includes("laroche")) return PRODUCT_UNIQUE_IMAGES[506];
  if (lower.includes("l'oreal") || lower.includes("hair serum")) return PRODUCT_UNIQUE_IMAGES[507];
  if (lower.includes("mac") && lower.includes("lipstick")) return PRODUCT_UNIQUE_IMAGES[508];
  if (lower.includes("forest essentials") || lower.includes("soundarya")) return PRODUCT_UNIQUE_IMAGES[509];
  if (lower.includes("sauvage") || lower.includes("dior")) return PRODUCT_UNIQUE_IMAGES[510];

  // Pantry & Staples
  if (lower.includes("raw honey") || lower.includes("forest honey")) return PRODUCT_UNIQUE_IMAGES[1];
  if (lower.includes("wildflower")) return PRODUCT_UNIQUE_IMAGES[2];
  if (lower.includes("manuka")) return PRODUCT_UNIQUE_IMAGES[3];
  if (lower.includes("clover")) return PRODUCT_UNIQUE_IMAGES[4];
  if (lower.includes("buckwheat")) return PRODUCT_UNIQUE_IMAGES[5];
  if (lower.includes("orange blossom")) return PRODUCT_UNIQUE_IMAGES[6];
  if (lower.includes("acacia")) return PRODUCT_UNIQUE_IMAGES[7];
  if (lower.includes("creamed")) return PRODUCT_UNIQUE_IMAGES[8];
  if (lower.includes("olive oil")) return PRODUCT_UNIQUE_IMAGES[9];
  if (lower.includes("coconut oil")) return PRODUCT_UNIQUE_IMAGES[10];
  if (lower.includes("flaxseed")) return PRODUCT_UNIQUE_IMAGES[11];
  if (lower.includes("avocado")) return PRODUCT_UNIQUE_IMAGES[12];
  if (lower.includes("almond") && !lower.includes("milk")) return PRODUCT_UNIQUE_IMAGES[13];
  if (lower.includes("cashew")) return PRODUCT_UNIQUE_IMAGES[14];
  if (lower.includes("chia")) return PRODUCT_UNIQUE_IMAGES[15];
  if (lower.includes("walnut")) return PRODUCT_UNIQUE_IMAGES[609];
  if (lower.includes("mixed nuts")) return PRODUCT_UNIQUE_IMAGES[16];
  if (lower.includes("quinoa")) return PRODUCT_UNIQUE_IMAGES[17];
  if (lower.includes("rolled oats")) return PRODUCT_UNIQUE_IMAGES[18];
  if (lower.includes("brown rice")) return PRODUCT_UNIQUE_IMAGES[19];
  if (lower.includes("steel-cut") || lower.includes("steel cut")) return PRODUCT_UNIQUE_IMAGES[20];
  if (lower.includes("green tea")) return PRODUCT_UNIQUE_IMAGES[21];
  if (lower.includes("chamomile")) return PRODUCT_UNIQUE_IMAGES[22];
  if (lower.includes("coffee") || lower.includes("espresso")) return PRODUCT_UNIQUE_IMAGES[23];
  if (lower.includes("granola")) return PRODUCT_UNIQUE_IMAGES[25];
  if (lower.includes("rice cake")) return PRODUCT_UNIQUE_IMAGES[26];
  if (lower.includes("dried mango")) return PRODUCT_UNIQUE_IMAGES[27];
  if (lower.includes("trail mix")) return PRODUCT_UNIQUE_IMAGES[28];
  if (lower.includes("almond milk")) return PRODUCT_UNIQUE_IMAGES[29];
  if (lower.includes("oat milk")) return PRODUCT_UNIQUE_IMAGES[30];
  if (lower.includes("coconut milk")) return PRODUCT_UNIQUE_IMAGES[31];
  if (lower.includes("soy milk")) return PRODUCT_UNIQUE_IMAGES[32];
  if (lower.includes("whey") || lower.includes("protein")) return PRODUCT_UNIQUE_IMAGES[603];
  if (lower.includes("atta") || lower.includes("wheat")) return PRODUCT_UNIQUE_IMAGES[606];
  if (lower.includes("dal") || lower.includes("toor")) return PRODUCT_UNIQUE_IMAGES[607];
  if (lower.includes("ghee")) return PRODUCT_UNIQUE_IMAGES[608];
  if (lower.includes("peanut butter")) return PRODUCT_UNIQUE_IMAGES[611];
  if (lower.includes("basmati") || lower.includes("rice")) return PRODUCT_UNIQUE_IMAGES[612];
  if (lower.includes("saffola") || lower.includes("sunflower")) return PRODUCT_UNIQUE_IMAGES[613];
  if (lower.includes("chyawanprash")) return PRODUCT_UNIQUE_IMAGES[614];
  if (lower.includes("seed")) return PRODUCT_UNIQUE_IMAGES[616];

  // Home & Kitchen
  if (lower.includes("flask") || lower.includes("bottle") || lower.includes("milton")) return PRODUCT_UNIQUE_IMAGES[701];
  if (lower.includes("mattress") || lower.includes("wakefit")) return PRODUCT_UNIQUE_IMAGES[702];
  if (lower.includes("comforter") || lower.includes("blanket")) return PRODUCT_UNIQUE_IMAGES[703];
  if (lower.includes("cookware") || lower.includes("tawa")) return PRODUCT_UNIQUE_IMAGES[704];
  if (lower.includes("stove") || lower.includes("pigeon")) return PRODUCT_UNIQUE_IMAGES[705];
  if (lower.includes("pillow")) return PRODUCT_UNIQUE_IMAGES[706];
  if (lower.includes("bed sheet") || lower.includes("bedsheet")) return PRODUCT_UNIQUE_IMAGES[707];
  if (lower.includes("chair") || lower.includes("gaming chair")) return PRODUCT_UNIQUE_IMAGES[708];
  if (lower.includes("bulb") || lower.includes("light")) return PRODUCT_UNIQUE_IMAGES[709];
  if (lower.includes("bowl") || lower.includes("borosil")) return PRODUCT_UNIQUE_IMAGES[710];

  // Toys & Baby
  if (lower.includes("bugatti")) return PRODUCT_UNIQUE_IMAGES[803];
  if (lower.includes("lego")) return PRODUCT_UNIQUE_IMAGES[801];
  if (lower.includes("diaper") || lower.includes("pampers")) return PRODUCT_UNIQUE_IMAGES[802];
  if (lower.includes("hot wheels") || lower.includes("car")) return PRODUCT_UNIQUE_IMAGES[804];
  if (lower.includes("himalaya") && lower.includes("baby")) return PRODUCT_UNIQUE_IMAGES[805];
  if (lower.includes("stroller") || lower.includes("pram")) return PRODUCT_UNIQUE_IMAGES[806];
  if (lower.includes("scrabble") || lower.includes("board game")) return PRODUCT_UNIQUE_IMAGES[807];
  if (lower.includes("baby shampoo") || lower.includes("chicco")) return PRODUCT_UNIQUE_IMAGES[808];

  // Auto
  if (lower.includes("crux") || lower.includes("half face")) return PRODUCT_UNIQUE_IMAGES[903];
  if (lower.includes("helmet") || lower.includes("steelbird")) return PRODUCT_UNIQUE_IMAGES[901];
  if (lower.includes("dash cam") || lower.includes("70mai")) return PRODUCT_UNIQUE_IMAGES[902];
  if (lower.includes("tire") || lower.includes("compressor") || lower.includes("inflator")) return PRODUCT_UNIQUE_IMAGES[904];
  if (lower.includes("car vacuum")) return PRODUCT_UNIQUE_IMAGES[905];
  if (lower.includes("shampoo") || lower.includes("3m")) return PRODUCT_UNIQUE_IMAGES[906];
  if (lower.includes("body cover") || lower.includes("bike cover")) return PRODUCT_UNIQUE_IMAGES[907];
  if (lower.includes("mat") && lower.includes("car")) return PRODUCT_UNIQUE_IMAGES[908];

  // Sports
  if (lower.includes("badminton") || lower.includes("yonex") || lower.includes("racquet")) return PRODUCT_UNIQUE_IMAGES[1001];
  if (lower.includes("yoga") || lower.includes("mat")) return PRODUCT_UNIQUE_IMAGES[1002];
  if (lower.includes("football") || lower.includes("nivia")) return PRODUCT_UNIQUE_IMAGES[1003];
  if (lower.includes("dumbbell")) return PRODUCT_UNIQUE_IMAGES[1004];
  if (lower.includes("resistance") || lower.includes("loop band")) return PRODUCT_UNIQUE_IMAGES[1005];
  if (lower.includes("cricket") || lower.includes("bat")) return PRODUCT_UNIQUE_IMAGES[1006];
  if (lower.includes("skipping") || lower.includes("rope")) return PRODUCT_UNIQUE_IMAGES[1007];
  if (lower.includes("bicycle") || lower.includes("bike") || lower.includes("cycle")) return PRODUCT_UNIQUE_IMAGES[1008];

  return getFallbackImageUrl(category);
}

export const SEED_PRODUCTS_RAW: Array<[number, string, string, string, number, string, number, number, number, number]> = [
  // id, name, category, sub_category, price, description, is_organic, stock, average_rating, review_count
  // 0. Pantry & Staples (IDs 1 - 32)
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

  // 1. Mobiles (101 - 112)
  [101, "Motorola edge 70 Fusion (12GB RAM, 256GB)", "mobiles", "smartphones", 29999, "144Hz 3D Curved pOLED Display, Sony LYTIA 700C Camera with OIS, IP68 Protection", 0, 40, 4.9, 1420],
  [102, "Apple iPhone 15 (Blue, 128GB)", "mobiles", "smartphones", 63999, "Dynamic Island, 48MP Main Camera, 2x Telephoto, All-Day Battery Life, USB-C Charging", 0, 25, 4.9, 3890],
  [103, "OnePlus 12R 5G (Cool Blue, 16GB, 256GB)", "mobiles", "smartphones", 39999, "Snapdragon 8 Gen 2, 4th Gen LTPO 120Hz ProXDR Display, 5500 mAh Battery, 100W SUPERVOOC", 0, 30, 4.8, 980],
  [104, "Samsung Galaxy S24 5G (Onyx Black, 256GB)", "mobiles", "smartphones", 74999, "Galaxy AI, 50MP Dual Telephoto, Dynamic AMOLED 2X Display with Armor Aluminum 2.0", 0, 18, 4.9, 560],
  [105, "Realme K14 Plus 5G (Submarine Blue, 128GB)", "mobiles", "smartphones", 25999, "Periscope Portrait Camera, Luxury Watch Design, 120Hz Curved Vision OLED Display", 0, 50, 4.7, 720],
  [106, "POCO X6 Pro 5G (Racing Yellow, 512GB)", "mobiles", "smartphones", 26999, "Dimensity 8300 Ultra processor, 1.5K 120Hz AMOLED, 64MP OIS Triple Camera", 0, 35, 4.8, 640],
  [107, "Google Pixel 8a (Bay Blue, 128GB)", "mobiles", "smartphones", 44999, "Google Tensor G3, Actua OLED Display, 64MP Camera with Magic Eraser & Best Take", 0, 30, 4.8, 810],
  [108, "Xiaomi 14 Ultra (Titanium Black, 512GB)", "mobiles", "smartphones", 99999, "Leica Quad Camera with 1-inch sensor, Snapdragon 8 Gen 3, WQHD+ 120Hz AMOLED", 0, 15, 4.9, 350],
  [109, "Apple iPad Pro 11-inch M4 (Space Black, 256GB)", "mobiles", "tablets", 99900, "Ultra Retina XDR Tandem OLED, M4 chip, ProMotion 120Hz, Thunderbolt USB-4", 0, 20, 5.0, 180],
  [110, "Samsung Galaxy Tab S9 FE (Mint, 128GB Wi-Fi)", "mobiles", "tablets", 34999, "10.9-inch 90Hz Display, Exynos 1380, S Pen included, IP68 water & dust resistance", 0, 25, 4.7, 430],
  [111, "Spigen Ultra Hybrid MagFit Case for iPhone 15", "mobiles", "mobile-accessories", 1899, "Crystal clear TPU bumper with built-in magnetic ring for MagSafe charging compatibility", 0, 80, 4.7, 950],
  [112, "Anker 737 Power Bank (PowerCore 24K, 140W Fast Charge)", "mobiles", "mobile-accessories", 9999, "24,000mAh Ultra-Powerful 3-Port portable charger with smart digital display", 0, 35, 4.9, 610],

  // 2. Electronics (201 - 214)
  [201, "ASUS Vivobook 15 OLED Laptop (Intel Core i5 13th Gen, 16GB, 512GB SSD)", "electronics", "laptops", 59990, "15.6-inch FHD OLED 600nits HDR display, Thin & Light 1.7kg, Windows 11 + MS Office 2024", 0, 15, 4.9, 310],
  [202, "TCL 43-inch 4K Ultra HD Smart QLED Google TV (43C645)", "electronics", "televisions", 25999, "QLED 4K with Dolby Vision & Atmos, 120Hz DLG Game Master, Hands-Free Voice Control", 0, 20, 4.8, 420],
  [203, "OnePlus Bullets Wireless Z2 Bluetooth Neckband (Acoustic Red)", "electronics", "audio", 1499, "12.4mm Bass Drivers, 30 Hours Playtime, Fast 10-Min Charge = 20 Hours Battery, IP55", 0, 100, 4.7, 2150],
  [204, "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones", "electronics", "audio", 28990, "Industry Leading ANC with 8 Mics, Auto NC Optimizer, Hi-Res Audio LDAC, 30h Battery", 0, 12, 5.0, 180],
  [205, "Apple iPad Air M2 (11-inch, Wi-Fi, 128GB, Space Grey)", "electronics", "tablets", 57900, "Apple M2 chip, Liquid Retina display with P3 wide color, 12MP Center Stage Camera", 0, 22, 4.9, 140],
  [206, "Noise ColorFit Pulse 4 Smart Watch with Bluetooth Calling", "electronics", "wearables", 1799, "1.85-inch Advanced AMOLED display, 7-day battery, 100+ Sports Modes, Health Tracking", 0, 80, 4.6, 920],
  [207, "MacBook Air 15-inch M3 (Midnight, 16GB RAM, 512GB SSD)", "electronics", "laptops", 154900, "Liquid Retina display, MagSafe charging, 18-hour battery, Fanless silent design", 0, 12, 4.9, 210],
  [208, "Lenovo Legion Pro 5i Gaming Laptop (Core i7 14th Gen, RTX 4060)", "electronics", "laptops", 134990, "16-inch WQXGA 240Hz 500nits, 32GB DDR5 RAM, 1TB NVMe Gen4 SSD, Legion Coldfront 5.0", 0, 14, 4.8, 175],
  [209, "Samsung 55-inch Crystal 4K Vivid Pro Ultra HD Smart TV", "electronics", "televisions", 44990, "Crystal Processor 4K, PurColor, SolarCell Remote, Q-Symphony Audio Integration", 0, 22, 4.8, 620],
  [210, "LG 65-inch 4K OLED evo C3 Smart TV", "electronics", "televisions", 174990, "Self-lit OLED pixels, α9 AI Processor Gen6, Dolby Vision IQ & Atmos, 0.1ms Gaming", 0, 10, 5.0, 140],
  [211, "Apple AirPods Pro (2nd Generation with MagSafe USB-C)", "electronics", "audio", 22990, "H2 chip, Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio", 0, 50, 4.9, 1850],
  [212, "JBL Charge 5 Portable Waterproof Bluetooth Speaker", "electronics", "audio", 14999, "Original Pro Sound with long excursion driver, separate tweeter, 20 hours playtime, IP67", 0, 40, 4.8, 790],
  [213, "Samsung Galaxy Watch6 LTE (44mm, Graphite)", "electronics", "wearables", 24999, "Sapphire Crystal glass, Advanced Sleep Coaching, ECG & Blood Pressure Monitoring, Wear OS", 0, 30, 4.7, 430],
  [214, "Logitech MX Master 3S Wireless Performance Mouse", "electronics", "wearables", 8995, "8K DPI Any-surface tracking, Quiet Clicks, MagSpeed electromagnetic scrolling wheel", 0, 60, 4.9, 880],

  // 3. Appliances (301 - 311)
  [301, "LG 190L 4-Star Smart Inverter Direct Cool Single Door Refrigerator", "appliances", "refrigerators", 16990, "Smart Inverter Compressor, Fastest in Ice Making, Toughened Glass Shelves, Works without Stabilizer", 0, 15, 4.9, 580],
  [302, "Voltas 1.5 Ton 5-Star Adjustable Inverter Split AC (185V Vectra Elite)", "appliances", "air-conditioners", 34990, "4-in-1 Adjustable Cooling Modes, 100% Copper Condenser, Anti-dust Filter, Stabilizer Free", 0, 10, 4.8, 290],
  [303, "Philips Digital Air Fryer HD9252/90 (4.1 Liter, 1400W)", "appliances", "kitchen-appliances", 7499, "Rapid Air Technology for 90% Less Fat, Touch Screen with 7 Pre-set Menus, Dishwasher Safe", 0, 25, 4.8, 340],
  [304, "Prestige Induction Cooktop PIC 20 (1600 Watt with Indian Menu Options)", "appliances", "kitchen-appliances", 2399, "Push Button Controls, Automatic Voltage Regulator, Anti-Magnetic Wall, Feather Touch Control", 0, 40, 4.7, 480],
  [305, "Samsung 653L Frost-Free Double Door Convertible Side-by-Side Refrigerator", "appliances", "refrigerators", 74990, "Twin Cooling Plus, 5-in-1 Convertible Modes, Digital Inverter with 20-Year Warranty, Wi-Fi", 0, 10, 4.9, 210],
  [306, "Whirlpool 240L Triple Door Multi-Door Refrigerator (Protton Royale)", "appliances", "refrigerators", 25490, "Microblock Technology, Active Fresh Zone for fruit retention, Moisture Retention Crisper", 0, 20, 4.7, 390],
  [307, "Daikin 1.5 Ton 5-Star Inverter Split AC (PM 2.5 Filter)", "appliances", "air-conditioners", 45490, "Dew Clean Technology, Coanda Airflow, Triple Display, 100% Copper with Anti-Corrosion", 0, 15, 4.9, 320],
  [308, "IFB 8 Kg 5-Star Front Load Washing Machine (Senator Smart)", "appliances", "kitchen-appliances", 36990, "AI Powered Wash, 9 Swirl Wash, Steam Wash at 95°C for 99.9% Germ Protection", 0, 18, 4.8, 410],
  [309, "LG 28L Charcoal Convection Microwave Oven (MJ2886BWUM)", "appliances", "kitchen-appliances", 19990, "Charcoal Lighting Heater for tandoori roasting, Diet Fry for 88% less oil cooking", 0, 25, 4.8, 280],
  [310, "Dyson V12 Detect Slim Cordless Vacuum Cleaner", "appliances", "kitchen-appliances", 44900, "Laser reveals invisible dust, Piezo sensor counts particles, 150AW suction, LCD screen", 0, 12, 4.9, 190],
  [311, "Morphy Richards 24L Digital Oven Toaster Griller (OTG)", "appliances", "kitchen-appliances", 8499, "Motorized Rotisserie, Convection baking technology, Digital timer and temperature display", 0, 30, 4.7, 240],

  // 4. Fashion (401 - 412)
  [401, "Levi's Men 511 Slim Fit Stretchable Denim Jeans (Dark Indigo)", "fashion", "mens-clothing", 2499, "Classic 5-pocket styling, Cotton-elastane blend for flexibility and premium everyday durability", 0, 50, 4.8, 620],
  [402, "Puma Flyer Runner Running & Training Shoes for Men (Black-White)", "fashion", "footwear", 2199, "SoftFoam+ comfort sockliner for instant step-in cushioning, breathable mesh upper", 0, 60, 4.7, 850],
  [403, "Titan Neo Analog Dial Quartz Watch for Men (Stainless Steel Strap)", "fashion", "watches", 4295, "Midnight blue sunray dial, Mineral glass, 50m water resistance, 2-year warranty", 0, 30, 4.8, 290],
  [404, "U.S. Polo Assn. Solid Slim Fit Pure Cotton Polo T-Shirt", "fashion", "mens-clothing", 999, "100% Pique Cotton, Signature brand embroidery, Ribbed collar and sleeve hems", 0, 75, 4.6, 410],
  [405, "Nike Air Jordan 1 Low Retro Sneakers (Gym Red/White)", "fashion", "footwear", 8995, "Encapsulated Air-Sole unit for lightweight cushioning, genuine leather upper, rubber cupsole", 0, 35, 4.9, 1120],
  [406, "Adidas Ultraboost Light Running Shoes for Men", "fashion", "footwear", 11999, "Light BOOST midsole cushioning, PRIMEKNIT+ textile upper, Continental rubber grip outsole", 0, 40, 4.9, 740],
  [407, "Tommy Hilfiger Classic Oxford Cotton Button-Down Shirt", "fashion", "mens-clothing", 3999, "100% Premium organic oxford cotton, embroidered flag logo on chest, regular tailored fit", 0, 45, 4.8, 390],
  [408, "Zara Structured Tailored Blazer Jacket", "fashion", "mens-clothing", 6990, "Peak lapel collar, double-welt front pockets, premium crease-resistant blended fabric", 0, 25, 4.7, 210],
  [409, "Fossil Grant Chronograph Leather Watch for Men", "fashion", "watches", 9995, "Roman numeral dial with 3 sub-dials, rich genuine amber leather strap, 50m water resistant", 0, 35, 4.8, 480],
  [410, "Casio G-Shock GA-2100 Carbon Core Guard Watch (All Black)", "fashion", "watches", 8995, "Octagonal retro bezel, 200m water resistance, shock-absorbent carbon fiber reinforced resin", 0, 50, 4.9, 870],
  [411, "Ray-Ban Aviator Classic Polarized Sunglasses (Gold Frame, Green Lens)", "fashion", "mens-clothing", 8590, "Crystal green polarized lenses, timeless teardrop metal frame, 100% UV400 protection", 0, 30, 4.9, 520],
  [412, "Samsonite GuardIT 2.0 Laptop Backpack (Black 27L)", "fashion", "mens-clothing", 4500, "Padded 15.6-inch laptop compartment, ergonomic shoulder straps, water-repellent ballistic nylon", 0, 55, 4.8, 640],

  // 5. Beauty (501 - 510)
  [501, "Minimalist 10% Niacinamide Face Serum with Zinc (30ml)", "beauty", "skincare", 599, "Clinically tested for blemish marks reduction, sebum control, and pore refining", 1, 65, 4.9, 1200],
  [502, "Cetaphil Gentle Skin Cleanser for Sensitive & Dry Skin (250ml)", "beauty", "skincare", 499, "Dermatologist recommended, Soap-free, Fragrance-free hydrating cleanser with Niacinamide", 0, 80, 4.8, 980],
  [503, "Maybelline SuperStay Matte Ink Liquid Lipstick (Pioneer 20)", "beauty", "makeup", 549, "Up to 16 Hours intense matte color payoff, smudge-proof, transfer-resistant precision applicator", 0, 90, 4.7, 760],
  [504, "COSRX Advanced Snail 96 Mucin Power Essence (100ml)", "beauty", "skincare", 1299, "96% Snail Secretion Filtrate for deep hydration, skin elasticity, and radiant glass-skin glow", 1, 60, 4.9, 1420],
  [505, "The Ordinary Hyaluronic Acid 2% + B5 Hydration Serum (30ml)", "beauty", "skincare", 850, "Multi-depth hydration with 3 forms of hyaluronic acid and Vitamin B5 for plump skin", 0, 80, 4.8, 1100],
  [506, "La Roche-Posay Anthelios SPF 50+ Invisible Fluid Sunscreen", "beauty", "skincare", 1950, "Broad spectrum UVA/UVB protection, ultra-resistant to water, sweat, and sand, non-greasy", 0, 50, 4.9, 870],
  [507, "L'Oreal Paris Extraordinary Oil Hair Serum (100ml)", "beauty", "haircare", 499, "Infused with 6 precious floral oils for instant 6x shine, frizz control, and heat protection", 0, 95, 4.7, 980],
  [508, "MAC Matte Lipstick (Ruby Woo 3g)", "beauty", "makeup", 1950, "Iconic vivid blue-red shade with long-wearing non-feathering retro matte finish", 0, 70, 4.9, 1340],
  [509, "Forest Essentials Ayurvedic Soundarya Radiance Cream with 24K Gold", "beauty", "skincare", 3975, "Pure 24 Karat Gold Bhasma and saffron infused in rich unrefined sweet almond oil", 1, 30, 4.8, 410],
  [510, "Dior Sauvage Eau De Parfum for Men (100ml)", "beauty", "makeup", 11500, "Radiant Calabrian bergamot, sensual Papua New Guinean vanilla absolute, smoky ambery sillage", 0, 20, 5.0, 780],

  // 6. Food & Health / Grocery (601 - 616)
  [601, "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)", "food-health", "grocery-staples", 349, "Unheated, unfiltered wild forest honey directly extracted from certified natural reserves", 1, 55, 5.0, 342],
  [602, "Cold-Pressed Extra Virgin Olive Oil (1 Liter Glass Bottle)", "food-health", "oils-ghee", 999, "First cold-pressed Spanish olives, rich in healthy monounsaturated fats & Vitamin E", 1, 40, 4.9, 210],
  [603, "Optimum Nutrition (ON) Gold Standard 100% Whey Protein (Double Rich Chocolate 1kg)", "food-health", "nutrition-supplements", 3299, "24g Whey protein per scoop, 5.5g BCAAs, Primary source Whey Isolate, Instantized for easy mixing", 0, 35, 4.9, 1540],
  [604, "Whole Grain Rolled Oats (High Fiber, 1kg Pouch)", "food-health", "grocery-staples", 289, "100% whole grain gluten-free oats, rich in beta-glucan fiber for daily heart and gut wellness", 1, 70, 4.8, 480],
  [605, "California Jumbo Raw Almonds (500g Fresh Pack)", "food-health", "dry-fruits", 499, "Vacuum packed premium crunchy California almonds rich in plant protein and healthy fats", 1, 50, 4.9, 520],
  [606, "Aashirvaad Shudh Chakki Atta (100% Whole Wheat, 10kg)", "food-health", "grocery-staples", 445, "Crafted from golden grains using traditional 4-step chakki process for soft, fluffy rotis", 1, 120, 4.9, 2100],
  [607, "Tata Sampann Unpolished Toor Dal / Arhar Dal (1kg)", "food-health", "grocery-staples", 189, "Unpolished natural toor dal sourced from certified farms, rich in wholesome protein", 1, 90, 4.8, 890],
  [608, "Amul Pure Cow Ghee (1 Liter Tin)", "food-health", "oils-ghee", 620, "Traditional granular texture and authentic aroma, rich source of Vitamin A, D, E & K", 1, 60, 4.9, 1780],
  [609, "Nutraj Signature Premium California Walnuts (Kernels 500g)", "food-health", "dry-fruits", 699, "Extra-light walnut halves, rich source of plant-based Omega-3 ALA, vacuum nitrogen flushed", 1, 65, 4.8, 590],
  [610, "Organic India Tulsi Green Tea Classic (100 Tea Bags Tin)", "food-health", "grocery-staples", 425, "Certified organic blend of Rama, Krishna & Vana Tulsi with delicate sencha green tea", 1, 90, 4.9, 870],
  [611, "Pintola All Natural Creamy Peanut Butter (100% Roasted Peanuts, 1kg)", "food-health", "nutrition-supplements", 399, "Zero added sugar, zero hydrogenated oil, 30g protein per 100g, pure roasted peanuts", 1, 80, 4.8, 1420],
  [612, "Daawat Rozana Super Basmati Rice (5kg Bag)", "food-health", "grocery-staples", 485, "Aged long-grain basmati with sweet aroma and fluffy non-sticky texture for daily cooking", 1, 100, 4.7, 950],
  [613, "Saffola Total Pro Heart Pro-Blend Edible Cooking Oil (5 Liter Can)", "food-health", "oils-ghee", 989, "Dual seed technology (Rice bran & Safflower), Oryzanol power for healthy cholesterol", 0, 70, 4.8, 1140],
  [614, "Dabur Chyawanprash with 2X Immunity 40+ Herbs (1kg Jar)", "food-health", "grocery-staples", 385, "Traditional Ayurvedic formulation backed by clinical trials, rich in Amla Vitamin C", 1, 110, 4.9, 1920],
  [615, "MuscleBlaze Biozyme Performance Whey (Rich Chocolate, 2kg)", "food-health", "nutrition-supplements", 4499, "Enhanced Absorption Formula (EAF), 25g Protein, 5.51g BCAA, Informed-Choice certified", 0, 40, 4.8, 860],
  [616, "True Elements 7-in-1 Super Seeds Mix (Chia, Flax, Pumpkin, Sunflower 500g)", "food-health", "dry-fruits", 449, "Lightly roasted crunchy mix of 7 nutritious seeds, rich in zinc, magnesium, and dietary fiber", 1, 85, 4.8, 640],

  // 7. Home & Kitchen (701 - 710)
  [701, "Milton Thermosteel Flip Lid 1000ml Vacuum Insulated Flask", "home", "kitchen-dining", 949, "24 Hours Hot & Cold retention, 100% Food grade 304 Stainless steel with carry bag", 0, 60, 4.8, 640],
  [702, "Wakefit Orthopedic Memory Foam King Size Mattress (78x72x6 Inch)", "home", "furniture", 13499, "Next-Gen memory foam with differential pressure zone support, breathable 100% cotton cover", 0, 15, 4.9, 410],
  [703, "Solimo Microfiber Reversible Comforter / Blanket (Double Bed, Aqua Blue)", "home", "bedding", 1499, "200 GSM hollow siliconized polyester filling, lightweight warmth, hypoallergenic", 0, 40, 4.7, 320],
  [704, "Prestige Omega Deluxe Granite Non-Stick 3-Piece Cookware Set", "home", "kitchen-dining", 2499, "Omni Tawa, Fry Pan & Kadai with Glass Lid, 5-layer durable German granite coating", 0, 45, 4.8, 510],
  [705, "Pigeon by Stovekraft Sheen Stainless Steel 3-Burner Gas Stove", "home", "kitchen-dining", 3299, "High-efficiency tri-pin brass burners, designer stainless steel body, ISI certified", 0, 30, 4.7, 380],
  [706, "SleepyCat Hybrid Latex Orthopedic CoolGel Memory Foam Pillow", "home", "bedding", 1899, "Contours to neck alignment, infused cooling gel beads, removable washable bamboo cover", 0, 50, 4.8, 420],
  [707, "Spaces 100% Pure Egyptian Cotton 400 TC King Bed Sheet Set", "home", "bedding", 2799, "Sateen weave with silky smooth touch, breathable natural cotton, includes 2 pillow covers", 0, 40, 4.8, 360],
  [708, "Green Soul Monster Ultimate Ergonomic Gaming & Work Chair", "home", "furniture", 16990, "Breathable spandex fabric, magnetic memory foam neck pillow, 4D adjustable armrests", 0, 20, 4.9, 290],
  [709, "Wipro Garnet 12W Smart LED B22 WiFi Color Bulb with Voice Control", "home", "furniture", 699, "16 Million colors with dimming, works with Alexa & Google Assistant, music sync mode", 0, 90, 4.6, 730],
  [710, "Borosil Prime Glass Mixing Bowl Set with Lids (Pack of 3)", "home", "kitchen-dining", 999, "100% Borosilicate glass, oven and microwave safe up to 350°C, air-tight BPA-free lids", 0, 60, 4.8, 540],

  // 8. Toys & Baby Care (801 - 808)
  [801, "LEGO Classic Medium Creative Brick Box Building Set (484 Pieces)", "toys-baby", "toys-games", 2499, "Inspires open-ended creativity with 35 vibrant brick colors, windows, eyes, and tires", 0, 30, 4.9, 290],
  [802, "Pampers All Round Protection Pants Diapers (Large, 74 Count)", "toys-baby", "baby-care", 1199, "Up to 12 hours absorption with magic gel technology and lotion with aloe vera", 0, 50, 4.8, 840],
  [803, "LEGO Technic Bugatti Bolide Agile Race Car Model Building Kit", "toys-baby", "toys-games", 4499, "Working W16 engine, steering, scissor doors, realistic yellow and black finish with decals", 0, 25, 4.9, 390],
  [804, "Hot Wheels 10-Car Gift Pack of 1:64 Scale Vehicles", "toys-baby", "toys-games", 1199, "Authentic die-cast sports and muscle cars with rolling wheels and detailed racing decos", 0, 60, 4.8, 920],
  [805, "Himalaya Total Baby Care Gentle Gift Basket (7 Baby Care Essentials)", "toys-baby", "baby-care", 899, "Gentle baby massage oil, powder, cream, wipes, soap, shampoo with natural herb extracts", 1, 75, 4.8, 670],
  [806, "LuvLap Sunshine Baby Stroller & Pram with Reversible Handle", "toys-baby", "baby-care", 4299, "3-position reclining seat, 5-point safety harness, 360-degree front swivel lock wheels", 0, 20, 4.7, 310],
  [807, "Mattel Scrabble Original Crossword Board Game for Families", "toys-baby", "toys-games", 899, "Classic wordplay board game with letter tiles, tile racks, score pad, and rule guide", 0, 50, 4.8, 540],
  [808, "Chicco Natural Sensation Baby Shampoo & Body Wash (300ml)", "toys-baby", "baby-care", 599, "Soap-free tearless formula with aloe vera & chamomile, tested by pediatricians", 0, 65, 4.8, 480],

  // 9. Auto Accessories (901 - 908)
  [901, "Steelbird SB-50 Adonis Full Face Helmet with Visor (Matte Black, L)", "auto-accessories", "helmets-gear", 1499, "ISI Certified (IS:4151), High impact ABS shell, breathable multi-pore interior padding", 0, 40, 4.8, 510],
  [902, "70mai Smart Dash Cam 1S (1080P Full HD, Night Vision, G-Sensor)", "auto-accessories", "car-electronics", 3999, "Sony IMX307 sensor, 130-degree wide angle, voice control and emergency auto-recording", 0, 25, 4.7, 180],
  [903, "Vega Crux Half Face Helmet with Smoke Visor (Glossy Black, M)", "auto-accessories", "helmets-gear", 1099, "ISI certified shell, quick release metallic buckle, removable odor-resistant cheek pads", 0, 50, 4.7, 420],
  [904, "Qubo Smart Tire Inflator Portable Air Compressor for Car & Bike", "auto-accessories", "car-electronics", 2799, "Auto shutoff with real-time digital pressure gauge, 150 PSI max, built-in LED torch", 0, 40, 4.8, 310],
  [905, "Bergmann Typhoon Heavy Duty Metal Car Vacuum Cleaner 150W", "auto-accessories", "car-electronics", 1499, "100% Pure copper motor, medical grade HEPA filter, 5-meter power cord with accessories", 0, 35, 4.7, 260],
  [906, "3M Large Car Care Auto Wash Shampoo (1 Liter)", "auto-accessories", "helmets-gear", 399, "High foaming pH-balanced formula removes dirt without stripping wax coating", 0, 80, 4.8, 710],
  [907, "TVS Motor Premium Weather-Resistant Two-Wheeler Body Cover", "auto-accessories", "helmets-gear", 699, "100% Water-resistant polyester with mirror pockets and buckle strap lock", 0, 60, 4.7, 390],
  [908, "All-Weather Heavy Duty Anti-Skid Rubber 7D Car Floor Mats", "auto-accessories", "helmets-gear", 2999, "Laser cut custom tailored design with curly heel pad, waterproof and easy to clean", 0, 30, 4.8, 340],

  // 10. Sports & Fitness (1001 - 1008)
  [1001, "Yonex Muscle Power 29 Light Graphite Badminton Racquet", "sports-fitness", "badminton", 2199, "High modulus graphite frame, Isometric head shape with Muscle Power shock absorption", 0, 45, 4.8, 380],
  [1002, "Boldfit Anti-Skid Yoga Mat 6mm with Carrying Strap (Navy Blue)", "sports-fitness", "fitness-accessories", 799, "Eco-friendly TPE material, double-sided non-slip grip, sweat-resistant & easy to clean", 1, 60, 4.7, 490],
  [1003, "Nivia Storm Football Rubber Moulded Size 5 Official Match Ball", "sports-fitness", "badminton", 599, "Rubber moulded exterior for hard surfaces, 32-panel aerodynamic construction", 0, 60, 4.7, 520],
  [1004, "Kobo Hexagonal Rubber Encased Dumbbell Pair (5kg x 2)", "sports-fitness", "fitness-accessories", 2199, "Heavy duty cast iron encased in natural virgin rubber with contoured chrome handles", 0, 35, 4.8, 340],
  [1005, "Decathlon Domyos Adjustable Resistance Loop Band Set (3-Pack)", "sports-fitness", "fitness-accessories", 699, "Light, Medium, and Heavy resistance elastic bands for strength and mobility training", 0, 70, 4.8, 480],
  [1006, "SG Savage Edition English Willow Cricket Bat (Full Size Men)", "sports-fitness", "badminton", 7999, "Grade 3 hand-crafted English Willow with thick edges, massive sweet spot, toe guard", 0, 15, 4.9, 210],
  [1007, "Fitkit FK001 Steel Wire High-Speed Skipping Jump Rope with Ball Bearings", "sports-fitness", "fitness-accessories", 299, "Tangle-free 360-degree ball bearing rotation with anti-slip aluminum alloy handles", 0, 90, 4.6, 620],
  [1008, "Firefox Bikes Cyclone 27.5T 21-Speed Alloy Mountain Bicycle", "sports-fitness", "fitness-accessories", 16499, "Lightweight 6061 alloy hardtail frame, Zoom front suspension fork, Shimano Tourney gears", 0, 12, 4.9, 180],
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
  image_url: PRODUCT_UNIQUE_IMAGES[p[0]] || getProductImageUrl(p[0], p[1], p[2], p[3]),
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
