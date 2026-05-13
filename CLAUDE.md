# Claude Code Instructions

Read and follow all rules in `.cursor/rules/` directory.

@.cursor/rules

## GitLab is the source of truth; GitHub is a mirror

- `master` flows **GitLab → GitHub** — GitLab is authoritative; never push `master` to GitHub.
- Dev branches flow **GitHub → GitLab** — branches created/pushed via the GitHub Claude Code integration mirror into GitLab, where MRs are opened, reviewed, and merged.
- Use `glab` for repo operations (not `gh`). PRs live in GitLab as MRs.
- If a branch was started from a stale GitHub mirror of `master`, its `.gitlab-ci.yml` may be out of date (e.g., still deploying previews via the old k8s path). Rebase onto current `master` before debugging CI.

## Preview environments

- Per-MR previews deploy automatically on `merge_request_event` to `https://docs-{CI_COMMIT_REF_SLUG}.pgai.green`.
- Infra: Hetzner VM (`PREVIEW_VM_HOST`) running Docker + Traefik with Let's Encrypt DNS-01 via Cloudflare. **Not Kubernetes.**
- Permanent staging from `master`: `https://docs-main.pgai.green`.
- Canonical spec: `postgres-ai/infra` → `green/SPEC.md` (MR !12). Original CI: docs MR !880.
