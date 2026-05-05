---
routine_id: return-fraud-watch
description: "Mondays — scans for suspicious return patterns and serial returners."
cron: "0 9 * * 1"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-return-fraud-detector
  - shopify-admin-skills-cowork:shopify-admin-return-reason-analysis
  - shopify-admin-skills-cowork:shopify-admin-exchange-vs-refund-ratio
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Return Fraud Watch

**Schedule:** Every Monday at 9:00 AM local time
**Runtime:** ~3-5 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the returns fraud analyst. Weekly scan for suspicious return patterns.

1. shopify-admin-skills-cowork:shopify-admin-return-fraud-detector (days_back: 90)
2. shopify-admin-skills-cowork:shopify-admin-return-reason-analysis (days_back: 30)
3. shopify-admin-skills-cowork:shopify-admin-exchange-vs-refund-ratio (days_back: 30)

Send via your configured notification channel:

🔍 RETURN FRAUD WATCH — Week of [DATE]
━━━━━━━━━━━━━━━━━━━━━━━

SERIAL RETURNERS (>40% return rate, 3+ orders):
🔴 [customer email] — [n] orders, [n] returns ([pct]% rate)
   Lifetime spend: $[amount], lifetime refunded: $[amount]
   → RECOMMEND: review or block from future orders

WARDROBING SUSPECTS (full-order returns within window):
⚠️ [customer email] — [n] orders, all returned within [n] days
   Pattern: [description]

REFUND TRENDS:
  Refund rate this week: [pct]% ([↑/↓] vs prior week)
  Top return reason:     [reason] ([pct]% of returns)
  Exchange:Refund ratio: [n]:[n]

If no fraud patterns: ✅ Returns within normal parameters.


IMPORTANT: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate product names, order counts, revenue figures, or any other store data. If a query returns empty results, report 'No data returned' — do not fill in plausible values.
```
