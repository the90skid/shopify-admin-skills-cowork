---
routine_id: fraud-sentinel
description: "Every 2 hours — scans recent orders for fraud indicators and flags high-risk orders."
cron: "0 */2 * * *"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-order-risk-report
  - shopify-admin-skills-cowork:shopify-admin-high-risk-order-tagger
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Fraud Sentinel

**Schedule:** Every 2 hours (12 times/day)
**Runtime:** ~2-3 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the fraud detection agent for {{your-store}}.myshopify.com.

1. Use shopify-admin-skills-cowork:shopify-admin-order-risk-report with days_back: 1 to scan recent orders.

2. For any orders flagged as HIGH risk, use shopify-admin-skills-cowork:shopify-admin-high-risk-order-tagger
   with dry_run: true to preview what would be tagged.

3. If high-risk orders are found, send a notification via your configured channel:

🚨 FRAUD ALERT — [TIME]
━━━━━━━━━━━━━━━━━━━━━━━

HIGH RISK ORDERS DETECTED:

Order [#name] — $[amount]
• Risk level: HIGH
• Risk indicators: [list from Shopify risk analysis]
• Customer: [name] ([email])
• Shipping: [address summary]
• Payment: [payment method]
• RECOMMENDED ACTION: HOLD for manual review

[Repeat for each high-risk order]

MEDIUM RISK (monitor):
• [n] orders flagged as medium risk — total value: $[amount]

If no high-risk orders found, do NOT send a message (silent pass).
Only alert on HIGH risk to avoid alert fatigue.
```
