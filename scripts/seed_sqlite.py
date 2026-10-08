import json
import os
import sqlite3

db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "store.db")
os.makedirs(os.path.dirname(db_path), exist_ok=True)

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data.json"), "r", encoding="utf-8") as f:
    data = json.load(f)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Enable WAL & foreign keys
cur.execute("PRAGMA foreign_keys = ON;")
cur.execute("PRAGMA journal_mode = WAL;")

# Drop old tables
cur.executescript("""
DROP VIEW IF EXISTS ratings_summary;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS user_addresses;
""")

# Setup tables
cur.executescript("""
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

# Insert products
for p in data["products"]:
    cur.execute("""
        INSERT INTO products (id, name, category, sub_category, price, original_price, description, is_organic, image_url, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p["id"],
        p["name"],
        p.get("category", "food-health"),
        p.get("sub_category", ""),
        p["price"],
        p.get("original_price"),
        p.get("description", ""),
        1 if p.get("is_organic") else 0,
        p.get("image_url", ""),
        p.get("stock", 20)
    ))

# Insert reviews
for r in data["reviews"]:
    cur.execute("""
        INSERT INTO reviews (product_id, rating, reviewer_name, review_text)
        VALUES (?, ?, ?, ?)
    """, (
        r["product_id"],
        r["rating"],
        r["reviewer_name"],
        r["review_text"]
    ))

# Insert user addresses
for a in data.get("user_addresses", []):
    cur.execute("""
        INSERT INTO user_addresses (user_id, name, phone, street_address, landmark, city, pincode, type, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        a.get("user_id", 1),
        a["name"],
        a["phone"],
        a["street_address"],
        a.get("landmark"),
        a["city"],
        a["pincode"],
        a.get("type", "Home"),
        1 if a.get("is_default") else 0,
        a.get("created_at")
    ))

conn.commit()

# Verify counts
cur.execute("SELECT count(*) FROM products")
p_count = cur.fetchone()[0]

cur.execute("SELECT count(*) FROM reviews")
r_count = cur.fetchone()[0]

cur.execute("SELECT count(*) FROM user_addresses")
a_count = cur.fetchone()[0]

conn.close()

print(f"Successfully seeded {db_path}: {p_count} products, {r_count} reviews, {a_count} addresses.")
