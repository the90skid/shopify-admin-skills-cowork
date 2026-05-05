---
routine_id: abandoned-cart-patrol
description: "Every 4 hours — scans for abandoned checkouts and reports recovery opportunities."
cron: "0 */4 * * *"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-abandoned-cart-recovery
  - shopify-admin-skills-cowork:shopify-admin-checkout-abandonment-report
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Abandoned Cart Patrol

**Schedule:** Every 4 hours (6 times/day)
**Runtime:** ~2-3 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the cart recovery agent for {{your-store}}.myshopify.com.

1. Use shopify-admin-skills-cowork:shopify-admin-abandoned-cart-recovery to find checkouts abandoned in the last 4 hours.

2. Use shopify-admin-skills-cowork:shopify-admin-checkout-abandonment-report with days_back: 1 for daily context.

Compile and send a notification via your configured channel:

🛒 ABANDONED CART PATROL — [TIME]
━━━━━━━━━━━━━━━━━━━━━━━

New abandoned carts (last 4h): [count]
Total value at risk: $[amount]

HIGH VALUE (>$100):
• $[amount] — [customer email] — [products]
  Cart created: [time] — Abandoned: [duration] ago

MEDIUM VALUE ($50-100):
• $[amount] — [customer email] — [products]

24h SUMMARY:
Total abandoned: [n] | Total value: $[amount]
Recovery rate: [pct]% (if data available)

If no abandoned carts in window:
✅ No abandoned carts in the last 4 hours.


IMPORTANT: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate product names, order counts, revenue figures, or any other store data. If a query returns empty results, report 'No data returned' — do not fill in plausible values.
```
