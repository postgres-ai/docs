module.exports = {
  baseSidebar: {
    "Overview": [
      "get-started",
      "questions-and-answers",
      "pricing",
      "roadmap",
    ],
    "Tutorials": [
      "tutorials/database-lab-tutorial",
      "tutorials/database-lab-tutorial-amazon-rds",
      "tutorials/joe-setup",
      "tutorials/onboarding",
    ],
    "Guides": [
      "guides/index",
      {
        "Administration": [
          "guides/administration/index",
          "guides/administration/postgresql-configuration",
          "guides/administration/engine-manage",
          "guides/administration/joe-manage",
          "guides/administration/engine-secure",
          "guides/administration/machine-setup",
          "guides/administration/logical-full-refresh",
          "guides/administration/ci-observer-postgres-log-masking",
        ],
      },
      {
        "Cloning": [
          "guides/cloning/index",
          "guides/cloning/create-clone",
          "guides/cloning/connect-clone",
          "guides/cloning/reset-clone",
          "guides/cloning/destroy-clone",
          "guides/cloning/clone-protection",
        ],
      },
      {
        "Joe bot": [
          "guides/joe-bot/index",
          "guides/joe-bot/get-query-plan",
          "guides/joe-bot/create-index",
          "guides/joe-bot/reset-session",
          "guides/joe-bot/query-activity-and-termination",
          "guides/joe-bot/visualize-query-plan",
          "guides/joe-bot/sql-optimization-history",
          "guides/joe-bot/count-rows",
          "guides/joe-bot/get-database-table-index-size",
        ],
      },
      {
        "CLI": [
          "guides/cli/index",
          "guides/cli/cli-install-init",
        ],
      },
      {
        "Data sources": [
          "guides/data/index",
          "guides/data/rds",
          "guides/data/dump",
          "guides/data/pg_basebackup",
          "guides/data/wal-g",
          "guides/data/custom",
        ],
      },
      {
        "Platform": [
          "guides/platform/index",
          "guides/platform/start-using-platform",
          "guides/platform/tokens",
        ],
      },
    ],
    "Database Lab Platform": [
      "platform/index",
      "platform/security",
    ],
    "Database Lab Engine": [
      "database-lab/index",
      "database-lab/masking",
      "database-lab/timing-estimator",
      "database-lab/supported-databases",
      {
        "Reference": [
          "database-lab/api-reference",
          "database-lab/cli-reference",
          "database-lab/components",
          "database-lab/config-reference",
        ],
      },
    ],
    "Staging with superpowers": [
      "staging/index",
    ],
    "Joe Bot": [
      "joe-bot/index",
      "joe-bot/example",
      {
        "Reference": [
          "joe-bot/config-reference",
          "joe-bot/commands-reference",
        ],
      },
    ],
    "Other": [
      "checkup/index",
      "database-changes-cicd/index",
      "data-recovery/index",
      "data-access/index",
    ]
  },
};
