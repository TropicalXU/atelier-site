/* layout.tsx
 *
 * This is the "picture frame" for your entire site.
 * Every page you create is rendered inside this layout.
 *
 * It does five things:
 *   1. Loads your two custom fonts (Inter + Playfair Display)
 *   2. Sets the site title and description (shown in browser tabs and Google)
 *   3. Wraps the whole app in CartProvider so all components can access
 *      cart state (item count, open/close drawer, etc.)
 *   4. Adds the CartDrawer (the slide-in cart panel) once, globally
 *   5. Adds the Header and Footer so they appear on every page automatically
 *
 * WHY CartProvider HERE?
 *   CartProvider is a React Context provider. It needs to wrap every component
 *   that uses `useCart()` — including Header (cart count) and CartDrawer.
 *   Putting it in layout.tsx means it automatically wraps every page.
 *
 * NOTE: CartProvider and CartDrawer are "use client" components, but they
 *   can still wrap Server Components (like `children`). Next.js handles this
 *   correctly — Server Component output is passed as already-rendered React
 *   elements to the client boundary.
 */

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

// ─── Font Setup ──────────────────────────────────────────────────────────────
//
// next/font/google downloads these fonts at build time (no external request
// at runtime), and creates CSS variables you can reference in globals.css.

const inter = Inter({
  variable: "--font-inter",    // becomes var(--font-inter) in CSS
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair", // becomes var(--font-playfair) in CSS
  subsets: ["latin"],
  display: "swap",
});

// ─── Site Metadata ────────────────────────────────────────────────────────────
//
// This is the default metadata for every page on the site.
//
// `title.template` is the smart part: when any page exports its own
//   `title`, Next.js automatically formats it as "[page title] — Atelier".
//   For example, the Privacy Policy page just exports title: "Privacy Policy"
//   and the browser tab will show "Privacy Policy — Atelier" automatically.
//
// `title.default` is what appears on pages that don't export their own title
//   (e.g. the homepage).
//
// `metadataBase` sets the base URL for any absolute URLs in metadata
//   (like Open Graph images). Update this when your real domain is live.

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atelier.co"), // ← update to your real domain
  title: {
    default: "Atelier — Premium Indie Clothing",
    template: "%s — Atelier",                      // e.g. "Privacy Policy — Atelier"
  },
  description: "Minimal. Modern. Editorial. Premium essentials for those who let quality speak.",
  openGraph: {
    siteName: "Atelier",
    type: "website",
    title: "Atelier — Premium Indie Clothing",
    description: "Minimal. Modern. Editorial. Premium essentials for those who let quality speak.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier — Premium Indie Clothing",
    description: "Minimal. Modern. Editorial. Premium essentials for those who let quality speak.",
  },
};

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        The font variables are applied here to the body, so every element
        inside can access them via Tailwind's font-sans / font-serif utilities.
      */}
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {/*
          CartProvider must wrap Header, CartDrawer, and children because
          all three use `useCart()` internally.

          The render order matters for z-index stacking:
            1. Header     (z-50, renders first)
            2. CartDrawer (z-50, renders after → stacks on top of Header)
          So the cart drawer visually covers the header when open — no extra
          z-index values needed beyond z-50.
        */}
        <CartProvider>
          <Header />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
