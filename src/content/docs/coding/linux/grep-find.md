---
title: Grep Find
---

# grep & find — Quick Reference

---

## grep — Search File Contents

### Syntax
```
grep [options] pattern [file...]
```

### Common Options

| Flag | Meaning |
|------|---------|
| `-r` | Recursive (search directories) |
| `-i` | Case-insensitive |
| `-n` | Show line numbers |
| `-l` | Print only filenames with matches |
| `-L` | Print only filenames WITHOUT matches |
| `-c` | Count matching lines per file |
| `-v` | Invert — show non-matching lines |
| `-w` | Match whole words only |
| `-x` | Match whole lines only |
| `-A n` | Show n lines After the match |
| `-B n` | Show n lines Before the match |
| `-C n` | Show n lines of Context (before + after) |
| `-E` | Extended regex (same as `egrep`) |
| `-F` | Fixed string, no regex |
| `-o` | Print only the matched part |
| `-q` | Quiet — exit 0/1 only, no output |
| `--include=` | Limit to files matching a glob |
| `--exclude=` | Skip files matching a glob |
| `--exclude-dir=` | Skip directories |

### Examples

```bash
# Basic search
grep "error" app.log

# Case-insensitive, with line numbers
grep -in "null pointer" *.java

# Recursive search in a directory
grep -r "TODO" ./src

# Recursive, only .py files
grep -r --include="*.py" "def main" .

# Show 3 lines of context around matches
grep -C 3 "segfault" /var/log/syslog

# Find files containing a pattern (just filenames)
grep -rl "import React" ./src

# Invert match — lines NOT containing "debug"
grep -v "debug" app.log

# Count occurrences per file
grep -rc "WARN" ./logs

# Match whole word (won't match "errors")
grep -w "error" app.log

# Extended regex — multiple patterns with |
grep -E "error|warn|fatal" app.log

# Print only the matched text
grep -o '"[^"]*"' data.json

# Search for a literal string (no regex)
grep -F "2.0.0" package.json

# Exclude directories (e.g. node_modules)
grep -r --exclude-dir=node_modules "config" .

# Pipe into grep
ps aux | grep nginx

# Grep output of a command
cat /etc/passwd | grep -i "root"
```

### Regex Quick Reference

| Pattern | Matches |
|---------|---------|
| `.` | Any single character |
| `*` | Zero or more of preceding |
| `+` | One or more (needs `-E`) |
| `?` | Zero or one (needs `-E`) |
| `^` | Start of line |
| `$` | End of line |
| `[abc]` | a, b, or c |
| `[^abc]` | Not a, b, or c |
| `[a-z]` | a through z |
| `\b` | Word boundary |
| `(foo\|bar)` | foo or bar (needs `-E` without escaping) |

---

## find — Search by File Attributes

### Syntax
```
find [path] [expression]
```

### Common Options / Tests

| Option | Meaning |
|--------|---------|
| `-name "pat"` | Filename matches glob (case-sensitive) |
| `-iname "pat"` | Filename matches glob (case-insensitive) |
| `-type f` | Regular files only |
| `-type d` | Directories only |
| `-type l` | Symbolic links only |
| `-size +10M` | Larger than 10 MB (`k`=KB, `M`=MB, `G`=GB) |
| `-size -1k` | Smaller than 1 KB |
| `-mtime -7` | Modified in last 7 days |
| `-mtime +30` | Modified more than 30 days ago |
| `-mmin -60` | Modified in last 60 minutes |
| `-newer file` | Modified more recently than `file` |
| `-empty` | Empty files or directories |
| `-maxdepth n` | Don't recurse deeper than n levels |
| `-mindepth n` | Skip top n levels |
| `-not` / `!` | Negate the next expression |
| `-o` | OR (default is AND) |
| `-perm 644` | Exact permission match |
| `-perm -u+x` | User has execute bit set |
| `-user name` | Owned by user |
| `-group name` | Owned by group |

### Actions

| Action | Meaning |
|--------|---------|
| `-print` | Print path (default) |
| `-ls` | Print like `ls -l` |
| `-delete` | Delete matched files (use carefully) |
| `-exec cmd {} \;` | Run cmd for each match |
| `-exec cmd {} +` | Run cmd once with all matches (faster) |
| `-execdir cmd {} \;` | Run cmd from the file's directory |

### Examples

```bash
# Find all .log files
find . -name "*.log"

# Find files modified in the last 24 hours
find . -mtime -1 -type f

# Find files larger than 100MB
find /var -size +100M -type f

# Find and delete files older than 30 days
find /tmp -mtime +30 -type f -delete

# Find empty directories
find . -type d -empty

# Find files NOT owned by root
find /etc -not -user root -type f

# Search only 2 levels deep
find . -maxdepth 2 -name "*.conf"

# Find and print size (human-readable via exec)
find . -name "*.log" -exec ls -lh {} \;

# Find then xargs (faster than -exec for many files)
find . -name "*.tmp" | xargs rm -f

# Combine with grep — find files containing a string
find . -name "*.js" -exec grep -l "useState" {} \;

# Find files modified more recently than a reference file
find . -newer reference.txt -type f

# Find by permission
find . -perm -u+x -type f

# Find directories named "build" or "dist"
find . -type d \( -name "build" -o -name "dist" \)

# Exclude a directory from find
find . -path ./node_modules -prune -o -name "*.ts" -print
```

---

## xargs — Pass stdin as Arguments

Takes lines from stdin and passes them as arguments to a command. Bridges commands that don't read from stdin.

```bash
find . -name "*.log" | xargs rm        # rm file1.log file2.log ... (one call)
find . -name "*.log" -exec rm {} \;   # rm file1.log, rm file2.log ... (one call per file, slower)
```

### Common Flags

| Flag | Meaning |
|------|---------|
| `-0` | Split input on null bytes instead of whitespace (pair with `-print0`) |
| `-n 1` | Pass one argument per command invocation |
| `-P 4` | Run up to 4 commands in parallel |
| `-I {}` | Use `{}` as a placeholder anywhere in the command |

### Examples

```bash
# Safe with filenames that have spaces
find . -name "*.log" -print0 | xargs -0 rm

# One file at a time
find . -name "*.bak" | xargs -n 1 gzip

# Placeholder — rename each file
find . -name "*.bak" | xargs -I{} mv {} {}.old

# Run 4 compressions in parallel
find . -name "*.csv" -print0 | xargs -0 -P 4 -n 1 gzip
```

---

## grep + find Together

```bash
# Find all .yaml files and grep for "port:"
find . -name "*.yaml" | xargs grep "port:"

# Same but handle filenames with spaces
find . -name "*.yaml" -print0 | xargs -0 grep "port:"

# One-liner alternative
find . -name "*.yaml" -exec grep -H "port:" {} \;
```

---

## Tips

- Use `grep -rn` as your default recursive search — you almost always want line numbers.
- Use `find . -maxdepth 2` to avoid scanning deep trees when you know where things are.
- Prefer `xargs` over `-exec {} \;` for large result sets — it batches calls and is much faster.
- Add `-print0` / `xargs -0` when filenames might contain spaces.
- `grep -l` and `find -name` are your fastest "which file has X / is named X" shortcuts.

---

[← Linux](/coding/linux/)
