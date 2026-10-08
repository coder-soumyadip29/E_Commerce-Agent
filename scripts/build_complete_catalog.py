import json
import os
import sqlite3

# Import data modules
from generate_all_catalog import mobiles_data, electronics_data, appliances_data
from data_fashion_beauty import fashion_data, beauty_data
from data_food_home import food_health_data, home_data
from data_toys_auto_sports import toys_baby_data, auto_accessories_data, sports_fitness_data

all_raw = [
    ("mobiles", mobiles_data),
    ("electronics", electronics_data),
    ("appliances", appliances_data),
    ("fashion", fashion_data),
    ("beauty", beauty_data),
    ("food-health", food_health_data),
    ("home", home_data),
    ("toys-baby", toys_baby_data),
    ("auto-accessories", auto_accessories_data),
    ("sports-fitness", sports_fitness_data),
]

products = []
category_counts = {}

for cat_slug, items in all_raw:
    category_counts[cat_slug] = len(items)
    for it in items:
        pid, name, subcat, price, desc, organic, stock, rating, reviews, img = it
        orig_price = round(price * 1.25, 2) if price < 5000 else round(price * 1.15, 2)
        products.append({
            "id": pid,
            "name": name,
            "category": cat_slug,
            "sub_category": subcat,
            "price": price,
            "original_price": orig_price,
            "description": desc,
            "is_organic": bool(organic),
            "stock": stock,
            "average_rating": rating,
            "review_count": reviews,
            "image_url": img
        })

print(f"Total products compiled: {len(products)}")
for cat, count in category_counts.items():
    print(f"  - {cat}: {count} products")

# 1. Generate lib/catalogProducts.ts
out_ts_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "lib", "catalogProducts.ts")

ts_content = """import { Product } from "./types";

export const ALL_CATALOG_PRODUCTS: Product[] = """ + json.dumps(products, indent=2) + """;
"""

with open(out_ts_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Successfully generated {out_ts_path}")

# 2. Reseed data/store.db with SQLite
db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "store.db")
db_path_temp = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "store_temp.db")
os.makedirs(os.path.dirname(db_path), exist_ok=True)
if os.path.exists(db_path_temp):
    os.remove(db_path_temp)

conn = sqlite3.connect(db_path_temp)
cur = conn.cursor()
cur.execute("PRAGMA foreign_keys = ON;")
cur.execute("PRAGMA journal_mode = WAL;")

cur.executescript("""
DROP VIEW IF EXISTS ratings_summary;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS user_addresses;

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
    payment_intent_id TEXT,
    payment_method TEXT DEFAULT 'card',
    shipping_address TEXT,
    delivery_slot TEXT,
    tracking_status TEXT DEFAULT 'processing',
    estimated_delivery_time TEXT,
    cancellation_reason TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE VIEW ratings_summary AS
SELECT
    product_id,
    AVG(rating) as average_rating,
    COUNT(rating) as review_count
FROM reviews
GROUP BY product_id;
""")

for p in products:
    cur.execute("""
        INSERT INTO products (id, name, category, sub_category, price, original_price, description, is_organic, image_url, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p["id"],
        p["name"],
        p["category"],
        p.get("sub_category", ""),
        p["price"],
        p.get("original_price"),
        p.get("description", ""),
        1 if p.get("is_organic") else 0,
        p.get("image_url", ""),
        p.get("stock", 20)
    ))

conn.commit()

cur.execute("SELECT count(*) FROM products")
p_count = cur.fetchone()[0]
conn.close()

try:
    if os.path.exists(db_path):
        # Also clean wal and shm if present
        for ext in ["", "-wal", "-shm"]:
            f = db_path + ext
            if os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass
    os.replace(db_path_temp, db_path)
except Exception as e:
    print(f"Notice during db replace: {e}")

print(f"SQLite DB seeded successfully at {db_path} with {p_count} products.")

