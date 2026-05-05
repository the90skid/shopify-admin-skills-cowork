# shopify-admin-skills-cowork

**Shopify Admin Skills for Claude Cowork + Official Shopify MCP Connector**

> Originally created by [40rty](https://40rty.ai) — [github.com/40RTY-ai/shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)  
> Adapted for Claude Cowork by [the90skid](https://github.com/the90skid)

---

## What is this?

106 AI agent skills for operating Shopify stores, adapted to work natively with **Claude Cowork** and the **Official Shopify MCP Connector**. No Shopify CLI needed. No terminal commands. Just connect the MCP connector and go.

Skills cover: marketing, merchandising, customer support, customer ops, conversion optimization, fulfillment, finance, order intelligence, returns, and store management.

---

## Requirements

- [Claude Cowork](https://claude.ai)
- Official Shopify MCP Connector (connect in Cowork settings)
- A Shopify store with Admin API access

---

## Setup

1. **Connect the Shopify MCP Connector** in your Claude Cowork settings
2. **Start using skills** — ask Claude to run any skill

That's it. No CLI, no auth commands, no plugin flags.

---

## Skill Categories

| Category | Count | Examples |
|----------|-------|---------|
| Marketing | 6 | Abandoned cart recovery, promo code generator, VIP identifier |
| Merchandising | 18 | Bulk price adjustment, dead stock finder, inventory transfer |
| Customer Support | 8 | Order lookup, refund & reorder, address correction |
| Customer Ops | 14 | RFM segmentation, churn risk scorer, cohort analysis |
| Conversion Optimization | 8 | Checkout abandonment report, cross-sell finder |
| Fulfillment Ops | 11 | Bulk fulfillment, carrier comparison, split shipment |
| Finance | 12 | Payout reconciliation, profit margin, tax summary |
| Order Intelligence | 9 | Risk report, repeat purchase rate, product affinity |
| Returns | 6 | Return fraud detector, reason analysis, restock |
| Store Management | 8 | Discount cleanup, file audit, redirect audit |

---

## Running a Skill

Ask Claude naturally:
> "Run the dead stock identifier skill for products with no sales in 90 days"

Or be specific:
> "Use shopify-admin-skills-cowork:shopify-admin-dead-stock-identifier with days_back: 90, dry_run: true"

All mutation skills support `dry_run: true` to preview changes without executing them.

---

## Scheduled Tasks

18 pre-built scheduled workflows in the `scheduled/` folder. Set them up with:
> "Schedule the morning store briefing to run every day at 8am"

See [scheduled/README.md](scheduled/README.md) for the full list.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add new skills.

---

## License

MIT — see [LICENSE](LICENSE).

Original skills by [40rty](https://40rty.ai). Fork adapted for Claude Cowork by [the90skid](https://github.com/the90skid).
