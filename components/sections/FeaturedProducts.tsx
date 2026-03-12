/* FeaturedProducts.tsx
 *
 * The product grid section on the home page.
 *
 * Phase 8 changes from Phase 7:
 *   - Internal ProductCard removed — now imported from components/ui/ProductCard
 *   - "View All" is now a real <Link href="/shop"> (was a <span>)
 *
 * Everything else is unchanged:
 *   - Still fetches from Shopify via getProducts(3)
 *   - Still an async Server Component
 *   - Grid layout and spacing identical
 */

import Link from "next/link";
import type { Product } from "@/types";
import { getProducts } from "@/lib/shopify";
import ProductCard from "@/components/ui/ProductCard";

// ─── Section Component ────────────────────────────────────────────────────────

export default async function FeaturedProducts() {
  let products: Product[] = [];
  try {
    products = await getProducts(3);
  } catch (err) {
    console.error("FeaturedProducts: failed to fetch from Shopify", err);
  }

  return (
    <section id="products" className="py-24 px-6 md:px-12 bg-white scroll-mt-24">

      {/* Section header */}
      <div className="flex items-end justify-between mb-14">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-zinc-400 mb-3">
            Featured
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-zinc-900 leading-tight">
            The Collection
          </h2>
        </div>

        {/* "View All" is now a real link to the /shop page */}
        <Link
          href="/shop"
          className="hidden md:inline-block text-xs tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors duration-200 pb-0.5"
        >
          View All
        </Link>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </section>
  );
}
