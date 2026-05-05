# Shopify Admin Skills — Claude Cowork Session Guide

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills) by [40rty](https://40rty.ai). Adapted for Claude Cowork.

## Getting Started

### 1. Connect the Shopify MCP Connector
In Claude Cowork settings, connect the **Official Shopify Connector**. This grants Claude access to your store's Admin GraphQL API via MCP tools.

### 2. Verify the connection
Ask Claude: "What's my store name?"
Expected: Claude uses `graphql_query` to run `{ shop { name id } }` and returns your store info.

### 3. Run any skill
All skills are available via the Skill tool. Example:
> "Run the abandoned cart recovery skill with dry_run: true"

No CLI required. No `shopify auth login`. No `--plugin-dir` flag.

---

## Available MCP Tools

The Shopify MCP Connector provides these tools:
- `graphql_query` — execute read-only GraphQL queries
- `graphql_mutation` — execute GraphQL mutations
- `graphql_schema` — explore the Shopify Admin API schema
- `search_docs_chunks` — search Shopify developer docs
- `get-order`, `get-product`, `list-orders`, `list-customers` — convenience tools
- `search_products`, `search_collections` — search tools

---

## Running a Skill

Every skill in `skills/<category>/<name>/SKILL.md` follows this pattern:
1. Claude reads the skill instructions
2. Uses `graphql_query` / `graphql_mutation` MCP tools to execute operations
3. Returns structured output (human-readable or JSON)

Always use `dry_run: true` on first run for any mutation skill.

---

## Scheduled Tasks

Tasks in `scheduled/` can be registered via the `schedule` skill:
> "Schedule the morning store briefing to run every day at 8am"

---

## Skill Categories

| Category | Skills | Description |
|----------|--------|-------------|
| marketing | 6 | Cart recovery, win-back, loyalty, promos |
| merchandising | 18 | Inventory, pricing, products, SEO |
| customer-support | 8 | Refunds, reorders, address fixes, lookups |
| customer-ops | 14 | Segmentation, RFM, cohorts, churn |
| conversion-optimization | 8 | Checkout analysis, cross-sell, discounts |
| fulfillment-ops | 11 | Routing, tracking, shipping, SLA |
| finance | 12 | Revenue, payouts, margins, tax |
| order-intelligence | 9 | Risk, attribution, affinity, repeat purchase |
| returns | 6 | Fraud, restocking, reason analysis |
| store-management | 8 | Discounts, drafts, files, SEO, redirects |

---

## Validation

```bash
npm run validate:index
```

---

## Attribution

Original skills created by [40rty](https://40rty.ai) — [github.com/40RTY-ai/shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills). MIT License. Adapted for Claude Cowork by [the90skid](https://github.com/the90skid).
