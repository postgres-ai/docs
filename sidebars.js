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

    "DBLab how-tos": [
      "dblab-howtos/index",
      {
        "Administration": [
          "dblab-howtos/administration/index",
          "dblab-howtos/administration/install-dle-from-postgres-ai",
          "dblab-howtos/administration/install-dle-from-aws-marketplace",
          "dblab-howtos/administration/install-dle-manually",
          "dblab-howtos/administration/run-database-lab-on-mac",
          "dblab-howtos/administration/postgresql-configuration",
          "dblab-howtos/administration/engine-manage",
          "dblab-howtos/administration/joe-manage",
          "dblab-howtos/administration/engine-secure",
          "dblab-howtos/administration/logical-full-refresh",
          "dblab-howtos/administration/ci-observer-postgres-log-masking",
          "dblab-howtos/administration/add-disk-space-to-zfs-pool",
          {
            "Data sources": [
              "dblab-howtos/administration/data/index",
              "dblab-howtos/administration/data/rds",
              "dblab-howtos/administration/data/dump",
              "dblab-howtos/administration/data/wal-g",
              "dblab-howtos/administration/data/pgbackrest",
              "dblab-howtos/administration/data/pg_basebackup",
              "dblab-howtos/administration/data/custom",
            ],
          },
        ],
      },
      {
        "CLI": [
          "dblab-howtos/cli/index",
          "dblab-howtos/cli/cli-install-init",
        ],
      },
      {
        "Cloning": [
          "dblab-howtos/cloning/index",
          "dblab-howtos/cloning/create-clone",
          "dblab-howtos/cloning/connect-clone",
          "dblab-howtos/cloning/reset-clone",
          "dblab-howtos/cloning/destroy-clone",
          "dblab-howtos/cloning/clone-protection",
          "dblab-howtos/cloning/clone-upgrade",
        ],
      },
      {
        "Branching": [
          "dblab-howtos/branching/index",
          "dblab-howtos/branching/create-branch",
          "dblab-howtos/branching/delete-branch",
        ],
      },
      {
        "Snapshots": [
          "dblab-howtos/snapshots/index",
          "dblab-howtos/snapshots/create-snapshot",
          "dblab-howtos/snapshots/delete-snapshot",
        ],
      },
      {
        "SQL optimization chatbot (Joe bot)": [
          "dblab-howtos/joe-bot/index",
          "dblab-howtos/joe-bot/get-query-plan",
          "dblab-howtos/joe-bot/create-index",
          "dblab-howtos/joe-bot/reset-session",
          "dblab-howtos/joe-bot/query-activity-and-termination",
          "dblab-howtos/joe-bot/visualize-query-plan",
          "dblab-howtos/joe-bot/sql-optimization-history",
          "dblab-howtos/joe-bot/count-rows",
          "dblab-howtos/joe-bot/get-database-table-index-size",
        ],
      },
      {
        "Platform": [
          "dblab-howtos/platform/index",
          "dblab-howtos/platform/start-using-platform",
          "dblab-howtos/platform/tokens",
          "dblab-howtos/platform/onboarding",
          "dblab-howtos/platform/audit-logs",
        ],
      },
    ],
    // "PostgreSQL how-tos": [
    //   "postgres-howtos/index",
    // ],
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
