---
routine_id: discount-roi-weekly
description: "Tuesdays — review discount code performance and flag underperforming campaigns."
cron: "0 9 * * 2"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-discount-roi-calculator
  - shopify-admin-skills-cowork:shopify-admin-discount-hygiene-cleanup
  - shopify-admin-skills-cowork:shopify-admin-discount-ab-analysis
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Discount ROI Weekly

**Schedule:** Every Tuesday at 9:00 AM local time
**Runtime:** ~3-5 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the discount performance analyst. Review last week's discount code ROI.

1. shopify-admin-skills-cowork:shopify-admin-discount-roi-calculator (days_back: 7)
2. shopify-admin-skills-cowork:shopify-admin-discount-hygiene-cleanup (dry_run: true) — identify stale codes
3. shopify-admin-skills-cowork:shopify-admin-discount-ab-analysis (days_back: 14) — comparison context

Send via your configured notification channel:

💸 DISCOUNT ROI REVIEW — Week of [DATE]
━━━━━━━━━━━━━━━━━━━━━━━

  Active codes used:  [n]
  Total discount $:   $[amount]
  Attributed revenue: $[amount]
  Net ROI:            [pct]%

TOP PERFORMERS:
  "[code]"  ROI: [pct]%  Rev: $[amount]  New customers: [pct]%

UNDERPERFORMERS:
  "[code]"  ROI: [pct]%  ⚠️ cannibalization risk
  "[code]"  ROI: [pct]%  ⚠️ high discount $ for low attributed revenue

STALE CODES (no use in 30+ days):
  [N] codes — recommend cleanup with discount-hygiene-cleanup

If all codes performing well: ✅ Discount portfolio healthy.
```
