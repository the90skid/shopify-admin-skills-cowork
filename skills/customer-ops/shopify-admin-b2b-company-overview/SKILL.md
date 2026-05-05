---
name: shopify-admin-b2b-company-overview
role: customer-ops
description: "Read-only: lists B2B company accounts with locations, catalogs, and payment terms for wholesale management."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - companies:query
  - companyLocations:query
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Queries all B2B company accounts and their associated locations, price lists, and payment terms. Provides a consolidated view of the wholesale account portfolio for ops and sales teams. Read-only — no mutations. Requires Shopify B2B (available on Shopify Plus).

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_customers`
- Store must be on Shopify Plus with B2B enabled

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| format | string | no | human | Output format: `human` or `json` |

## Safety

> ℹ️ Read-only skill — no mutations are executed. Safe to run at any time.

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.

1. **OPERATION:** `companies` — query
   **Inputs:** `first: 250`, select `name`, `locations`, `contacts`, `createdAt`, pagination cursor
   **Expected output:** All B2B company accounts; paginate until `hasNextPage: false`

2. **OPERATION:** `companyLocations` — query
   **Inputs:** `first: 250` per company, select `name`, `buyerExperienceConfiguration { paymentTermsTemplate, checkoutToDraft }`, `catalogsCount`
   **Expected output:** Company locations with payment and catalog configuration

## GraphQL Operations

```graphql
# companies:query — validated against api_version 2025-01
query B2BCompanies($after: String) {
  companies(first: 250, after: $after) {
    edges {
      node {
        id
        name
        note
        createdAt
        updatedAt
        locationsCount {
          count
        }
        contactsCount {
          count
        }
        orders(first: 1, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
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

```graphql
# companyLocations:query — validated against api_version 2025-01
query CompanyLocationsDetail($companyId: ID!) {
  company(id: $companyId) {
    id
    name
    locations(first: 50) {
      edges {
        node {
          id
          name
          shippingAddress {
            countryCode
            city
          }
          buyerExperienceConfiguration {
            paymentTermsTemplate {
              name
              dueInDays
            }
            checkoutToDraft
          }
          catalogsCount {
            count
          }
        }
      }
    }
  }
}
```

## Session Tracking

**Claude MUST emit the following output at each stage. This is mandatory.**

**On start**, emit:
```
╔══════════════════════════════════════════════╗
║  SKILL: B2B Company Overview                 ║
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
B2B COMPANY OVERVIEW
  Total companies:   <n>
  Total locations:   <n>
  With net terms:    <n>
  With catalogs:     <n>

  Company: <name>
    Locations: <n>  |  Last order: <date>
    Payment terms: Net 30
  Output: b2b_companies_<date>.csv
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "b2b-company-overview",
  "store": "<domain>",
  "total_companies": 0,
  "total_locations": 0,
  "companies": [],
  "output_file": "b2b_companies_<date>.csv"
}
```

## Output Format
CSV file `b2b_companies_<YYYY-MM-DD>.csv` with columns:
`company_id`, `company_name`, `locations_count`, `contacts_count`, `last_order_date`, `last_order_value`, `currency`, `payment_terms`, `has_catalog`

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `THROTTLED` | API rate limit exceeded | Wait 2 seconds, retry up to 3 times |
| Empty companies list | B2B not configured or no accounts | Exit with 0 companies, note B2B Plus requirement |
| `companies` query not available | Store not on Shopify Plus | Return clear error: B2B requires Shopify Plus |

## Best Practices
- Run monthly as a wholesale account health check — companies with no orders in 90+ days may need outreach.
- `checkoutToDraft: true` means the buyer must have orders approved before payment — useful for understanding which accounts require manual order review.
- For companies with multiple locations but only one catalog, check if the catalog is correctly scoped to each location.
- This skill requires Shopify B2B (Shopify Plus feature) — it will return an empty result or an error on non-Plus stores.
