/* app/products/[handle]/page.tsx
 *
 * Dynamic product detail page — accessible at /products/[handle]
 * e.g. /products/oversized-wool-coat
 *
 * HOW DYNAMIC ROUTES WORK:
 *   The folder name `[handle]` is a Next.js placeholder — it matches any URL
 *   segment in that position. Whatever appears in the URL becomes the `handle`
 *   variable inside this component. So /products/oversized-wool-coat gives you
 *   handle = "oversized-wool-coat", which is passed to getProductByHandle().
 *
 * THREE SPECIAL EXPORTS:
 *   1. generateStaticParams — tells Next.js which product pages to pre-build
 *   2. generateMetadata     — sets the browser tab title per product
 *   3. default export       — the actual page component
 *
 * LAYOUT:
 *   - Desktop: two columns — image left (sticky), details right
 *   - Mobile:  single column — image on top, details below
 *
 * ERROR HANDLING:
 *   Two distinct failure cases are handled separately:
 *   - Product not found (404) → `notFound()` shows Next.js's built-in 404 page
 *   - Shopify is unreachable  → friendly "temporarily unavailable" message
 *     (instead of a hard crash / 500 error)
 *
 * PHASE 9.6 CHANGE:
 *   Replaced <AddToCartButton variantId={product.variantId} /> with
 *   <ProductVariantForm> which handles the full variant selection UI.
 *   The static price display was also moved into ProductVariantForm so it
 *   updates dynamically when the user selects a different variant.
 */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByHandle, getProducts } from "@/lib/shopify";
import ProductVariantForm from "@/components/ui/ProductVariantForm";

// ─── generateStaticParams ─────────────────────────────────────────────────────
//
// Runs at build time. Fetches all product handles so Next.js can pre-generate
// a static HTML page for each product (faster loads, better SEO).
// In development (`npm run dev`) this is ignored — pages render on demand.
//
// The try/catch means a Shopify outage during `npm run build` returns an empty
// array instead of crashing the whole build. Pages will be generated on demand
// (server-side rendering) until the next successful build.

export async function generateStaticParams() {
  try {
    const products = await getProducts(100);
    return products.map((p) => ({ handle: p.handle }));
  } catch (err) {
    console.error("generateStaticParams: failed to fetch products from Shopify", err);
    // Return empty array — Next.js will render each page on demand instead
    return [];
  }
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
//
// Sets the browser tab title and description for each product page.
// Uses the title.template from layout.tsx → "Oversized Wool Coat — Atelier"
//
// In Next.js 15, `params` is a Promise, so we await it.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;

  try {
    const product = await getProductByHandle(handle);

    if (!product) {
      return { title: "Product not found" };
    }

    return {
      title: product.name,
      description: product.description || `${product.name} — Atelier`,
    };
  } catch {
    // Shopify unreachable — return a generic title rather than crashing
    return { title: "Product" };
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────
//
// `params` contains the URL segment — e.g. { handle: "oversized-wool-coat" }
// We fetch the product from Shopify using that handle.
//
// TWO error cases:
//   shopifyError = true  → Shopify threw (network error, timeout, etc.)
//                          Show a "temporarily unavailable" message.
//   product = null       → Shopify responded fine but no product has this handle.
//                          Call notFound() to show the 404 page.

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  let product = null;
  let shopifyError = false;

  try {
    product = await getProductByHandle(handle);
  } catch (err) {
    console.error(`ProductPage: failed to fetch product "${handle}"`, err);
    shopifyError = true;
  }

  // Shopify is reachable but no product matched this handle → 404
  if (!shopifyError && !product) notFound();

  // Shopify is unreachable → friendly fallback (not a crash)
  if (shopifyError || !product) {
    return (
      <div className="py-28 px-6 md:px-12 bg-white min-h-[60vh]">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/shop"
            className="text-xs tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors duration-200 mb-14 inline-block"
          >
            ← Back to shop
          </Link>
          <div className="max-w-sm">
            <h1 className="font-serif text-3xl text-zinc-900 mb-4 leading-snug">
              This product is temporarily unavailable.
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              We&apos;re having trouble loading this product right now. Please try again in a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Normal product page
  return (
    <div className="py-28 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* ── Back Link ─────────────────────────────────────────────────── */}
        <Link
          href="/shop"
          className="text-xs tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors duration-200 mb-14 inline-block"
        >
          ← Back to shop
        </Link>

        {/* ── Two-Column Grid ───────────────────────────────────────────── */}
        {/*
          `lg:grid-cols-2` splits into two equal columns on large screens.
          `items-start` keeps both columns aligned to the top.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Left Column: Product Image ─────────────────────────────── */}
          {/*
            `lg:sticky lg:top-32` keeps the image visible as you scroll
            through a long description on desktop — same trick as BrandStory.
          */}
          <div className="lg:sticky lg:top-32">
            <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
              {product.image.src ? (
                <Image
                  src={product.image.src}
                  alt={product.image.alt}
                  fill
                  // `priority` tells Next.js to load this image immediately
                  // (not lazily) since it's the main content of the page.
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-400">
                    {product.category}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Product Details ──────────────────────────── */}
          <div className="pt-2">

            {/* Category label */}
            <p className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-4">
              {product.category}
            </p>

            {/* Product name */}
            <h1 className="font-serif text-3xl md:text-4xl text-zinc-900 leading-[1.15] tracking-tight mb-4">
              {product.name}
            </h1>

            {/* ── Variant Form ───────────────────────────────────────────
              ProductVariantForm is a client component that manages:
                - Price display (updates when variant selection changes)
                - Option selector buttons (Size, Colour, etc.)
                - Add to Cart button (uses the selected variant's ID)

              We pass the full variants and options arrays from Shopify so the
              form can work out availability and pricing for each combination.

              basePrice / baseCurrency are shown as a fallback if the selected
              variant's price can't be determined — in practice this won't
              happen, but it prevents a blank price if something goes wrong.
            */}
            <ProductVariantForm
              variants={product.variants}
              options={product.options}
              basePrice={product.price}
              baseCurrency={product.currency}
            />

            {/* Divider */}
            <div className="w-12 h-px bg-zinc-200 mt-8 mb-8" />

            {/* Description */}
            {product.description && (
              <p className="text-sm text-zinc-500 leading-relaxed">
                {product.description}
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
