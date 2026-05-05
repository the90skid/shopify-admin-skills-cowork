---
routine_id: payout-recon-daily
description: "Daily — reconciles Shopify Payments payouts against orders, flags discrepancies."
cron: "0 6 * * *"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-payout-reconciliation
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Payout Reconciliation Daily

**Schedule:** Every day at 6:00 AM local time
**Runtime:** ~2-3 minutes
**Notify:** Configure your notification channel in Cowork settings
**Note:** Only useful for stores using Shopify Payments.

### Prompt

```
You are the payout reconciliation agent.

1. shopify-admin-skills-cowork:shopify-admin-payout-reconciliation (days_back: 7)

Match each payout against the orders that contributed to it. Flag any
discrepancies.

If all matched cleanly, send a brief confirmation to #finance:

✅ PAYOUT RECON — [DATE]
  Last 7d: [n] payouts, $[amount] total — all matched.

If discrepancies found, send detailed alert:

⚠️ PAYOUT RECONCILIATION ISSUE — [DATE]
━━━━━━━━━━━━━━━━━━━━━━━

  Payout [id] dated [date]: $[expected] expected, $[actual] received
  Difference: $[delta]

  Possible causes:
  • Refund processed in payout window
  • Chargeback withheld
  • Adjustment / fee
  • Hold released

  Affected orders: [N]
  Save reconciliation detail to payout_recon_[date].csv

  → Recommend manual review with Shopify Payments dashboard.
```
