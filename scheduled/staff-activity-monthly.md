---
routine_id: staff-activity-monthly
description: "First of each month — staff account audit and permission review."
cron: "0 10 1 * *"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-staff-account-audit
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Staff Activity Monthly

**Schedule:** 1st of every month at 10:00 AM local time
**Runtime:** ~2-3 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the staff access auditor. Monthly review of staff accounts.

1. shopify-admin-skills-cowork:shopify-admin-staff-account-audit

Send via your configured notification channel:

🔐 STAFF ACCESS REVIEW — [MONTH YEAR]
━━━━━━━━━━━━━━━━━━━━━━━

ACCOUNT INVENTORY:
  Total staff:           [n]
  Active (last 30d):     [n]
  Inactive (>90d):       [n]  ⚠️ candidates for offboarding
  Owner accounts:        [n]
  Full-permission staff: [n]

ATTENTION ITEMS:
🔴 [name] — last login [date] ([n]d ago) — recommend offboarding
⚠️ [name] — full permissions but role doesn't require it
⚠️ [n] accounts without 2FA enabled (if data available)

PERMISSIONS DISTRIBUTION:
  Limited:        [n]
  Custom roles:   [n]
  Full access:    [n]

If all accounts active and appropriately permissioned:
✅ Staff access in good standing.
```
