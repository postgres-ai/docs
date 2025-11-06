# DB schema design guide

- For PKs, use `int8 ... generated always as identity` instead of `int4/serial`
- Prefer `timestamptz` over `timestamp`
- Prefer `text` over `varchar`
- Use **UUIDv7** when applicable (function `uuidv7()`, PG18+)
- Never use `money` data type - store as cents/smallest unit instead
- Avoid SQL reserved words in names
- Ensure names are unique and under 63 characters
- Use snake_case for all identifiers
- Prefer plurals for table names: `users`, `blog_posts`
- Prefer singular names for columns: `email`, `status`
- Use `comment` to add comments to columns, tables, and other database objects
- DB object comments must be short and precise, maximum 1024 characters
- Explain purpose in comments, not implementation
- Include valid values for enums or constrained fields
- If needed, add inline comments using `/* ... */` (C style); these comments may be detailed
- Use **lowercase SQL keywords** (not uppercase)
- Add spaces and line breaks for readability in complex statements 