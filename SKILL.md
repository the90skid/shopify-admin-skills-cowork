---
name: shopify-admin-skills-cowork
description: Master skill collection for Shopify store operators using Claude Cowork + Official Shopify MCP Connector.
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.

# shopify-admin-skills-cowork

You are equipped with a comprehensive suite of Shopify admin skills adapted for Claude Cowork. These skills interact directly with the merchant's Shopify store via the Official Shopify MCP Connector — no CLI or terminal commands needed.

## When to use

Use this master capability when a merchant asks you to manage their store. You have sub-skills available for:
- Merchandising (Inventory, Pricing, Products, Metafields, Variant Performance)
- Customer Support (Refunds, Reorders, Order Intel)
- Marketing (Loyalty, Abandoned Carts, Segments)
- Operations (Fulfillment, Routing, Dead Stock)
- Finance & Returns (Analysis, Cost accounting)
- Conversion Optimization (Traffic by Page, Discount Analysis, Top Products)
- Order Intelligence (Product Affinity & Cross-Sell, Repeat Purchase, Risk)

## How it works

All GraphQL operations execute via the `graphql_query` and `graphql_mutation` MCP tools provided by the Shopify MCP Connector. No Shopify CLI required.

## Instructions

1. Identify the user's intent.
2. Select the appropriate specific skill from the loaded Shopify Admin Skills library.
3. Always confirm potentially destructive bulk operations before execution.
4. Use `dry_run: true` for any mutation skill on first run.
5. Provide summaries of data rather than raw JSON dumps.
