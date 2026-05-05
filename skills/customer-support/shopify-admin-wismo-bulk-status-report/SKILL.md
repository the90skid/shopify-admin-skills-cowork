---
name: shopify-admin-wismo-bulk-status-report
role: customer-support
description: "Identify orders at risk of generating WISMO support tickets: shipped orders with stale tracking, and unfulfilled orders past their SLA window."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - orders:query
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Generates a bulk report of orders most likely to generate "Where Is My Order?" (WISMO) support tickets — shipped orders whose tracking hasn't updated in N days, and unfulfilled orders sitting past a configurable SLA. According to industry research, WISMO accounts for ~18% of all incoming support requests, making proactive identification a direct ops capacity investment. Read-only. Replaces manual order-by-order admin scanning or helpdesk searches. The CSV output can be used to proactively contact customers before they contact you.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_orders`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| format | string | no | human | Output format: `human` or `json` |
| dry_run | bool | no | false | Preview operations without executing mutations |
| unfulfilled_sla_days | integer | no | 3 | Flag unfulfilled orders older than this many days |
| stale_tracking_days | integer | no | 5 | Flag shipped orders where the last fulfillment was created more than this many days ago (proxy for stale tracking) |
| limit | integer | no | 250 | Max orders per page |

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
>
> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**
> **product names, order counts, revenue figures, or any other store data. If a query returns**
> **empty results, report "No data returned" — do not fill in plausible values.**

1. **OPERATION:** `orders` — query (unfulfilled at-risk)
   **Inputs:** `first: <limit>`, `query: "fulfillment_status:unfulfilled created_at:<='<NOW minus unfulfilled_sla_days>'"`, sort by `CREATED_AT` ascending
   **Expected output:** Orders unfulfilled past SLA window with `name`, `createdAt`, `customer`, `displayFulfillmentStatus`; label as `UNFULFILLED_OVERDUE`

2. **OPERATION:** `orders` — query (shipped but potentially stale)
   **Inputs:** `first: <limit>`, `query: "fulfillment_status:shipped updated_at:<='<NOW minus stale_tracking_days>'"`, sort by `UPDATED_AT` ascending
   **Expected output:** Shipped orders not updated recently with `name`, `createdAt`, `fulfillments.createdAt`, `fulfillments.trackingInfo`; label as `SHIPPED_STALE_TRACKING`

## GraphQL Operations

```graphql
# orders:query — validated against api_version 2025-01
query WismoOrders($first: Int!, $after: String, $query: String) {
  orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT) {
    edges {
      node {
        id
        name
        createdAt
        updatedAt
        displayFulfillmentStatus
        displayFinancialStatus
        customer {
          id
          firstName
          lastName
          defaultEmailAddress {
            emailAddress
          }
        }
        shippingAddress {
          city
          province
          country
        }
        fulfillments {
          createdAt
          status
          trackingInfo {
            number
            url
            company
          }
        }
        totalPriceSet {
          shopMoney { amount currencyCode }
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
║  SKILL: wismo-bulk-status-report             ║
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
  Unfulfilled overdue orders:      <n>
  Shipped stale-tracking orders:   <n>
  Total at-risk orders:            <n>
  Errors:                          0
  Output:                          wismo-report-<YYYY-MM-DD>.csv
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "wismo-bulk-status-report",
  "store": "<domain>",
  "started_at": "<ISO8601>",
  "completed_at": "<ISO8601>",
  "dry_run": false,
  "steps": [
    { "step": 1, "operation": "WismoOrders", "type": "query", "params_summary": "fulfillment_status:unfulfilled, sla_days: <n>, limit: <n>", "result_summary": "<n> orders", "skipped": false },
    { "step": 2, "operation": "WismoOrders", "type": "query", "params_summary": "fulfillment_status:shipped, stale_days: <n>, limit: <n>", "result_summary": "<n> orders", "skipped": false }
  ],
  "outcome": {
    "unfulfilled_overdue_count": 0,
    "shipped_stale_count": 0,
    "total_at_risk": 0,
    "errors": 0,
    "output_file": "wismo-report-<YYYY-MM-DD>.csv"
  }
}
```

## Output Format
CSV file `wismo-report-<YYYY-MM-DD>.csv` with columns: `risk_type`, `order_name`, `customer_email`, `order_date`, `days_waiting`, `fulfillment_status`, `tracking_number`, `tracking_company`, `shipping_city`, `shipping_country`.

Two sections in the CSV (separated by `risk_type` column value): `UNFULFILLED_OVERDUE` and `SHIPPED_STALE_TRACKING`. For human format, also shows a summary table before the CSV path.

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| No orders returned | All orders are within SLA / recently updated | Good news — no WISMO risk detected |
| Very large result set | High order volume or wide SLA window | Narrow date range or reduce `unfulfilled_sla_days` |
| `customer` is null | Guest checkout order | Order name and tracking still included — email column will be empty |
| Rate limit (429) | Many pages of orders | Reduce `limit` to 100 |

## Best Practices
1. Run this report daily during your morning ops review alongside `fulfillment-status-digest` — together they cover both the ops queue and the customer-facing risk.
2. Sort the CSV by `days_waiting` descending to prioritize outreach to the most overdue orders first.
3. For `UNFULFILLED_OVERDUE` orders, forward to the `fulfillment-status-digest` skill to understand why they haven't been fulfilled and use `order-hold-and-release` if needed.
4. For `SHIPPED_STALE_TRACKING` orders, check if the carrier tracking URL shows movement — if it's genuinely stalled, proactive outreach reduces ticket volume significantly.
5. Use `format: json` to pipe the output into a Slack alert or CRM automation that creates follow-up tasks for your support team.
