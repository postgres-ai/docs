# Comparison pages

Each file in `pages/` becomes one page under `/compare/`, a markdown twin under
`/raw/compare/`, a row in the matrix on `/compare`, and a line in `/llms.txt`.

- `postgresai.json` holds what we say about our own products, once. It also
  defines the kinds of comparison, the questions (rows) each kind answers, the
  reasons to pick our product that a page may use (`proofs`), and the groups
  shown on `/compare`.
- `pages/<slug>.json` holds what we say about one other product, with a source
  for every row.

`node plugins/compare-pages/load.js` checks everything; pass file paths to check
single pages. The same check runs in `bun test tests/` and at build time, so a
page that breaks a rule cannot ship.

## Claims policy

These pages make statements about other companies' products. They are only
worth publishing if a reader, or the other vendor, can check every statement.

1. **Primary sources only.** A statement about the other product comes from its
   own documentation, pricing page, changelog, release notes, blog or source
   repository. Not from review sites, comparison articles, forum posts or
   memory. Open the page on the day you write the row and cite it.
2. **Every row cites a source.** `sources` lists the pages; rows, prices and
   answers point to them by number. A source nobody cites is removed.
3. **No claims of absence.** "We did not find it" is not "they do not have it".
   If the reviewed sources do not show a capability, write `Not documented in
   the sources we reviewed.` and use the verdict `nd`. Use `no` only when the
   vendor's own documentation says the product does not do it, and cite that
   page.
4. **Mark previews.** A feature the vendor calls preview, beta, early access or
   experimental is written as such, with the verdict `preview`.
5. **Say where they are better.** `chooseThem` lists real reasons to pick the
   other product for PostgreSQL. A page with a weak `chooseThem` reads as an
   advertisement and will be rejected in review.
6. **Our side is fixed.** Do not describe PostgresAI or DBLab capabilities in a
   page beyond what `postgresai.json` already says in its rows, its `proofs`,
   its `limits` and its `facts` list. If a page needs a claim that is not
   there, add it to `facts` with a link to our docs, in its own review. Never
   mention features that are not released. Do not name the parts our products
   are built from (the collector, the metrics store): they change between
   versions. Say what the product does.
7. **Facts, not adjectives.** No "best", "leading", "seamless", "powerful",
   "robust", "simple", "easy". No "just dashboards". State what the product
   does, the number, the limit, the price.
8. **Prices are list prices.** Give the price, the unit and what it includes, as
   the pricing page states them. Different products bill by host, server, core,
   user or usage; do not convert between units or call one cheaper.
9. **Names as the vendor writes them.** PostgreSQL in formal text, Postgres is
   fine in running text. Current product names; note a former name once if
   people still search for it.
10. **Nothing internal.** No private repository links, no customer details, no
    roadmap, no numbers that are not on our public site.
11. **Dated.** `checkedOn` is the day the sources were read. Re-read them before
    changing the date.
12. **PostgreSQL only.** These pages compare what each product does for
    PostgreSQL. No lists of other database engines, and no "covers your whole
    stack" as a reason to choose a product. If the product is part of a wider
    platform, one clause says so; the rest is about Postgres. A capability
    that is about Postgres stays even when it connects to other data, such as
    linking a slow query to the application trace that ran it.
13. **A reason to pick us is evidence on both sides.** A `proofs` entry takes
    our half from `postgresai.json` (a fact with a link to our docs) and adds
    what the other vendor's own documentation says on the same point, with a
    source. Pick only points where their documentation shows a real
    difference: they say they do not do it, do less with a stated limit,
    charge extra, have it in preview, or tie it to one platform. If they
    document the same or more, it is not a proof. Their half starts with what
    the product does on that point; "the sources we reviewed do not describe"
    may follow, never lead, and a proof that has nothing else is not a proof.

## Verdicts

Rows marked `matrix` in `postgresai.json` also carry a one-word answer, `v`:

| `v` | Shown as | Use when |
|---|---|---|
| `yes` | Yes | Documented and generally available |
| `partial` | Partly | Documented, with a stated limit that matters for this question |
| `preview` | Preview | Documented as preview, beta or early access |
| `no` | No | The vendor's documentation says it is not offered |
| `nd` | Not documented | Not found in the sources reviewed |
| `na` | Does not apply | The question makes no sense for this kind of product |

Three cases come up often enough to fix the answer:

- **A feature built into a managed cloud service** (Query Store in Azure, Aurora
  cloning): "self-hosted" is `no` only with a vendor sentence that says the
  vendor runs the service, quoted in the row; otherwise `na`. "Open source" is
  `na`, with one sentence that says which service the feature is part of.
- **CI integration** (branching pages): `yes` when the vendor documents a CI
  integration or a pipeline workflow (an action, an app, a plugin, a guide);
  `partial` when only a CLI or API that a pipeline could call is documented;
  `nd` when neither is. Whether a migration is tested for locks belongs in
  the text and in the `ci` proof, not in the one-word answer.
- **The matrix is not a scorecard.** We chose its columns, and the note under
  it says so. A row may set `matrixOrder` to move its column.

## Page file

```json
{
  "slug": "postgresai-vs-example",
  "kind": "monitoring",
  "competitor": {
    "name": "Example",
    "vendor": "Example, Inc.",
    "url": "https://example.com/",
    "category": "PostgreSQL monitoring",
    "group": "postgres-tools",
    "status": "active"
  },
  "checkedOn": "2026-11-17",
  "title": "PostgresAI vs Example: the honest contrast in a few words",
  "description": "One or two sentences, 90 to 170 characters, naming what each product is and the main difference. Used as the meta description and in llms.txt.",
  "summary": "Two to four sentences, 200 to 750 characters. The short answer a reader came for: what each one is, where they differ, who should pick which.",
  "proofs": [
    { "key": "open", "them": "What their documentation says on the same point, 20 to 320 characters.", "sources": [3] },
    { "key": "test", "them": "…", "sources": [5] },
    { "key": "experts", "them": "…", "sources": [4] }
  ],
  "chooseThem": ["Two to five reasons to pick the other product for PostgreSQL.", "…"],
  "rows": [
    { "key": "scope", "them": "What the other product is, in their terms.", "sources": [1] },
    { "key": "platforms", "v": "yes", "them": "…", "sources": [2, 3] }
  ],
  "pricing": [{ "plan": "Pro", "price": "$100 per server/month", "notes": "What it includes", "sources": [4] }],
  "pricingNote": "Optional sentence, for example that usage charges come on top.",
  "together": "Optional paragraph: how the two are used together, if they are.",
  "disclosure": "Optional sentence: a relationship with the other vendor that a reader should know about.",
  "faq": [{ "q": "A question people search for?", "a": "A direct answer, 40 to 700 characters.", "sources": [1] }],
  "sources": [
    { "title": "Example documentation: overview", "url": "https://example.com/docs" },
    { "title": "Example pricing", "url": "https://example.com/pricing" }
  ]
}
```

Rules the check enforces:

- `slug` equals the file name and starts with the prefix of its `kind`.
- `title` starts with `<product> vs ` and is 30 to 75 characters. The page
  shows the two names as its heading and the part after the colon as the line
  under it, so that part names the difference in a few words.
- `rows` has exactly the keys defined for the kind in `postgresai.json`, each
  with `them` (10 to 460 characters) and at least one source number. Rows marked
  `matrix` need `v`; other rows must not have it.
- `proofs` has 3 or 4 entries. Each `key` is one of the keys under `proofs`
  for the kind in `postgresai.json`, used once; `them` is 20 to 320 characters,
  cites at least one source and does not open with what we could not find.
- `chooseThem` has 2 to 5 items of 20 to 240 characters.
- `faq` has 3 to 6 questions; each `q` ends with a question mark.
- `sources` has 4 to 40 entries with unique `https` URLs, all of them cited.
- `competitor.status` is `active`, `discontinued` or `acquired`; anything but
  `active` needs `statusNote` and `statusSources`.
- `disclosure`, when present, is 30 to 300 characters. Use it when we have a
  relationship with the other vendor: a partnership, a shared project, or a
  product of ours that is built on theirs.
- No opinion wording (see `BANNED` in `plugins/compare-pages/load.js`), no
  other database engines or "full-stack" talk (see `OUT_OF_SCOPE` there; a
  plan name in the pricing table is exempt), and no links to private
  repositories.

## Adding a page

1. Read the other vendor's documentation and pricing page. Keep the URLs.
2. Copy an existing page of the same `kind`, fill it in, run the check.
3. In the merge request, say which sources you read and on which day.
