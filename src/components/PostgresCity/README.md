# PostgresCity

An animated, simplified PostgreSQL cluster for the front page. Plain canvas 2D
and TypeScript — no runtime dependency, no WebGL, no network.

## What it is

The scene is a projection of a real city plan, not a fresh drawing. Positions,
district ordering and the semantic palette come from
[PGSimCity](https://github.com/NikolayS/PGSimCity), which is the same cluster in
three dimensions. Behind it runs a small deterministic model of PostgreSQL, and
everything that moves is a consequence of that model's state:

- Statements travel a connection's own duct to its own backend process. The
  postmaster forks a backend **per connection**, not per statement.
- A read that misses in the buffer pool goes to storage; the clock sweep picks
  the victim frame, and a dirty victim is written out first.
- A write dirties a page in shared memory and produces a WAL record. The commit
  waits for that record to reach durable storage — and the data page is still
  dirty in memory when the commit returns.
- Dirty pages reach the data directory later: at a checkpoint, through the
  background writer, or because another backend needed the frame.
- Replication ships the log. No data page crosses the wire.

The rates are scaled so a person can watch them; the counts are reduced. Both
are disclosed in the caption under the figure, which is load-bearing content
and must not be dropped at any breakpoint.

## Files

| File | Role |
|---|---|
| `plan.ts` | Geography, structures and routes, in PGSimCity's coordinates |
| `sim.ts` | The model. Seeded, fixed-timestep, allocation-free after construction |
| `render.ts` | Canvas painter. All screen-space geometry precomputed once |
| `palette.ts` | The two semantic palettes, light and dark |
| `index.tsx` | React wrapper: sizing, theme, motion, visibility, keyboard |

## Tests

```shell
bun test src/components
```

The tests assert the claims the drawing makes — that no structure floats over
the excavation, that storage renders below memory, that each backend has its
own connection duct, that `usage_count` caps at 5, that pages stay dirty across
a commit, and that WAL volume climbs after a checkpoint re-arms full-page
writes. They assert durable properties, not this calibration's numbers: if a
change makes the model more correct and a test goes red, the assertion is what
was wrong.

## Attribution

Derived from PGSimCity, copyright 2026 Nikolay Samokhvalov, licensed under
Apache-2.0. PGSimCity is an independent, non-commercial educational
visualization and is not affiliated with, sponsored by, or endorsed by the
PostgreSQL project, the PostgreSQL Global Development Group, or the PostgreSQL
Community Association of Canada. PostgreSQL is a trademark of the PostgreSQL
Community Association of Canada.
