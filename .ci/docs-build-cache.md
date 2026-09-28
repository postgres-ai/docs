# Docs image build caching

All image jobs use BuildKit and export inline cache metadata. `--cache-from`
imports that metadata directly from the registry; an explicit `docker pull`
would download and unpack the entire previous image before cache selection,
including obsolete generated pages. Missing cache tags permit a cold build.

Review builds import both the existing branch image and the shared review cache.
This keeps a branch's reusable layers available when a different MR overwrites
the shared tag. Neither cache is trusted as a finished site: BuildKit checks
source inputs and build arguments, including the environment URL, normally.

Keep image publication tags and deployment behavior unchanged. Do not remove
pages, plugins, search, redirects, feeds, or validation checks for speed. Cache
changes should not require changing the Docusaurus build or runtime server.

When benchmarking, distinguish an unchanged-image cache hit from a content
edit that actually runs the site compiler, and report build-and-push separately
from deployment time. Inspect the trace for cache hits and compilation steps.

Docker 27 review and main-staging jobs publish all existing tags directly with
`docker buildx build --push`. Production retains its Docker 20 build/push path.

The image build runs the existing xmllint/jq checks on generated RSS, Atom and
JSON feeds before it can publish. This replaces the standalone branch-only,
allow-failure feed job, not its checks. MR images now receive the same checks,
and invalid or missing feeds fail the build. For local validation, the script
still builds by default; `--skip-build` validates existing `build/` files.

To verify the validation gate, test valid generated feeds, malformed RSS/Atom XML,
malformed JSON, and a missing feed. The latter cases must return a nonzero exit
status; run these checks on temporary copies, never alter published output.
When timing this path, report the first validator-tools installation separately
from subsequent builds with that layer cached. Change a tracked build-context
file to force compilation; retrying an identical commit only measures a cache hit.
