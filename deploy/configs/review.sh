export REPLICAS=1

# Per-branch preview environment.
# DOCS_NAME / CI_COMMIT_REF_SLUG come from .gitlab-ci.yml's &env_review.
# The cluster's existing Cloudflare + ingress route docs-<slug>.pgai.green
# to the Service named ${DOCS_NAME} in the `review` namespace.
export URL="https://${DOCS_NAME}.pgai.green"
export BASE_URL="/"

# Previews share the staging API / auth / bot backends — only the docs
# frontend is built per branch.
export SIGN_IN_URL="https://console-v2.postgres.ai/signin"
export BOT_WS_URL="wss://v2.postgres.ai/ai-bot-ws/"
export API_URL_PREFIX="https://v2.postgres.ai/api/general"

# No analytics on preview environments.
export UMAMI_WEBSITE_ID=""
export UMAMI_SCRIPT_URL=""
