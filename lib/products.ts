// lib/products.ts
//
// Local sample product data for Phase 5.
//
// WHY THIS FILE EXISTS:
//   Product data should never live inside a component file.
//   Keeping it here means FeaturedProducts.tsx and (later) the shop page
//   both import from one single source of truth.
//
// PHASE 6 MIGRATION NOTE:
//   When you connect Shopify, you will replace this file's export with a
//   function that fetches from the Shopify Storefront API. The components
//   importing this data will not need to change — only this file.
//
// IMAGES:
//   Using Unsplash for high-quality editorial fashion photography.
//   All images are free to use under the Unsplash License.
//   To replace an image: swap the URL with any other Unsplash photo URL,
//   keeping the same ?auto=format&fit=crop&w=800&q=80 query string.
//   Find photos at: https://unsplash.com

import type { Product } from "@/types";

// ─── All Products ─────────────────────────────────────────────────────────────
//
// `featured: true`  → shown in the FeaturedProducts section on the homepage
// `featured: false` → shown only on the full shop/collection page (Phase 8)

export const products: Product[] = [
  // ── Featured (homepage) ───────────────────────────────────────────────────

  {
    id: "1",
    handle: "oversized-wool-coat",
    variantId: "", // local sample data — variantId not needed (Shopify provides real IDs)
    name: "Oversized Wool Coat",
    category: "Outerwear",
    price: 380,
    currency: "USD",
    description:
      "A generous cut in heavyweight boiled wool. Designed to be worn as the final layer — structured enough to stand alone, relaxed enough to live in.",
    image: {
      src: "https://images.unsplash.com/photo-1539533018447-63fcce2678e4?auto=format&fit=crop&w=800&q=80",
      alt: "Oversized wool coat in charcoal, worn against a minimal backdrop",
    },
    featured: true,
    variants: [], // local sample — real variants come from Shopify
    options: [],  // local sample — real options come from Shopify
  },

  {
    id: "2",
    handle: "relaxed-linen-shirt",
    variantId: "",
    name: "Relaxed Linen Shirt",
    category: "Tops",
    price: 145,
    currency: "USD",
    description:
      "Stonewashed linen in a dropped-shoulder, boxy silhouette. Pre-washed for immediate softness. Gets better with every wash.",
    image: {
      src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      alt: "Relaxed white linen shirt laid flat on a light surface",
    },
    featured: true,
    variants: [],
    options: [],
  },

  {
    id: "3",
    handle: "tailored-wide-trousers",
    variantId: "",
    name: "Tailored Wide Trousers",
    category: "Bottoms",
    price: 220,
    currency: "USD",
    description:
      "High-rise wide-leg trousers cut from a medium-weight wool blend. A strong silhouette that pairs equally well with a fitted knit or an oversized shirt.",
    image: {
      src: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80",
      alt: "Wide-leg tailored trousers in a neutral tone, minimally styled",
    },
    featured: true,
    variants: [],
    options: [],
  },

  // ── Non-featured (shop page only, Phase 8) ────────────────────────────────

  {
    id: "4",
    handle: "merino-turtleneck",
    variantId: "",
    name: "Merino Turtleneck",
    category: "Tops",
    price: 195,
    currency: "USD",
    description:
      "Fine-gauge merino in a close-fitting ribbed turtleneck. Lightweight enough to layer, warm enough to wear alone.",
    image: {
      src: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
      alt: "Fitted merino turtleneck in off-white, clean studio background",
    },
    featured: false,
    variants: [],
    options: [],
  },

  {
    id: "5",
    handle: "cotton-utility-jacket",
    variantId: "",
    name: "Cotton Utility Jacket",
    category: "Outerwear",
    price: 265,
    currency: "USD",
    description:
      "A workwear silhouette updated for everyday wear. Four patch pockets, a relaxed single-breasted cut, and a dense cotton canvas that softens over time.",
    image: {
      src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      alt: "Cotton utility jacket in tan, worn open over a simple outfit",
    },
    featured: false,
    variants: [],
    options: [],
  },

  {
    id: "6",
    handle: "straight-leg-chinos",
    variantId: "",
    name: "Straight Leg Chinos",
    category: "Bottoms",
    price: 175,
    currency: "USD",
    description:
      "Mid-rise straight chinos in a washed cotton twill. A clean, unfussy trouser that works from morning to evening.",
    image: {
      src: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
      alt: "Straight-cut chinos in stone, photographed on a clean background",
    },
    featured: false,
    variants: [],
    options: [],
  },
];

// ─── Convenience Exports ──────────────────────────────────────────────────────
//
// These are pre-filtered slices of the full list.
// Import `featuredProducts` in FeaturedProducts.tsx to get only the homepage 3.
// Import `products` directly when you build the full shop page in Phase 8.

export const featuredProducts = products.filter((p) => p.featured);
