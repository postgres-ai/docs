// Builds a valid comparison page for a kind from the real postgresai.json, and
// a temporary data directory holding it, for tests that need known content.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const US_FILE = path.resolve(__dirname, '../../src/data/compare/postgresai.json');

function readUs() {
  return JSON.parse(fs.readFileSync(US_FILE, 'utf8'));
}

function makePage(us, kindKey = 'monitoring', overrides = {}) {
  const kind = us.kinds[kindKey];
  const slug = `${kind.prefix}example`;
  return {
    slug,
    kind: kindKey,
    competitor: {
      name: 'Example',
      vendor: 'Example, Inc.',
      url: 'https://example.com/',
      category: 'PostgreSQL monitoring',
      group: kind.groups[0].key,
      status: 'active',
    },
    checkedOn: '2026-11-17',
    title: `${kind.product} vs Example: a made-up product for the tests`,
    description:
      'Example is a made-up product used by the tests. It collects query statistics and shows them on dashboards, as a hosted service.',
    summary:
      'Example is a made-up product used by the tests. It collects query statistics from PostgreSQL and shows them on dashboards. ' +
      'It is hosted by the vendor. Pick it when you want dashboards only; pick the other one when you want findings with a fix.',
    chooseThem: [
      'You want a hosted dashboard and nothing else.',
      'You need the one feature that only this product documents.',
    ],
    proofs: kind.proofs.slice(0, 3).map((proof, i) => ({
      key: proof.key,
      them: `What Example documents on the point "${proof.title}".`,
      sources: [1 + (i % 4)],
    })),
    rows: kind.rows.map((row, i) => ({
      key: row.key,
      them: `What Example documents for the question "${row.label}".`,
      sources: [1 + (i % 4)],
      ...(row.matrix ? {v: 'yes'} : {}),
    })),
    pricing: [{plan: 'Pro', price: '$100 per server/month', notes: 'One server', sources: [2]}],
    faq: [
      {q: 'Is Example open source?', a: 'No. Example is a hosted service; its documentation does not list a source repository.', sources: [1]},
      {q: 'What does Example cost?', a: 'The Pro plan is $100 per server a month, as listed on its pricing page.', sources: [2]},
      {q: 'Does Example work with Amazon RDS?', a: 'Yes. Its documentation lists Amazon RDS among the supported platforms.', sources: [3]},
    ],
    sources: [
      {title: 'Example documentation', url: 'https://example.com/docs'},
      {title: 'Example pricing', url: 'https://example.com/pricing'},
      {title: 'Example platforms', url: 'https://example.com/docs/platforms'},
      {title: 'Example changelog', url: 'https://example.com/changelog'},
    ],
    ...overrides,
  };
}

// A data directory with our real side and the given pages.
function makeDataDir(pages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-'));
  fs.copyFileSync(US_FILE, path.join(dir, 'postgresai.json'));
  fs.mkdirSync(path.join(dir, 'pages'));
  for (const page of pages) {
    fs.writeFileSync(path.join(dir, 'pages', `${page.slug}.json`), JSON.stringify(page, null, 2));
  }
  return dir;
}

module.exports = {readUs, makePage, makeDataDir};
