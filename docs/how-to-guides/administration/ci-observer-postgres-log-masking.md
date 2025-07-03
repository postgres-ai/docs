---
title: Masking sensitive data in PostgreSQL logs when using CI Observer
sidebar_label: Masking sensitive data (CI Observer)
description: Learn how to configure CI Observer to mask sensitive data in PostgreSQL logs before saving them in Platform's centralized storage
keywords:
  - "PII, GDPR, sensitive data"
  - "Masking sensitive data in PostgreSQL logs"
  - "database log masking"
  - "Database Lab CI Observer"
  - "automated testing of database migrations"
  - "automated testing of schema changes"
---

## Configure masking for PostgreSQL log
When Database Lab's CI Observer is used for automated testing of database migrations, it stores PostgreSQL log in DBLab Platform's centralized storage. You can optionally configure masking rules for sensitive data in the PostgreSQL log. Such rules will be continuously applied before sending any PostgreSQL log entries to the Platform's storage.

You can define masking rules in the form of regular expressions. To do it, open the DBLab Engine configuration file (usually, `~/.dblab/engine/configs/server.yml`; see config file examples [here](https://gitlab.com/postgres-ai/database-lab/-/tree/v4.0.0-rc.4/engine/configs)) and define subsection `replacementRules` in the section `replacementRules`. A basic example:
```yaml
observer:
  replacementRules:
    "(?:[0-9]{1,3}\\.){3}[0-9]{1,3}": "*.*.*.*" # mask IP address
    "[a-z0-9._%+\\-]+(@[a-z0-9.\\-]+\\.[a-z]{2,4})": "***$1" # mask email address
```

Before masking:
```
ip: 127.0.0.1, email: 'john@example.com'
```

After masking:
```
ip: *.*.*.*, email: '***@example.com'
```


You can specify as many masking rules as you need, in key-value format. In example above, two rules are specified: one is for masking all IP addresses, and another to mask all emails.

Each masking rule consists of a key and a value:
- Keys are regular expressions (see details below)
- Values is replacement templates, where substitution is supported (`$1`, `$2`, etc.)

Use backslash(`\`) to escape special characters: https://yaml.org/spec/1.2/spec.html#id2788097.

:::caution
When many sophisticated regular expressions are used, one might expect a slowdown of Postgres log processing. Try to define as few rules as possible, as simple as possible.
:::

## How it works
Replacement rules are applied to all log fields of the incoming PostgreSQL CSV log lines that can contain some sensitive data: 
- `message` 
- `detail` 
- `hint`
- `internal_query` 
- `query`

## Regular expressions
The syntax of the regular expressions accepted is the same general syntax used by Perl, Python, and other languages.  You can find syntax details here: https://github.com/google/re2/wiki/Syntax.

In a template, a variable is denoted by a substring of the form $name or ${name}, where name is a non-empty sequence of letters, digits, and underscores. 
A purely numeric name like `$1` refers to a submatch with the corresponding index; other names refer to capturing parentheses named with the `(?P<name>...)` syntax. 
A reference to an out-of-range or unmatched index or a name that is not present in the regular expression is replaced by an empty string.

To insert a literal `$` in the output, use `$$` in the template.
