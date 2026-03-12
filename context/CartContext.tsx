"use client";
//
// context/CartContext.tsx
//
// The cart's shared state — readable and writable from any component.
//
// WHY CONTEXT?
//   Cart state needs to be shared across three unrelated places:
//     - Header: shows "Cart (2)" item count
//     - CartDrawer: shows all items, totals, remove buttons
//     - AddToCartButton: triggers cart updates and opens the drawer
//   React Context is like a shared store — any component inside the provider
//   can read from it and update it, without passing props up and down.
//
// HOW IT WORKS:
//   1. CartProvider wraps the whole app (we add it in layout.tsx)
//   2. On first page load, it calls fetchCart() to restore any existing cart
//      (the cart ID comes from a cookie the server sets when you add items)
//   3. Any component calls `useCart()` to access state and actions
//
// STATE:
//   cart         — the full cart data (items, total, etc.) or null if empty
//   isOpen       — whether the drawer is showing
//   isLoading    — true while an add/remove request is in progress
//
// ACTIONS:
//   openCart()                  — slides the drawer open
//   closeCart()                 — slides the drawer closed
//   handleAddToCart(variantId)  — adds item, returns true on success / false on failure
//   handleRemoveFromCart(lineId)— removes item, updates state

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { addToCart, removeFromCart, fetchCart } from "@/app/actions/cart";
import type { CartData } from "@/lib/cart";

// ─── Context Type ─────────────────────────────────────────────────────────────
//
// This is the shape of what `useCart()` returns.
// TypeScript will enforce that every consumer gets exactly these fields.
//
// handleAddToCart returns a boolean:
//   true  — item was added successfully (button can show "Added ✓")
//   false — something went wrong (button can show an error state)
//
// This lets AddToCartButton show the right label without needing to catch
// errors itself — the context handles all error logging.

type CartContextType = {
  cart: CartData | null;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  handleAddToCart: (variantId: string) => Promise<boolean>;
  handleRemoveFromCart: (lineId: string) => Promise<void>;
};

// ─── Context Creation ─────────────────────────────────────────────────────────
//
// `null` is the initial value — it will be replaced immediately once the
// CartProvider renders. The `useCart()` hook below throws if it's still null
// (i.e. if you accidentally use `useCart()` outside the provider).

const CartContext = createContext<CartContextType | null>(null);

// ─── CartProvider ─────────────────────────────────────────────────────────────
//
// Wraps the app in layout.tsx. All state lives here.

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Restore cart on first page load ──────────────────────────────────────
  //
  // The server has a "cartId" cookie. On mount, we call fetchCart() which
  // reads that cookie (via Server Action) and returns the cart data.
  // If the cart is empty or expired, fetchCart() returns null — that's fine.
  useEffect(() => {
    fetchCart()
      .then(setCart)
      .catch(() => {
        // fetchCart failing just means we start with an empty cart — not an error
      });
  }, []);

  // ── Drawer controls ───────────────────────────────────────────────────────
  //
  // `useCallback` memoises these functions so they don't recreate on every
  // render — small optimisation that prevents unnecessary re-renders in Header
  // and CartDrawer which consume these functions.

  const openCart  = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // ── Add to cart ───────────────────────────────────────────────────────────
  //
  // Returns true on success, false on failure.
  //
  // Why return a boolean instead of throwing?
  //   AddToCartButton needs to know whether the add succeeded so it can show
  //   "Added ✓" or an error state. Since the context already does error
  //   logging, all the button needs is a simple yes/no signal — not the
  //   full error object.
  //
  // Flow:
  //   1. Set loading state (disables the button)
  //   2. Call the Server Action — creates or updates the cart
  //   3. Update local cart state with the new data
  //   4. Open the drawer so the user sees what they just added
  //   5. Return true — add succeeded
  //   6. On any error: log it, return false — button can show error state
  //   7. Always clear loading state (in finally block)

  const handleAddToCart = useCallback(async (variantId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const updatedCart = await addToCart(variantId);
      setCart(updatedCart);
      setIsOpen(true); // Auto-open so the user sees the item was added
      return true;
    } catch (err) {
      console.error("handleAddToCart failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Remove from cart ──────────────────────────────────────────────────────
  //
  // NOTE: `lineId` is the cart line ID (CartLine.id), not the variant ID.

  const handleRemoveFromCart = useCallback(async (lineId: string) => {
    setIsLoading(true);
    try {
      const updatedCart = await removeFromCart(lineId);
      setCart(updatedCart ?? null);
    } catch (err) {
      console.error("handleRemoveFromCart failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        openCart,
        closeCart,
        handleAddToCart,
        handleRemoveFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── useCart Hook ─────────────────────────────────────────────────────────────
//
// The one thing you import in every component that needs cart state.
//
// Usage:
//   import { useCart } from "@/context/CartContext"
//   const { cart, openCart, handleAddToCart } = useCart()

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  // This error fires during development if you forget to wrap the app in
  // CartProvider, or if you call useCart() in a Server Component.
  if (!context) {
    throw new Error(
      "useCart() must be called inside a component that is rendered " +
      "inside <CartProvider>. Check that CartProvider is in layout.tsx."
    );
  }

  return context;
}
