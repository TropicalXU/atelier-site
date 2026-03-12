// app/actions/cart.ts
//
// Server Actions for cart operations.
//
// WHAT IS A SERVER ACTION?
//   A Server Action is a function that runs on the server, even though it
//   can be called from client components (like AddToCartButton or CartContext).
//   You mark a file as containing Server Actions by adding "use server" at
//   the top.
//
// WHY USE SERVER ACTIONS INSTEAD OF CLIENT-SIDE FETCH?
//   Our Shopify credentials don't have the NEXT_PUBLIC_ prefix, meaning they're
//   intentionally kept off the client. Server Actions let us call Shopify from
//   the server, so credentials stay private. The client just calls the action
//   like a normal async function — it never sees the credentials.
//
// HOW THE COOKIE WORKS:
//   Shopify carts are identified by an ID (e.g. "gid://shopify/Cart/abc123").
//   We save that ID in a cookie called "cartId" so it persists across page
//   loads and browser sessions (up to 30 days).
//
//   addToCart flow:
//     1. Check for existing "cartId" cookie
//     2a. No cookie → create new Shopify cart, save ID in cookie, return cart
//     2b. Cookie exists → add item to existing cart, return updated cart
//     2c. Cart add fails with "Cart not found" → cart expired → recreate it
//     2d. Cart add fails for any other reason → re-throw (don't recreate)
//
// SMART CART RECREATION (Fix 2):
//   The old code recreated the cart on ANY cartLinesAdd error. That was wrong
//   because a network timeout or invalid variant would silently wipe the cart.
//
//   Now we inspect the error message:
//     "Shopify cart error: Cart not found" → cart expired → safe to recreate
//     Anything else → real error (bad variant, network, etc.) → re-throw
//
//   This works because lib/cart.ts now checks Shopify's `userErrors` array and
//   throws descriptive messages like "Shopify cart error: Cart not found" for
//   business-logic failures.

"use server";

import { cookies } from "next/headers";
import {
  cartCreate,
  cartLinesAdd,
  cartLinesRemove,
  getCart,
  type CartData,
} from "@/lib/cart";

// Cookie configuration — reused by any action that sets the cartId cookie
const CART_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30,       // 30 days in seconds
  httpOnly: true,                    // Client-side JS cannot read this cookie
  sameSite: "lax" as const,         // Protects against CSRF
  secure: process.env.NODE_ENV === "production", // HTTPS-only in production
};

// ─── addToCart ────────────────────────────────────────────────────────────────
//
// Add a product variant to the cart.
// Creates a new Shopify cart if one doesn't exist yet.
//
// Throws on real errors (bad variantId, network failure, etc.) so the caller
// (CartContext) can catch them and show the user a meaningful message.
//
// Usage in a client component:
//   import { addToCart } from "@/app/actions/cart"
//   const updatedCart = await addToCart(product.variantId)

export async function addToCart(variantId: string): Promise<CartData> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  // ── Case 1: No cart yet — create one with this item ──────────────────────
  if (!cartId) {
    const cart = await cartCreate(variantId);
    cookieStore.set("cartId", cart.id, CART_COOKIE_OPTIONS);
    return cart;
  }

  // ── Case 2: Cart exists — try to add to it ───────────────────────────────
  try {
    return await cartLinesAdd(cartId, variantId);
  } catch (err) {
    // ── Case 3: Check whether the cart has expired ────────────────────────
    //
    // Shopify carts expire after ~10 days of inactivity. When that happens,
    // cartLinesAdd throws "Shopify cart error: Cart not found".
    //
    // We ONLY recreate the cart for this specific error. Every other error
    // (network timeout, invalid variantId, out of stock, etc.) is re-thrown
    // so the caller can show the user a helpful message instead of silently
    // wiping their cart.
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    const isCartGone = message.includes("cart not found");

    if (!isCartGone) {
      // Real error — surface it to the caller
      throw err;
    }

    // Cart expired — delete the stale cookie before creating a fresh cart
    cookieStore.delete("cartId");
    const cart = await cartCreate(variantId);
    cookieStore.set("cartId", cart.id, CART_COOKIE_OPTIONS);
    return cart;
  }
}

// ─── removeFromCart ───────────────────────────────────────────────────────────
//
// Remove a specific line item from the cart.
//
// IMPORTANT: This takes the LINE ID (the cart line's own unique ID),
// not the variant ID or product ID. You get the line ID from CartLine.id
// inside the cart data.
//
// Usage:
//   const updatedCart = await removeFromCart(line.id)

export async function removeFromCart(lineId: string): Promise<CartData | null> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  // If no cart exists, nothing to remove
  if (!cartId) return null;

  return await cartLinesRemove(cartId, lineId);
}

// ─── fetchCart ────────────────────────────────────────────────────────────────
//
// Load the current cart on page load (or on context mount).
// Returns null if:
//   - No "cartId" cookie exists (new visitor or cleared cookies)
//   - The cart has expired in Shopify
//
// Usage:
//   const cart = await fetchCart()

export async function fetchCart(): Promise<CartData | null> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) return null;

  try {
    return await getCart(cartId);
  } catch {
    // Cart is gone (expired or invalid ID) — return null rather than throwing
    return null;
  }
}
