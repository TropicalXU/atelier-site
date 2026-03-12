"use client";
//
// components/cart/CartDrawer.tsx
//
// A slide-in cart panel that appears from the right side of the screen.
//
// STRUCTURE:
//   - Overlay: semi-transparent backdrop. Click it to close the drawer.
//   - Panel: white panel that slides in from the right edge.
//     ├── Header row: "Your Cart" title + ✕ close button
//     ├── Items list: scrollable, one row per cart line
//     └── Footer: total amount + checkout placeholder
//
// ANIMATION:
//   The panel is always in the DOM (not conditionally rendered).
//   When closed, it's translated off-screen with `translate-x-full`.
//   When open, it slides back to `translate-x-0`.
//   The CSS `transition-transform duration-300` handles the animation.
//   This avoids animation flicker that can happen with conditional rendering.
//
// Z-INDEX NOTE:
//   The Header is `z-50`. Because the CartDrawer renders *after* Header in
//   the DOM (both are inside CartProvider in layout.tsx), its z-50 elements
//   stack on top of the header — no need for higher z-index values.
//
// ACCESSIBILITY (Fix 5):
//   1. `aria-hidden={!isOpen}` on the panel — screen readers skip it when closed
//   2. `inert` on the panel when closed — keyboard tab stops are removed so
//      focus can't wander into the hidden drawer
//   3. Escape key closes the drawer (standard dialog behaviour)
//   4. Focus moves to the close button when the drawer opens, so the first
//      Tab stop for keyboard users is always the ✕ button
//
//   WHY `inert`?
//     `pointer-events-none` only blocks mouse clicks — it doesn't stop keyboard
//     focus from reaching interactive elements inside the drawer. `inert` does
//     both: it removes all tab stops AND blocks pointer events at once.
//     TypeScript doesn't know about `inert` yet, so we spread it as a prop.

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, handleRemoveFromCart } = useCart();

  // Ref to the close button — we move focus here when the drawer opens
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ── Keyboard: close on Escape ─────────────────────────────────────────────
  //
  // Standard dialog behaviour: pressing Escape should close any modal/drawer.
  // We add the listener when the component mounts and remove it on unmount.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // ── Focus management: move focus to close button when drawer opens ─────────
  //
  // When a dialog opens, focus should move into it so keyboard and screen-reader
  // users aren't stranded behind the overlay. The close button is the safest
  // first focus target — it's always visible when the drawer is open.
  useEffect(() => {
    if (isOpen) {
      // Small delay so the CSS transition has started — avoids a race where
      // the element isn't yet fully in the viewport when focus() fires.
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Count total items (sum of all line quantities) for the header label
  const itemCount = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;

  // Pre-format the total so the JSX stays readable
  const formattedTotal = cart
    ? formatPrice(
        parseFloat(cart.cost.totalAmount.amount),
        cart.cost.totalAmount.currencyCode
      )
    : "$0.00";

  // `inert` removes all tab stops and blocks pointer events inside the panel
  // when the drawer is closed. TypeScript expects a boolean for this attribute.
  const inertProp = !isOpen ? { inert: true } : {};

  return (
    <>
      {/* ── Backdrop overlay ───────────────────────────────────────────────── */}
      {/*
        Always in the DOM. Visible only when isOpen is true.
        `pointer-events-none` when hidden prevents it from blocking clicks.
        Clicking it closes the drawer.
      */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-50 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* ── Drawer panel ───────────────────────────────────────────────────── */}
      {/*
        Full height, max 400px wide, slides from the right.
        `flex flex-col` stacks header / items / footer vertically.
        The items section gets `flex-1 overflow-y-auto` to scroll independently.

        Accessibility attributes:
          role="dialog"             — tells AT this is a dialog
          aria-modal="true"         — AT should treat content behind overlay as inert
          aria-label               — names the dialog for screen readers
          aria-hidden={!isOpen}    — hides from AT when closed (no visual = no AT)
          {...inertProp}            — removes tab stops when closed
      */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        aria-hidden={!isOpen}
        {...inertProp}
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >

        {/* ── Panel header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <p className="text-xs tracking-[0.25em] uppercase text-zinc-900">
            Your Cart
            {itemCount > 0 && (
              <span className="text-zinc-400 ml-2">({itemCount})</span>
            )}
          </p>
          {/* ref lets us programmatically focus this button when drawer opens */}
          <button
            ref={closeButtonRef}
            onClick={closeCart}
            aria-label="Close cart"
            className="text-zinc-400 hover:text-zinc-900 transition-colors duration-200 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* ── Items list ───────────────────────────────────────────────────── */}
        {/*
          `flex-1 overflow-y-auto` means this section expands to fill the
          available space and scrolls independently when there are many items.
          `opacity-50` during loading gives subtle visual feedback.
        */}
        <div
          className={`flex-1 overflow-y-auto px-6 transition-opacity duration-150 ${
            isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* ── Empty state ──────────────────────────────────────────────── */}
          {(!cart || cart.lines.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 mb-4">
                Your cart is empty
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="text-xs tracking-[0.15em] uppercase text-zinc-900 hover:text-zinc-500 transition-colors duration-200 border-b border-zinc-900"
              >
                Browse the collection
              </Link>
            </div>
          )}

          {/* ── Line items ───────────────────────────────────────────────── */}
          {cart && cart.lines.length > 0 && (
            <ul className="divide-y divide-zinc-100">
              {cart.lines.map((line) => {
                const { merchandise } = line;

                // Line total = unit price × quantity
                const lineTotal = formatPrice(
                  parseFloat(merchandise.price.amount) * line.quantity,
                  merchandise.price.currencyCode
                );

                // Only show the variant title if it's not "Default Title"
                // (Shopify gives every product at least one variant;
                // single-option products get "Default Title" as the name)
                const showVariantTitle =
                  merchandise.title !== "Default Title";

                return (
                  <li key={line.id} className="flex gap-4 py-5">

                    {/* Product image */}
                    <div className="relative w-16 h-20 bg-zinc-100 flex-shrink-0 overflow-hidden">
                      {merchandise.image ? (
                        <Image
                          src={merchandise.image.url}
                          alt={merchandise.image.altText ?? merchandise.product.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      {/*
                        `min-w-0` on the flex child prevents long product names
                        from overflowing the flex container.
                      */}
                      <Link
                        href={`/products/${merchandise.product.handle}`}
                        onClick={closeCart}
                        className="text-sm text-zinc-900 font-medium leading-snug hover:text-zinc-500 transition-colors duration-200 block"
                      >
                        {merchandise.product.title}
                      </Link>

                      {showVariantTitle && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {merchandise.title}
                        </p>
                      )}

                      <p className="text-xs text-zinc-400 mt-1">
                        Qty: {line.quantity}
                      </p>
                    </div>

                    {/* Price + remove button */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <button
                        onClick={() => handleRemoveFromCart(line.id)}
                        aria-label={`Remove ${merchandise.product.title}`}
                        className="text-zinc-300 hover:text-zinc-900 transition-colors duration-200 text-base leading-none"
                      >
                        ✕
                      </button>
                      <p className="text-sm text-zinc-700">
                        {lineTotal}
                      </p>
                    </div>

                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Panel footer ─────────────────────────────────────────────────── */}
        {/*
          Always visible at the bottom — even when the items list is scrolled.
          Only shown when there are items in the cart.
        */}
        {cart && cart.lines.length > 0 && (
          <div className="border-t border-zinc-100 px-6 py-6 flex-shrink-0">

            {/* Total */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-500">
                Total
              </p>
              <p className="text-sm text-zinc-900 font-medium">
                {formattedTotal}
              </p>
            </div>

            {/* ── Checkout button ───────────────────────────────────────────
              `cart.checkoutUrl` is the Shopify-hosted checkout URL.
              Shopify generates it automatically for every cart — it looks like:
                https://your-store.myshopify.com/cart/c/abc123
              Clicking this link takes the customer to Shopify's own checkout
              page where they enter shipping and payment details.

              WHY A PLAIN <a> INSTEAD OF NEXT.JS <Link>?
                Next.js <Link> is for navigating within your own app.
                The checkout URL belongs to Shopify's domain, not ours.
                A plain <a> is the correct element for any external URL.

              WHY NOT target="_blank"?
                Checkout should replace the current tab — opening a new tab
                is disorienting and leaves an empty cart drawer tab behind.
            */}
            <a
              href={cart.checkoutUrl}
              className="block w-full bg-zinc-900 text-white text-xs tracking-[0.2em] uppercase py-4 px-8 text-center hover:bg-zinc-700 transition-colors duration-200"
            >
              Checkout
            </a>

          </div>
        )}

      </div>
    </>
  );
}
