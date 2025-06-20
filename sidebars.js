module.exports = {
  baseSidebar: {
    "Overview": [
      "get-started",
      "questions-and-answers",
      "roadmap",
    ],
    "Tutorials": [
      "tutorials/database-lab-tutorial",
      "tutorials/database-lab-tutorial-amazon-rds",
      "tutorials/joe-setup",
    ],
    "DBLab Engine": [
      "database-lab/index",
      "database-lab/supported-databases",
      "database-lab/user-interface",
      "database-lab/masking",
      "database-lab/db-migration-checker",
      "database-lab/telemetry",
    ],
    "Joe bot": [
      "joe-bot/index",
      "joe-bot/example",
    ],
    "DBLab Platform (SaaS)": [
      "platform/index",
      "platform/security",
    ],
    "Other": [
      "checkup/index",
      "data-recovery/index",
      "data-access/index",
    ],
    "How-to guides": [
      "how-to-guides/index",
      {
        "Administration": [
          "how-to-guides/administration/index",
          "how-to-guides/administration/install-dle-from-postgres-ai",
          "how-to-guides/administration/install-dle-from-aws-marketplace",
          "how-to-guides/administration/install-dle-manually",
          "how-to-guides/administration/run-database-lab-on-mac",
          "how-to-guides/administration/postgresql-configuration",
          "how-to-guides/administration/engine-manage",
          "how-to-guides/administration/joe-manage",
          "how-to-guides/administration/engine-secure",
          "how-to-guides/administration/logical-full-refresh",
          "how-to-guides/administration/ci-observer-postgres-log-masking",
          "how-to-guides/administration/add-disk-space-to-zfs-pool",
          {
            "Data sources": [
              "how-to-guides/administration/data/index",
              "how-to-guides/administration/data/rds",
              "how-to-guides/administration/data/dump",
              "how-to-guides/administration/data/wal-g",
              "how-to-guides/administration/data/pgbackrest",
              "how-to-guides/administration/data/pg_basebackup",
              "how-to-guides/administration/data/custom",
            ],
          },
        ],
      },
      {
        "CLI": [
          "how-to-guides/cli/index",
          "how-to-guides/cli/cli-install-init",
        ],
      },
      {
        "Cloning": [
          "how-to-guides/cloning/index",
          "how-to-guides/cloning/create-clone",
          "how-to-guides/cloning/connect-clone",
          "how-to-guides/cloning/reset-clone",
          "how-to-guides/cloning/destroy-clone",
          "how-to-guides/cloning/clone-protection",
          "how-to-guides/cloning/clone-upgrade",
        ],
      },
      {
        "Branching": [
          "how-to-guides/branching/index",
          "how-to-guides/branching/create-branch",
          "how-to-guides/branching/delete-branch",
        ],
      },
      {
        "Snapshots": [
          "how-to-guides/snapshots/index",
          "how-to-guides/snapshots/create-snapshot",
          "how-to-guides/snapshots/delete-snapshot",
        ],
      },
      {
        "SQL optimization chatbot (Joe bot)": [
          "how-to-guides/joe-bot/index",
          "how-to-guides/joe-bot/get-query-plan",
          "how-to-guides/joe-bot/create-index",
          "how-to-guides/joe-bot/reset-session",
          "how-to-guides/joe-bot/query-activity-and-termination",
          "how-to-guides/joe-bot/visualize-query-plan",
          "how-to-guides/joe-bot/sql-optimization-history",
          "how-to-guides/joe-bot/count-rows",
          "how-to-guides/joe-bot/get-database-table-index-size",
        ],
      },
      {
        "Platform": [
          "how-to-guides/platform/index",
          "how-to-guides/platform/start-using-platform",
          "how-to-guides/platform/tokens",
          "how-to-guides/platform/onboarding",
          "how-to-guides/platform/audit-logs",
        ],
      },
    ],
    "Reference guides": [
      "reference-guides/index",
      "reference-guides/postgres-ai-bot-reference",
      "reference-guides/database-lab-engine-components",
      "reference-guides/database-lab-engine-api-reference",
      "reference-guides/dblab-client-cli-reference",
      "reference-guides/database-lab-engine-configuration-reference",
      "reference-guides/db-migration-checker-configuration-reference",
      "reference-guides/joe-bot-configuration-reference",
      "reference-guides/joe-bot-commands-reference",
    ],
  },
};
