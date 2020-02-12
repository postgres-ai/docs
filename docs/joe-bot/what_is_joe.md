---
title: What is Joe Bot
---

Joe is a Postgres Query Optimization.

Joe allows boosting the back-end development process by:

- providing developers access to experiment on automatically provisioned
production-size DB testing replica (works on top of [Database Lab](https://gitlab.com/postgres-ai/database-lab)).
- providing recommendations for query optimization and the ability to rollback.


## Detailed intro
- Sessions are independent. They provide own full-sized copy of the database.
- Feel free to change anything: build and drop indexes, change schema, etc.
- In any time, it's possible to re-initialize the database using by `reset`. This will cancel the ongoing queries in the current session. 
- Use `help` to see the full list of commands.
- Responses are marked with `Session: N`, where `N` is the session number (creates once on the session initialize).
- The session will be destroyed after specified amount of minutes of inactivity (configurable on the Database Lab). The corresponding DB clone will be deleted.
- EXPLAIN plans are expected to be identical to production plans.
- The actual timing values may differ from production because actual caches in the Database Lab are smaller. However, the number of bytes and pages/buffers in plans are identical to production.

## Community 
Bug reports, ideas, and merge requests are welcome: https://gitlab.com/postgres-ai/joe

To discuss Joe Bot, join our Slack:  https://database-lab-team-slack-invite.herokuapp.com/
