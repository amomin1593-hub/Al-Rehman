#!/usr/bin/env python3
"""
Dummy data generator for Al-Rehman Traders.

Run:  python3 scripts/generate_dummy_data.py   (or: npm run data)

Writes:
  data/catalog.json      -> categories, collections, finishes, products (used by the Next.js site)
  data/profile.json      -> dummy customer profile, orders, addresses, wishlist

Edit the lists below, re-run, and the site + SQL stay in sync.
"""
import json
import random
from pathlib import Path

random.seed(7)  # same output every run
ROOT = Path(__file__).resolve().parent.parent

CATEGORIES = [
    {"slug": "sink-bowls", "name": "Sink Bowls", "tagline": "Hand-made basins in every size",
     "description": "Counter-top, wall-hung and hand-made sink bowls in ceramic, stone and steel."},
    {"slug": "bathroom-faucets", "name": "Bathroom Faucets", "tagline": "Basin mixers and pillar taps",
     "description": "Single-lever mixers, pillar cocks and tall basin taps for everyday precision."},
    {"slug": "kitchen-faucets", "name": "Kitchen Faucets", "tagline": "Pull-out and swivel spouts",
     "description": "High-arc, pull-down and wall-mounted kitchen taps built for daily work."},
    {"slug": "muslim-showers", "name": "Muslim Showers", "tagline": "Hygiene sprays and sets",
     "description": "Health faucets, shattaf sets and angle valves with leak-proof hoses."},
    {"slug": "showers", "name": "Showers", "tagline": "Rain heads and shower mixers",
     "description": "Overhead rain showers, hand showers and concealed mixers."},
    {"slug": "accessories", "name": "Accessory Sets", "tagline": "Finishing touches",
     "description": "Towel rails, robe hooks, soap dishes and complete bathroom accessory sets."},
]

COLLECTIONS = [
    {"slug": "noor", "name": "Noor", "line": "Soft curves, light lines"},
    {"slug": "safa", "name": "Safa", "line": "Pure, minimal geometry"},
    {"slug": "indus", "name": "Indus", "line": "Flowing water forms"},
    {"slug": "margalla", "name": "Margalla", "line": "Solid, architectural"},
    {"slug": "zaviya", "name": "Zaviya", "line": "Sharp angles, slim profiles"},
    {"slug": "chenab", "name": "Chenab", "line": "Classic heritage detailing"},
    {"slug": "ravi", "name": "Ravi", "line": "Everyday essentials"},
]

FINISHES = [
    {"slug": "chrome", "name": "Chrome", "hex": "#c9ccd0"},
    {"slug": "brushed-nickel", "name": "Brushed Nickel", "hex": "#a8a49c"},
    {"slug": "matte-black", "name": "Matte Black", "hex": "#2a2a2a"},
    {"slug": "brushed-gold", "name": "Brushed Gold", "hex": "#c8a46a"},
    {"slug": "gunmetal", "name": "Gunmetal", "hex": "#5b5d60"},
]

# per category: (art keys, name templates, price range PKR, spec builder)
TONES = ["#ece8e1", "#e6e2da", "#efece6", "#e3e0db", "#e9e4dc", "#e5e7e6"]

PRODUCT_PLAN = {
    "sink-bowls": {
        "arts": ["basin-round", "basin-rect", "basin-oval"],
        "names": ["Counter-top Basin", "Hand-made Sink Bowl", "Vessel Basin", "Wall-hung Basin", "Oval Sink Bowl", "Square Sink Bowl"],
        "price": (8500, 42000),
        "specs": lambda: {"Size": random.choice(["50x40 cm", "55x45 cm", "60x45 cm", "45x45 cm"]),
                          "Material": random.choice(["Vitreous ceramic", "Hand-made ceramic", "Terrazzo stone"]),
                          "Mounting": random.choice(["Counter-top", "Wall-hung", "Semi-recessed"]),
                          "Warranty": "5 years"},
        "finishes": False,
    },
    "bathroom-faucets": {
        "arts": ["faucet-basin", "faucet-tall", "faucet-pillar"],
        "names": ["Ceramic Basin Mixer", "Tall Basin Mixer", "Gold Waterfall Mixer", "Waterfall Basin Mixer", "Cascade Basin Mixer", "Pull-out Basin Mixer"],
        "price": (6500, 38000),
        "specs": lambda: {"Spout reach": f"{random.choice([110, 125, 140, 160])} mm",
                          "Flow rate": f"{random.choice([5, 6, 8])} L/min",
                          "Cartridge": "35 mm ceramic disc",
                          "Material": "Lead-free brass",
                          "Warranty": f"{random.choice([5, 7, 10])} years"},
        "finishes": True,
    },
    "kitchen-faucets": {
        "arts": ["faucet-kitchen", "faucet-kitchen-pull"],
        "names": ["Kitchen Sink Mixer", "Pull-down Kitchen Tap", "Wall Kitchen Mixer", "Swivel Sink Cock", "Pro Spring Kitchen Tap"],
        "price": (9500, 46000),
        "specs": lambda: {"Spout height": f"{random.choice([220, 260, 310, 420])} mm",
                          "Swivel": random.choice(["180°", "360°"]),
                          "Spray modes": str(random.choice([1, 2, 3])),
                          "Material": "Lead-free brass",
                          "Warranty": f"{random.choice([5, 7])} years"},
        "finishes": True,
    },
    "muslim-showers": {
        "arts": ["bidet-spray"],
        "names": ["Muslim Shower Set", "Angle Valve", "Gold Angle Valve", "Chrome Angle Valve", "Heavy Brass Angle Valve"],
        "price": (1800, 14500),
        "specs": lambda: {"Hose": f"{random.choice([1.2, 1.5])} m stainless braided",
                          "Includes": random.choice(["Spray, hose, holder", "Spray, hose, holder, angle valve"]),
                          "Body": random.choice(["ABS chrome", "Solid brass"]),
                          "Warranty": f"{random.choice([2, 3, 5])} years"},
        "finishes": True,
    },
    "showers": {
        "arts": ["shower-head", "shower-column"],
        "names": ["Square Rain Shower Set", "Shower Column", "Gold Shower Mixer Set", "Hand Shower Rail", "Thermostatic Shower Set"],
        "price": (7500, 68000),
        "specs": lambda: {"Head size": f"{random.choice([200, 250, 300, 400])} mm",
                          "Spray modes": str(random.choice([1, 3, 5])),
                          "Anti-limescale": "Silicone nozzles",
                          "Warranty": f"{random.choice([5, 7])} years"},
        "finishes": True,
    },
    "accessories": {
        "arts": ["accessory-set", "towel-rail"],
        "names": ["6-Piece Accessory Set", "Towel Rail & Hook", "Towel Ring", "Soap Dispenser", "Paper Holder", "Glass Corner Shelf"],
        "price": (1500, 24000),
        "specs": lambda: {"Pieces": str(random.choice([1, 2, 4, 6])),
                          "Material": random.choice(["SS 304", "Solid brass"]),
                          "Fixing": "Concealed screws",
                          "Warranty": "3 years"},
        "finishes": True,
    },
}

DESCRIPTIONS = {
    "sink-bowls": "A clean, generous bowl with a smooth glazed finish that resists stains and wipes clean in seconds. Sized for Pakistani vanities and pre-drilled for standard pop-up wastes.",
    "bathroom-faucets": "Solid lead-free brass body with a smooth ceramic cartridge and an aerated, splash-free flow. A quiet lever with precise hot/cold control.",
    "kitchen-faucets": "Built for busy kitchens: a high spout that clears large pots, a firm swivel and a lever that stays light even after years of use.",
    "muslim-showers": "A comfortable spray with a soft, even flow and a braided hose that will not kink. Wall holder and fittings included.",
    "showers": "Wide, even rainfall with easy-clean silicone nozzles. Designed to perform well even at low water pressure.",
    "accessories": "Matching bathroom hardware with concealed fixings and a finish that holds up to humidity.",
}


def round_price(x: int) -> int:
    return int(round(x / 50.0) * 50)


def build_products():
    products, pid = [], 1
    for cat in CATEGORIES:
        plan = PRODUCT_PLAN[cat["slug"]]
        for i, base in enumerate(plan["names"]):
            col = COLLECTIONS[(pid + i) % len(COLLECTIONS)]
            price = round_price(random.randint(*plan["price"]))
            on_sale = random.random() < 0.25
            name = f"{col['name']} {base}"
            slug = name.lower().replace(" ", "-").replace("&", "and")
            finishes = ([f["slug"] for f in random.sample(FINISHES, random.randint(2, 4))]
                        if plan["finishes"] else [])
            if finishes and "chrome" not in finishes:
                finishes[0] = "chrome"
            products.append({
                "id": pid,
                "slug": slug,
                "sku": f"ART-{cat['slug'][:3].upper()}-{1000 + pid}",
                "name": name,
                "category": cat["slug"],
                "collection": col["slug"],
                "price": price,
                "compare_at": round_price(price * 1.18) if on_sale else None,
                "finishes": finishes,
                "specs": plan["specs"](),
                "art": plan["arts"][i % len(plan["arts"])],
                "tone": TONES[pid % len(TONES)],
                "badge": "Sale" if on_sale else random.choice([None, None, None, "New", "Best seller"]),
                "rating": round(random.uniform(4.1, 5.0), 1),
                "reviews": random.randint(3, 140),
                "stock": random.choice([0, 4, 12, 25, 25, 40, 40, 60, 60, 80, 80, 100]),
                "featured": i < 1 or random.random() < 0.15,
                "description": DESCRIPTIONS[cat["slug"]],
            })
            pid += 1
    return products


def build_profile(products):
    by_id = {p["id"]: p for p in products}
    statuses = ["Delivered", "Delivered", "Shipped", "Processing"]
    orders = []
    for n in range(4):
        items = random.sample(products, random.randint(1, 3))
        lines = [{"product_id": p["id"], "name": p["name"], "qty": random.randint(1, 2),
                  "price": p["price"], "finish": (p["finishes"] or [None])[0]} for p in items]
        subtotal = sum(l["qty"] * l["price"] for l in lines)
        orders.append({
            "id": f"ART-{24180 - n * 37}",
            "date": ["2026-11-14", "2026-10-02", "2026-08-21", "2026-06-09"][n],
            "status": statuses[3 - n] if n < 2 else "Delivered",
            "payment": random.choice(["Cash on Delivery", "Bank Transfer"]),
            "items": lines,
            "subtotal": subtotal,
            "shipping": 0 if subtotal > 25000 else 450,
        })
    return {
        "user": {"name": "Ahmed Raza", "email": "ahmed.raza@example.com", "phone": "+92 300 1234567",
                 "member_since": "2024-03-07", "tier": "Trade Partner", "avatar_initials": "AR"},
        "stats": {"orders": len(orders), "wishlist": 5, "reward_points": 1240},
        "addresses": [
            {"id": 1, "label": "Home", "default": True, "name": "Ahmed Raza",
             "line1": "House 12, Street 4, Satellite Town", "city": "Gujranwala", "province": "Punjab",
             "phone": "+92 300 1234567"},
            {"id": 2, "label": "Site Office", "default": False, "name": "Ahmed Raza",
             "line1": "Plot 88, Kangniwala Bypass", "city": "Gujranwala", "province": "Punjab",
             "phone": "+92 321 7654321"},
        ],
        "wishlist": [p["id"] for p in random.sample(products, 5)],
        "orders": orders,
    }


def sql_str(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, (dict, list)):
        return "'" + json.dumps(v).replace("'", "''") + "'::jsonb"
    return "'" + str(v).replace("'", "''") + "'"


SCHEMA = """-- Al-Rehman Traders - Supabase schema (run in Supabase SQL editor)
create table if not exists categories (
  slug text primary key, name text not null, tagline text, description text
);
create table if not exists collections (
  slug text primary key, name text not null, line text
);
create table if not exists finishes (
  slug text primary key, name text not null, hex text
);
create table if not exists products (
  id bigint primary key generated by default as identity,
  slug text unique not null,
  sku text unique,
  name text not null,
  category text references categories(slug),
  collection text references collections(slug),
  price integer not null,
  compare_at integer,
  finishes jsonb default '[]'::jsonb,
  specs jsonb default '{}'::jsonb,
  art text,
  tone text,
  badge text,
  rating numeric(2,1),
  reviews integer default 0,
  stock integer default 0,
  featured boolean default false,
  description text,
  image_url text,
  created_at timestamptz default now()
);
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, tier text default 'Customer',
  reward_points integer default 0, created_at timestamptz default now()
);
create table if not exists addresses (
  id bigint primary key generated by default as identity,
  user_id uuid references auth.users(id) on delete cascade,
  label text, is_default boolean default false, name text, line1 text,
  city text, province text, phone text
);
create table if not exists orders (
  id text primary key,
  user_id uuid references auth.users(id),
  status text default 'Processing',
  payment text,
  items jsonb not null,
  subtotal integer not null,
  shipping integer default 0,
  shipping_address jsonb,
  created_at timestamptz default now()
);
create table if not exists wishlist (
  user_id uuid references auth.users(id) on delete cascade,
  product_id bigint references products(id) on delete cascade,
  primary key (user_id, product_id)
);

alter table products enable row level security;
alter table categories enable row level security;
alter table collections enable row level security;
alter table finishes enable row level security;
create policy "public read products" on products for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read collections" on collections for select using (true);
create policy "public read finishes" on finishes for select using (true);

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table wishlist enable row level security;
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own addresses" on addresses for all using (auth.uid() = user_id);
create policy "own orders" on orders for select using (auth.uid() = user_id);
create policy "own wishlist" on wishlist for all using (auth.uid() = user_id);
"""


def build_seed(catalog):
    out = ["-- Al-Rehman Traders - dummy seed data (generated)"]
    for table, rows in [("categories", catalog["categories"]), ("collections", catalog["collections"]),
                        ("finishes", catalog["finishes"])]:
        for r in rows:
            cols = ", ".join(r.keys())
            vals = ", ".join(sql_str(v) for v in r.values())
            out.append(f"insert into {table} ({cols}) values ({vals}) on conflict do nothing;")
    for p in catalog["products"]:
        r = {k: v for k, v in p.items()}
        cols = ", ".join(r.keys())
        vals = ", ".join(sql_str(v) for v in r.values())
        out.append(f"insert into products ({cols}) overriding system value values ({vals}) on conflict do nothing;")
    return "\n".join(out) + "\n"


IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".avif")

# Temporary sample photos: free to use under the Unsplash License (https://unsplash.com/license).
# Products in a category take turns using these. Your own photos in public/products/ replace them.
# Set USE_SAMPLE_PHOTOS = False to go back to the drawn artwork.
USE_SAMPLE_PHOTOS = False
_U = "https://images.unsplash.com/"
_Q = "?w=1000&q=75&auto=format&fit=crop"
SAMPLE_PHOTOS = {
    "sink-bowls": [
        _U + "photo-1596180744691-d19a1b90b53c" + _Q,          # white vessel bowl, Sanibell BV
        _U + "photo-1644916925497-109cbd92087d" + _Q,          # sink with gold faucet, Tile Merchant Ireland
        _U + "flagged/photo-1600002340809-2ce83b75fba6" + _Q,  # wash basin, OS Media
    ],
    "bathroom-faucets": [
        _U + "photo-1586798271453-3b60b56cbba8" + _Q,          # chrome faucet on white sink, Chastity Cortijo
        _U + "photo-1644916925497-109cbd92087d" + _Q,
        _U + "flagged/photo-1600002340809-2ce83b75fba6" + _Q,
    ],
    "kitchen-faucets": [
        _U + "photo-1652918321143-917efc510571" + _Q,          # gold kitchen faucet, Decima Athens
        _U + "photo-1723902499676-5f164528aa2c" + _Q,          # kitchen sink by window, Taylor Friehl
    ],
    "showers": [
        _U + "photo-1643081262278-807976f7f2f7" + _Q,          # shower head with water, Nicole Queiroz
    ],
    "accessories": [
        _U + "photo-1556228453-9b79898f7654" + _Q,             # white towel rack, Curology
    ],
    # "muslim-showers": no good free photo found yet - drawn artwork is used
}


def attach_images(products):
    """Use photos from public/products/ when they exist.

    public/products/<product-slug>.jpg   -> photo for that one product
    public/products/<category-slug>.jpg  -> photo for every product in that category
                                            (sink-bowls, bathroom-faucets, kitchen-faucets,
                                             muslim-showers, showers, accessories)
    No photo -> the drawn placeholder artwork is used.
    """
    folder = ROOT / "public" / "products"
    folder.mkdir(parents=True, exist_ok=True)
    files = {f.stem.lower(): f.name for f in folder.iterdir() if f.suffix.lower() in IMG_EXT}
    catalog_dir = folder / "catalog"
    found = sample = 0
    turn = {}
    pos = {}
    for p in products:
        pos[p["category"]] = pos.get(p["category"], 0) + 1
        own = None
        for ext in IMG_EXT:  # public/products/catalog/<category>-<n>.jpg = Al-Rehman's own photos
            f = catalog_dir / f"{p['category']}-{pos[p['category']]}{ext}"
            if f.exists():
                own = f"catalog/{f.name}"
                break
        name = files.get(p["slug"]) or own or files.get(p["category"])
        if name:
            p["image_url"] = f"/products/{name}"
            found += 1
            continue
        pool = SAMPLE_PHOTOS.get(p["category"], []) if USE_SAMPLE_PHOTOS else []
        if pool:
            i = turn.get(p["category"], 0)
            p["image_url"] = pool[i % len(pool)]
            turn[p["category"]] = i + 1
            sample += 1
        else:
            p["image_url"] = None
    print(f"Photos: {found} your own, {sample} sample (Unsplash), "
          f"{len(products) - found - sample} drawn artwork")


def main():
    import sys
    if (ROOT / "data" / "catalog.json").exists() and "--reset" not in sys.argv:
        print("data/catalog.json already exists, so nothing was changed.")
        print("Your products are now managed in the admin panel (/admin).")
        print("To wipe everything and start again from dummy data, run:  npm run data:reset")
        return
    products = build_products()
    attach_images(products)
    catalog = {"categories": CATEGORIES, "collections": COLLECTIONS, "finishes": FINISHES, "products": products}
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "catalog.json").write_text(json.dumps(catalog, indent=2, ensure_ascii=False))
    (ROOT / "data" / "profile.json").write_text(json.dumps(build_profile(products), indent=2, ensure_ascii=False))
    print(f"Wrote {len(products)} products and profile (supabase/schema.sql is maintained by hand)")


if __name__ == "__main__":
    main()
