/* Header.tsx
 *
 * The navigation bar — appears at the top of every page.
 *
 * Design choices:
 *   - `fixed`        → stays visible as the user scrolls
 *   - `z-50`         → floats above all other content
 *   - `bg-white/90`  → 90% opaque white (slightly see-through)
 *   - `backdrop-blur`→ frosted-glass blur behind the bar
 *   - `border-b`     → thin line separating header from page
 *
 * Phase 9 additions:
 *   - Cart count: shows "Cart (2)" when there are items in the cart.
 *     Clicking it opens the CartDrawer (the slide-in panel).
 *   - `useCart()` provides the count and the openCart action.
 *     This is safe because Header is already a client component.
 *
 * "use client" is required at the top because this component uses useState,
 * which is a React hook that only works in the browser (not on the server).
 * In Next.js App Router, all components are server-side by default — adding
 * "use client" opts this one component into client-side rendering.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  // `isMenuOpen` tracks whether the mobile panel is visible.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // `cart` gives us the current items; `openCart` opens the drawer.
  const { cart, openCart } = useCart();

  // Total item count across all lines (e.g. 2 lines × qty 1 each = 2)
  const itemCount = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;

  // Convenience function — used by each nav link's onClick to close the panel
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-zinc-100">

      {/* ── Main Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 md:px-12">

        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.25em] uppercase text-zinc-900 hover:text-zinc-600 transition-colors"
          onClick={closeMenu}
        >
          Atelier
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
          <Link href="/shop" className="text-xs tracking-[0.15em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
            Shop
          </Link>
          <Link href="/#story" className="text-xs tracking-[0.15em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
            Story
          </Link>
          <Link href="/#contact" className="text-xs tracking-[0.15em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
            Contact
          </Link>
          {/* Cart button — opens the CartDrawer */}
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="text-xs tracking-[0.15em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors duration-200"
          >
            Cart{itemCount > 0 && ` (${itemCount})`}
          </button>
        </nav>

        {/* Mobile: Cart count + Menu toggle — grouped on the right */}
        <div className="flex items-center gap-5 md:hidden">
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="text-xs tracking-[0.15em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Cart{itemCount > 0 && ` (${itemCount})`}
          </button>
          <button
            className="text-xs tracking-[0.15em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

      </div>

      {/* ── Mobile Navigation Panel ───────────────────────────────────────
          Only renders when `isMenuOpen` is true.
          Cart is already accessible via the header bar button above,
          so it's not repeated in the mobile panel.                       */}
      {isMenuOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t border-zinc-100 bg-white"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col px-6 py-8 gap-7">
            <Link
              href="/shop"
              className="text-xs tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors duration-200"
              onClick={closeMenu}
            >
              Shop
            </Link>
            <Link
              href="/#story"
              className="text-xs tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors duration-200"
              onClick={closeMenu}
            >
              Story
            </Link>
            <Link
              href="/#contact"
              className="text-xs tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors duration-200"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </div>
        </nav>
      )}

    </header>
  );
}
