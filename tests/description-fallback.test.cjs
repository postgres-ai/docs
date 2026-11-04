const assert = require('node:assert/strict');
const {test} = require('node:test');
const {descriptionFromContent, MAX_LENGTH} = require('../plugins/description-fallback');

test('joins a hard-wrapped paragraph into one sentence', () => {
  const md = '# Title\n\nSecurity model and hardening options for the self-hosted monitoring stack. Several of these\nare on by default.\n';
  assert.equal(
    descriptionFromContent(md),
    'Security model and hardening options for the self-hosted monitoring stack. Several of these are on by default.',
  );
});

test('skips headings, imports, code, admonitions and lists', () => {
  const md = [
    "import Tabs from '@theme/Tabs';",
    '',
    '## Overview',
    '',
    ':::note',
    '',
    '- a list item',
    '',
    '```bash',
    'echo not prose',
    '```',
    '',
    'The **real** first paragraph with a [link](/docs/x) and `code`.',
  ].join('\n');
  assert.equal(descriptionFromContent(md), 'The real first paragraph with a link and code.');
});

test('keeps whole sentences within the limit', () => {
  const s1 = 'First sentence is here.';
  const s2 = 'Second one '.padEnd(120, 'x') + '.';
  const s3 = 'Third sentence pushes past the limit.';
  const out = descriptionFromContent(`${s1} ${s2} ${s3}`);
  assert.equal(out, `${s1} ${s2}`);
  assert.ok(out.length <= MAX_LENGTH);
});

test('a single overlong sentence is cut at a word with an ellipsis', () => {
  const out = descriptionFromContent('word '.repeat(60).trim() + '.');
  assert.ok(out.length <= MAX_LENGTH);
  assert.ok(out.endsWith('word…'));
});

test('domain names and versions do not end a sentence', () => {
  const md = 'Install from postgres.ai and run version 0.15 today. ' + 'More text '.repeat(20);
  assert.equal(descriptionFromContent(md), 'Install from postgres.ai and run version 0.15 today.');
});

test('returns undefined when there is no prose', () => {
  assert.equal(descriptionFromContent('# Only a title\n\n```\ncode\n```\n'), undefined);
});

test('a too-short first paragraph gives way to the next one', () => {
  const md = '## Name\nUser-defined.\n\n## Responsibility\nManages all other containers and handles data retrieval.\n';
  assert.equal(descriptionFromContent(md), 'Manages all other containers and handles data retrieval.');
});

test('a short leading sentence is not used alone', () => {
  const md = 'New in 0.15. ' + 'Self-hosted instances include an optional reporter '.repeat(5);
  const out = descriptionFromContent(md);
  assert.ok(out.startsWith('New in 0.15. Self-hosted'));
  assert.ok(out.endsWith('…') && out.length <= MAX_LENGTH);
});

test('skips "//" boilerplate lines', () => {
  const md = '// I post a new PostgreSQL "howto" article every day.\n\nThe actual topic of this how-to is explained here.\n';
  assert.equal(descriptionFromContent(md), 'The actual topic of this how-to is explained here.');
});
