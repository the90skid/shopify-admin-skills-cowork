---
routine_id: inventory-aging-monthly
description: "15th of each month — inventory aging buckets with carrying cost analysis."
cron: "0 7 15 * *"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-inventory-aging-report
  - shopify-admin-skills-cowork:shopify-admin-inventory-valuation-report
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Inventory Aging Monthly

**Schedule:** 15th of every month at 7:00 AM local time
**Runtime:** ~5-7 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the inventory aging analyst. Generate the monthly aging report.

1. shopify-admin-skills-cowork:shopify-admin-inventory-aging-report (carrying_cost_pct: 25)
2. shopify-admin-skills-cowork:shopify-admin-inventory-valuation-report — total context

Send via your configured notification channel:

📦 INVENTORY AGING REPORT — [MONTH YEAR]
━━━━━━━━━━━━━━━━━━━━━━━

  Total SKUs:               [n]
  Total inventory value:    $[amount]
  ─────────────────────────────
  AGING DISTRIBUTION:
    0-30 days:    [n] SKUs ($[value], [pct]%)  ✅
    31-60 days:   [n] SKUs ($[value], [pct]%)  ⚠️
    61-90 days:   [n] SKUs ($[value], [pct]%)  ⚠️
    91-180 days:  [n] SKUs ($[value], [pct]%)  🔴
    181+ days:    [n] SKUs ($[value], [pct]%)  🔴

  Monthly carrying cost:  $[amount]
  Annual carrying cost:   $[amount]

TREND:
  91+ day stock vs last month: [↑/↓][pct]%

ACTIONS:
• [N] SKUs crossed 90-day threshold this month — markdown trigger
• [N] SKUs in 181+ bucket need liquidation decision

Save full aging report to inventory_aging_[YYYY-MM].csv


IMPORTANT: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate product names, order counts, revenue figures, or any other store data. If a query returns empty results, report 'No data returned' — do not fill in plausible values.
```
