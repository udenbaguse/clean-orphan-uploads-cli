# clean-orphan-uploads-cli

CLI to remove orphan upload files in a local folder based on image path reference data in PostgreSQL.

This tool is safe to use incrementally because it supports `--dry-run` mode for simulation before files are actually deleted.

## How It Works

1. The CLI reads all image path values from the PostgreSQL table.
2. The CLI reads all files in the local upload folder.
3. Files that are no longer referenced by the database are considered orphan.
4. Orphan files will:
   - only be reported if using `--dry-run`
   - be permanently deleted without `--dry-run`

## Prerequisites

- Node.js `>=20`
- Accessible PostgreSQL database
- Data structure containing image paths (default: `projects` table, `image` column)

## Installation

### Option 1: Install as a package

```bash
npm install clean-orphan-uploads-cli
```

### Option 2: Run from this source repo

```bash
npm install github:udenbaguse/clean-orphan-uploads-cli
```

## Step-by-Step Usage (Recommended)

### Step 1 - Identify the upload folder to clean

Example default folder:

```bash
public/uploads
```

If your folder is different, use `--uploads-dir <path>` later.

### Step 2 - Prepare database connection

Choose one of the following methods.

#### Method A (simplest): use `--db-url`

```bash
clean-orphan-uploads --db-url "postgres://user:pass@localhost:5432/dbname" --dry-run
```

#### Method B: use environment variable

If `--db-url` is not provided, the CLI will read from env

`dotenv` is automatically loaded, so you can use a `.env` file.

Example `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=secret
```

### Step 3 - Always run a simulation first (`--dry-run`)

This is a mandatory step before actual deletion:

```bash
clean-orphan-uploads --dry-run
```

Example output:

```text
Dry-run complete. 12 file(s) would be removed from 130 file(s).
```

### Step 4 - Review simulation results

If the number of files to be deleted makes sense, proceed to step 5.

If not as expected, check:

- `--uploads-dir`
- `--table`
- `--column`
- `--path-prefix`
- DB connection configuration

### Step 5 - Execute orphan file deletion

Run without `--dry-run`:

```bash
clean-orphan-uploads
```

Example output:

```text
Removed 12 orphaned file(s) from 130 file(s).
```

### Step 6 - Post-execution verification

- Check that the upload folder contents are correct.
- Run `--dry-run` again to ensure all orphans have been cleaned.

## Options

- `--dry-run` preview files that would be deleted without actually deleting them
- `--uploads-dir <path>` upload folder (default: `public/uploads`)
- `--db-url <url>` PostgreSQL connection string (`DATABASE_URL` if not set)
- `--table <name>` table name (default: `projects`)
- `--column <name>` image path column name (default: `image`)
- `--path-prefix <prefix>` path prefix in DB (default: `/uploads/`)

## Common Command Examples

### Default (table `projects`, column `image`, folder `public/uploads`)

```bash
clean-orphan-uploads --dry-run
```

### Custom upload folder

```bash
clean-orphan-uploads --uploads-dir storage/uploads --dry-run
```

### Custom table and column

```bash
clean-orphan-uploads --table products --column thumbnail --dry-run
```

### Custom path prefix

```bash
clean-orphan-uploads --path-prefix /media/ --dry-run
```

### Full command with DB URL

```bash
clean-orphan-uploads \
  --db-url "postgres://user:pass@localhost:5432/dbname" \
  --uploads-dir public/uploads \
  --table projects \
  --column image \
  --path-prefix /uploads/ \
  --dry-run
```

## Important Notes

- The CLI only processes files in the first level of the upload folder (not recursive into subfolders).
- `--table` and `--column` values must be valid SQL identifiers.
- If the upload folder is not found, the process will be skipped with the message:

```text
No uploads directory found at: <path>
```


## Recommended Script Keywords (package.json)

```bash
"clean:uploads": "node node_modules/clean-orphan-uploads-cli/bin/clean-orphan-uploads.js",
"clean:uploads:dry": "node node_modules/clean-orphan-uploads-cli/bin/clean-orphan-uploads.js --dry-run"
```
