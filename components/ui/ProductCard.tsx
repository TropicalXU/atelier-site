/* components/ui/ProductCard.tsx
 *
 * Shared product card — used in two places:
 *   - components/sections/FeaturedProducts.tsx (homepage featured grid)
 *   - app/shop/page.tsx (full collection page)
 *
 * Extracting it here means any visual change you make to the card
 * automatically updates both grids at once.
 *
 * The card is wrapped in a Next.js <Link> so clicking anywhere on it
 * navigates to the product detail page at /products/[handle].
 *
 * The `group` class on <Link> enables child hover effects — for example,
 * `group-hover:scale-105` on the image zooms it when the card is hovered.
 */

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  return (
    // `block` makes the Link fill its grid cell (Links are inline by default)
    <Link href={`/products/${product.handle}`} className="group block">
      <article>

        {/* ── Image ──────────────────────────────────────────────────────── */}
        {/* `aspect-[3/4]` locks the image to a portrait ratio — same as before */}
        <div className="relative aspect-[3/4] bg-zinc-100 mb-5 overflow-hidden">
          {product.image.src ? (
            <Image
              src={product.image.src}
              alt={product.image.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            // Shown when a Shopify product has no image uploaded yet
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-400">
                {product.category}
              </p>
            </div>
          )}
        </div>

        {/* ── Info row ───────────────────────────────────────────────────── */}
        {/* Name + category on the left, price on the right — unchanged */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-900 font-medium mb-1 leading-snug">
              {product.name}
            </p>
            <p className="text-xs tracking-[0.15em] uppercase text-zinc-400">
              {product.category}
            </p>
          </div>
          <p className="text-sm text-zinc-700 whitespace-nowrap">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>

      </article>
    </Link>
  );
}
