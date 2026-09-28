const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {Prism} = require('prism-react-renderer');

// Exercise the theme wrapper without Docusaurus's webpack-only theme alias.
const source = fs.readFileSync(path.join(__dirname, '../src/theme/prism-include-languages.js'), 'utf8')
  .replace(/^import .*;\n/m, '')
  .replace('export default ', '');
new Function('includeLanguages', 'Prism', `${source}\nprismIncludeLanguages(Prism);`)(() => {}, Prism);

for (const prompt of ['nik=#', 'postgres=>', 'my-db=*#', 'nik-#', 'postgres=!>']) {
  test(`SQL after ${prompt} is not a comment`, () => {
    const tokens = Prism.tokenize(`${prompt} select 1; -- real comment`, Prism.languages.sql);
    assert.equal(tokens[0].type, 'psql-prompt');
    assert(tokens.some(t => t.type === 'keyword' && t.content === 'select'));
    assert(tokens.some(t => t.type === 'comment' && t.content.includes('-- real comment')));
  });
}
for (const [sql, type] of [
  ["select '#literal';", 'string'],
  ['-- real SQL comment', 'comment'],
  ['/* block comment */', 'comment'],
  ['# MySQL comment', 'comment'],
]) {
  test(`preserves ${sql}`, () => {
    const tokens = Prism.tokenize(sql, Prism.languages.sql);
    assert(!tokens.some(t => t.type === 'psql-prompt'));
    assert(tokens.some(t => t.type === type));
  });
}

test('recognizes prompts on later lines of a transcript', () => {
  const tokens = Prism.tokenize('nik=# select 1;\n ?column?\n----------\n        1\n\nnik=# select 2;', Prism.languages.sql);
  assert.equal(tokens.filter(t => t.type === 'psql-prompt').length, 2);
  assert.equal(tokens.filter(t => t.type === 'keyword' && t.content === 'select').length, 2);
});

test('does not turn a prompt inside a quoted string into a prompt token', () => {
  const tokens = Prism.tokenize("select 'first line\nnik=# example';", Prism.languages.sql);
  assert(!tokens.some(t => t.type === 'psql-prompt'));
  assert(tokens.some(t => t.type === 'string'));
});
