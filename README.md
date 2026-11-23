# Al-Rehman Traders: Sanitary Ware Store

A clean, premium e-commerce storefront built with **Next.js 16 (App Router)** and **Tailwind CSS 4**, using **Python** to generate the dummy catalogue and the Supabase SQL.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## What's inside

| Page | Path |
|---|---|
| Home (hero carousel, collections, essentials, brand block, support, newsletter) | `/` |
| Shop all, with filters and sorting | `/shop` |
| Category pages | `/shop/sink-bowls`, `/shop/muslim-showers`, … |
| Collections index and collection pages | `/collections`, `/collections/noor`, … |
| Product page (finish picker, qty, wishlist, WhatsApp order) | `/product/[slug]` |
| Cart drawer, cart page, checkout (COD / bank / wallet) | `/cart`, `/checkout` |
| **Customer profile**: overview, order tracking, wishlist, addresses, settings | `/account` |
| Support / FAQ / contact, About | `/support`, `/about` |

## Admin panel (`/admin`)

Open **http://localhost:3000/admin**. The default password is `alrehman123`.
To change it, create a file called `.env.local` in the project folder containing:

```
ADMIN_PASSWORD=your-strong-password
```

Then restart `npm run dev`. Before going live, add the same variable in Vercel (Project → Settings → Environment Variables).

| Admin page | What you can do |
|---|---|
| Dashboard | Stock totals, stock value, low or out-of-stock items, recent orders |
| Products & stock | Search and filter, edit price and stock in the table, +/- stock, star = featured on home page, delete |
| Add / edit product | Name, category, collection, price, old price, stock, badge, finishes, specs, description, **photo upload** |
| Home page | Announcement bar, banner slides (add, remove, reorder, upload photo, edit text and links), the two big tiles |
| Orders | Change order status (demo orders until Supabase is connected) |

**How saving works:** the admin saves into `data/*.json` and uploads photos to `public/products/uploads` and `public/home/uploads`.
Make changes on your computer with `npm run dev`, then push to GitHub and Vercel publishes them.
The live site can't save admin changes until Supabase is connected; it shows a message if you try.

## Where to edit things

- **Brand colours and fonts**: `app/globals.css` (the `@theme` block)
- **Phone, WhatsApp, email, address, free-delivery limit**: `lib/site.ts`
- **Logo**: `public/logo-dark.png`, `public/logo-light.png`, `app/icon.png`
- **Hero slides**: `components/HeroCarousel.tsx`
- **Products and home page**: use the admin panel (above).
- **Start over with fresh dummy data**: `npm run data:reset` (warning: this replaces all your products).

- **Product photos**: products show drawn placeholder artwork until a product has an `image_url`. Add real photo URLs (e.g. from Supabase Storage) and they replace the artwork automatically.

## Deploy to Vercel

```bash
git init && git add . && git commit -m "Initial store"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then import the repo at vercel.com/new. The defaults work as they are (framework: Next.js).

## Connect Supabase (database + photo storage)

1. Create a free project at **supabase.com** (region: closest to Pakistan, e.g. Mumbai or Singapore).
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**.
   This creates the tables and a public photo bucket called `media`.
3. Open **Project Settings → API Keys** and copy:
   - the **Project URL** (`https://xxxx.supabase.co`), shown on the project's home page / Data API page
   - a **Secret key** (`sb_secret_...`). Never share it, and never put it in browser code.
4. Put them in `.env.local` (on your computer) **and** in Vercel → Project → Settings → Environment Variables:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxx
ADMIN_PASSWORD=your-strong-password
```

5. Restart `npm run dev` (and redeploy on Vercel). Open `/admin`. The dashboard says
   "Supabase is connected, but it has no products yet". Click **Import starter products** once.
6. Done. From now on, products, stock, prices, the home page and orders are saved in Supabase,
   and photos you upload in the admin go to Supabase Storage. Changes show on the live site immediately.

Without these variables the site still runs from the JSON files in `/data` (on your computer only).
