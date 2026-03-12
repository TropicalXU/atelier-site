/* app/shop/page.tsx
 *
 * The full collection page — accessible at /shop
 *
 * How it works:
 *   - This is an async Server Component, same pattern as FeaturedProducts
 *   - It calls getProducts(24) to fetch up to 24 products from Shopify
 *   - Products are displayed using the shared ProductCard component
 *   - The try/catch means the page still loads if Shopify is temporarily down
 *
 * The Header and Footer are added automatically by layout.tsx.
 *
 * `export const metadata` sets the browser tab title to "Shop — Atelier"
 * using the title.template we defined in layout.tsx.
 */

import type { Metadata } from "next";
import type { Product } from "@/types";
import { getProducts } from "@/lib/shopify";
import ProductCard from "@/components/ui/ProductCard";

// ─── Page Metadata ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full Atelier collection — premium essentials, minimal design.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ShopPage() {
  // Fetch up to 24 products from Shopify.
  // Increase this number when you have more products.
  let products: Product[] = [];
  try {
    products = await getProducts(24);
  } catch (err) {
    console.error("ShopPage: failed to fetch from Shopify", err);
  }

  return (
    <div className="py-28 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.25em] uppercase text-zinc-400 mb-3">
            All products
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-zinc-900 leading-[1.1] tracking-tight">
            The Collection
          </h1>
        </div>

        {/* ── Product Grid ──────────────────────────────────────────────── */}
        {/*
          Same 3-column grid as the homepage featured section.
          `gap-y-14` gives a bit more vertical breathing room since there
          are more rows here than on the homepage.
        */}
        {products.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No products found. Check your Shopify store or connection.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-14">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
