---
name: shopify-admin-collection-reorganization
role: merchandising
description: "Reorder products in a manual Shopify collection by inventory level, moving in-stock products to the top and out-of-stock to the bottom."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - collection:query
  - collectionReorderProducts:mutation
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Reorders products in a manual Shopify collection by inventory level without navigating the Shopify admin UI. This skill queries all products in the collection, computes the desired sort order by `totalInventory`, and applies it in a single `collectionReorderProducts` mutation. Note: only works on manual (custom) collections — smart collections managed by Shopify rules are not supported.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_products`, `write_products`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| format | string | no | human | Output format: `human` or `json` |
| dry_run | bool | no | false | Preview operations without executing mutations |
| collection_id | string | yes | — | GID of the manual collection (e.g., `gid://shopify/Collection/123`) |
| sort_by | string | no | inventory_desc | `inventory_desc` (highest stock first) or `inventory_asc` (lowest stock first) |

## Safety

> ⚠️ Step 2 executes `collectionReorderProducts` which changes the product display order immediately. The sort is reversible — run again with the opposite `sort_by` to restore previous order — but the original custom order cannot be recovered once overwritten. The `moves` array passed to the mutation must be complete; partial moves produce undefined ordering. Always run with `dry_run: true` first to review the computed sort order before committing.

`collectionReorderProducts` only works on manual (custom) collections. If the collection has `sortOrder` other than `MANUAL`, the skill must abort with a clear message: "Cannot reorder: collection sort order is not MANUAL. Switch the collection to manual sorting in the Shopify admin first."

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
>
> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**
> **product names, order counts, revenue figures, or any other store data. If a query returns**
> **empty results, report "No data returned" — do not fill in plausible values.**

1. **OPERATION:** `collection` — query
   **Inputs:** `id: <collection_id>`, `first: 250`, pagination cursor
   **Expected output:** Collection metadata (title, `sortOrder`) and all product nodes with `totalInventory`; verify `sortOrder == "MANUAL"` — abort if not; paginate until all products fetched

2. **OPERATION:** `collectionReorderProducts` — mutation
   **Inputs:** `id: <collection_id>`, `moves` array sorted by `totalInventory` per `sort_by` parameter — each move is `{id: <product_id>, newPosition: "<index>"}` (0-indexed string)
   **Expected output:** `job.id` and `job.done`; `userErrors`

## GraphQL Operations

```graphql
# collection:query — validated against api_version 2025-01
query CollectionProducts($id: ID!, $first: Int!, $after: String) {
  collection(id: $id) {
    id
    title
    sortOrder
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          totalInventory
          variants(first: 100) {
            edges {
              node {
                inventoryQuantity
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
}
```

```graphql
# collectionReorderProducts:mutation — validated against api_version 2025-01
mutation CollectionReorderProducts($id: ID!, $moves: [MoveInput!]!) {
  collectionReorderProducts(id: $id, moves: $moves) {
    job {
      id
      done
    }
    userErrors {
      field
      message
    }
  }
}
```

## Session Tracking

**Claude MUST emit the following output at each stage. This is mandatory.**

**On start**, emit:
```
╔══════════════════════════════════════════════╗
║  SKILL: collection-reorganization            ║
║  Started: <YYYY-MM-DD HH:MM UTC>             ║
╚══════════════════════════════════════════════╝
```

**After each step**, emit:
```
[N/TOTAL] <QUERY|MUTATION>  <OperationName>
          → Params: <brief summary of key inputs>
          → Result: <count or outcome>
```

If `dry_run: true`, prefix every mutation step with `[DRY RUN]` and do not execute it.

**On completion**, emit:

For `format: human` (default):
```
══════════════════════════════════════════════
OUTCOME SUMMARY
  Collection:          <title>
  Products reordered:  <n>
  Sort order:          <inventory_desc|inventory_asc>
  Errors:              0
  Output:              none
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "collection-reorganization",
  "store": "<domain>",
  "started_at": "<ISO8601>",
  "completed_at": "<ISO8601>",
  "dry_run": false,
  "steps": [
    { "step": 1, "operation": "CollectionProducts", "type": "query", "params_summary": "collection_id: <gid>, first: 250", "result_summary": "<n> products fetched", "skipped": false },
    { "step": 2, "operation": "CollectionReorderProducts", "type": "mutation", "params_summary": "sort_by: inventory_desc, <n> moves", "result_summary": "job submitted", "skipped": false }
  ],
  "outcome": {
    "collection_title": "<title>",
    "products_reordered": 0,
    "sort_by": "inventory_desc",
    "errors": 0,
    "output_file": null
  }
}
```

## Output Format
No CSV output. The skill reports the new sort order in the session completion summary. Use `dry_run: true` to preview the computed position list without committing.

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `sortOrder is not MANUAL` | Collection is a smart/automated collection | Switch collection to manual ordering in Shopify admin |
| `userErrors` in mutation | Invalid product ID or position | Check all product IDs belong to the collection |
| Collection not found | Invalid collection GID | Verify the GID in Shopify admin |
| Rate limit (429) | Too many paginated requests | Reduce `first` to 100 and retry |

## Best Practices
1. Always run `dry_run: true` first — the skill will print the proposed product order so you can verify before committing.
2. `collectionReorderProducts` is asynchronous — `job.done` may be `false` immediately. The sort completes within a few seconds; refresh the storefront to verify.
3. Use `sort_by: inventory_asc` to push out-of-stock products to the bottom of the collection page, reducing customer frustration.
4. For large collections (250+ products), pagination is automatic but increases execution time. Consider running during off-peak hours.
5. This skill only reads `totalInventory` from the products node — it does not aggregate per-location. If you need location-specific sorting, use the `low-inventory-restock` skill to identify which products to prioritize.
