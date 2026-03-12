"use client";
//
// components/ui/ProductVariantForm.tsx
//
// The interactive part of the product detail page.
// Handles: variant selection, price display, and Add to Cart.
//
// WHY IS THIS A SEPARATE CLIENT COMPONENT?
//   The product detail page (app/products/[handle]/page.tsx) is a Server
//   Component — it runs on the server and can't hold React state. We need
//   state to track which variant the user has selected (Size M, Colour Navy,
//   etc.). This client component receives the product's variants and options
//   as props from the server, then manages selection state on the client.
//
// HOW VARIANT SELECTION WORKS:
//   Each Shopify product has a list of options (axes like "Size" or "Colour")
//   and a list of variants. Every variant is one specific combination of
//   option values, e.g. Size=M and Colour=Navy.
//
//   We store the user's current selection as a plain object:
//     { Size: "M", Colour: "Navy" }
//
//   To find the matching Shopify variant we look for the variant whose
//   selectedOptions all match:
//     variant.selectedOptions.every(opt => selection[opt.name] === opt.value)
//
//   That variant's ID is what we send to the Shopify cart API.
//
// AVAILABILITY:
//   For each option button we check whether any *available* variant exists that
//   matches that value plus whatever is already selected in the other options.
//   Unavailable combinations get a strikethrough style and a disabled button.
//
//   Example:
//     Options: Size (S M L) and Colour (Black White)
//     Current selection: Colour = Black
//     → If "S / Black" is out of stock, the S button is disabled
//     → If "M / Black" and "L / Black" are in stock, M and L are enabled
//
// PRICE:
//   Each variant can have its own price (e.g. XL costs more). The displayed
//   price updates as the user selects different options.
//
//   This component renders the price (replacing the static price on the page).

import { useState, useMemo } from "react";
import type { ProductVariant, ProductOption } from "@/types";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/components/ui/AddToCartButton";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  variants: ProductVariant[];
  options: ProductOption[];
  // base price + currency are the fallback shown when no variant is found.
  // In practice a selected variant is always found, but this prevents a blank
  // price if something unexpected happens.
  basePrice: number;
  baseCurrency: string;
};

// ─── Helper: find matching variant ───────────────────────────────────────────
//
// Given the user's current selection (e.g. { Size: "M", Colour: "Navy" }),
// finds the variant whose selectedOptions all match.
// Returns null if no variant exists for this combination.

function findMatchingVariant(
  variants: ProductVariant[],
  selection: Record<string, string>
): ProductVariant | null {
  return (
    variants.find((v) =>
      v.selectedOptions.every((opt) => selection[opt.name] === opt.value)
    ) ?? null
  );
}

// ─── Helper: check if an option value is available ────────────────────────────
//
// Returns true if at least one AVAILABLE variant exists that:
//   - has `optionValue` for `optionName`
//   - matches the current selection for all OTHER options
//
// This lets us disable buttons for out-of-stock combinations rather than all
// values for a given option.

function isValueAvailable(
  variants: ProductVariant[],
  currentSelection: Record<string, string>,
  optionName: string,
  optionValue: string
): boolean {
  const testSelection = { ...currentSelection, [optionName]: optionValue };
  return variants.some(
    (v) =>
      v.availableForSale &&
      v.selectedOptions.every((opt) => testSelection[opt.name] === opt.value)
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductVariantForm({
  variants,
  options,
  basePrice,
  baseCurrency,
}: Props) {

  // ── Initialise selection from the first variant ───────────────────────────
  //
  // We use the first variant's selectedOptions as the default state.
  // This means: on page load, the first valid combination is pre-selected,
  // the price is correct, and Add to Cart is immediately usable.
  //
  // `useMemo` means this initial value is only computed once (on first render),
  // not on every re-render.
  const initialSelection = useMemo<Record<string, string>>(() => {
    const first = variants[0];
    if (!first) return {};
    return Object.fromEntries(
      first.selectedOptions.map((opt) => [opt.name, opt.value])
    );
  }, [variants]);

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string>>(initialSelection);

  // ── Derive current variant from selection ─────────────────────────────────
  //
  // Re-calculated on every render when selectedOptions changes.
  // `useMemo` makes this efficient — only runs when selectedOptions or
  // variants actually change.
  const selectedVariant = useMemo(
    () => findMatchingVariant(variants, selectedOptions),
    [variants, selectedOptions]
  );

  // ── Handle option button click ────────────────────────────────────────────
  //
  // When the user clicks "M" in the Size group, we update just the Size key
  // while keeping all other selections the same.
  function handleSelect(optionName: string, optionValue: string) {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: optionValue }));
  }

  // ── Derived display values ────────────────────────────────────────────────
  //
  // Price: use selected variant's price if available, fall back to base price
  const displayPrice = selectedVariant?.price ?? basePrice;
  const displayCurrency = selectedVariant?.currency ?? baseCurrency;

  // Whether to show the out-of-stock message near the button
  const isOutOfStock = selectedVariant ? !selectedVariant.availableForSale : false;

  // The variant ID to pass to Add to Cart — empty string disables the button
  const variantId = selectedVariant?.id ?? "";

  // ── No options (single-variant product) ──────────────────────────────────
  //
  // If this product has no meaningful options (Shopify's "Default Title" was
  // filtered out in lib/shopify.ts), just show price + button with no selectors.
  const hasOptions = options.length > 0;

  return (
    <div>

      {/* ── Price ──────────────────────────────────────────────────────────── */}
      {/*
        Replacing the static price in the server component.
        Updates dynamically as the user selects a different variant.
      */}
      <p className="text-lg text-zinc-700 mb-8">
        {formatPrice(displayPrice, displayCurrency)}
        {isOutOfStock && (
          <span className="ml-3 text-xs tracking-[0.15em] uppercase text-zinc-400">
            Out of stock
          </span>
        )}
      </p>

      {/* ── Option Selectors ───────────────────────────────────────────────── */}
      {/*
        One group of buttons per option (e.g. Size, Colour).
        Only rendered if the product has options.
      */}
      {hasOptions && (
        <div className="space-y-6 mb-8">
          {options.map((option) => (
            <div key={option.name}>

              {/* Option label — e.g. "Size" */}
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 mb-3">
                {option.name}
                {/* Show the currently selected value next to the label */}
                <span className="ml-2 text-zinc-900">
                  {selectedOptions[option.name]}
                </span>
              </p>

              {/* Value buttons — e.g. XS / S / M / L / XL */}
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;
                  const available = isValueAvailable(
                    variants,
                    selectedOptions,
                    option.name,
                    value
                  );

                  return (
                    <button
                      key={value}
                      onClick={() => handleSelect(option.name, value)}
                      disabled={!available}
                      aria-label={`${option.name}: ${value}${!available ? " (unavailable)" : ""}`}
                      aria-pressed={isSelected}
                      className={[
                        // Base: small uppercase pill button
                        "min-w-[2.75rem] px-3 py-2 text-xs tracking-[0.1em] uppercase transition-colors duration-150",
                        // Selected: filled dark
                        isSelected
                          ? "bg-zinc-900 text-white border border-zinc-900"
                          : "bg-white text-zinc-700 border border-zinc-300 hover:border-zinc-900",
                        // Unavailable: muted + strikethrough
                        !available
                          ? "opacity-40 cursor-not-allowed line-through"
                          : "cursor-pointer",
                      ].join(" ")}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Divider before button — only shown when we have selectors above */}
      {hasOptions && <div className="w-12 h-px bg-zinc-200 mb-8" />}

      {/* ── Add to Cart Button ─────────────────────────────────────────────── */}
      {/*
        Passes the currently selected variant's ID.
        If variantId is "" (no variant found), AddToCartButton shows "Unavailable".
        If the variant is out of stock, it also shows "Unavailable" since
        Shopify will reject the cartLinesAdd call.
      */}
      <AddToCartButton
        variantId={isOutOfStock ? "" : variantId}
      />

    </div>
  );
}
