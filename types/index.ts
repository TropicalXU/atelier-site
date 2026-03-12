// types/index.ts
//
// Shared TypeScript types used across the project.
// Centralising them here means you only update a type in one place,
// and TypeScript will flag every file that needs updating.

// ─── ProductVariant ───────────────────────────────────────────────────────────
//
// A single variant of a product — e.g. "Size M / Colour Navy".
//
// Shopify requires the variant ID (not the product ID) when adding items to a
// cart. A product with three sizes and two colours has up to 6 variants, each
// with its own ID, price, and stock status.
//
// selectedOptions maps option names to the specific values for this variant:
//   e.g. [ { name: "Size", value: "M" }, { name: "Colour", value: "Navy" } ]
//
// availableForSale is Shopify's combined flag for whether the variant can be
// purchased — it accounts for inventory levels and the product's status.

export type ProductVariant = {
  id: string;
  title: string;          // e.g. "M / Navy" — Shopify joins all option values
  availableForSale: boolean;
  price: number;          // this variant's price (variants can have different prices)
  currency: string;       // e.g. "USD"
  selectedOptions: Array<{
    name: string;         // e.g. "Size"
    value: string;        // e.g. "M"
  }>;
};

// ─── ProductOption ────────────────────────────────────────────────────────────
//
// One option axis for a product, e.g. "Size" with values ["XS","S","M","L","XL"].
// A product with Size + Colour options has two ProductOptions.
//
// Shopify's `product.options` gives us these values in the display order set
// in the admin — we use this to render the selector UI in the right order.

export type ProductOption = {
  name: string;     // e.g. "Size"
  values: string[]; // e.g. ["XS", "S", "M", "L", "XL"]
};

// ─── Product ──────────────────────────────────────────────────────────────────
//
// Describes a single product.
//
// Field notes:
//   id       — string (not number) to match Shopify's format when we migrate
//   handle   — the URL-safe slug, e.g. "oversized-wool-coat"
//              → used in product page URLs: /products/oversized-wool-coat
//   variantId — the first variant's ID — kept for simple use cases like
//               ProductCard; the full `variants` array is used on the detail page
//   price    — the lowest variant price (from Shopify's priceRange.minVariantPrice)
//              On the product detail page we show the selected variant's price instead
//   variants — all variants fetched from Shopify (used for the variant selector UI)
//   options  — the option axes (Size, Colour, etc.) used to render selector buttons
//   image    — an object with src + alt, ready for next/image
//   featured — true = show this product in the FeaturedProducts section

export type Product = {
  id: string;
  handle: string;
  variantId: string;    // first variant ID — shortcut for simple use cases
  name: string;
  category: string;
  price: number;        // lowest variant price with cents preserved, e.g. 29.99
  currency: string;     // e.g. "USD"
  description: string;
  image: {
    src: string;
    alt: string;
  };
  featured: boolean;
  variants: ProductVariant[];   // all variants for this product
  options: ProductOption[];     // option axes (Size, Colour, etc.)
};

// ─── Newsletter signup ────────────────────────────────────────────────────────
//
// Matches the `newsletter_signups` table in Supabase.

export type NewsletterSignup = {
  email: string;
};

// ─── Contact message ──────────────────────────────────────────────────────────
//
// Matches the `contact_messages` table in Supabase.

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};
