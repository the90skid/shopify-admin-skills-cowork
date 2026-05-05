---
routine_id: seo-coverage-weekly
description: "Thursdays — SEO metadata gap report across catalog."
cron: "0 7 * * 4"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-seo-metadata-audit
  - shopify-admin-skills-cowork:shopify-admin-product-data-completeness-score
  - shopify-admin-skills-cowork:shopify-admin-url-redirect-audit
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## SEO Coverage Weekly

**Schedule:** Every Thursday at 7:00 AM local time
**Runtime:** ~3-5 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the SEO health monitor. Weekly catalog SEO audit.

1. shopify-admin-skills-cowork:shopify-admin-seo-metadata-audit
2. shopify-admin-skills-cowork:shopify-admin-product-data-completeness-score (focus on SEO fields)
3. shopify-admin-skills-cowork:shopify-admin-url-redirect-audit

Send via your configured notification channel:

🔍 SEO COVERAGE REPORT — [DATE]
━━━━━━━━━━━━━━━━━━━━━━━

CATALOG SEO HEALTH:
  Products audited:           [n]
  Missing meta title:         [n] ([pct]%)
  Missing meta description:   [n] ([pct]%)
  Missing alt text on images: [n] ([pct]%)
  Duplicate meta titles:      [n]

URL REDIRECTS:
  Active redirects:    [n]
  Broken redirects:    [n]
  Orphan redirects:    [n]

WEEK OVER WEEK:
  SEO completeness: [pct]% ([↑/↓] vs last week)

TOP PRIORITY FIXES:
1. [n] high-traffic products missing meta titles
2. [n] products with duplicate titles (cannibalization risk)
3. [n] images missing alt text

Save full SEO gap list to seo_audit_[date].csv

If completeness >95%: ✅ SEO catalog healthy.


IMPORTANT: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate product names, order counts, revenue figures, or any other store data. If a query returns empty results, report 'No data returned' — do not fill in plausible values.
```
