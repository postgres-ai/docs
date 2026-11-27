# Pin Bun to a patch release. The floating 1.3 tag moved under us and forced
# fresh dependency installs in CI.
FROM oven/bun:1.3.13-debian@sha256:e95356cb8e1de62ad69ab3bd3584ba947013d27650a226804d2fc0af4e17dac2

# Install only libvips runtime (not -dev) so sharp uses prebuilt binaries
# This is much faster than compiling from source (~2 min saved)
RUN apt-get update && apt-get install -y --no-install-recommends libvips42 && rm -rf /var/lib/apt/lists/*

# Install dependencies before environment-specific arguments so MR URLs do not
# invalidate the dependency layer shared by preview builds.
WORKDIR /docs

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Validate generated feeds with the same tools as the former standalone CI job.
# Keep this after dependency installation to preserve its existing cache layer.
RUN apt-get update && apt-get install -y --no-install-recommends libxml2-utils jq && rm -rf /var/lib/apt/lists/*

ARG ARG_REACT_APP_API_SERVER
ENV REACT_APP_API_SERVER=$ARG_REACT_APP_API_SERVER

ARG ARG_URL
ENV URL=$ARG_URL

ARG ARG_BASE_URL
ENV BASE_URL=$ARG_BASE_URL

ARG ARG_SIGN_IN_URL
ENV SIGN_IN_URL=$ARG_SIGN_IN_URL

ARG ARG_BOT_WS_URL
ENV BOT_WS_URL=$ARG_BOT_WS_URL

ARG ARG_API_URL_PREFIX
ENV API_URL_PREFIX=$ARG_API_URL_PREFIX

ARG ARG_UMAMI_WEBSITE_ID
ENV UMAMI_WEBSITE_ID=$ARG_UMAMI_WEBSITE_ID

ARG ARG_UMAMI_SCRIPT_URL
ENV UMAMI_SCRIPT_URL=$ARG_UMAMI_SCRIPT_URL

COPY . .
# Compilation caches help local rebuilds, but are not read by the runtime or
# restored into subsequent Docker builds. Do not ship them to the registry/VM.
# Bound build parallelism inside the image, not just in the outer CI job.
# Native compiler pools otherwise size themselves from the runner's CPU count,
# which can exceed the memory available to this Docker-in-Docker build.
# Keep these limits build-only; the runtime server does not need them.
RUN RAYON_NUM_THREADS=2 TOKIO_WORKER_THREADS=2 \
    DOCUSAURUS_GIT_COMMAND_CONCURRENCY=4 DOCUSAURUS_SSR_CONCURRENCY=4 \
    bun run build && bash .ci/validate-feeds.sh --skip-build && rm -rf node_modules/.cache

EXPOSE 3000
CMD ["bun", "run", "serve"]
