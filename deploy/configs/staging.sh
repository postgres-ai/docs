# DEPRECATED — old v2 staging environment (k8s ns `staging`,
# served at v2.postgres.ai docs path) is being sunset.
# CI jobs that source this file (build_and_push_staging, deploy_staging)
# are gated off in .gitlab-ci.yml.
# REPLICAS=0 is defensive: any accidental deploy scales the workload to
# zero instead of bringing the env back up.
#
# New staging is preview-based, deployed from `master`:
#   - Static docs site: https://docs-main.pgai.green
#     (jobs: build_and_push_main_staging, deploy_main_staging)
#
# Tracking: https://gitlab.com/postgres-ai/infra/-/work_items/50

export REPLICAS=0
export URL="https://v2.postgres.ai"
export BASE_URL="/"
export SIGN_IN_URL="https://console-v2.postgres.ai/signin"
export BOT_WS_URL="wss://v2.postgres.ai/ai-bot-ws/"
export API_URL_PREFIX="https://v2.postgres.ai/api/general"
# Umami analytics
export UMAMI_WEBSITE_ID="8a51b37c-420b-4777-8bab-63491be1a4ac"
export UMAMI_SCRIPT_URL="https://analytics-v2.postgres.ai/script.js"