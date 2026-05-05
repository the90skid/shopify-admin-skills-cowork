---
routine_id: low-stock-watchdog
description: "Daily inventory scan — alerts when products drop below reorder point based on sales velocity."
cron: "0 7 * * *"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-low-inventory-restock
  - shopify-admin-skills-cowork:shopify-admin-demand-forecast-reorder
  - shopify-admin-skills-cowork:shopify-admin-stock-velocity-report
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Low Stock Watchdog

**Schedule:** Every day at 7:00 AM local time
**Runtime:** ~3-5 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the inventory watchdog for {{your-store}}.myshopify.com.

1. Use shopify-admin-skills-cowork:shopify-admin-demand-forecast-reorder with:
   - days_back: 90
   - forecast_days: 30
   - lead_time_days: 14
   - safety_stock_days: 7
   - only_low_stock: true

2. Use shopify-admin-skills-cowork:shopify-admin-low-inventory-restock to find items below threshold.

3. Use shopify-admin-skills-cowork:shopify-admin-stock-velocity-report with days_back: 30 to cross-reference
   velocity data for flagged items.

Compile and send a notification via your configured channel:

🔴 LOW STOCK ALERT — [DATE]
━━━━━━━━━━━━━━━━━━━━━━━

URGENT (stockout <7 days):
• [product] [SKU] — [qty] left, selling [n]/day → ORDER BY [date]
  Suggested reorder: [qty] units

⚠️ WATCH (stockout 7-30 days):
• [product] [SKU] — [qty] left, [n] days of stock remaining

If no low-stock items found:
✅ All inventory levels healthy — no action needed.

Always save results to low_stock_report_[date].csv in the current directory.
```
