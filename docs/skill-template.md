---
name: skill-slug
role: marketing
description: "One sentence: what business outcome this achieves."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - OperationName:query
  - OperationName:mutation
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.

## Purpose
One paragraph describing the business outcome, when to use this skill, and what it replaces.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_orders`, `write_discounts` (list all required scopes)

## Parameters
All skills accept these universal parameters:

| Parameter | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| format    | string | no       | human   | Output format: `human` (default) or `json` |
| dry_run   | bool   | no       | false   | Preview mutations without executing |

Skill-specific parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| param_name | type | yes/no | default | Description |

## Safety

> **Include this section only for skills with irreversible mutations (financial, bulk data changes).**

Steps N and N execute mutations that cannot be undone. Run with `dry_run: true` to preview results before committing.

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.

1. **OPERATION:** `OperationName` — query
   **Inputs:** field, filter
   **Expected output:** Description of returned data and how it feeds step 2

2. **OPERATION:** `OperationName` — mutation
   **Inputs:** data from step 1
   **Expected output:** Confirmation of change, IDs of affected records

## GraphQL Operations

```graphql
# OperationName:query — validated against api_version 2025-01
query OperationName($first: Int!, $after: String, $query: String) {
  fieldName(first: $first, after: $after, query: $query) {
    edges {
      node {
        id
        # ... fields
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

```graphql
# OperationName:mutation — validated against api_version 2025-01
mutation OperationName($input: InputType!) {
  mutationField(input: $input) {
    result {
      id
    }
    userErrors {
      field
      message
    }
  }
}
```

## Session Tracking

**Claude MUST emit the following output at each stage. This is mandatory.**

**On start**, emit:
```
╔══════════════════════════════════════════════╗
║  SKILL: <skill name>                         ║
║  Started: <YYYY-MM-DD HH:MM UTC>             ║
╚══════════════════════════════════════════════╝
```

**After each step**, emit:
```
[N/TOTAL] <QUERY|MUTATION>  <OperationName>
          → Params: <brief summary of key inputs>
          → Result: <count or outcome>
```

If `dry_run: true`, prefix every mutation step with `[DRY RUN]` and do not execute it.

**On completion**, emit:

For `format: human` (default):
```
══════════════════════════════════════════════
OUTCOME SUMMARY
  <Metric label>:   <value>
  Errors:           0
  Output:           <filename or "none">
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "<skill-slug>",
  "started_at": "<ISO8601>",
  "completed_at": "<ISO8601>",
  "dry_run": false,
  "steps": [
    {
      "step": 1,
      "operation": "<OperationName>",
      "type": "query",
      "params_summary": "<string>",
      "result_summary": "<string>",
      "skipped": false
    }
  ],
  "outcome": {
    "metric_key": 0,
    "errors": 0,
    "output_file": null
  }
}
```

## Output Format
Describe what Claude produces: CSV export fields, JSON structure, or summary only.

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `THROTTLED` | API rate limit | Wait 2s, retry up to 3 times |
| `userErrors` non-empty | Invalid input | Log each error message, skip affected record, continue |

## Best Practices
- Tip 1 — specific, actionable, non-obvious.
- Tip 2 — includes concrete action (e.g., "Run with `dry_run: true` first — discount codes cannot be bulk-deleted via API").
- Tip 3
