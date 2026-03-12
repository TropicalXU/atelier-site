// lib/utils.ts
//
// Shared utility helpers used across the app.
// Keep this file small — only add truly reusable, stateless helpers here.

/**
 * Format a price number + currency code into a display string.
 *
 * Uses the JavaScript built-in `Intl.NumberFormat`, which:
 *   - Adds the correct currency symbol automatically ($, £, €, etc.)
 *   - Always shows 2 decimal places (so cents are never lost)
 *   - Works for any ISO 4217 currency code Shopify returns
 *
 * Examples:
 *   formatPrice(380,   "USD")  → "$380.00"
 *   formatPrice(29.99, "USD")  → "$29.99"
 *   formatPrice(380,   "GBP")  → "£380.00"
 *   formatPrice(380,   "EUR")  → "€380.00"
 *
 * WHY NOT `$${product.price}`?
 *   That old pattern has two problems:
 *   1. It assumes USD — breaks for GBP, EUR, etc.
 *   2. It shows whatever number is stored — if the number is 380 (integer)
 *      you get "$380", but if it's 29.99 you get "$29.99". Inconsistent,
 *      and it relies on Math.round() having been correct upstream.
 *   `Intl.NumberFormat` handles all of this reliably in one place.
 *
 * @param price    - The numeric price, e.g. 29.99 or 380
 * @param currency - ISO 4217 currency code from Shopify, e.g. "USD", "GBP"
 */
export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
