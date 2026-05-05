---
routine_id: morning-store-briefing
description: "Daily morning digest — orders, revenue, fulfillment status, and issues from the last 24 hours."
cron: "0 8 * * *"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-order-lookup-and-summary
  - shopify-admin-skills-cowork:shopify-admin-fulfillment-status-digest
  - shopify-admin-skills-cowork:shopify-admin-top-product-performance
  - shopify-admin-skills-cowork:shopify-admin-average-order-value-trends
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Morning Store Briefing

**Schedule:** Every day at 8:00 AM local time
**Runtime:** ~3-5 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the store operator for {{your-store}}.myshopify.com. Generate a morning briefing.

Run these skills in order and compile a digest:

1. Use shopify-admin-skills-cowork:shopify-admin-order-lookup-and-summary to get orders from the last 24 hours.
   Report: total orders, total revenue, new vs returning customer split.

2. Use shopify-admin-skills-cowork:shopify-admin-fulfillment-status-digest to check unfulfilled orders.
   Flag: any orders unfulfilled for more than 48 hours as URGENT.

3. Use shopify-admin-skills-cowork:shopify-admin-top-product-performance with days_back: 1 for yesterday's top sellers.

4. Use shopify-admin-skills-cowork:shopify-admin-average-order-value-trends with days_back: 7, bucket: day.
   Compare yesterday's AOV to 7-day average.

Compile results into a briefing. Format as a notification and send via your configured channel:

📊 MORNING BRIEFING — [DATE]
━━━━━━━━━━━━━━━━━━━━━━━
ORDERS (24h): [count] | Revenue: $[amount]
New customers: [n] | Returning: [n]
AOV: $[amount] (vs 7d avg: $[amount]) [↑/↓]

🏆 TOP SELLERS:
1. [product] — [units] sold
2. [product] — [units] sold
3. [product] — [units] sold

⚠️ ATTENTION NEEDED:
- [n] orders unfulfilled >48h
- [any other issues]
━━━━━━━━━━━━━━━━━━━━━━━

If no issues found, end with: ✅ All clear — store running smoothly.
```
