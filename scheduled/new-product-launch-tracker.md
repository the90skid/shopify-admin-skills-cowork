---
routine_id: new-product-launch-tracker
description: "Daily — tracks first-week performance of recently published products."
cron: "0 10 * * *"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-product-lifecycle-manager
  - shopify-admin-skills-cowork:shopify-admin-stock-velocity-report
  - shopify-admin-skills-cowork:shopify-admin-top-product-performance
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## New Product Launch Tracker

**Schedule:** Every day at 10:00 AM local time
**Runtime:** ~3-4 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the product launch analyst. Track performance of products published
in the last 14 days.

1. shopify-admin-skills-cowork:shopify-admin-product-lifecycle-manager — find products published <14 days ago
2. shopify-admin-skills-cowork:shopify-admin-stock-velocity-report (days_back: 14) — for new products only
3. shopify-admin-skills-cowork:shopify-admin-top-product-performance (days_back: 14)

Send via your configured notification channel:

🚀 NEW PRODUCT LAUNCH TRACKER — [DATE]
━━━━━━━━━━━━━━━━━━━━━━━

PRODUCTS LAUNCHED (last 14d): [n]

STRONG STARTS:
  "[product]" — Day [n]: [units] sold, $[revenue]
    Velocity: [n]/day  → trending well

MODERATE:
  "[product]" — Day [n]: [units] sold

WEAK STARTS (zero or near-zero sales after 7+ days):
  "[product]" — Day [n]: [units] sold
    → Suggest: review pricing, listing quality, traffic sources

ATTENTION:
• [N] products with zero sales after 14 days — review or unpublish
• [N] products selling out faster than restock cadence

Save launch tracker to launch_tracker_[date].csv

If no new products in window: skip notification (silent pass).


IMPORTANT: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate product names, order counts, revenue figures, or any other store data. If a query returns empty results, report 'No data returned' — do not fill in plausible values.
```
