import os

dirs = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "images"),
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tests", "images"),
]

# Create SVG placeholder templates for all 10 categories + universal low-bandwidth fallback
categories = {
    "placeholder_low_bandwidth": ("CartWise Fast Cache", "#10B981", "#064E3B", "📦 Low-Bandwidth Mode"),
    "mobiles_fallback": ("Mobiles & Tablets", "#3B82F6", "#1E3A8A", "📱 Mobiles & Tablets"),
    "electronics_fallback": ("Electronics & Laptops", "#6366F1", "#312E81", "💻 Laptops & Audio"),
    "appliances_fallback": ("Home Appliances", "#EC4899", "#831843", "❄️ Smart Appliances"),
    "fashion_fallback": ("Fashion & Apparel", "#F59E0B", "#78350F", "👕 Fashion & Footwear"),
    "beauty_fallback": ("Beauty & Wellness", "#F43F5E", "#881337", "✨ Skincare & Beauty"),
    "food_health_fallback": ("Food & Groceries", "#10B981", "#064E3B", "🍯 Organic Food & Health"),
    "home_fallback": ("Home & Kitchen", "#8B5CF6", "#4C1D95", "🛋️ Home & Kitchen"),
    "toys_baby_fallback": ("Toys & Baby Care", "#F97316", "#7C2D12", "🧸 Toys & Baby Care"),
    "auto_fallback": ("Auto Accessories", "#64748B", "#0F172A", "🏍️ Helmets & Auto Gear"),
    "sports_fallback": ("Sports & Fitness", "#14B8A6", "#134E4A", "🏸 Sports & Equipment"),
}

for name, (label, col1, col2, icon_text) in categories.items():
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{col1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{col2};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" rx="16"/>
  <rect x="20" y="20" width="560" height="360" rx="12" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <circle cx="300" cy="170" r="64" fill="rgba(255,255,255,0.12)" filter="url(#shadow)"/>
  <text x="300" y="182" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" fill="#ffffff" text-anchor="middle">{icon_text.split()[0]}</text>
  <text x="300" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">{label}</text>
  <text x="300" y="310" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="rgba(255,255,255,0.75)" text-anchor="middle">CartWise High-Speed Offline Cache • 100% Genuine</text>
</svg>"""

    for target_dir in dirs:
        os.makedirs(target_dir, exist_ok=True)
        file_path = os.path.join(target_dir, f"{name}.svg")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(svg_content)

print(f"Generated {len(categories)} offline SVG images in public/images and tests/images.")
