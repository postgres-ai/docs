# Principles
This repository contains both PostgresAI website (excluding the Console/Platform part) and PostgresAI Documentation.

## Documentation – principles

We're building documentation following the principles described at https://documentation.divio.com/:

> There is a secret that needs to be understood in order to write good software documentation: there isn’t one thing called documentation, there are four.
>
> They are: tutorials, how-to guides, technical reference and explanation. They represent four different purposes or functions, and require four different approaches to their creation. Understanding the implications of this will help improve most documentation - often immensely.

Learn more: https://documentation.divio.com/

## Engine

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

### Installation

```shell
bun install
```

### Local Development

```shell
bun start
```

This command starts a local development server and opens a browser window. Most changes are reflected live without having to restart the server.

### Preview environments

Every merge request automatically gets a live preview deployment:

- **Preview URL**: `https://docs-{branch-slug}.pgai.green` (find it via the "View app" button on the MR page)
- **Permanent staging**: `https://docs-main.pgai.green` (updated on every push to `master`)
- **Auto-cleanup**: Preview environments stop automatically after 1 week, or can be stopped manually via the CI job
- **Access**: Public (open-source repo)
