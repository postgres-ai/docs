const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');
const llmsTxtPlugin = require('../plugins/llms-txt');

const SITE = 'https://example.com';

// The curated product entries reference these docs, so every fixture has them.
const REQUIRED = ['monitoring/index', 'checkup/index', 'database-lab/index', 'postgres-howtos/index'];

function fixture(extraDocs = []) {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-txt-'));
  const outDir = path.join(siteDir, 'build');
  fs.mkdirSync(outDir);
  const docs = [...REQUIRED.map((id) => ({id, title: id, description: `About ${id}.`})), ...extraDocs].map((d) => {
    const file = path.join(siteDir, 'docs', `${d.id}.md`);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, d.body ?? `# ${d.title}\n\nBody of ${d.id}.\n`);
    return {
      ...d,
      permalink: `/docs/${d.id.replace(/\/index$/, '')}`,
      source: `@site/docs/${d.id}.md`,
    };
  });
  const allContent = {
    'docusaurus-plugin-content-docs': {default: {loadedVersions: [{docs}]}},
    'docusaurus-plugin-content-blog': {
      default: {
        blogPosts: [
          {metadata: {title: 'A post', description: 'Post summary.', permalink: '/blog/a-post', date: '2026-10-01'}},
        ],
      },
    },
  };
  const plugin = llmsTxtPlugin({siteDir, siteConfig: {url: `${SITE}/`}});
  return {siteDir, outDir, plugin, allContent};
}

async function run(extraDocs) {
  const {outDir, plugin, allContent} = fixture(extraDocs);
  await plugin.allContentLoaded({allContent});
  await plugin.postBuild({outDir});
  return {
    index: fs.readFileSync(path.join(outDir, 'llms.txt'), 'utf8').split('\n'),
    full: fs.readFileSync(path.join(outDir, 'llms-full.txt'), 'utf8'),
  };
}

const tutorial = {
  id: 'tutorials/first-clone',
  title: 'First [clone]',
  description: 'Create a thin clone.',
  body: "---\ntitle: First clone\n---\n\nimport Tabs from '@theme/Tabs';\n\n# First clone\n\nSee [the guide](/docs/database-lab) first.\n",
};

test('llms.txt opens with the site name and summary', async () => {
  const {index} = await run([tutorial]);
  assert.equal(index[0], '# PostgresAI');
  assert.match(index[2], /^> Zero drama Postgres\. /);
});

test('a doc is listed in its section with its markdown twin', async () => {
  const {index} = await run([tutorial]);
  const section = index.indexOf('## Docs: tutorials');
  assert.ok(section > 0);
  assert.equal(
    index[section + 2],
    `- [First \\[clone\\]](${SITE}/docs/tutorials/first-clone): Create a thin clone. [Markdown](${SITE}/raw/docs/tutorials/first-clone.md)`,
  );
});

test('curated products use the canonical line and the pinned CLI', async () => {
  const {index} = await run();
  const line = index.find((l) => l.startsWith('- [PostgresAI monitoring]('));
  assert.ok(line.includes('AI-native PostgreSQL observability: monitoring'));
  assert.ok(line.includes('npx postgresai@0.17.0'));
  assert.ok(!line.includes('@latest'));
  assert.ok(line.endsWith(`[Markdown](${SITE}/raw/docs/monitoring/index.md)`));
});

test('blog and Optional sections are present', async () => {
  const {index} = await run();
  assert.ok(index.includes(`- [A post](${SITE}/blog/a-post): Post summary.`));
  assert.ok(index.includes('## Optional'));
});

test('llms-full.txt carries raw markdown with absolute URLs', async () => {
  const {full} = await run([tutorial]);
  assert.ok(full.includes(`URL: ${SITE}/docs/tutorials/first-clone`));
  assert.ok(full.includes(`Markdown: ${SITE}/raw/docs/tutorials/first-clone.md`));
  assert.ok(full.includes(`See [the guide](${SITE}/docs/database-lab) first.`));
  assert.ok(!full.includes('title: First clone'), 'frontmatter stripped');
  assert.ok(!full.includes("import Tabs"), 'MDX imports stripped');
});

test('a doc in an unknown section fails the build', async () => {
  const {outDir, plugin, allContent} = fixture([{id: 'brand-new/page', title: 'New', description: 'x'}]);
  await plugin.allContentLoaded({allContent});
  await assert.rejects(plugin.postBuild({outDir}), /no section/);
});

test('llms-full.txt keeps import/export lines inside code fences', async () => {
  const body = [
    "import Tabs from '@theme/Tabs';",
    'export const toc = [];',
    '',
    '```bash',
    'export DB_PWD=secret',
    '```',
    '',
    '~~~',
    "import os",
    '~~~',
    '',
    '````md',
    '```',
    'export INNER=1',
    '```',
    'export OUTER=1',
    '````',
    '',
    '```bash\r',
    'export CRLF=1\r',
    '```\r',
    '',
  ].join('\n');
  const {full} = await run([{id: 'tutorials/env', title: 'Env', description: 'x', body}]);
  for (const line of ['export DB_PWD=secret', 'import os', 'export INNER=1', 'export OUTER=1', 'export CRLF=1']) {
    assert.ok(full.includes(line), `fenced line kept: ${line}`);
  }
  assert.ok(!full.includes('import Tabs'), 'top-level import stripped');
  assert.ok(!full.includes('export const toc'), 'top-level export stripped');
});

test('llms-full.txt leaves site-relative links in code as written', async () => {
  const body = [
    '# Links',
    '',
    'Read [the guide](/docs/a) and `[x](/raw)` here.',
    'Use ``<a href="/inline">`` or <a href="/docs/b">b</a>.',
    '',
    '```md',
    '[fenced](/docs/fenced)',
    '<img src="/img/fenced.png" />',
    '```',
    '',
    '~~~html',
    '<a href=\'/tilde\'>t</a>',
    '~~~',
    '',
    '````md',
    '```',
    '[nested](/nested)',
    '```',
    '````',
    '',
    'After: [c](/docs/c).',
    '',
  ].join('\n');
  const {full} = await run([{id: 'tutorials/links', title: 'Links', description: 'x', body}]);
  for (const kept of [
    '`[x](/raw)`',
    '``<a href="/inline">``',
    '[fenced](/docs/fenced)',
    '<img src="/img/fenced.png" />',
    "<a href='/tilde'>t</a>",
    '[nested](/nested)',
  ]) {
    assert.ok(full.includes(kept), `code kept as written: ${kept}`);
  }
  assert.ok(full.includes(`[the guide](${SITE}/docs/a)`), 'prose link before inline code');
  assert.ok(full.includes(`<a href="${SITE}/docs/b">b</a>`), 'prose href after inline code');
  assert.ok(full.includes(`After: [c](${SITE}/docs/c).`), 'prose link after fences');
});
