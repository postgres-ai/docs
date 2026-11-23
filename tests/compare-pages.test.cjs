const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');

const {loadCompare, validatePage, validateOurSide} = require('../plugins/compare-pages/load');
const {buildPageView, buildIndexView, orderedPages} = require('../plugins/compare-pages/view');
const {renderPage} = require('../plugins/compare-pages/markdown');
const {readUs, makePage, makeDataDir} = require('./helpers/compare-fixture.cjs');

const ROOT = path.resolve(__dirname, '..');
const us = readUs();

function problems(overrides, kind = 'monitoring') {
  const page = makePage(us, kind, overrides);
  return validatePage(page, `${page.slug}.json`, us);
}

// --- The published data ---------------------------------------------------

test('every published comparison page passes the claims checks', () => {
  const {pages} = loadCompare();
  assert.ok(pages.length > 0, 'there is at least one comparison page');
});

test('what we say about ourselves is complete', () => {
  assert.deepEqual(validateOurSide(us), []);
});

// The collector and the metrics store change between versions, so a page says
// what PostgresAI monitoring does, not what it is built from. The pgwatch page
// states the history, with a date.
test('our side does not name the parts PostgresAI monitoring is built from', () => {
  const parts = /pgwatch|victoria\s?metrics|vmalert/i;
  assert.doesNotMatch(JSON.stringify(us), parts);

  const {pages} = loadCompare();
  for (const page of pages) {
    if (page.slug === 'postgresai-vs-pgwatch') continue;
    const ours = [page.title, page.description, page.summary, page.disclosure, page.together]
      .concat((page.faq || []).map((f) => f.a));
    for (const text of ours) assert.doesNotMatch(text || '', parts, page.slug);
  }
  const pgwatch = pages.find((page) => page.slug === 'postgresai-vs-pgwatch');
  assert.match(pgwatch.disclosure, /versions released up to November 2026 use it/);
  assert.doesNotMatch(pgwatch.title + pgwatch.description, /uses pgwatch|built on pgwatch/);
});

test('prices in postgresai.json are the ones on the pricing page', () => {
  const pricingPage = fs.readFileSync(path.join(ROOT, 'src/pages/pricing/index.tsx'), 'utf8');
  const plans = JSON.stringify(require('../src/data/monitoringPlans.json'));
  const listed = (kind, plan) => us.kinds[kind].pricing.find((p) => p.plan === plan);

  assert.match(listed('monitoring', 'Starter').price, /^\$16 /);
  assert.ok(pricingPage.includes("name: 'Starter', price: '$16'"), 'Starter is $16 on the pricing page');
  assert.match(listed('monitoring', 'Scale').price, /^\$512 /);
  assert.ok(pricingPage.includes("name: 'Scale', price: '$512'"), 'Scale is $512 on the pricing page');

  assert.match(listed('branching', 'DBLab SE').price, /\$62\/month/);
  assert.ok(pricingPage.includes('Starting at $62/mo'), 'DBLab SE starts at $62 on the pricing page');
  assert.match(listed('branching', 'DBLab EE').notes, /\$0\.2662 per 100 GiB per hour/);
  assert.ok(pricingPage.includes('$0.2662 / 100 GiB / h'), 'DBLab EE rate on the pricing page');
  assert.ok(pricingPage.includes('Maximum database size 2000 GiB'), 'DBLab SE size limit on the pricing page');

  assert.ok(plans.includes('"14 days"') && plans.includes('"13 months"'), 'retention in the plan matrix');
  const retention = us.kinds.monitoring.rows.find((r) => r.key === 'retention').us;
  assert.match(retention, /14 days on Starter, 13 months on Scale/);
});

// Site-relative links in our column must point at a page that exists.
test('links to our own docs resolve to a file', () => {
  const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
  const resolves = (url) => {
    const clean = url.split('#')[0].replace(/\/+$/, '');
    if (clean === '/compare') return true;
    if (clean.startsWith('/docs/')) {
      const rel = clean.slice('/docs/'.length);
      const dir = path.join(ROOT, 'docs', path.dirname(rel));
      const name = path.basename(rel);
      if (['.md', '.mdx'].some((ext) => exists(`docs/${rel}${ext}`) || exists(`docs/${rel}/index${ext}`))) return true;
      // Docusaurus drops a numeric prefix: 02-query-analysis.md -> query-analysis.
      return fs.existsSync(dir) && fs.readdirSync(dir).some((f) => new RegExp(`^\\d+-${name}\\.mdx?$`).test(f));
    }
    return ['.md', '.mdx', '.tsx', '.js'].some(
      (ext) => exists(`src/pages${clean}${ext}`) || exists(`src/pages${clean}/index${ext}`),
    );
  };
  for (const fact of us.facts.filter((f) => f.url.startsWith('/'))) {
    assert.ok(resolves(fact.url), `facts: ${fact.url} does not resolve`);
  }
  for (const [kindKey, kind] of Object.entries(us.kinds)) {
    const links = [
      kind.productUrl,
      kind.pricingUrl,
      ...kind.cta.map((c) => c.href),
      ...kind.rows.flatMap((r) => r.usSources.map((s) => s.url)),
      ...kind.proofs.flatMap((p) => p.usSources.map((s) => s.url)),
      ...((kind.tryIt && kind.tryIt.links) || []).map((l) => l.href),
    ];
    for (const url of links.filter((u) => u.startsWith('/'))) {
      assert.ok(resolves(url), `${kindKey}: ${url} does not resolve`);
    }
    // The screenshot is a file we ship.
    if (kind.figure) {
      assert.ok(exists(`static${kind.figure.src}`), `${kindKey}: ${kind.figure.src} is not in static/`);
      if (kind.figure.href) assert.ok(resolves(kind.figure.href), `${kindKey}: ${kind.figure.href} does not resolve`);
    }
  }
});

// --- The checks themselves ------------------------------------------------

test('a well-formed page passes, for every kind', () => {
  for (const kind of Object.keys(us.kinds)) assert.deepEqual(problems({}, kind), [], kind);
});

test('a row without a source is rejected', () => {
  const page = makePage(us);
  page.rows[0].sources = [];
  assert.match(validatePage(page, `${page.slug}.json`, us).join('\n'), /rows\.scope needs at least one source number/);
});

test('a missing row and an unknown row are rejected', () => {
  const page = makePage(us);
  page.rows.pop();
  page.rows.push({key: 'made-up', them: 'Not a question we ask.', sources: [1]});
  const out = validatePage(page, `${page.slug}.json`, us).join('\n');
  assert.match(out, /unknown key "made-up"/);
  assert.match(out, /rows\.compliance is missing/);
});

test('a matrix row needs a verdict, and other rows must not have one', () => {
  const page = makePage(us);
  delete page.rows.find((r) => r.key === 'platforms').v;
  page.rows.find((r) => r.key === 'scope').v = 'yes';
  const out = validatePage(page, `${page.slug}.json`, us).join('\n');
  assert.match(out, /rows\.platforms\.v must be one of/);
  assert.match(out, /rows\.scope\.v is set/);
});

test('a matrix column can be moved', () => {
  const view = buildIndexView(us, [makePage(us)]);
  const {columns} = view.kinds[0].matrix;
  assert.equal(columns[0].label, 'Any provider');

  const broken = JSON.parse(JSON.stringify(us));
  broken.kinds.monitoring.rows.find((r) => r.key === 'scope').matrixOrder = 2;
  assert.match(validateOurSide(broken).join('\n'), /matrixOrder is a whole number on a matrix row/);
});

// The sentence above the matrix is counted from its cells, so it cannot say
// more than the pages do.
test('the matrix summary is counted from the cells', () => {
  const {pages} = loadCompare();
  for (const kind of buildIndexView(us, pages).kinds) {
    const m = kind.matrix;
    assert.equal(m.tally.length, m.columns.length);
    m.tally.forEach((n, i) => assert.equal(n, m.rows.filter((row) => row.cells[i] === 'yes').length));
    const ours = m.us.map((v, i) => (v === 'yes' ? i : -1)).filter((i) => i >= 0);
    assert.equal(m.ourYes, ours.length);
    assert.deepEqual(
      m.matchAll,
      m.rows.filter((row) => ours.every((i) => row.cells[i] === 'yes')).map((row) => row.name),
    );
    for (const c of m.rarest) assert.ok(c.yes / m.rows.length <= 0.25, `${c.label} is not rare`);
  }
});

// These pages are about PostgreSQL. A row that asks about other database
// engines does not belong on them.
test('no row asks about databases other than PostgreSQL', () => {
  for (const kind of Object.values(us.kinds)) {
    for (const row of kind.rows) {
      assert.notEqual(row.key, 'engines');
      assert.doesNotMatch(row.label, /other than PostgreSQL|other databases|databases supported/i);
    }
  }
});

// A reason to pick our product is our fact with our docs, plus what the other
// vendor documents on the same point, with a source.
test('a proof needs a known key, a text and a source', () => {
  const keys = us.kinds.monitoring.proofs.map((p) => p.key);
  const proof = (key, extra = {}) => ({key, them: 'What Example documents on this point.', sources: [1], ...extra});

  assert.match(problems({proofs: [proof(keys[0]), proof(keys[1])]}).join('\n'), /proofs needs 3-4 entries/);
  assert.match(problems({proofs: [proof(keys[0]), proof(keys[1]), proof('made-up')]}).join('\n'), /unknown key "made-up"/);
  assert.match(problems({proofs: [proof(keys[0]), proof(keys[1]), proof(keys[1])]}).join('\n'), /appears twice/);
  assert.match(
    problems({proofs: [proof(keys[0]), proof(keys[1]), proof(keys[2], {sources: []})]}).join('\n'),
    /needs at least one source number/,
  );
  assert.match(problems({proofs: [proof(keys[0]), proof(keys[1]), proof(keys[2], {them: 'Too short.'})]}).join('\n'), /must be 20-320 chars/);
  assert.match(
    problems({proofs: [proof(keys[0]), proof(keys[1]), proof(keys[2], {them: 'Example has a seamless setup on every cloud.'})]}).join('\n'),
    /opinion wording/,
  );
  assert.match(
    problems({
      proofs: [proof(keys[0]), proof(keys[1]), proof(keys[2], {them: 'The sources we reviewed do not describe a fix for a finding.'})],
    }).join('\n'),
    /start with what Example does/,
  );
  assert.match(problems({chooseUs: ['An old list of reasons with no evidence.']}).join('\n'), /chooseUs is no longer used/);
});

// Other engines and the rest of the stack are out of scope on both sides.
test('a page cannot talk about other databases or the whole stack', () => {
  const second = 'Teams that already run it for their PostgreSQL servers.';
  for (const text of [
    'Example also monitors MySQL and MongoDB servers.',
    'Example is a full-stack observability platform.',
    'Example supports other database engines too.',
    'Example is infrastructure monitoring with a collector.',
  ]) {
    assert.match(problems({chooseThem: [text, second]}).join('\n'), /outside PostgreSQL/);
    assert.match(problems({summary: `${text} ${'It collects PostgreSQL query statistics and plans. '.repeat(4)}`.trim()}).join('\n'), /outside PostgreSQL/);
  }
  // A plan name is a name, and a trace that leads to a query is about Postgres.
  const fixture = makePage(us, 'monitoring', {});
  const pricing = [{...fixture.pricing[0], plan: 'Infrastructure Monitoring'}];
  assert.doesNotMatch(problems({pricing}).join('\n'), /outside PostgreSQL/);
  assert.doesNotMatch(
    problems({chooseThem: ['Example links a slow PostgreSQL query to the application trace that ran it.', second]}).join('\n'),
    /outside PostgreSQL/,
  );

  const broken = JSON.parse(JSON.stringify(us));
  broken.kinds.monitoring.rows[0].us = 'Monitors PostgreSQL, MySQL and SQL Server from one place.';
  assert.match(validateOurSide(broken).join('\n'), /kinds\.monitoring\.rows\.\w+: outside PostgreSQL/);
});

test('our half of every proof is a fact with a link to our docs', () => {
  const broken = JSON.parse(JSON.stringify(us));
  broken.kinds.monitoring.proofs[0].usSources = [];
  broken.kinds.branching.proofs[0].title = 'An unrivalled way to clone a database';
  const out = validateOurSide(broken).join('\n');
  assert.match(out, /kinds\.monitoring\.proofs\.\w+: usSources needs at least one link/);
  assert.match(out, /kinds\.branching\.proofs\.[\w-]+: opinion wording/);
});

test('opinion wording is rejected', () => {
  for (const text of ['A best-in-class dashboard for teams of any size.', 'It offers seamless setup on every cloud.']) {
    assert.match(problems({chooseThem: [text, text + ' Two.', text + ' Three.']}).join('\n'), /opinion wording/);
  }
});

test('a private repository is never linked or named', () => {
  const out = problems({together: 'See https://gitlab.com/postgres-ai/growth/-/work_items/33 for the plan.'}).join('\n');
  assert.match(out, /names a private repository/);
});

test('a source nobody cites, and a citation of a missing source, are rejected', () => {
  const page = makePage(us);
  page.sources.push({title: 'Unused', url: 'https://example.com/unused'});
  page.pricing[0].sources = [99];
  const out = validatePage(page, `${page.slug}.json`, us).join('\n');
  assert.match(out, /sources\[5\] .* is never cited/);
  assert.match(out, /cites source 99/);
});

test('the title, slug and group must fit the kind', () => {
  const out = problems({title: 'DBLab vs Example: the wrong product name for this kind', slug: 'dblab-vs-example'}).join('\n');
  assert.match(out, /title must start with "PostgresAI vs "/);
  assert.match(out, /slug must start with "postgresai-vs-"/);
  const page = makePage(us);
  page.competitor.group = 'nowhere';
  assert.match(validatePage(page, `${page.slug}.json`, us).join('\n'), /competitor\.group must be one of/);
});

test('a product that is not active needs a dated note with a source', () => {
  const page = makePage(us);
  page.competitor.status = 'discontinued';
  const out = validatePage(page, `${page.slug}.json`, us).join('\n');
  assert.match(out, /statusNote is required/);
  assert.match(out, /competitor\.statusSources needs at least one source number/);
});

test('a disclosure, when present, must be a full sentence', () => {
  assert.match(problems({disclosure: 'Partners.'}).join('\n'), /disclosure must be a sentence/);
  assert.deepEqual(problems({disclosure: 'Example, Inc. and PostgresAI run a podcast together.'}), []);
});

test('loadCompare reports every problem at once and names the file', () => {
  const bad = makePage(us);
  bad.description = 'Too short.';
  bad.faq = [];
  assert.throws(() => loadCompare(makeDataDir([bad])), (e) => {
    assert.match(e.message, /compare: 2 problem\(s\)/);
    assert.match(e.message, /postgresai-vs-example\.json: description is 10 chars/);
    return true;
  });
});

// --- What the pages are built from ----------------------------------------

test('a page view joins our row and theirs under one question', () => {
  const page = makePage(us);
  const view = buildPageView(page, us, [page]);
  assert.equal(view.path, '/compare/postgresai-vs-example');
  assert.equal(view.markdownPath, '/raw/compare/postgresai-vs-example.md');
  assert.equal(view.rows.length, us.kinds.monitoring.rows.length);
  const row = view.rows.find((r) => r.key === 'platforms');
  assert.equal(row.label, 'Where your Postgres can run, and which versions');
  assert.match(row.us, /Amazon RDS and Aurora/);
  assert.match(row.them, /What Example documents/);
  assert.equal(row.usV, 'yes');

  // The heading is the two names; the rest of the title is the line under it.
  assert.equal(view.heading, 'PostgresAI vs Example');
  assert.equal(view.angle, 'a made-up product for the tests');

  // A proof carries our fact and our docs next to their statement and source.
  assert.equal(view.proofs.length, 3);
  const def = us.kinds.monitoring.proofs[0];
  assert.deepEqual(view.proofs[0], {
    key: def.key,
    title: def.title,
    us: def.us,
    usSources: def.usSources,
    them: `What Example documents on the point "${def.title}".`,
    sources: [1],
  });
});

test('the index groups pages and leaves discontinued products out of the matrix', () => {
  const active = makePage(us);
  const gone = makePage(us, 'monitoring', {slug: 'postgresai-vs-gone'});
  gone.competitor = {...gone.competitor, name: 'Gone', status: 'discontinued', statusNote: 'Shut down in 2024.', statusSources: [4]};
  const clone = makePage(us, 'branching');
  const pages = [gone, clone, active];
  const view = buildIndexView(us, pages);

  assert.equal(view.total, 3);
  assert.deepEqual(view.kinds.map((k) => k.key), ['monitoring', 'branching']);
  const monitoring = view.kinds[0];
  assert.deepEqual(monitoring.groups[0].pages.map((p) => p.name), ['Example', 'Gone']);
  assert.deepEqual(monitoring.matrix.rows.map((r) => r.name), ['Example']);
  assert.equal(monitoring.matrix.columns.length, monitoring.matrix.us.length);
  assert.deepEqual(orderedPages(us, pages).map((p) => p.slug), ['postgresai-vs-example', 'postgresai-vs-gone', 'dblab-vs-example']);
});

test('the markdown twin carries the table, the prices and the numbered sources', () => {
  const page = makePage(us);
  const md = renderPage(buildPageView(page, us, [page]), 'https://example.org');
  assert.ok(md.startsWith('# PostgresAI vs Example: a made-up product for the tests\n'));
  assert.ok(md.includes('Checked on 2026-11-17. Page: https://example.org/compare/postgresai-vs-example.'));
  assert.ok(md.includes('| | PostgresAI | Example |'));
  assert.ok(md.includes('| Where your Postgres can run, and which versions | Any provider: yes. Amazon RDS and Aurora'));
  assert.ok(!md.includes('other than PostgreSQL'));
  assert.ok(md.includes('## Where PostgresAI is ahead of Example'));
  assert.ok(md.includes(`1. **${us.kinds.monitoring.proofs[0].title}.**`));
  assert.ok(md.includes(`   - Example: What Example documents on the point "${us.kinds.monitoring.proofs[0].title}". [1]`));
  assert.ok(md.includes('## When Example is the better choice'));
  assert.ok(md.indexOf('## Where PostgresAI is ahead') < md.indexOf('## Side by side'));
  assert.ok(md.indexOf('## Side by side') < md.indexOf('## When Example is the better choice'));
  assert.ok(md.includes('| Open source | Yes. The monitoring software is open source'));
  assert.ok(md.includes('| Example | Pro | $100 per server/month | One server [2] |'));
  assert.ok(md.includes('1. [Example documentation](https://example.com/docs)'));
  assert.ok(md.includes('- [PostgresAI monitoring overview](https://example.org/docs/monitoring)'));
  assert.ok(md.includes('## How we compare'));
  assert.ok(!md.includes('Disclosure:'), 'no disclosure line unless the page has one');
  const disclosed = {...page, disclosure: 'Example, Inc. and PostgresAI run a podcast together.'};
  assert.ok(
    renderPage(buildPageView(disclosed, us, [disclosed]), 'https://example.org').includes(
      'Disclosure: Example, Inc. and PostgresAI run a podcast together.',
    ),
  );
  assert.ok(!/\]\(\//.test(md), 'no site-relative links are left');
});
