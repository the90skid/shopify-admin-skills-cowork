# Scheduled Tasks for Claude Cowork

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.

These are scheduled tasks (routines) designed to run automatically in Claude Cowork on a cron schedule. Each task uses the Shopify MCP connector to query your store and deliver reports or alerts.

## Prerequisites

1. **Shopify MCP Connector** must be connected in your Claude Cowork workspace.
2. **Notification channel** configured in Cowork settings (for alerts/reports).

## How to Set Up

Use the `schedule` skill in Claude Cowork to register any task:

> "Schedule the morning store briefing to run every day at 8am"

Or reference the cron expression in the task's frontmatter directly:

> "Schedule morning-store-briefing to run on cron 0 8 * * *"

## Tasks

| # | Task | Description | Cron |
|---|------|-------------|------|
| 1 | `abandoned-cart-patrol` | Every 4 hours — scans for abandoned checkouts and reports recovery opportunities. | `0 */4 * * *` |
| 2 | `catalog-health-weekly` | Wednesdays — comprehensive product data quality scan. | `0 7 * * 3` |
| 3 | `customer-churn-watch` | Weekly — identifies at-risk and churning customers with win-back recommendations. | `0 8 * * 3` |
| 4 | `dead-stock-weekly` | Sundays — identify dead stock and generate markdown candidates report. | `0 9 * * 0` |
| 5 | `discount-roi-weekly` | Tuesdays — review discount code performance and flag underperforming campaigns. | `0 9 * * 2` |
| 6 | `fraud-sentinel` | Every 2 hours — scans recent orders for fraud indicators and flags high-risk orders. | `0 */2 * * *` |
| 7 | `fulfillment-sla-watchdog` | Twice daily on weekdays — checks for overdue fulfillments and stalled shipments. | `0 10,15 * * 1-5` |
| 8 | `inventory-aging-monthly` | 15th of each month — inventory aging buckets with carrying cost analysis. | `0 7 15 * *` |
| 9 | `low-stock-watchdog` | Daily inventory scan — alerts when products drop below reorder point based on sales velocity. | `0 7 * * *` |
| 10 | `monthly-financial-close` | First of every month — comprehensive financial close report with P&L, payouts, taxes, and refunds. | `0 8 1 * *` |
| 11 | `morning-store-briefing` | Daily morning digest — orders, revenue, fulfillment status, and issues from the last 24 hours. | `0 8 * * *` |
| 12 | `new-product-launch-tracker` | Daily — tracks first-week performance of recently published products. | `0 10 * * *` |
| 13 | `payout-recon-daily` | Daily — reconciles Shopify Payments payouts against orders, flags discrepancies. | `0 6 * * *` |
| 14 | `price-anomaly-scanner` | Daily early morning — scans for pricing errors, zero-price products, and compare-at-price inconsistencies. | `0 6 * * *` |
| 15 | `quarterly-business-review` | First day of each quarter — comprehensive QBR with trends, cohorts, top movers, and strategic insights. | `0 9 1 1,4,7,10 *` |
| 16 | `return-fraud-watch` | Mondays — scans for suspicious return patterns and serial returners. | `0 9 * * 1` |
| 17 | `seo-coverage-weekly` | Thursdays — SEO metadata gap report across catalog. | `0 7 * * 4` |
| 18 | `staff-activity-monthly` | First of each month — staff account audit and permission review. | `0 10 1 * *` |
| 19 | `vip-customer-watcher` | Daily — alerts on VIP customer orders, issues, or churn risk for white-glove handling. | `0 9 * * *` |
| 20 | `weekly-business-review` | Monday morning — comprehensive weekly performance report across all store dimensions. | `0 8 * * 1` |

**Total: 20 scheduled tasks**

## File Format

Each `.md` file contains:
- **Frontmatter** with `routine_id`, `description`, `cron`, `skills_used`, `platform`, and `toolkit`
- **Prompt** that Claude executes when the task fires

## Attribution

Original routines by [40rty](https://40rty.ai) ([github.com/40RTY-ai/shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)). MIT License.

