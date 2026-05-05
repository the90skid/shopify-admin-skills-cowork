---
name: shopify-admin-frequently-bought-together
role: conversion-optimization
description: "Read-only: mines order history to find product pairs and triplets frequently purchased together, generating cross-sell and bundle recommendations."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - orders:query
  - products:query
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Analyzes order history to discover which products are frequently purchased together. Calculates co-occurrence frequency, lift scores, and confidence metrics to generate data-driven cross-sell recommendations and bundle candidates. Read-only — no mutations.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_orders`, `read_products`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| days_back | integer | no | 180 | Order lookback window |
| min_support | integer | no | 3 | Minimum co-occurrence count to report a pair |
| max_results | integer | no | 25 | Maximum product pairs to return |
| group_size | integer | no | 2 | Pair size: `2` for pairs, `3` for triplets |
| collection_filter | string | no | — | Limit to products in a specific collection |
| format | string | no | human | Output format: `human` or `json` |

## Safety

> ℹ️ Read-only skill — no mutations are executed. Safe to run at any time.

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
>
> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**
> **product names, order counts, revenue figures, or any other store data. If a query returns**
> **empty results, report "No data returned" — do not fill in plausible values.**

1. **OPERATION:** `orders` — query
   **Inputs:** `query: "created_at:>='<NOW - days_back days>'"`, `first: 250`, select `lineItems { product { id, title } }`, pagination cursor
   **Expected output:** All orders with product-level line items

2. For each order with 2+ distinct products, generate all product pair combinations

3. Build co-occurrence matrix:
   - **Support** = number of orders containing both products
   - **Confidence(A→B)** = P(B|A) = support(A,B) / support(A)
   - **Lift** = confidence(A→B) / P(B) — lift > 1.0 means positive association

4. **OPERATION:** `products` — query (enrichment)
   **Inputs:** Product IDs from top pairs for titles, images, prices
   **Expected output:** Product details for display

5. Rank pairs by lift score (descending), filter by min_support

## GraphQL Operations

```graphql
# orders:query — validated against api_version 2025-01
query OrderLineItems($query: String!, $after: String) {
  orders(first: 250, after: $after, query: $query) {
    edges {
      node {
        id
        lineItems(first: 50) {
          edges {
            node {
              product { id title }
              quantity
            }
          }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

```graphql
# products:query — validated against api_version 2025-01
query ProductDetails($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      vendor
      productType
      priceRangeV2 {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      totalInventory
      status
    }
  }
}
```

## Session Tracking

**Claude MUST emit the following output at each stage. This is mandatory.**

**On start**, emit:
```
╔══════════════════════════════════════════════╗
║  SKILL: Frequently Bought Together           ║
║  Started: <YYYY-MM-DD HH:MM UTC>             ║
╚══════════════════════════════════════════════╝
```

**After each step**, emit:
```
[N/TOTAL] <QUERY|MUTATION>  <OperationName>
          → Params: <brief summary of key inputs>
          → Result: <count or outcome>
```

**On completion**, emit:

For `format: human` (default):
```
══════════════════════════════════════════════
FREQUENTLY BOUGHT TOGETHER  (<days_back> days, <n> orders analyzed)
  Unique product pairs found: <n>
  Pairs meeting min_support:  <n>

  TOP PAIRS BY LIFT:
  #1  "<product A>" + "<product B>"
      Support: <n> orders  Lift: <n>x  Confidence: <pct>%

  #2  "<product A>" + "<product B>"
      Support: <n> orders  Lift: <n>x  Confidence: <pct>%

  BUNDLE CANDIDATES (high support + high lift):
    "<product A>" + "<product B>"  →  Suggested bundle price: $<n>

  Output: fbt_pairs_<date>.csv
══════════════════════════════════════════════
```

## Output Format
CSV file `fbt_pairs_<YYYY-MM-DD>.csv` with columns:
`product_a_id`, `product_a_title`, `product_b_id`, `product_b_title`, `support`, `confidence_a_to_b`, `confidence_b_to_a`, `lift`, `combined_avg_price`

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `THROTTLED` | API rate limit exceeded | Wait 2 seconds, retry up to 3 times |
| Single-item orders only | Store with no multi-item orders | Report empty — suggest longer lookback window |
| Too many products | Combinatorial explosion | Limit to top 500 products by order count |

## Best Practices
- Use `days_back: 180` or `365` for sufficient sample size.
- Pairs with lift > 2.0 are strong bundle candidates.
- Use results to create manual product bundles or configure upsell apps.
- Cross-reference with `top-product-performance` to ensure paired items are high-performing.
- Products with high confidence A→B but low confidence B→A suggest directional upsells (show B when A is in cart).
