---
name: shopify-admin-checkout-abandonment-report
role: conversion-optimization
description: "Aggregate abandoned checkout data for a time range, broken down by cart value bucket and hour of day (UTC)."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - abandonedCheckouts:query
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Aggregates abandoned checkout data broken down by cart value bucket and hour of day (UTC). Helps identify when and at what price point customers are most likely to abandon checkout. Scoped to what the `abandonedCheckouts` API provides — device type and geographic location are not available in this API and are not reported.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_checkouts`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| format | string | no | human | Output format: `human` or `json` |
| dry_run | bool | no | false | Preview operations without executing mutations |
| date_range_start | string | yes | — | Start date in ISO 8601 (e.g., `2025-01-01`) |
| date_range_end | string | yes | — | End date in ISO 8601 (e.g., `2025-01-31`) |
| cart_value_buckets | array | no | [0, 25, 50, 100, 250] | Array of thresholds defining cart value bands (e.g., `[0,25,50,100,250]` creates bands: $0–25, $25–50, $50–100, $100–250, $250+) |

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
>
> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**
> **product names, order counts, revenue figures, or any other store data. If a query returns**
> **empty results, report "No data returned" — do not fill in plausible values.**

1. **OPERATION:** `abandonedCheckouts` — query
   **Inputs:** `first: 250`, `query: "created_at:>='<date_range_start>' created_at:<='<date_range_end>'"`, pagination cursor
   **Expected output:** All abandoned checkouts in range with `totalPrice` and `createdAt`; paginate until `hasNextPage: false`; then aggregate in-memory: (1) count by cart value bucket, (2) count by hour of day (UTC, 0–23)

## GraphQL Operations

```graphql
# abandonedCheckouts:query — validated against api_version 2025-04
query AbandonedCheckoutsReport($first: Int!, $after: String, $query: String) {
  abandonedCheckouts(first: $first, after: $after, query: $query) {
    edges {
      node {
        id
        createdAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        customer {
          defaultEmailAddress {
            emailAddress
          }
        }
        lineItems {
          edges {
            node {
              title
              quantity
              variant {
                price
              }
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## Session Tracking

**Claude MUST emit the following output at each stage. This is mandatory.**

**On start**, emit:
```
╔══════════════════════════════════════════════╗
║  SKILL: checkout-abandonment-report          ║
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
OUTCOME SUMMARY
  Total abandoned:   <n>
  Date range:        <start> to <end>
  Errors:            0
  Output:            none
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "checkout-abandonment-report",
  "store": "<domain>",
  "started_at": "<ISO8601>",
  "completed_at": "<ISO8601>",
  "dry_run": false,
  "steps": [
    { "step": 1, "operation": "AbandonedCheckoutsReport", "type": "query", "params_summary": "<date_range_start> to <date_range_end>", "result_summary": "<n> checkouts", "skipped": false }
  ],
  "outcome": {
    "total_abandoned": 0,
    "date_range_start": "<date_range_start>",
    "date_range_end": "<date_range_end>",
    "by_cart_value": [
      { "range": "$0 – $25", "count": 0, "pct": 0.0 }
    ],
    "by_hour_utc": [
      { "hour": "00:00", "count": 0, "pct": 0.0 }
    ],
    "errors": 0,
    "output_file": null
  }
}
```

## Output Format

Two tables displayed inline (no CSV):

**Table 1: Abandonment by Cart Value Bucket**

| Cart Value Range | Abandoned Checkouts | % of Total |
|-----------------|---------------------|------------|
| $0 – $25 | ... | ... |
| $25 – $50 | ... | ... |
| $50 – $100 | ... | ... |
| $100 – $250 | ... | ... |
| $250+ | ... | ... |

**Table 2: Abandonment by Hour of Day (UTC)**

| Hour (UTC) | Abandoned Checkouts | % of Total |
|-----------|---------------------|------------|
| 00:00 | ... | ... |
| 01:00 | ... | ... |
| 02:00 | ... | ... |
| ... | | |

For `format: json`, `by_cart_value` is an array of `{range, count, pct}` objects; `by_hour_utc` is an array of `{hour, count, pct}` objects.

Note: Device type and geographic location are not available in the `abandonedCheckouts` API and are not reported by this skill.

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| No checkouts returned | No abandoned checkouts in date range | Widen date range or verify `read_checkouts` scope |
| Invalid date format | Date not in ISO 8601 | Use format `YYYY-MM-DD` |
| Rate limit (429) | Too many paginated requests | Narrow date range or reduce `first` to 100 |

## Best Practices
1. For high-traffic stores, narrow the date range to 7–14 days for faster results; paginating 90 days of data can produce many API calls.
2. The default `cart_value_buckets` of `[0,25,50,100,250]` works for most stores — adjust thresholds to match your AOV distribution.
3. Hours are reported in UTC — convert to your store's local timezone before drawing conclusions about peak abandonment times.
4. Run this report weekly and compare the by-hour pattern to your promotional send times to find timing opportunities.
5. `email` is included in the query result — combine with the `abandoned-cart-recovery` skill to act on the customers most likely to convert based on their cart value tier.
