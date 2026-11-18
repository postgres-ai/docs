const assert = require('node:assert/strict');
const {test} = require('node:test');
const React = require('react');
const runtime = require('react/jsx-runtime');
const {renderToStaticMarkup} = require('react-dom/server');
const printLinkRefs = require('../plugins/print-link-refs');
const {absoluteUrl} = printLinkRefs;

const SITE = 'https://postgres.ai';

// Compile MDX the way Docusaurus does (@mdx-js/mdx + remark-gfm), render it
// to static HTML with React: no JavaScript runs in the page.
async function render(mdx, {frontMatter} = {}) {
  const {evaluate} = await import('@mdx-js/mdx');
  const {default: remarkGfm} = await import('remark-gfm');
  const setFrontMatter = () => (tree, file) => {
    if (frontMatter) file.data.frontMatter = frontMatter;
  };
  const {default: Content} = await evaluate(mdx, {
    ...runtime,
    remarkPlugins: [remarkGfm, setFrontMatter, [printLinkRefs, {siteUrl: SITE}]],
  });
  return renderToStaticMarkup(React.createElement(Content));
}

const markers = (html) => [...html.matchAll(/<sup class="pgai-print-ref">\[(\d+)\]<\/sup>/g)].map((m) => Number(m[1]));
const refs = (html) =>
  [...html.matchAll(/<li><span class="pgai-print-refs__num">\[(\d+)\]<\/span> <span class="pgai-print-refs__body">(?:<span class="pgai-print-refs__text">([^<]*)<\/span> )?<a class="pgai-print-refs__url" href="([^"]*)">/g)].map(
    (m) => ({n: Number(m[1]), text: m[2], url: m[3].replace(/&amp;/g, '&')}),
  );

test('numbers links in order of first appearance; the same URL reuses its number', async () => {
  const html = await render(
    [
      'See [Forge](/products/dblab-forge) and [the docs](https://www.postgresql.org/docs/current/).',
      '',
      'Again [Forge, other text](/products/dblab-forge), then [wiki](https://wiki.postgresql.org/).',
    ].join('\n'),
  );
  assert.deepEqual(markers(html), [1, 2, 1, 3]);
  assert.deepEqual(refs(html), [
    {n: 1, text: 'Forge', url: 'https://postgres.ai/products/dblab-forge'},
    {n: 2, text: 'the docs', url: 'https://www.postgresql.org/docs/current/'},
    {n: 3, text: 'wiki', url: 'https://wiki.postgresql.org/'},
  ]);
  // The marker follows the link, it is not inside it.
  assert.match(html, /<a href="\/products\/dblab-forge">Forge<\/a><sup class="pgai-print-ref">\[1\]<\/sup>/);
  // The list has its heading and comes last.
  assert.match(html, /<section class="pgai-print-refs"><h2 class="pgai-print-refs__title">Links<\/h2><ol class="pgai-print-refs__list">/);
  assert.ok(html.trimEnd().endsWith('</ol></section>'));
});

test('skips same-page anchors, code, images and links that wrap only an image', async () => {
  const html = await render(
    [
      '## Intro',
      '',
      'Jump to [step 1](#1-check-for-it), see `[x](https://code.example/)` and:',
      '',
      '```',
      '[not a link](https://block.example/)',
      '```',
      '',
      '![chart](/assets/x.svg)',
      '',
      '[![badge](/assets/b.svg)](https://badge.example/)',
      '',
      'Only [this one](https://real.example/a) counts.',
    ].join('\n'),
  );
  assert.deepEqual(markers(html), [1]);
  assert.deepEqual(refs(html), [{n: 1, text: 'this one', url: 'https://real.example/a'}]);
  assert.match(html, /badge\.example\/"><img[^>]*\/><\/a><\/p>/);
});

test('a link to this very post is same-page navigation', async () => {
  const html = await render('[here](/blog/my-post#fig-1) and [other](/blog/other-post#x).', {
    frontMatter: {slug: 'my-post'},
  });
  assert.deepEqual(refs(html), [{n: 1, text: 'other', url: 'https://postgres.ai/blog/other-post#x'}]);
});

test('footnote references and back-references are not numbered; links inside footnotes are', async () => {
  const html = await render(
    ['Claim[^1] with [a source](https://a.example/).', '', '[^1]: From [the thread](https://b.example/t).'].join('\n'),
  );
  assert.deepEqual(markers(html), [1, 2]);
  assert.deepEqual(
    refs(html).map((r) => r.url),
    ['https://a.example/', 'https://b.example/t'],
  );
  // GFM footnote ref and back-ref links get no marker.
  assert.doesNotMatch(html, /data-footnote-ref[^>]*>[^<]*<\/a><\/sup><sup class="pgai-print-ref"/);
  assert.doesNotMatch(html, /data-footnote-backref[^>]*>[^<]*<\/a><sup class="pgai-print-ref"/);
});

test('reference-style links, JSX <a href> and links inside JSX wrappers are numbered', async () => {
  const html = await render(
    [
      '<div className="pgai-longread">',
      '',
      'Read [the rule][rule] and <a href="https://jsx.example/">this</a>.',
      '',
      '**[Bold link](https://bold.example/)**',
      '',
      '</div>',
      '',
      '[rule]: https://wiki.postgresql.org/wiki/Don%27t_Do_This',
    ].join('\n'),
  );
  assert.deepEqual(markers(html), [1, 2, 3]);
  assert.deepEqual(refs(html), [
    {n: 1, text: 'the rule', url: 'https://wiki.postgresql.org/wiki/Don%27t_Do_This'},
    {n: 2, text: 'this', url: 'https://jsx.example/'},
    {n: 3, text: 'Bold link', url: 'https://bold.example/'},
  ]);
});

test('link text with inline code keeps the code text; a bare GFM autolink is not repeated as text', async () => {
  const html = await render('The [`inval.c`](https://github.com/postgres/postgres/blob/x/inval.c#L88) comment, https://bare.example/.');
  assert.deepEqual(refs(html), [
    {n: 1, text: 'inval.c', url: 'https://github.com/postgres/postgres/blob/x/inval.c#L88'},
    {n: 2, text: undefined, url: 'https://bare.example/'},
  ]);
});

test('a post without links gets no list', async () => {
  const html = await render('Just text, and [an anchor](#x).');
  assert.doesNotMatch(html, /pgai-print-ref/);
});

test('absoluteUrl resolves site paths to the canonical host', () => {
  const ctx = {siteUrl: SITE, basePath: '/blog/', selfPath: null};
  assert.equal(absoluteUrl('/products/monitoring', ctx), 'https://postgres.ai/products/monitoring');
  assert.equal(absoluteUrl('pathname:///assets/a.pdf', ctx), 'https://postgres.ai/assets/a.pdf');
  assert.equal(absoluteUrl('other-post', ctx), 'https://postgres.ai/blog/other-post');
  assert.equal(absoluteUrl('mailto:a@b.example', ctx), 'mailto:a@b.example');
  assert.equal(absoluteUrl('#x', ctx), null);
  assert.equal(absoluteUrl('javascript:void(0)', ctx), null);
  assert.equal(absoluteUrl('  ', ctx), null);
});
