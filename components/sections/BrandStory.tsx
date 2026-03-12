/* BrandStory.tsx
 *
 * The "Our Story" section — gives the brand a voice and a point of view.
 *
 * Layout: two columns on desktop, stacked on mobile.
 *   - Left column:  eyebrow label + large serif headline + thin divider line
 *   - Right column: two short paragraphs of brand copy
 *
 * Why two columns?
 *   This is a standard editorial layout in fashion/luxury design. The
 *   asymmetry (short left, longer right) creates visual tension and makes
 *   the section feel considered, not generic.
 *
 * `id="story"` matches the anchor link in the Header nav (#story),
 *   so clicking "Story" scrolls here.
 *
 * To update: replace the placeholder text inside the <p> tags.
 */

export default function BrandStory() {
  return (
    // `scroll-mt-24` clears the fixed header when #story anchor is used
    <section id="story" className="py-28 px-6 md:px-12 bg-zinc-50 scroll-mt-24">

      {/*
        Two-column grid:
          - `grid-cols-1`    = stacked on mobile
          - `md:grid-cols-2` = side by side on 768px+
          - `gap-16`         = generous space between the two columns
          - `items-start`    = both columns align to the top (not centred)
      */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* ── Left Column: Headline ─────────────────────────────────────── */}
        <div className="md:sticky md:top-32">
          {/* Eyebrow label — same style as Hero and FeaturedProducts */}
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-6">
            Our Story
          </p>

          {/* Large serif headline — split across two lines for rhythm */}
          <h2 className="font-serif text-4xl md:text-5xl text-zinc-900 leading-[1.1] tracking-tight mb-8">
            Born from<br />restraint.
          </h2>

          {/* Thin decorative divider — a minimal editorial accent */}
          <div className="w-12 h-px bg-zinc-300" />
        </div>

        {/* ── Right Column: Body Copy ───────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/*
            `leading-relaxed` gives the paragraphs generous line height —
            important for readability in body copy blocks.
          */}
          <p className="text-base text-zinc-600 leading-relaxed">
            Atelier was built on a single conviction: that the most enduring
            pieces are the ones you stop noticing. Not because they disappear,
            but because they simply belong — to the moment, to the body,
            to the life being lived in them.
          </p>

          <p className="text-base text-zinc-600 leading-relaxed">
            We design for the long run. Each piece is considered slowly,
            made from materials chosen for how they age rather than how they
            photograph. We are not interested in trends. We are interested
            in permanence.
          </p>

          <p className="text-base text-zinc-600 leading-relaxed">
            Our collections are small on purpose. We would rather make fewer
            things well than many things quickly.
          </p>

          {/* Subtle CTA — optional, keeps the section from feeling like a dead end */}
          <a
            href="#contact"
            className="inline-block mt-2 text-xs tracking-[0.2em] uppercase text-zinc-900 border-b border-zinc-300 hover:border-zinc-900 pb-0.5 transition-colors duration-200 self-start"
          >
            Get in touch
          </a>
        </div>

      </div>
    </section>
  );
}
