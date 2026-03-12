/* Contact.tsx
 *
 * Contact form — saves submitted messages to Supabase.
 *
 * Layout: two columns on desktop (same as before).
 *   - Left column:  headline + description (always visible)
 *   - Right column: the form (swaps to a success message on success)
 *
 * States:
 *   "idle"    → normal form, fields empty and enabled
 *   "loading" → waiting for Supabase, fields + button disabled
 *   "success" → form replaced by a thank-you message in the right column
 *   "error"   → error shown below the submit button
 *
 * Validation:
 *   - Name:    required, at least 2 characters
 *   - Email:   required, must look like an email address
 *   - Message: required, at least 10 characters (catches "ok" or "test" spam)
 *
 * `id="contact"` and `scroll-mt-24` are preserved from the cleanup pass.
 */

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "loading" | "success" | "error";

// Shared input class string — defined once so all inputs look identical
// and you only need to change one place to restyle them all.
const inputClass = `
  w-full px-4 py-3
  border border-zinc-200
  text-sm text-zinc-900
  placeholder-zinc-400
  focus:outline-none focus:border-zinc-500
  transition-colors duration-200
  disabled:opacity-50 disabled:bg-zinc-50
`;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Contact() {
  // One state variable per field
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Overall form state
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isLoading = status === "loading";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // ── Validation ──────────────────────────────────────────────────────
    if (name.trim().length < 2) {
      setErrorMessage("Please enter your name (at least 2 characters).");
      setStatus("error");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    if (message.trim().length < 10) {
      setErrorMessage("Please enter a message (at least 10 characters).");
      setStatus("error");
      return;
    }

    // ── Submit to Supabase ───────────────────────────────────────────────
    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("contact_messages")         // the table we created in Supabase
        .insert({                          // insert one row with all three fields
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        });

      if (error) {
        setErrorMessage("Something went wrong. Please try again.");
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
  }

  return (
    // `scroll-mt-24` clears the fixed header when #contact anchor is used
    <section id="contact" className="py-28 px-6 md:px-12 bg-white scroll-mt-24">

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* ── Left Column: always visible ──────────────────────────────── */}
        <div className="md:sticky md:top-32">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-6">
            Get in touch
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-zinc-900 leading-[1.1] tracking-tight mb-8">
            Let&apos;s talk.
          </h2>
          <div className="w-12 h-px bg-zinc-200 mb-8" />
          <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
            For press enquiries, wholesale, or anything else — we read
            every message and respond within two business days.
          </p>
        </div>

        {/* ── Right Column: form or success message ─────────────────────── */}

        {status === "success" ? (

          // ── Success State ──────────────────────────────────────────────
          // Replaces the form in the right column only.
          // The left column (headline) stays visible for visual balance.
          <div className="flex flex-col gap-4 pt-2">
            <p className="text-xs tracking-[0.3em] uppercase text-zinc-400">
              Message received
            </p>
            <h3 className="font-serif text-2xl md:text-3xl text-zinc-900 leading-snug">
              Thank you for reaching out.
            </h3>
            <div className="w-8 h-px bg-zinc-200" />
            <p className="text-sm text-zinc-500 leading-relaxed">
              We&apos;ll be in touch within two business days.
            </p>
          </div>

        ) : (

          // ── Form (idle / loading / error) ──────────────────────────────
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="text-xs tracking-[0.15em] uppercase text-zinc-500">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                disabled={isLoading}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="text-xs tracking-[0.15em] uppercase text-zinc-500">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                disabled={isLoading}
                className={inputClass}
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="text-xs tracking-[0.15em] uppercase text-zinc-500">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                disabled={isLoading}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Submit button */}
            <div className="flex flex-col items-end gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  px-10 py-3.5
                  bg-zinc-900 text-white
                  text-xs tracking-[0.2em] uppercase font-medium
                  hover:bg-zinc-700
                  transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoading ? "Sending…" : "Send message"}
              </button>

              {/* Error message — only visible in "error" state */}
              {status === "error" && (
                <p className="text-sm text-red-500 text-right" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>

          </form>

        )}

      </div>
    </section>
  );
}
