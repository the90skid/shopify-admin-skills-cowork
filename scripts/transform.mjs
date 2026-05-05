#!/usr/bin/env node

/**
 * transform.mjs — Phase 1 batch transformation script.
 * Adapts all skill SKILL.md files from Claude Code / Shopify CLI to Claude Cowork / MCP Connector.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const SKILLS_DIR = join(ROOT, 'skills');

const ATTRIBUTION = `\n> Forked from [shopify-admin-skills](https://github.com/40RTY-ai/shopify-admin-skills)\n> by [40rty](https://40rty.ai) — MIT License. Adapted for Claude Cowork.\n`;

const MCP_WORKFLOW_NOTE = `> Execute all GraphQL operations via the \`graphql_query\` and \`graphql_mutation\` MCP tools.\n> The Shopify MCP connector handles store authentication automatically.\n>\n> **CRITICAL: Report ONLY data returned by the MCP tools. Never infer, estimate, or fabricate**\n> **product names, order counts, revenue figures, or any other store data. If a query returns**\n> **empty results, report "No data returned" — do not fill in plausible values.**\n`;

async function getSkillFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(e => e.isFile() && e.name === 'SKILL.md')
    .map(e => join(e.parentPath || e.path, e.name));
}

function transformFrontmatter(content) {
  // Replace toolkit
  content = content.replace(
    /^toolkit:\s*shopify-admin,\s*shopify-admin-execution$/m,
    'toolkit: shopify-mcp-connector'
  );

  // Replace compatibility
  content = content.replace(
    /^compatibility:\s*Claude Code,\s*Cursor,\s*Codex,\s*Gemini CLI$/m,
    'compatibility: Claude Cowork'
  );

  return content;
}

function injectAttribution(content) {
  // Insert attribution after the closing --- of frontmatter
  const fmEnd = content.indexOf('---', content.indexOf('---') + 3);
  if (fmEnd === -1) return content;
  const insertPos = fmEnd + 3;
  return content.slice(0, insertPos) + '\n' + ATTRIBUTION + content.slice(insertPos);
}

function replacePrerequisites(content) {
  // Find ## Prerequisites section and replace the CLI auth line
  const prereqPattern = /- Authenticated Shopify CLI session[^\n]*\n/;
  content = content.replace(prereqPattern, '- Shopify MCP connector connected in Claude Cowork settings\n');

  // Also handle the variant: "- Authenticated Shopify CLI session: `shopify auth login --store <domain>`"
  const prereqPattern2 = /- Authenticated Shopify CLI session:[^\n]*\n/;
  content = content.replace(prereqPattern2, '- Shopify MCP connector connected in Claude Cowork settings\n');

  // Rename "API scopes:" to "Required store scopes:" if present
  content = content.replace(/- API scopes:/g, '- Required store scopes:');

  return content;
}

function removeStoreParam(content) {
  // Remove the | store | string | yes | — | Store domain ... | row from parameters table
  const storeRowPattern = /\| store\s*\|[^\n]*\n/;
  content = content.replace(storeRowPattern, '');
  return content;
}

function prependWorkflowNote(content) {
  // Find ## Workflow Steps and insert the MCP note after it
  const workflowHeader = '## Workflow Steps';
  const idx = content.indexOf(workflowHeader);
  if (idx === -1) return content;
  const insertPos = idx + workflowHeader.length;
  // Find the next newline after the header
  const nextNewline = content.indexOf('\n', insertPos);
  if (nextNewline === -1) return content;
  return content.slice(0, nextNewline + 1) + '\n' + MCP_WORKFLOW_NOTE + content.slice(nextNewline + 1);
}

function removeStoreDomainFromBanner(content) {
  // Remove "║  Store: <store domain>  ║" line from session tracking banner
  const storeLinePattern = /║\s*Store:.*║\n/g;
  content = content.replace(storeLinePattern, '');
  return content;
}

function transformSkill(content) {
  content = transformFrontmatter(content);
  content = injectAttribution(content);
  content = replacePrerequisites(content);
  content = removeStoreParam(content);
  content = prependWorkflowNote(content);
  content = removeStoreDomainFromBanner(content);
  return content;
}

async function main() {
  const files = await getSkillFiles(SKILLS_DIR);
  console.log(`Found ${files.length} skill files to transform.`);

  let transformed = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      const result = transformSkill(content);
      await writeFile(file, result, 'utf-8');
      transformed++;
    } catch (err) {
      console.error(`ERROR: ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone. Transformed: ${transformed}, Errors: ${errors}`);
}

main();
