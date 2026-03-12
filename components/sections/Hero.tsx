/* Hero.tsx
 *
 * The first section visitors see — full viewport height, dark background,
 * editorial headline in the serif font, two CTA buttons, scroll indicator.
 *
 * Design breakdown:
 *   - `min-h-screen`         → at least as tall as the browser window
 *   - `bg-zinc-900`          → near-black charcoal background
 *   - `font-serif`           → Playfair Display (set up in globals.css)
 *   - `pt-20`                → padding to clear the fixed header (80px)
 *
 * The two buttons:
 *   - "View Collection" → solid white, links to #products section
 *   - "Our Story"       → outlined, links to #story section
 *
 * The scroll indicator at the bottom is a thin animated line — a common
 * editorial touch on premium fashion sites.
 *
 * To customise: change the headline text, the subline, or the button labels.
 * To add a background image later: replace `bg-zinc-900` with a Next.js
 * <Image> component and use absolute positioning.
 */

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-zinc-900 flex items-center justify-center overflow-hidden">

      {/* Subtle gradient overlay — adds depth to the flat background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 opacity-80 pointer-events-none" />

      {/* Main content — centred on the page */}
      <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl mx-auto pt-20">

        {/* Eyebrow label — the small text above the headline */}
        <p className="text-xs tracking-[0.35em] uppercase text-zinc-500 mb-8">
          New Collection — SS26
        </p>

        {/* Main headline — uses the serif font for editorial impact */}
        {/*
          `leading-[1.1]` tightens the line height, which is a standard
          fashion-editorial typographic choice for large display text.
        */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] tracking-tight mb-8">
          Dressed for<br />
          <em className="not-italic text-zinc-300">silence.</em>
        </h1>

        {/* Subline — short, understated brand statement */}
        <p className="text-sm md:text-base text-zinc-400 tracking-wide max-w-sm mx-auto mb-12 leading-relaxed">
          Premium essentials for those who let quality speak for itself.
        </p>

        {/* CTA Buttons */}
        {/*
          `flex-col sm:flex-row` = stacked on mobile, side by side on larger screens.
          Both buttons are square-cornered (no border-radius) — a common
          choice in minimal premium design.
        */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Primary button — solid white */}
          <a
            href="#products"
            className="inline-block w-full sm:w-auto px-10 py-3.5 bg-white text-zinc-900 text-xs tracking-[0.2em] uppercase font-medium hover:bg-zinc-100 transition-colors duration-200"
          >
            View Collection
          </a>

          {/* Secondary button — outlined */}
          <a
            href="#story"
            className="inline-block w-full sm:w-auto px-10 py-3.5 border border-zinc-600 text-white text-xs tracking-[0.2em] uppercase font-medium hover:border-zinc-300 hover:text-zinc-200 transition-colors duration-200"
          >
            Our Story
          </a>

        </div>
      </div>

      {/* Scroll indicator — vertical line with a label */}
      {/*
        `absolute bottom-10` places it 40px from the bottom of the section.
        `left-1/2 -translate-x-1/2` centres it horizontally.
        The line fades out downward with a CSS gradient.
      */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
        <p className="text-[9px] tracking-[0.35em] uppercase text-zinc-600">Scroll</p>
        <div className="w-px h-10 bg-gradient-to-b from-zinc-500 to-transparent" />
      </div>

    </section>
  );
}
