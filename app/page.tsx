/* page.tsx — The Home Page
 *
 * This file controls what appears on the home page and in what order.
 * Each section is its own component, imported from /components/sections/.
 *
 * To reorder sections: move the lines below.
 * To add a new section: import it and add it to the list.
 *
 * Note: Header and Footer are NOT listed here — they live in layout.tsx
 * and appear automatically on every page.
 *
 * Current sections (Phase 2 complete ✅):
 *   1. Hero               — full-screen intro
 *   2. FeaturedProducts   — 3-product grid
 *   3. BrandStory         — editorial brand narrative
 *   4. Newsletter         — email signup (UI only — Supabase in Phase 3)
 *   5. Contact            — contact form  (UI only — Supabase in Phase 3)
 */

import Hero from "@/components/sections/Hero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import BrandStory from "@/components/sections/BrandStory";
import Newsletter from "@/components/sections/Newsletter";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <BrandStory />
      <Newsletter />
      <Contact />
    </>
  );
}
