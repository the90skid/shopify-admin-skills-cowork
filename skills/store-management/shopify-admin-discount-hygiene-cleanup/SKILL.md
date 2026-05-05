---
name: shopify-admin-discount-hygiene-cleanup
role: store-management
description: "Finds expired, zero-usage, or duplicate discount codes and optionally deactivates or deletes them."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - discountNodes:query
  - discountCodeDelete:mutation
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Audits the discount catalog for expired codes, codes with zero redemptions, and duplicate code prefixes. Discount sprawl accumulates over months of campaigns and makes the admin difficult to navigate. Optionally deletes flagged codes. Replaces manual discount cleanup and builds on the `discount-ab-analysis` skill with a write step.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_discounts`, `write_discounts`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| flag_expired | bool | no | true | Flag/delete discounts past their end date |
| flag_zero_usage | bool | no | true | Flag/delete discounts with 0 redemptions older than N days |
| zero_usage_min_age_days | integer | no | 30 | Age threshold for zero-usage flags |
| dry_run | bool | no | true | Preview without executing mutations |
| format | string | no | human | Output format: `human` or `json` |

## Safety

> ⚠️ `discountCodeDelete` permanently removes discount codes. Deleted codes cannot be recovered. Customers who received a deleted code will find it invalid. Run with `dry_run: true` to review the flagged list before committing. Always check that expired codes are not referenced in active email campaigns before deleting.

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
>
> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**
> **product names, order counts, revenue figures, or any other store data. If a query returns**
> **empty results, report "No data returned" — do not fill in plausible values.**

1. **OPERATION:** `discountNodes` — query
   **Inputs:** `first: 250`, select `discount { ... on DiscountCodeBasic { codes, usageLimit, asyncUsageCount, endsAt, status } }`, pagination cursor
   **Expected output:** All discount codes with usage and expiry data; paginate until `hasNextPage: false`

2. Flag discounts matching: `flag_expired` (status = EXPIRED) and/or `flag_zero_usage` (asyncUsageCount == 0 AND created > `zero_usage_min_age_days` ago)

3. **OPERATION:** `discountCodeDelete` — mutation
   **Inputs:** `id: <discount_node_id>`
   **Expected output:** `deletedCodeDiscountId`, `userErrors`

## GraphQL Operations

```graphql
# discountNodes:query — validated against api_version 2025-01
query DiscountAudit($after: String) {
  discountNodes(first: 250, after: $after) {
    edges {
      node {
        id
        discount {
          ... on DiscountCodeBasic {
            title
            status
            createdAt
            endsAt
            asyncUsageCount
            usageLimit
            codes(first: 5) {
              edges {
                node {
                  id
                  code
                }
              }
            }
          }
          ... on DiscountCodeBxgy {
            title
            status
            createdAt
            endsAt
            asyncUsageCount
            usageLimit
          }
          ... on DiscountCodeFreeShipping {
            title
            status
            createdAt
            endsAt
            asyncUsageCount
            usageLimit
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
# discountCodeDelete:mutation — validated against api_version 2025-01
mutation DiscountCodeDelete($id: ID!) {
  discountCodeDelete(id: $id) {
    deletedCodeDiscountId
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
║  SKILL: Discount Hygiene Cleanup             ║
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
  Discounts scanned:     <n>
  Expired:               <n>
  Zero usage (> <n> days): <n>
  Total flagged:         <n>
  Deleted:               <n>
  Errors:                <n>
  Output:                discount_cleanup_<date>.csv
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "discount-hygiene-cleanup",
  "store": "<domain>",
  "started_at": "<ISO8601>",
  "dry_run": true,
  "outcome": {
    "scanned": 0,
    "flagged_expired": 0,
    "flagged_zero_usage": 0,
    "deleted": 0,
    "errors": 0,
    "output_file": "discount_cleanup_<date>.csv"
  }
}
```

## Output Format
CSV file `discount_cleanup_<YYYY-MM-DD>.csv` with columns:
`discount_id`, `title`, `status`, `created_at`, `ends_at`, `usage_count`, `usage_limit`, `flag_reason`, `action`

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `THROTTLED` | API rate limit exceeded | Wait 2 seconds, retry up to 3 times |
| `userErrors` on delete | Discount already deleted or active order using it | Log error, skip, continue |
| No discounts flagged | Clean discount catalog | Exit with ✅ no cleanup needed |

## Best Practices
- Run quarterly — discount code sprawl accumulates quickly with seasonal campaigns.
- Check with your email marketing team before deleting zero-usage codes — they may be in a scheduled campaign that hasn't launched yet.
- Keep `flag_zero_usage` age at 30+ days to avoid deleting codes from recently launched campaigns.
- Automatic/percentage discounts (not code-based) are not cleaned up by this skill — those are managed separately.
