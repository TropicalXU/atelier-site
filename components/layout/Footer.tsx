/* Footer.tsx
 *
 * The site-wide footer — appears at the bottom of every page.
 *
 * Structure (three columns on desktop, stacked on mobile):
 *   Col 1 — Brand: Atelier wordmark + short tagline
 *   Col 2 — Navigate: same links as the header nav
 *   Col 3 — Legal: Privacy Policy + Terms of Service links
 *
 *   Below the columns: a thin divider + a one-line copyright bar.
 *
 * Note on placement:
 *   The Footer is imported in layout.tsx (not page.tsx) so it
 *   automatically appears on every page — home, privacy, terms, etc.
 *   You never need to add it manually to individual page files.
 *
 */

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-zinc-100">

      {/* ── Main Footer Grid ────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 py-16">
        {/*
          Three columns on desktop (`grid-cols-3`), stacked on mobile (`grid-cols-1`).
          `gap-12` gives comfortable breathing room between columns.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Column 1 — Brand */}
          <div>
            {/* <Link> for internal route — faster than a plain <a> tag */}
            <Link
              href="/"
              className="inline-block text-sm font-semibold tracking-[0.25em] uppercase text-zinc-900 hover:text-zinc-600 transition-colors mb-4"
            >
              Atelier
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[180px]">
              Premium essentials for those who let quality speak for itself.
            </p>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            {/* Column heading */}
            <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mb-5">
              Navigate
            </p>
            <nav className="flex flex-col gap-3" aria-label="Footer navigation">
              {/*
                Using /#section instead of #section so these links work
                correctly from any page (e.g. /privacy, /terms), not just
                the homepage. /#products navigates to the home page then
                scrolls to the #products section.
              */}
              <Link href="/shop" className="text-xs tracking-[0.1em] text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
                Shop
              </Link>
              <Link href="/#story" className="text-xs tracking-[0.1em] text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
                Our Story
              </Link>
              <Link href="/#contact" className="text-xs tracking-[0.1em] text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
                Contact
              </Link>
            </nav>
          </div>

          {/* Column 3 — Legal */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mb-5">
              Legal
            </p>
            <nav className="flex flex-col gap-3" aria-label="Legal links">
              {/*
                These pages will be built in Phase 4.
                Using the real final URLs (/privacy, /terms) now so the links
                are honest — they'll show a 404 until the pages exist, which
                is better than href="#" which silently scrolls to the top.
              */}
              <Link href="/privacy" className="text-xs tracking-[0.1em] text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs tracking-[0.1em] text-zinc-500 hover:text-zinc-900 transition-colors duration-200">
                Terms of Service
              </Link>
            </nav>
          </div>

        </div>
      </div>

      {/* ── Copyright Bar ───────────────────────────────────────────────── */}
      {/*
        `currentYear` is set from JavaScript's Date object — so it
        automatically updates every year without you touching this file.
      */}
      <div className="px-6 md:px-12 py-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-400 tracking-wide">
          © {currentYear} Atelier. All rights reserved.
        </p>
        <p className="text-[11px] text-zinc-400 tracking-wide">
          Made with care.
        </p>
      </div>

    </footer>
  );
}
