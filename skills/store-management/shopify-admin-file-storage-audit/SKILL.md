---
name: shopify-admin-file-storage-audit
role: store-management
description: "Read-only: lists every file in CDN storage, cross-references usage on products, pages, and articles, and flags orphaned/unreferenced assets."
toolkit: shopify-mcp-connector
api_version: "2025-01"
graphql_operations:
  - files:query
  - products:query
  - pages:query
  - articles:query
status: stable
compatibility: Claude Cowork
---

> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)
> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.


## Purpose
Inventories every file (image, video, generic file) in the store's CDN library and cross-references each one against products, pages, and blog articles to determine whether it is actually used. Orphaned files inflate storage usage, slow back-office search, and obscure brand assets. Read-only — no mutations. Provides the data foundation for a manual cleanup or archival workflow.

## Prerequisites
- Shopify MCP connector connected in Claude Cowork settings
- Required store scopes: `read_files`, `read_products`, `read_content`

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| min_age_days | integer | no | 30 | Only flag files older than this (avoid newly uploaded assets in flight) |
| file_types | string | no | all | Filter: `IMAGE`, `VIDEO`, `GENERIC_FILE`, or `all` |
| sample_orphans | integer | no | 25 | Number of orphaned files to print in the human-format completion banner |
| format | string | no | human | Output format: `human` or `json` |

## Safety

> ℹ️ Read-only skill — no mutations are executed. Safe to run at any time. No files are deleted by this skill; it produces a report only.

## Workflow Steps

> Execute all GraphQL operations via the `graphql_query` and `graphql_mutation` MCP tools.
> The Shopify MCP connector handles store authentication automatically.
>
> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**
> **product names, order counts, revenue figures, or any other store data. If a query returns**
> **empty results, report "No data returned" — do not fill in plausible values.**

1. **OPERATION:** `files` — query
   **Inputs:** `first: 250`, select `id`, `alt`, `createdAt`, `fileStatus`, `__typename`, plus typename-specific URL/size fields, pagination cursor
   **Expected output:** Full file inventory with CDN URLs and byte sizes; paginate until `hasNextPage: false`

2. **OPERATION:** `products` — query
   **Inputs:** `first: 250`, select `media { ... on MediaImage { image { url } id }, ... on Video { sources { url } } }`, pagination cursor
   **Expected output:** Set of file IDs / URLs referenced by any product

3. **OPERATION:** `pages` — query
   **Inputs:** `first: 250`, select `body` (HTML body for inline `<img src=...>` reference scanning)
   **Expected output:** Page bodies; extract `cdn.shopify.com/...` URLs

4. **OPERATION:** `articles` — query
   **Inputs:** `first: 250`, select `body` and `image { url }`
   **Expected output:** Article bodies and hero images; extract referenced file URLs

5. Cross-reference: any file in step 1 whose `id` or canonical URL is not found in the union of step 2, 3, 4 references → orphan.

6. Apply `min_age_days` filter — exclude files created within the last N days from the "orphan" list to avoid flagging staging/in-flight uploads.

## GraphQL Operations

```graphql
# files:query — validated against api_version 2025-01
query FileInventory($after: String, $query: String) {
  files(first: 250, after: $after, query: $query) {
    edges {
      node {
        id
        alt
        createdAt
        fileStatus
        __typename
        ... on MediaImage {
          image { url width height }
          originalSource { fileSize }
        }
        ... on Video {
          sources { url mimeType fileSize }
        }
        ... on GenericFile {
          url
          mimeType
          originalFileSize
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

```graphql
# products:query — validated against api_version 2025-01
query ProductMediaReferences($after: String) {
  products(first: 250, after: $after) {
    edges {
      node {
        id
        media(first: 50) {
          edges {
            node {
              ... on MediaImage { id image { url } }
              ... on Video { id sources { url } }
            }
          }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

```graphql
# pages:query — validated against api_version 2025-01
query PageBodyReferences($after: String) {
  pages(first: 250, after: $after) {
    edges { node { id title body } }
    pageInfo { hasNextPage endCursor }
  }
}

# articles:query — validated against api_version 2025-01
query ArticleBodyReferences($after: String) {
  articles(first: 250, after: $after) {
    edges { node { id title body image { url } } }
    pageInfo { hasNextPage endCursor }
  }
}
```

## Session Tracking

**Claude MUST emit the following output at each stage. This is mandatory.**

**On start**, emit:
```
╔══════════════════════════════════════════════╗
║  SKILL: File Storage Audit                   ║
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
FILE STORAGE AUDIT
  Total files:        <n>   ( <total_size_mb> MB )
    Images:           <n>
    Videos:           <n>
    Generic files:    <n>
  Referenced files:   <n>   ( <ref_size_mb> MB )
  Orphaned files:     <n>   ( <orphan_size_mb> MB ,  <pct>%)

  Sample orphans:
    "<filename>"  <size>  uploaded: <YYYY-MM-DD>
  Output: file_audit_<date>.csv
══════════════════════════════════════════════
```

For `format: json`, emit:
```json
{
  "skill": "file-storage-audit",
  "store": "<domain>",
  "total_files": 0,
  "total_size_bytes": 0,
  "referenced_files": 0,
  "orphaned_files": 0,
  "orphaned_size_bytes": 0,
  "orphan_pct": 0,
  "output_file": "file_audit_<date>.csv"
}
```

## Output Format
CSV file `file_audit_<YYYY-MM-DD>.csv` with columns:
`file_id`, `file_type`, `url`, `alt`, `size_bytes`, `created_at`, `age_days`, `is_referenced`, `referenced_by_count`, `referenced_by_sample`

## Error Handling
| Error | Cause | Recovery |
|-------|-------|----------|
| `THROTTLED` | API rate limit exceeded | Wait 2 seconds, retry up to 3 times |
| `ACCESS_DENIED` on `files` | Missing `read_files` scope | Re-auth with `read_files` added |
| File without size field | CDN metadata still propagating | Treat `size_bytes = null`; include in report with note |
| Body URL parsing miss | Page/article uses theme asset path, not CDN URL | Mark as `referenced_by: theme`, exclude from orphan list |

## Best Practices
- Run before any large media re-upload (e.g., catalog refresh) to baseline current storage.
- Use `min_age_days: 30` to avoid flagging in-flight uploads not yet wired to a product or page.
- Sort the CSV by `size_bytes` descending — a few large videos often dominate storage cost.
- Do NOT bulk-delete from the report directly. Spot-check 10 random orphans first; theme and email-template references are not always discoverable via the Admin API.
- Keep the prior month's CSV and diff against the new run to track net storage growth.
