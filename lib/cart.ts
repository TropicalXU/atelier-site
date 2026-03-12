// lib/cart.ts
//
// Shopify Storefront API — cart operations.
//
// This file handles everything needed to create and manage a Shopify cart:
//   1. TYPE DEFINITIONS — describes what the cart looks like in our app
//   2. GRAPHQL MUTATIONS/QUERIES — what we send to Shopify
//   3. FETCH FUNCTION — sends requests (mirrors shopifyFetch in lib/shopify.ts)
//   4. FORMAT HELPER — converts Shopify response → our CartData type
//   5. PUBLIC EXPORTS — the four functions used everywhere else
//
// SHOPIFY CART CONCEPT:
//   A Shopify cart has an `id` and a list of `lines`.
//   Each line = one variant + quantity.
//   To add a product you need its VARIANT ID (not product ID).
//   Even products with no options have one variant called "Default Title".
//
// SHOPIFY ERROR HANDLING — two separate error channels:
//
//   Channel A — transport errors (HTTP 4xx/5xx, network failures):
//     These are thrown by `cartFetch` when the response itself is bad.
//     Example: "Shopify cart API error: 503 Service Unavailable"
//
//   Channel B — business-logic errors (HTTP 200, but Shopify says no):
//     Shopify returns HTTP 200 with a `userErrors` array describing what
//     went wrong. These are NOT exceptions from fetch — you have to explicitly
//     check the array. Examples:
//       - "Cart not found"          (expired or invalid cart ID)
//       - "Product variant does not exist"  (bad variantId)
//       - "Merchandise is not available"    (out of stock)
//
//   Previously, userErrors were silently ignored. Now every mutation checks
//   them and throws a descriptive Error so callers can act on the message.

// ─── 1. Types ─────────────────────────────────────────────────────────────────

export type CartLine = {
  id: string;           // Unique line ID — needed to remove a specific item
  quantity: number;
  merchandise: {
    id: string;         // Variant ID (e.g. "gid://shopify/ProductVariant/123")
    title: string;      // Variant title (e.g. "Default Title" or "Blue / Large")
    product: {
      title: string;    // Product name
      handle: string;   // URL slug (for linking back to the product page)
    };
    price: {
      amount: string;       // e.g. "380.00"
      currencyCode: string; // e.g. "USD"
    };
    image: {
      url: string;
      altText: string | null;
    } | null;
  };
};

export type CartData = {
  id: string;           // Shopify cart ID — saved in a cookie between visits
  checkoutUrl: string;  // Shopify-hosted checkout URL — used in Phase 10
  lines: CartLine[];
  cost: {
    totalAmount: {
      amount: string;       // e.g. "525.00"
      currencyCode: string;
    };
  };
};

// ─── 2. Internal Shopify Response Types ───────────────────────────────────────
//
// These describe the raw shape of Shopify's JSON response.
// They are only used inside this file — the rest of the app uses CartData.
//
// NOTE: `cart` is typed as `ShopifyCart | null` in mutation responses.
// When Shopify returns userErrors (e.g. "Cart not found"), the cart field
// is null. We check userErrors first, then the cart field.

type ShopifyCartLineNode = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { title: string; handle: string };
    price: { amount: string; currencyCode: string };
    image: { url: string; altText: string | null } | null;
  };
};

type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  lines: { edges: Array<{ node: ShopifyCartLineNode }> };
  cost: { totalAmount: { amount: string; currencyCode: string } };
};

type ShopifyUserError = { field: string[]; message: string };

type CartMutationResponse = {
  cartCreate?: {
    cart: ShopifyCart | null;         // null when userErrors is non-empty
    userErrors: ShopifyUserError[];
  };
  cartLinesAdd?: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
  cartLinesRemove?: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
};

type CartQueryResponse = {
  cart: ShopifyCart | null;
};

// ─── 3. GraphQL Mutations & Queries ───────────────────────────────────────────
//
// CART_FIELDS is the set of fields we ask for in every cart response.
// The `... on ProductVariant` is an inline fragment — Shopify's `merchandise`
// field is a union type; for physical products it's always ProductVariant.

const CART_FIELDS = `
  id
  checkoutUrl
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            product {
              title
              handle
            }
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
  cost {
    totalAmount {
      amount
      currencyCode
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FIELDS}
    }
  }
`;

// ─── 4. Fetch Function ────────────────────────────────────────────────────────

async function cartFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const domain  = process.env.SHOPIFY_STORE_DOMAIN;
  const token   = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION;

  if (!domain || !token || !version) {
    throw new Error(
      "Shopify env vars missing — check SHOPIFY_STORE_DOMAIN, " +
      "SHOPIFY_STOREFRONT_ACCESS_TOKEN, and SHOPIFY_API_VERSION in .env.local"
    );
  }

  const response = await fetch(
    `https://${domain}/api/${version}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify cart API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  // GraphQL-level errors (schema violations, auth failures) arrive here
  if (json.errors) {
    throw new Error(
      `Shopify cart GraphQL error: ${json.errors[0]?.message ?? "Unknown error"}`
    );
  }

  return json.data as T;
}

// ─── 5. userErrors helper ─────────────────────────────────────────────────────
//
// Shopify uses userErrors for business-logic problems (bad input, cart gone).
// They come back as HTTP 200 — cartFetch will NOT throw for them.
// This helper checks the array and throws a descriptive Error if it's non-empty.
//
// WHY THROW INSTEAD OF RETURN?
//   Throwing lets callers (like app/actions/cart.ts) use try/catch and inspect
//   the message string to decide what to do — e.g. recreate the cart if the
//   error says "Cart not found", but re-throw everything else.

function throwIfUserErrors(errors: ShopifyUserError[] | undefined, context: string): void {
  if (!errors || errors.length === 0) return;
  // Use the first error message — it's the most relevant for our use case.
  // Log all errors so nothing is hidden during development.
  if (errors.length > 1) {
    console.warn(`${context}: additional userErrors:`, errors.slice(1));
  }
  throw new Error(`Shopify cart error: ${errors[0].message}`);
}

// ─── 6. Format Helper ─────────────────────────────────────────────────────────

function formatCart(cart: ShopifyCart): CartData {
  return {
    id:          cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines:       cart.lines.edges.map(({ node }) => node),
    cost:        cart.cost,
  };
}

// ─── 7. Public Exports ────────────────────────────────────────────────────────

/**
 * Create a new Shopify cart containing one item.
 * Throws if Shopify reports a userError (e.g. invalid variantId).
 */
export async function cartCreate(variantId: string): Promise<CartData> {
  const data = await cartFetch<CartMutationResponse>({
    query: CART_CREATE_MUTATION,
    variables: {
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    },
  });

  // Check business-logic errors BEFORE checking the cart field.
  // When there are userErrors, cart will be null — checking errors first gives
  // a clear, actionable message instead of "cartCreate returned no cart".
  throwIfUserErrors(data.cartCreate?.userErrors, "cartCreate");

  const cart = data.cartCreate?.cart;
  if (!cart) throw new Error("cartCreate returned no cart");

  return formatCart(cart);
}

/**
 * Add one item to an existing cart.
 *
 * Common userErrors thrown here:
 *   "Shopify cart error: Cart not found"   — cart ID is expired or invalid
 *   "Shopify cart error: Product variant does not exist" — bad variantId
 *   "Shopify cart error: Merchandise is not available"   — out of stock
 */
export async function cartLinesAdd(
  cartId: string,
  variantId: string
): Promise<CartData> {
  const data = await cartFetch<CartMutationResponse>({
    query: CART_LINES_ADD_MUTATION,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    },
  });

  throwIfUserErrors(data.cartLinesAdd?.userErrors, "cartLinesAdd");

  const cart = data.cartLinesAdd?.cart;
  if (!cart) throw new Error("cartLinesAdd returned no cart");

  return formatCart(cart);
}

/**
 * Remove a line item from the cart by its line ID.
 *
 * NOTE: Takes the LINE ID (cart.lines[n].id), not the variant ID.
 */
export async function cartLinesRemove(
  cartId: string,
  lineId: string
): Promise<CartData> {
  const data = await cartFetch<CartMutationResponse>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
  });

  throwIfUserErrors(data.cartLinesRemove?.userErrors, "cartLinesRemove");

  const cart = data.cartLinesRemove?.cart;
  if (!cart) throw new Error("cartLinesRemove returned no cart");

  return formatCart(cart);
}

/**
 * Fetch a cart by its Shopify ID.
 * Returns null if the cart no longer exists (Shopify carts expire after ~10 days inactive).
 */
export async function getCart(cartId: string): Promise<CartData | null> {
  const data = await cartFetch<CartQueryResponse>({
    query: GET_CART_QUERY,
    variables: { cartId },
  });

  if (!data.cart) return null;
  return formatCart(data.cart);
}
