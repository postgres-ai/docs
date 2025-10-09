---
title: Development Postgres Hacking
description: PostgresAI rule - Development Postgres Hacking
---

---
description: "Guidelines for PostgreSQL development and hacking"
globs: "*.c,*.h,Makefile*,*.patch,*.diff,configure*"
---

# Postgres hacking

## Required dependencies

### For Linux (Ubuntu/Debian):
```bash
sudo apt-get install build-essential libreadline-dev zlib1g-dev flex bison \
  libxml2-dev libxslt-dev libssl-dev libxml2-utils xsltproc ccache docbook \
  docbook-dsssl docbook-xsl docbook-xml docbook-defguide openjade \
  libxml2-utils sgml-data
```

### For macOS:
Follow the official platform-specific notes:
- [macOS installation notes](https://www.postgresql.org/docs/current/installation-platform-notes.html#INSTALLATION-NOTES-MACOS)
- Install Xcode Command Line Tools: `xcode-select --install`
- Consider using Homebrew for dependencies

## Configuration

### Always use these ./configure flags:
```bash
./configure \
  --enable-depend \
  --enable-cassert \
  --enable-debug \
  --prefix=/tmp/pg18_featureXXX \
  --with-openssl
```

**Important**: Always use `--prefix` with a descriptive path in `/tmp` (e.g., `/tmp/pg18_featureXXX` where XXX describes your feature) to avoid conflicts with system PostgreSQL installations and easily identify different builds.

## Building

### Make with parallel jobs:
```bash
make -j8
```

### Full build sequence:
```bash
./configure --enable-depend --enable-cassert --enable-debug --prefix=/tmp/pg18_featureXXX
make -j8
make install
```

## Running psql

### Always use the --no-psqlrc flag:
```bash
psql --no-psqlrc -d postgres
```

This prevents loading of the user's `.psqlrc` file, ensuring consistent behavior across different environments.

## Git workflow

### Commit message format:
Follow PostgreSQL's commit message style - comprehensive and detailed:

```
Short descriptive title (50 chars max)

Detailed explanation of what this change does and why it's needed.
Be precise, concise, and brief while explaining all important details.

Changes made:
- Specific change 1 with technical details
- Specific change 2 with rationale
- Specific change 3 with impact description

Testing performed:
- Test scenario 1
- Test scenario 2

No emojis in commit messages.
```

### What NOT to commit or include in patches/diffs:
- ❌ Test files and logs
- ❌ Temporary binaries  
- ❌ Core dumps
- ❌ Build artifacts
- ❌ Personal configuration files
- ❌ AI rules directories and files (`.cursor/`, `CLAUDE.md`, `.cursorrules`, etc.)
- ❌ IDE-specific files and directories

**Important**: When creating `.patch` or `.diff` files, ensure AI tooling files are excluded. Use `git diff` with pathspec exclusions:
```bash
# Exclude AI tooling files from patches
git diff -- . ':(exclude).cursor' ':(exclude)CLAUDE.md' ':(exclude).cursorrules'
```

### File placement:
- Place temporary files in `/tmp` instead of the repo directory
- Don't add temp directory names to `.gitignore`
- Keep temporary files outside the main directory structure

## Development best practices

### Testing:
- Run regression tests: `make check`
- Run specific tests: `make check TESTS="test_name"`
- Clean build: `make clean && make -j8`

### Debugging:
- Build with debug symbols: `./configure --enable-debug`
- Use `gdb` for debugging: `gdb --args postgres -D /path/to/data`
- Check logs in `pg_log/` directory

### Code style:
- Follow the existing PostgreSQL coding conventions
- Use `pgindent` for consistent formatting
- Keep line length under 80 characters where possible