# Claude Code Instructions

Read and follow all rules in `.cursor/rules/` directory.

@.cursor/rules

## Repository mirroring: GitLab ↔ GitHub

This repo lives in **two** places and they are mirrored in opposite
directions depending on the branch:

- **`master` / `main`** is mirrored **GitLab → GitHub**.
  GitLab is the source of truth for the main branch; GitHub gets the
  read-only copy.

- **Development branches** (everything except `master` / `main`) are
  mirrored **GitHub → GitLab** by `.github/workflows/mirror-to-gitlab.yml`
  on every push.

The intent is: developers (including Claude Code's GitHub integration)
can start work on a development branch on GitHub; the branch is
auto-pushed to GitLab; the rest of the workflow — code review,
preview-environment CI, and the merge into `master` — happens on
GitLab. After the GitLab merge, the updated `master` flows back to
GitHub via the GitLab → GitHub mirror.

Practical implications when using Claude Code here:

- Push development branches to **GitHub** (`origin`). The mirror workflow
  handles GitLab; do not push directly to GitLab from this clone.
- Open PRs on GitHub for visibility, but the **merge** happens on
  GitLab (a corresponding MR is opened on the GitLab side).
- Do **not** push to `master` from any branch — `master` only updates
  via the GitLab → GitHub mirror after a GitLab MR is merged.
- Preview environments (`https://<branch-slug>.preview-docs.postgres.ai`)
  are provisioned by GitLab CI on every push to a non-`master` branch.
  See `.gitlab-ci.yml` (`build_and_push_review` / `deploy_review` /
  `stop_review`).
