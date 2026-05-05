---
name: shopify-admin-page-content-audit
role: store-management
description: "Read-only: lists all pages and blog posts, flags empty or short content and missing SEO fields."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - pages:query
  - articles:query
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Scans all store pages and blog articles for missing or thin content (short body, missing SEO title/description, empty body). Thin content pages are penalized by search engines and create a poor customer experience. Read-only — no mutations. Complements `seo-metadata-audit` (which covers products and collections).

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_content`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| min_body_length | integer | no | 100 | Flag pages with body content shorter than this (characters) |
| include_unpublished | bool | no | false | Also audit unpublished pages and articles |
| format | string | no | human | Output format: `human` or `json` |

## Safety

> ℹ️ Read-only skill — no mutations are executed. Safe to run at any time.

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
>
> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**
> **product names, order counts, revenue figures, or any other store data. If a query returns**
> **empty results, report "No data returned" — do not fill in plausible values.**

1. **OPERATION:** `pages` — query
   **Inputs:** `first: 250`, select `title`, `body`, `bodySummary`, `seo`, `publishedAt`, pagination cursor
   **Expected output:** All pages with content and SEO data

2. **OPERATION:** `articles` — query
   **Inputs:** `first: 250`, select `title`, `body`, `seo`, `publishedAt`, `blog { title }`, pagination cursor
   **Expected output:** All blog articles with content data

3. Flag: empty body, body < `min_body_length`, missing SEO title, missing SEO description

## GraphQL Operations

```graphql
# pages:query — validated against api_version 2025-04
query PageContentAudit($after: String) {
  pages(first: 250, after: $after) {
    edges {
      node {
        id
        title
        handle
        publishedAt
        bodySummary
        body
        seoTitle: metafield(namespace: "global", key: "title_tag") { value }
        seoDescription: metafield(namespace: "global", key: "description_tag") { value }
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
# articles:query — validated against api_version 2025-04
query ArticleContentAudit($after: String) {
  articles(first: 250, after: $after) {
    edges {
      node {
        id
        title
        handle
        publishedAt
        body
        summary
        seoTitle: metafield(namespace: "global", key: "title_tag") { value }
        seoDescription: metafield(namespace: "global", key: "description_tag") { value }
        blog {
          id
          title
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## Session Tracking

**Claude MUST emit the following output at each stage. This is mandatory.**

**On start**, emit:
```
╔══════════════════════════════════════════════╗
║  SKILL: Page Content Audit                   ║
║  Started: <YYYY-MM-DD HH:MM UTC>             ║
╚══════════════════════════════════════════════╝
```

**After each step**, emit:
```
[N/TOTAL] <QUERY|MUTATION>  <OperationName>
          → Params: <brief summary of key inputs>
          → Result: <count or outcome>
```

**On completion**, emit:

For `format: human` (default):
```
══════════════════════════════════════════════
PAGE CONTENT AUDIT
  Pages scanned:    <n>  |  Issues: <n>
  Articles scanned: <n>  |  Issues: <n>

  Issues:
    Page: "<title>" — empty body
    Article: "<title>" — missing SEO description
  Output: content_audit_<date>.csv
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "page-content-audit",
  "store": "<domain>",
  "pages_scanned": 0,
  "articles_scanned": 0,
  "issues_found": 0,
  "output_file": "content_audit_<date>.csv"
}
```

## Output Format
CSV file `content_audit_<YYYY-MM-DD>.csv` with columns:
`type`, `id`, `title`, `handle`, `published_at`, `body_length`, `has_seo_title`, `has_seo_description`, `issue`

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `THROTTLED` | API rate limit exceeded | Wait 2 seconds, retry up to 3 times |
| No pages or articles | Minimal store | Exit with 0 results |

## Best Practices
- A page with fewer than 300 words is generally considered "thin content" by search engines — use `min_body_length: 1500` (characters ≈ ~250 words) as a starting threshold.
- The About, FAQ, and Contact pages are high-trust pages that should never be empty — prioritize these.
- Run after any CMS migration or theme change that may have wiped page content.
- Pair with `seo-metadata-audit` for a complete SEO audit covering products, collections, pages, and blog articles in one workflow.
