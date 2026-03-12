"use client";
//
// components/ui/AddToCartButton.tsx
//
// The "Add to Cart" button on the product detail page.
//
// STATES:
//   idle      → "Add to cart"   (default)
//   loading   → "Adding..."     (while the server action is running)
//   added     → "Added ✓"       (briefly shown after a successful add)
//   error     → "Try again"     (briefly shown if the add failed)
//   unavail   → button disabled (variantId is empty — product has no variant)
//
// The `added` and `error` states both reset back to `idle` after 2 seconds,
// so the button is ready for another click.
//
// WHY "use client"?
//   This component uses React state (useState) and calls a Server Action
//   when clicked. Any component using hooks must be a client component.
//
// WHY DOES handleAddToCart RETURN A BOOLEAN?
//   The context catches all errors internally and logs them. It returns:
//     true  — item was added successfully
//     false — something went wrong
//   This keeps the button simple: it just checks yes/no and picks a label,
//   without needing its own try/catch or error inspection.

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Props = {
  variantId: string;
};

// Which feedback state is the button showing right now?
type ButtonState = "idle" | "added" | "error";

export default function AddToCartButton({ variantId }: Props) {
  const { handleAddToCart, isLoading } = useCart();

  // Tracks the post-action feedback label ("Added ✓" or "Try again")
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  // If variantId is empty, the product has no variants in Shopify.
  // This shouldn't happen with real products, but is a safe fallback.
  const isUnavailable = !variantId;

  async function handleClick() {
    if (isUnavailable || isLoading) return;

    const success = await handleAddToCart(variantId);

    // Show feedback for 2 seconds, then revert to idle
    setButtonState(success ? "added" : "error");
    setTimeout(() => setButtonState("idle"), 2000);
  }

  // Button label changes based on current state
  function getLabel() {
    if (isUnavailable)        return "Unavailable";
    if (isLoading)            return "Adding...";
    if (buttonState === "added") return "Added ✓";
    if (buttonState === "error") return "Try again";
    return "Add to cart";
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isUnavailable}
      className="w-full bg-zinc-900 text-white text-xs tracking-[0.2em] uppercase py-4 px-8 hover:bg-zinc-700 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {getLabel()}
    </button>
  );
}
