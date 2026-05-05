# Contributing to shopify-admin-skills-cowork

> This repo is a fork of [40RTY-ai/shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills) by [40rty](https://40rty.ai), adapted for Claude Cowork + Official Shopify MCP Connector.

## Adding a New Skill

### 1. Use the template

Copy `docs/skill-template.md` into the appropriate category directory:

```
skills/<category>/shopify-admin-<your-skill-name>/SKILL.md
```

### 2. Required frontmatter fields

```yaml
---
name: shopify-admin-<your-skill-name>
role: <category>
description: "One sentence describing the business outcome."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - OperationName:query
  - OperationName:mutation
status: stable
compatibility: Claude Cowork
---
```

### 3. Prerequisites format

Always use MCP connector style — no CLI commands:

```markdown
## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_orders`, `write_products` (list yours)
```

### 4. No `store` parameter

Do not include a `store` parameter in the Parameters table. The MCP connector is pre-bound to the store.

### 5. Workflow Steps format

Always include the MCP note at the top of Workflow Steps:

```markdown
## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
```

### 6. Attribution

Include this block below the frontmatter `---`:

```markdown
> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.
```

---

## Running Validation

```bash
npm run validate:index
```

This verifies the GraphQL operations index matches the frontmatter in all skill files.

---

## PR Checklist

Before submitting a pull request, verify:

- [ ] Attribution line present in the skill file
- [ ] No hardcoded store domains anywhere
- [ ] No Shopify CLI references (`shopify auth`, `shopify store execute`)
- [ ] No `store` parameter in the Parameters table
- [ ] `toolkit: shopify-mcp-connector` in frontmatter
- [ ] `compatibility: Claude Cowork` in frontmatter
- [ ] MCP workflow note present in Workflow Steps
- [ ] GraphQL operations validated against `api_version: "2025-01"`
- [ ] `dry_run` parameter included for any mutation skill

---

## Adding a Scheduled Task

Place your task file in `scheduled/<task-name>.md`. Follow the same frontmatter conventions plus add:

```yaml
platform: Claude Cowork
cron: "0 8 * * *"  # your schedule
```

Include a setup block:

```markdown
## Setup in Claude Cowork
Use the `schedule` skill to register this task:
> "Schedule [task name] to run [frequency]"
```

---

## License

MIT. All contributions inherit the same license.
