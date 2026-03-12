/* app/privacy/page.tsx
 *
 * Privacy Policy page — accessible at /privacy
 *
 * How this works in Next.js App Router:
 *   Any folder you create inside `app/` becomes a URL route.
 *   This file lives at app/privacy/page.tsx → the URL is /privacy
 *   The Header and Footer are added automatically by layout.tsx.
 *
 * `export const metadata` at the top overrides the default site title
 *   just for this page. The browser tab will show "Privacy Policy — Atelier"
 *   because of the `title.template` we set in layout.tsx.
 *
 * PLACEHOLDER VALUES — search for [BRACKETS] and replace before going live:
 *   [City, Country]   → your business location
 *   [Month YYYY]      → when you last updated this policy
 *   [EU / US / etc.]  → where your Supabase data is stored
 */

import type { Metadata } from "next";
import Link from "next/link";

// ─── Page Metadata ────────────────────────────────────────────────────────────
//
// Next.js merges this with the root metadata in layout.tsx.
// The title becomes "Privacy Policy — Atelier" automatically.

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Atelier collects, uses, and protects your personal information.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  return (
    <div className="py-28 px-6 md:px-12 bg-white">
      <div className="max-w-2xl mx-auto">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-6">
          Legal
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-zinc-900 leading-[1.1] tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 mb-12">
          Last updated: [Month YYYY]
        </p>
        <div className="w-12 h-px bg-zinc-200 mb-12" />

        {/* ── Policy Sections ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-10">

          {/* 1 — Who we are */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              1. Who we are
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Atelier is a premium indie clothing brand based in [City, Country].
              You can reach us at{" "}
              <a
                href="mailto:hello@atelier.co"
                className="underline hover:text-zinc-900 transition-colors duration-200"
              >
                hello@atelier.co
              </a>
              .
            </p>
          </section>

          {/* 2 — What data we collect */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              2. What data we collect
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-4">
              We only collect personal data that you voluntarily provide through
              our website:
            </p>
            <div className="flex flex-col gap-3">
              <div className="pl-4 border-l border-zinc-200">
                <p className="text-sm text-zinc-500 leading-relaxed">
                  <span className="text-zinc-700 font-medium">Newsletter signup:</span>{" "}
                  your email address only.
                </p>
              </div>
              <div className="pl-4 border-l border-zinc-200">
                <p className="text-sm text-zinc-500 leading-relaxed">
                  <span className="text-zinc-700 font-medium">Contact form:</span>{" "}
                  your name, email address, and the message you write.
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mt-4">
              We do not use advertising trackers, third-party analytics, or
              tracking cookies of any kind.
            </p>
          </section>

          {/* 3 — How we use your data */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              3. How we use your data
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Email addresses from the newsletter are used solely to send
              occasional updates about Atelier products and releases. Contact form
              submissions are used only to respond to your enquiry. We do not
              sell, share, or rent your personal data to any third parties.
            </p>
          </section>

          {/* 4 — Data storage */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              4. Data storage
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Your data is stored securely using Supabase, a GDPR-compliant
              database provider. Data is held in [EU / US] data centres. We
              retain your data only for as long as necessary to fulfil the
              purpose it was collected for, or until you request deletion.
            </p>
          </section>

          {/* 5 — Your rights */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              5. Your rights
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              You have the right to access, correct, or delete any personal data
              we hold about you. To make a request, email{" "}
              <a
                href="mailto:hello@atelier.co"
                className="underline hover:text-zinc-900 transition-colors duration-200"
              >
                hello@atelier.co
              </a>{" "}
              and we will respond within 30 days.
            </p>
          </section>

          {/* 6 — Changes */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              6. Changes to this policy
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              We may update this Privacy Policy from time to time. The date at
              the top of this page will always reflect the most recent revision.
              Continued use of the site after any changes constitutes your
              acceptance of the updated policy.
            </p>
          </section>

          {/* 7 — Contact */}
          <section>
            <h2 className="font-serif text-xl text-zinc-900 mb-3">
              7. Contact
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              For any privacy-related questions, contact us at{" "}
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
