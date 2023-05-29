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
    "Database Lab Engine": [
      "database-lab/index",
      "database-lab/masking",
      "database-lab/timing-estimator",
      "database-lab/supported-databases",
      "database-lab/user-interface",
      "database-lab/telemetry",
    ],
    "DB Migration Checker": [
      "db-migration-checker/index",
    ],
    "Joe Bot": [
      "joe-bot/index",
      "joe-bot/example",
    ],
    "Database Lab Platform (SaaS)": [
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
          "how-to-guides/administration/postgresql-configuration",
          "how-to-guides/administration/engine-manage",
          "how-to-guides/administration/joe-manage",
          "how-to-guides/administration/engine-secure",
          "how-to-guides/administration/machine-setup",
          "how-to-guides/administration/logical-full-refresh",
          "how-to-guides/administration/ci-observer-postgres-log-masking",
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
        ],
      },
      {
        "SQL Optimization Chatbot (Joe Bot)": [
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
        ],
      },
    ],
    "Reference guides": [
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
