---
name: shopify-admin-product-data-completeness-score
role: merchandising
description: "Read-only: scores each product on data completeness across description, images, SEO, weight, barcode, cost, and metafields."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - products:query
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Calculates a data completeness score (0–100) for each active product based on the presence of key fields: description, images, SEO title, SEO description, variant weight, barcode, cost, and specified metafields. Produces a ranked list of products needing the most data work. Read-only — no mutations. Catalog health report in a single pass.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_products`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status_filter | string | no | active | Product status to score: `active`, `draft`, or `all` |
| required_metafields | array | no | [] | List of `namespace.key` metafields that are required (e.g., `["custom.material"]`) |
| format | string | no | human | Output format: `human` or `json` |

## Safety

> ℹ️ Read-only skill — no mutations are executed. Safe to run at any time.

## Scoring Rubric

| Field | Points |
|-------|--------|
| Description present (non-empty) | 15 |
| At least 1 image | 15 |
| SEO title present | 10 |
| SEO description present | 10 |
| At least 1 variant with barcode | 10 |
| At least 1 variant with cost | 10 |
| At least 1 variant with weight | 10 |
| All required metafields present | 20 (split evenly) |
| **Total** | **100** |

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
>
> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**
> **product names, order counts, revenue figures, or any other store data. If a query returns**
> **empty results, report "No data returned" — do not fill in plausible values.**

1. **OPERATION:** `products` — query
   **Inputs:** `query: "status:<status_filter>"`, `first: 250`, select all completeness fields, pagination cursor
   **Expected output:** Products with all scored fields; paginate until `hasNextPage: false`

2. Score each product per rubric; rank ascending by score

## GraphQL Operations

```graphql
# products:query — validated against api_version 2025-01
query ProductCompleteness($query: String!, $after: String) {
  products(first: 250, after: $after, query: $query) {
    edges {
      node {
        id
        title
        handle
        descriptionHtml
        images(first: 1) {
          edges {
            node {
              id
            }
          }
        }
        seo {
          title
          description
        }
        variants(first: 10) {
          edges {
            node {
              id
              barcode
              weight
              inventoryItem {
                unitCost {
                  amount
                }
              }
            }
          }
        }
        metafields(first: 20) {
          edges {
            node {
              namespace
              key
              value
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
║  SKILL: Product Data Completeness Score      ║
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
PRODUCT DATA COMPLETENESS REPORT
  Products scored:  <n>
  Avg score:        <pct>/100
  Score < 50:       <n> products (need urgent attention)
  Score 50–79:      <n> products
  Score ≥ 80:       <n> products

  Lowest scoring products:
    "<title>"  Score: <n>/100  Missing: description, SEO title
  Output: completeness_<date>.csv
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "product-data-completeness-score",
  "store": "<domain>",
  "products_scored": 0,
  "avg_score": 0,
  "below_50_count": 0,
  "output_file": "completeness_<date>.csv"
}
```

## Output Format
CSV file `completeness_<YYYY-MM-DD>.csv` with columns:
`product_id`, `title`, `score`, `has_description`, `image_count`, `has_seo_title`, `has_seo_description`, `has_barcode`, `has_cost`, `has_weight`, `missing_metafields`

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `THROTTLED` | API rate limit exceeded | Wait 2 seconds, retry up to 3 times |
| No products match filter | Empty catalog or wrong filter | Exit with 0 results |

## Best Practices
- Use this skill as a pre-launch gate — run before activating DRAFT products to ensure all required fields are filled.
- Tune `required_metafields` to your store's specific needs (e.g., `custom.material` for apparel, `custom.ingredients` for food).
- A score below 50 typically means a product is missing foundational content (description or images) and should be deprioritized from launch until fixed.
- Run monthly to track catalog quality trends over time; improvements after a content sprint should be visible in the average score.
