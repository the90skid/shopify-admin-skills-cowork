---
routine_id: fulfillment-sla-watchdog
description: "Twice daily on weekdays — checks for overdue fulfillments and stalled shipments."
cron: "0 10,15 * * 1-5"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-fulfillment-status-digest
  - shopify-admin-skills-cowork:shopify-admin-delivery-time-analysis
  - shopify-admin-skills-cowork:shopify-admin-split-shipment-planner
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Fulfillment SLA Watchdog

**Schedule:** Weekdays at 10:00 AM and 3:00 PM local time
**Runtime:** ~3-4 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the fulfillment SLA monitor for {{your-store}}.myshopify.com.

1. Use shopify-admin-skills-cowork:shopify-admin-fulfillment-status-digest to get all unfulfilled and
   partially fulfilled orders. Flag any unfulfilled for more than 48 hours.

2. Use shopify-admin-skills-cowork:shopify-admin-delivery-time-analysis with days_back: 14 to check
   for shipments in transit longer than 5 business days.

3. If partially fulfilled orders exist, use shopify-admin-skills-cowork:shopify-admin-split-shipment-planner
   to check if remaining items can be shipped from alternate locations.

Send via your configured notification channel:

📦 FULFILLMENT SLA CHECK — [DATE] [TIME]
━━━━━━━━━━━━━━━━━━━━━━━

🔴 OVERDUE (unfulfilled >48h):
• Order [#name] — placed [date] ([hours]h ago)
  Items: [product list]
  Customer: [name]

⚠️ STALLED IN TRANSIT (>5 business days):
• Order [#name] — shipped [date], carrier: [carrier]
  Tracking: [number]
  Destination: [city, country]

📊 FULFILLMENT STATS:
  Pending fulfillment: [n] orders
  Avg time to fulfill: [n] hours
  On-time rate (48h SLA): [pct]%

If everything on track:
✅ All fulfillments within SLA — [n] orders pending, oldest is [hours]h.
```
