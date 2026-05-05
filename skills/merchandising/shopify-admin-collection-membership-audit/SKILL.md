---
name: shopify-admin-collection-membership-audit
role: merchandising
description: "Read-only: lists orphan products (in zero collections) and over-collected products for catalog hygiene."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - products:query
  - collections:query
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Identifies products that are not in any collection ("orphans" — invisible in store navigation) and products that appear in an unusually high number of collections ("over-collected" — potential merchandising noise). Read-only — no mutations.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_products`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| max_collections | integer | no | 10 | Flag products in more than this many collections |
| status_filter | string | no | active | Product status to scan: `active`, `draft`, or `all` |
| format | string | no | human | Output format: `human` or `json` |

## Safety

> ℹ️ Read-only skill — no mutations are executed. Safe to run at any time.

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.

1. **OPERATION:** `products` — query
   **Inputs:** `query: "status:<status_filter>"`, `first: 250`, select `collections { edges { node { id } } }`, pagination cursor
   **Expected output:** Products with their collection memberships; paginate until `hasNextPage: false`

2. For each product: count collections → flag if 0 (orphan) or > `max_collections` (over-collected)

3. **OPERATION:** `collections` — query (for collection names)
   **Inputs:** `first: 250`, select `id`, `title`, `productsCount`
   **Expected output:** Collection metadata for enriching the report

## GraphQL Operations

```graphql
# products:query — validated against api_version 2025-01
query ProductCollectionMembership($query: String!, $after: String) {
  products(first: 250, after: $after, query: $query) {
    edges {
      node {
        id
        title
        handle
        status
        collections(first: 30) {
          edges {
            node {
              id
              title
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

```graphql
# collections:query — validated against api_version 2025-01
query CollectionOverview($after: String) {
  collections(first: 250, after: $after) {
    edges {
      node {
        id
        title
        handle
        productsCount {
          count
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
║  SKILL: Collection Membership Audit          ║
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
COLLECTION MEMBERSHIP AUDIT
  Products scanned:      <n>
  Orphan products (0 collections):     <n>
  Over-collected (> <max_collections>): <n>

  Orphan products (sample):
    "<title>" — <status>
  Output: collection_audit_<date>.csv
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "collection-membership-audit",
  "store": "<domain>",
  "products_scanned": 0,
  "orphan_count": 0,
  "over_collected_count": 0,
  "output_file": "collection_audit_<date>.csv"
}
```

## Output Format
CSV file `collection_audit_<YYYY-MM-DD>.csv` with columns:
`product_id`, `title`, `handle`, `status`, `collection_count`, `collections`, `issue`

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `THROTTLED` | API rate limit exceeded | Wait 2 seconds, retry up to 3 times |
| No orphans found | All products are in collections | Exit with ✅ no orphans found |

## Best Practices
- Orphan active products are invisible in store navigation — customers can only find them via direct URL or search. Prioritize fixing these.
- Automated collections (rule-based) may automatically pull products based on tags or conditions — an orphan in manual collections may still appear in automated ones. Check both.
- Use `max_collections: 5` for stores with a tightly curated navigation; use higher thresholds for marketplace-style stores where cross-listing is intentional.
- Run after seasonal catalog refreshes to ensure all new products are assigned to the right collections.
