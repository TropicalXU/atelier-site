// lib/shopify.ts
//
// Shopify Storefront API client for Atelier.
//
// This file has three layers — read top to bottom:
//
//   1. TYPE DEFINITIONS  — describes what Shopify sends back (internal only)
//   2. GRAPHQL QUERY     — what we ask Shopify for
//   3. FETCH FUNCTION    — sends the request and handles errors
//   4. FORMAT HELPER     — converts Shopify shape → our Product type
//   5. PUBLIC EXPORTS    — the functions you import in pages/components
//
// HOW IT CONNECTS TO THE REST OF THE PROJECT:
//   - `getProducts()` returns Product[] — the same type used by lib/products.ts
//   - This means components don't need to change when you swap data sources
//   - These functions run SERVER-SIDE ONLY (no "use client" in this file)
//     because the env vars have no NEXT_PUBLIC_ prefix
//
// PHASE 7 SWAP:
//   In the next step, you'll replace:
//     import { featuredProducts } from "@/lib/products"
//   with:
//     const products = await getProducts()
//   in your Server Components. That's the entire integration.

import type { Product, ProductVariant, ProductOption } from "@/types";

// ─── 1. Shopify Response Types ────────────────────────────────────────────────
//
// These describe the exact shape of the JSON Shopify sends back.
// They are only used inside this file — everywhere else uses our Product type.

type ShopifyImage = {
  url: string;
  altText: string | null;
};

type ShopifyMoney = {
  amount: string;       // Always a string from Shopify, e.g. "380.00"
  currencyCode: string; // e.g. "USD", "GBP"
};

// One variant from Shopify — e.g. Size M / Colour Navy
type ShopifyVariantNode = {
  id: string;
  title: string;             // Shopify joins all option values: "M / Navy"
  availableForSale: boolean; // Combined flag: in-stock AND published
  price: ShopifyMoney;       // This specific variant's price
  selectedOptions: Array<{
    name: string;   // "Size"
    value: string;  // "M"
  }>;
};

// One product option axis — e.g. Size with values XS/S/M/L/XL
type ShopifyOption = {
  name: string;     // "Size"
  values: string[]; // ["XS", "S", "M", "L", "XL"]
};

type ShopifyProductNode = {
  id: string;
  handle: string;       // URL slug, e.g. "oversized-wool-coat"
  title: string;
  productType: string;  // Shopify's category field
  description: string;
  priceRange: {
    minVariantPrice: ShopifyMoney; // lowest price across all variants
  };
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  // options gives us the axis labels and all their values, in display order.
  // Used to render the selector buttons in the right order.
  options: ShopifyOption[];
  // We fetch up to 100 variants. Most clothing products have far fewer —
  // e.g. 5 sizes × 3 colours = 15 variants total.
  //
  // FIRST-VARIANT ASSUMPTION — intentional for this test project:
  //   Most Atelier products are simple (one size/colour = one variant), so
  //   taking variants[0] is correct. If a product ever has multiple variants
  //   (e.g. size S/M/L), the product page would need a variant-selector UI
  //   before we can pass the right ID to the cart. That's a future phase.
  //
  //   Safe fallback: if variantId ends up "" (empty), AddToCartButton shows
  //   "Unavailable" and disables itself — nothing breaks.
  //
  //   Every Shopify product has at least one variant even when it has no
  //   options. Single-option products get a variant titled "Default Title".
  variants: {
    edges: Array<{
      node: ShopifyVariantNode;
    }>;
  };
};

type ShopifyProductsResponse = {
  products: {
    edges: Array<{
      node: ShopifyProductNode;
    }>;
  };
};

type ShopifySingleProductResponse = {
  product: ShopifyProductNode | null; // `productByHandle` was removed in 2024-01+
};

// ─── 2. GraphQL Queries ───────────────────────────────────────────────────────
//
// GraphQL lets you ask for exactly the fields you need — nothing more.
// Each field name here maps to a field on ShopifyProductNode above.
//
// `$first: Int!` is a variable — we pass the actual number when calling
// shopifyFetch. The `!` means it's required.
//
// PHASE 9.6 ADDITIONS:
//   - `options { name values }` — option axes for the variant selector UI
//   - `variants(first: 100)` — all variants with price, stock, and selectedOptions
//     (was variants(first: 1) before — now we need the full set)

const PRODUCT_FIELDS = `
  id
  handle
  title
  productType
  description
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  images(first: 1) {
    edges {
      node {
        url
        altText
      }
    }
  }
  options {
    name
    values
  }
  variants(first: 100) {
    edges {
      node {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ${PRODUCT_FIELDS}
        }
      }
    }
  }
`;

const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
    }
  }
`;

// ─── 3. Core Fetch Function ───────────────────────────────────────────────────
//
// All public helpers below call this function internally.
// It reads your credentials from .env.local and sends the GraphQL request.
//
// The generic <T> means: "whatever type the caller expects to get back."
// This lets TypeScript check that we're using the response correctly.

async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {

  const domain  = process.env.SHOPIFY_STORE_DOMAIN;
  const token   = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION;

  // Fail fast with a clear message if any credential is missing
  if (!domain || !token || !version) {
    throw new Error(
      "Shopify env vars missing. Check SHOPIFY_STORE_DOMAIN, " +
      "SHOPIFY_STOREFRONT_ACCESS_TOKEN, and SHOPIFY_API_VERSION in .env.local"
    );
  }

  const endpoint = `https://${domain}/api/${version}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // This header is how Shopify authenticates Storefront API requests
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    // Uncomment this in production to cache responses for 60 seconds:
    // next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(
      `Shopify API request failed: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();

  // GraphQL returns errors inside the response body (not as HTTP status codes)
  if (json.errors) {
    throw new Error(
      `Shopify GraphQL error: ${json.errors[0]?.message ?? "Unknown error"}`
    );
  }

  return json.data as T;
}

// ─── 4. Format Helper ─────────────────────────────────────────────────────────
//
// Converts one Shopify product node → our Product type (from types/index.ts).
// This is the bridge between Shopify's shape and the rest of the app.
//
// Key conversions:
//   title       → name
//   productType → category  (set this in Shopify: Products → Product type)
//   amount      → price     (string "29.99" → number 29.99, preserved exactly)
//   images[0]   → image     (we take the first image only for now)
//   options     → options   (axis labels + all values for the selector UI)
//   variants    → variants  (all variants with price, stock, selectedOptions)
//   variants[0] → variantId (kept for backwards-compatible simple use cases)

function formatProduct(node: ShopifyProductNode): Product {
  const firstImage  = node.images.edges[0]?.node;
  // parseFloat preserves cents — "29.99" → 29.99, "380.00" → 380
  // We intentionally do NOT Math.round() here because that would turn
  // $29.99 into $30. formatPrice() in lib/utils.ts handles display formatting.
  const price       = parseFloat(node.priceRange.minVariantPrice.amount);
  const currency    = node.priceRange.minVariantPrice.currencyCode;
  // variantId is the first variant — kept for simple use cases.
  // The full `variants` array is used on the product detail page.
  const variantId   = node.variants.edges[0]?.node.id ?? "";

  // Map Shopify's variant shape → our ProductVariant type
  const variants: ProductVariant[] = node.variants.edges.map(({ node: v }) => ({
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale,
    price: parseFloat(v.price.amount),
    currency: v.price.currencyCode,
    selectedOptions: v.selectedOptions,
  }));

  // Map Shopify's options shape → our ProductOption type
  // We filter out the synthetic "Title" option that Shopify creates for
  // products with no real options (it has the single value "Default Title").
  const options: ProductOption[] = node.options
    .filter(
      (opt) => !(opt.name === "Title" && opt.values.length === 1 && opt.values[0] === "Default Title")
    )
    .map((opt) => ({
      name: opt.name,
      values: opt.values,
    }));

  return {
    id:          node.id,
    handle:      node.handle,
    variantId,
    name:        node.title,
    category:    node.productType,    // set Product type in Shopify admin
    price,
    currency,
    description: node.description,
    image: {
      src: firstImage?.url ?? "",
      alt: firstImage?.altText ?? node.title,
    },
    featured: false,
    // `featured` is not a built-in Shopify field.
    // Phase 8 option: use a Shopify collection called "Featured" and check
    // whether a product belongs to it, or use a product metafield.
    variants,
    options,
  };
}

// ─── 5. Public Exports ────────────────────────────────────────────────────────
//
// These are the only functions you import in your pages and components.
// Everything above is internal implementation detail.

/**
 * Fetch products from Shopify.
 * @param first - How many products to return (default: 12)
 *
 * Usage in a Server Component:
 *   const products = await getProducts()
 *   const featured = await getProducts(3)
 */
export async function getProducts(first = 12): Promise<Product[]> {
  const data = await shopifyFetch<ShopifyProductsResponse>({
    query: GET_PRODUCTS_QUERY,
    variables: { first },
  });

  return data.products.edges.map(({ node }) => formatProduct(node));
}

/**
 * Fetch a single product by its handle (URL slug).
 * Returns null if no product is found with that handle.
 * @param handle - e.g. "oversized-wool-coat"
 *
 * Usage in a Server Component:
 *   const product = await getProductByHandle("oversized-wool-coat")
 */
export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  const data = await shopifyFetch<ShopifySingleProductResponse>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });

  if (!data.product) return null;
  return formatProduct(data.product);
}
