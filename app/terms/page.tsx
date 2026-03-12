/* app/terms/page.tsx
 *
 * Terms of Service page — accessible at /terms
 *
 * Same structure as the Privacy Policy page.
 * Header + Footer are added automatically by layout.tsx.
 *
 * PLACEHOLDER VALUES — search for [BRACKETS] and replace before going live:
 *   [City, Country]   → your business location
 *   [Month YYYY]      → when you last updated these terms
 *   [Country / State] → the governing law jurisdiction
 */

import type { Metadata } from "next";
import Link from "next/link";

// ─── Page Metadata ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using the Atelier website.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TermsPage() {
  return (
    <div className="py-28 px-6 md:px-12 bg-white">
      <div className="max-w-2xl mx-auto">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-6">
          Legal
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-zinc-900 leading-[1.1] tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500 mb-12">
          Last updated: [Month YYYY]
        </p>
        <div className="w-12 h-px bg-zinc-200 mb-12" />

        {/* ── Terms Sections ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-10">

          {/* 1 — Overview */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              1. Overview
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              These Terms of Service govern your use of the Atelier website
              located at{" "}
              <span className="text-zinc-700">atelier.co</span>. By accessing
              this site, you agree to be bound by these terms. If you do not
              agree, please do not use the site.
            </p>
          </section>

          {/* 2 — Use of the website */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              2. Use of the website
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              You may use this website for personal, non-commercial purposes
              only. You agree not to misuse the site, submit false information
              through our forms, attempt to gain unauthorised access to any
              system, or use the site in any way that could damage or impair it.
            </p>
          </section>

          {/* 3 — Intellectual property */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              3. Intellectual property
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              All content on this website — including text, images, logos, and
              design — is the property of Atelier and is protected by copyright.
              You may not reproduce, distribute, or use any content from this
              site without our prior written permission.
            </p>
          </section>

          {/* 4 — Disclaimer */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              4. Disclaimer
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              This website is provided &ldquo;as is&rdquo; without warranties of
              any kind. Atelier makes no representations about the accuracy or
              completeness of the content on this site. We reserve the right to
              update or remove content at any time without notice.
            </p>
          </section>

          {/* 5 — Limitation of liability */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              5. Limitation of liability
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              To the fullest extent permitted by law, Atelier shall not be liable
              for any indirect, incidental, or consequential damages arising from
              your use of this website or its content.
            </p>
          </section>

          {/* 6 — Third-party links */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              6. Third-party links
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              This site may contain links to external websites. Atelier is not
              responsible for the content or privacy practices of those sites.
              Links are provided for convenience only and do not imply
              endorsement.
            </p>
          </section>

          {/* 7 — Governing law */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              7. Governing law
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              These terms are governed by the laws of [Country / State]. Any
              disputes arising from your use of this site shall be subject to
              the exclusive jurisdiction of the courts in [City, Country].
            </p>
          </section>

          {/* 8 — Changes */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              8. Changes to these terms
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              We may update these Terms from time to time. The date at the top
              of this page will reflect the most recent revision. Continued use
              of the site after changes are posted constitutes your acceptance
              of the updated terms.
            </p>
          </section>

          {/* 9 — Contact */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              9. Contact
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Questions about these terms? Email us at{" "}
              <a
                href="mailto:hello@atelier.co"
                className="underline hover:text-zinc-900 transition-colors duration-200"
              >
                hello@atelier.co
              </a>
              .
            </p>
          </section>

        </div>

        {/* ── Back Link ─────────────────────────────────────────────────── */}
        <div className="mt-16 pt-8 border-t border-zinc-100">
          <Link
            href="/"
            className="text-xs tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors duration-200"
          >
            ← Back to home
          </Link>
        </div>

      </div>
    </div>
  );
}
