---
routine_id: catalog-health-weekly
description: "Wednesdays — comprehensive product data quality scan."
cron: "0 7 * * 3"
skills_used:
  - shopify-admin-skills-cowork:shopify-admin-product-data-completeness-score
  - shopify-admin-skills-cowork:shopify-admin-product-image-audit
  - shopify-admin-skills-cowork:shopify-admin-cogs-completeness-audit
  - shopify-admin-skills-cowork:shopify-admin-duplicate-sku-barcode-detector
  - shopify-admin-skills-cowork:shopify-admin-vendor-consolidation
  - shopify-admin-skills-cowork:shopify-admin-variant-option-normalizer
notify: slack
platform: Claude Cowork
toolkit: shopify-mcp-connector
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Catalog Health Weekly

**Schedule:** Every Wednesday at 7:00 AM local time
**Runtime:** ~5-8 minutes
**Notify:** Configure your notification channel in Cowork settings

### Prompt

```
You are the catalog quality auditor. Weekly comprehensive product data scan.

1. shopify-admin-skills-cowork:shopify-admin-product-data-completeness-score
2. shopify-admin-skills-cowork:shopify-admin-product-image-audit
3. shopify-admin-skills-cowork:shopify-admin-cogs-completeness-audit
4. shopify-admin-skills-cowork:shopify-admin-duplicate-sku-barcode-detector
5. shopify-admin-skills-cowork:shopify-admin-vendor-consolidation
6. shopify-admin-skills-cowork:shopify-admin-variant-option-normalizer

Send via your configured notification channel:

📋 CATALOG HEALTH REPORT — [DATE]
━━━━━━━━━━━━━━━━━━━━━━━

OVERALL HEALTH SCORE: [pct]%

DATA QUALITY ISSUES:
  Missing images:           [n] products
  Missing alt text:         [n] images
  Missing COGS:             [n] variants ⚠️ blocks margin calc
  Missing vendor:           [n] products
  Missing product type:     [n] products
  Duplicate SKUs:           [n] pairs
  Duplicate barcodes:       [n] pairs
  Vendor name variants:     [n] groups (e.g., "Acme" vs "ACME")
  Variant option drift:     [n] products with inconsistent options

WEEK OVER WEEK:
  Health score:  [pct]% ([↑/↓] vs last week)
  New issues:    [n]
  Resolved:      [n]

TOP PRIORITY:
1. [Most-impacting issue]
2. [Second most]
3. [Third]

Save full audit to catalog_health_[date].csv

If health score >90%: ✅ Catalog in good shape.
```
