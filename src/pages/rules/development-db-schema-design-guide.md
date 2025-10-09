---
title: Development Db Schema Design Guide
description: PostgresAI rule - Development Db Schema Design Guide
---

---
description: "Database schema design guide for consistent table and column design"
globs: "*.sql,*.psql,*migration*,*schema*"
---

# Database schema design guide

## Data types and constraints

### Primary keys
- Use `int8 ... generated always as identity` instead of `int4/serial`
- Provides better scalability and avoids sequence exhaustion

```sql
-- Good
create table users (
  id int8 generated always as identity primary key,
  email text not null
);

-- Bad
create table users (
  id serial primary key,
  email varchar(255) not null
);
```

### Recommended data types
- **Prefer `timestamptz` over `timestamp`** - always store timezone info
- **Prefer `text` over `varchar`** - no arbitrary length limits
- **Use UUIDv7 when applicable** - function `uuidv7()` (Postgres 18+)
- **Never use `money` data type** - store as cents/smallest unit instead

```sql
-- Good
create table orders (
  id int8 generated always as identity primary key,
  created_at timestamptz not null default now(),
  description text,
  amount_cents int8 not null, -- store money as smallest unit
  external_id uuid default uuidv7()
);

-- Bad
create table orders (
  id serial primary key,
  created_at timestamp not null default now(),
  description varchar(500),
  amount money not null,
  external_id uuid default gen_random_uuid()
);
```

## Naming conventions

### General rules
- **Avoid SQL reserved words** in names
- **Ensure names are unique and under 63 characters**
- **Use snake_case for all identifiers**
- **Prefer plurals for table names**: `users`, `blog_posts`
- **Prefer singular names for columns**: `email`, `status`

```sql
-- Good
create table blog_posts (
  id int8 generated always as identity primary key,
  title text not null,
  content text,
  author_id int8 not null references users(id),
  status text not null check (status in ('draft', 'published', 'archived'))
);

-- Bad
create table BlogPost (
  ID serial primary key,
  Title varchar(255) not null,
  Content text,
  AuthorID int not null references User(ID),
  Status varchar(50) not null
);
```

## Documentation and comments

### Comment guidelines
- **Use `comment` to add comments** to columns, tables, and other database objects
- **DB object comments must be short and precise, maximum 1024 characters**
- **Explain purpose in comments, not implementation**
- **Include valid values for enums or constrained fields**
- **Add inline comments using `/* ... */` (C style)** for detailed explanations

```sql
create table users (
  id int8 generated always as identity primary key,
  email text not null unique,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'deleted')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

comment on table users is 'System users with authentication credentials';
comment on column users.email is 'Unique email address for authentication';
comment on column users.status is 'User account status: active, suspended, deleted';
comment on column users.last_login_at is 'Timestamp of most recent successful login';

/* Indexes for common query patterns */
create index idx_users_email on users(email);
create index idx_users_status on users(status) where status != 'deleted';
```

## SQL formatting
- **Use lowercase SQL keywords** (not uppercase)
- **Add spaces and line breaks for readability** in complex statements

```sql
-- Good
create table user_sessions (
  id int8 generated always as identity primary key,
  user_id int8 not null references users(id) on delete cascade,
  session_token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Bad
CREATE TABLE user_sessions(id SERIAL PRIMARY KEY,user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,session_token VARCHAR(255) NOT NULL UNIQUE,expires_at TIMESTAMP NOT NULL,created_at TIMESTAMP NOT NULL DEFAULT NOW());
```

## Best practices summary
1. Use `int8 generated always as identity` for primary keys
2. Choose `timestamptz` for timestamps, `text` for strings
3. Store monetary values as integers (cents)
4. Use descriptive, snake_case names under 63 characters
5. Pluralize table names, singularize column names
6. Add meaningful comments explaining purpose and constraints
7. Format SQL with lowercase keywords and proper spacing