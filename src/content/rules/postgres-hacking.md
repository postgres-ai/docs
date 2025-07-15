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
  --prefix=/usr/local/pgsql \
  --with-openssl
```

## Building

### Make with parallel jobs:
```bash
make -j8
```

### Full build sequence:
```bash
./configure --enable-depend --enable-cassert --prefix=/usr/local/pgsql
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

### Professional commit messages:
```
Short descriptive message (50 chars max)


Detailed description of the change if needed.
Optional list of changes:
- First change
- Second change
- Third change
```

### What NOT to add to git:
- ❌ Test files and logs
- ❌ Temporary binaries
- ❌ Core dumps
- ❌ Build artifacts
- ❌ Personal configuration files

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