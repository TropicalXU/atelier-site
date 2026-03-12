/* Newsletter.tsx
 *
 * Email signup form — saves submitted addresses to Supabase.
 *
 * This component has four states:
 *   "idle"    → the normal form, ready to accept input
 *   "loading" → form submitted, waiting for Supabase to respond
 *   "success" → insert succeeded, form replaced by a thank-you message
 *   "error"   → something went wrong, error shown below the form
 *
 * "use client" is required because this component uses:
 *   - useState  (to track the email value and current state)
 *   - onSubmit  (a browser event handler)
 * Both only work in the browser, not on the server.
 *
 * Validation (intentionally simple):
 *   - Email must not be empty
 *   - Email must contain "@" and "." (catches obvious typos)
 *   A duplicate email shows a friendly message instead of a raw error.
 *
 * To find the Postgres error code reference:
 *   23505 = unique_violation (duplicate email — our email column is UNIQUE)
 */

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// The four possible states the form can be in
type Status = "idle" | "loading" | "success" | "error";

// Simple email check — must have an @ and a . after it
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // `preventDefault` stops the browser from doing a full page reload
    // when the form is submitted — we handle it ourselves with JavaScript.
    e.preventDefault();

    // ── Validation ──────────────────────────────────────────────────────
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    // ── Submit to Supabase ───────────────────────────────────────────────
    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("newsletter_signups")  // the table we created in Supabase
        .insert({ email });          // insert one row with the email value

      if (error) {
        // Postgres error code 23505 = unique constraint violation.
        // It means this email is already in the table.
        if (error.code === "23505") {
          setErrorMessage("This email is already subscribed — you're all set.");
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
        setStatus("error");
        return;
      }
    } catch {
      // Catches thrown errors (e.g. missing env vars, network failure)
      setErrorMessage("Could not connect. Please check your connection and try again.");
      setStatus("error");
      return;
    }

    // ── Success ──────────────────────────────────────────────────────────
    setStatus("success");
    setEmail("");
  }

  // ── Success State ────────────────────────────────────────────────────────
  // Replace the form content with a confirmation message.
  // The section shell (dark background, padding) stays the same.
  if (status === "success") {
    return (
      <section className="py-28 px-6 md:px-12 bg-zinc-900">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-6">
            You&apos;re in
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-white leading-[1.15] tracking-tight mb-4">
            Thank you for subscribing.
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            You&apos;ll be the first to hear about new arrivals and early access.
          </p>
        </div>
      </section>
    );
  }

  // ── Default / Error State ────────────────────────────────────────────────
  return (
    <section className="py-28 px-6 md:px-12 bg-zinc-900">
      <div className="max-w-md mx-auto text-center">

        {/* Eyebrow label */}
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-6">
          Stay informed
        </p>

        {/* Headline */}
        <h2 className="font-serif text-3xl md:text-4xl text-white leading-[1.15] tracking-tight mb-4">
          Join the inner circle.
        </h2>

        {/* Subline */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-10">
          New arrivals, behind-the-scenes, and early access — delivered
          quietly to your inbox.
        </p>

        {/* Form — onSubmit calls our handleSubmit function above */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" noValidate>

          {/* Email input
              `value` + `onChange` = "controlled input" — React owns the value.
              `disabled` during loading so the user can't change it mid-submit. */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            aria-label="Email address"
            disabled={status === "loading"}
            className="
              flex-1
              px-4 py-3
              bg-transparent
              border border-zinc-700
              text-white text-sm
              placeholder-zinc-600
              focus:outline-none focus:border-zinc-400
              transition-colors duration-200
              disabled:opacity-50
            "
          />

          {/* Submit button
              `type="submit"` triggers the form's onSubmit when clicked.
              Label changes to "Subscribing…" during the loading state. */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="
              px-8 py-3
              bg-white text-zinc-900
              text-xs tracking-[0.2em] uppercase font-medium
              hover:bg-zinc-100
              transition-colors duration-200
              whitespace-nowrap
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>

        </form>

        {/* Error message — only shown in "error" state */}
        {status === "error" && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
        )}

        {/* Fine print */}
        <p className="mt-5 text-[11px] tracking-wide text-zinc-600">
          No spam. Unsubscribe at any time.
        </p>

      </div>
    </section>
  );
}
