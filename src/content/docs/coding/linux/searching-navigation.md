---
title: Searching Navigation
---

# Searching & Navigation — Quick Reference

:::note
For `grep`, `find`, and `xargs` in depth, see grep-find.md.
:::

---

## locate — Fast Filename Search

Uses a pre-built database — much faster than `find` for filename lookups.

```bash
locate nginx.conf             # find files named nginx.conf
locate -i readme              # case-insensitive
locate "*.log"                # by pattern
locate -n 10 config           # limit to 10 results

# Update the database (needed after new files are created)
sudo updatedb
```

**Caveat:** results can be stale — use `find` when you need guaranteed freshness.

---

## fd — Modern find Alternative

Faster, simpler syntax, ignores `.git` and `node_modules` by default.

```bash
fd                            # list all files recursively
fd .ts                        # files with .ts extension
fd config                     # files named "config" (fuzzy)
fd -e yaml                    # by extension
fd -t d src                   # directories named "src"
fd -H .env                    # include hidden files
fd --exclude node_modules     # exclude a directory
fd ".*\.test\.ts" src/        # regex pattern in src/
```

---

## ripgrep (rg) — Modern grep Alternative

Much faster than grep, respects `.gitignore`, skips binaries automatically.

```bash
rg "TODO"                     # search current dir recursively
rg -i "error"                 # case-insensitive
rg "useState" src/            # search in a specific directory
rg -t ts "useEffect"          # only TypeScript files
rg -l "import React"          # filenames only
rg -n "port"                  # with line numbers
rg --no-ignore "secret"       # don't respect .gitignore
rg -C 3 "panic"               # 3 lines of context
rg -e "foo" -e "bar"          # multiple patterns (OR)
rg --hidden "config"          # include hidden files
```

---

## Directory Navigation

```bash
cd -                          # go back to previous directory
cd ~                          # go to home directory
pushd /some/dir               # push dir onto stack and cd to it
popd                          # pop and return to previous dir
dirs                          # list directory stack
```

---

## Tree — Visual Directory Structure

```bash
tree                          # show full tree
tree -L 2                     # limit to 2 levels deep
tree -a                       # include hidden files
tree -d                       # directories only
tree --gitignore              # respect .gitignore
tree -I "node_modules|dist"   # exclude patterns
```

---

## fzf — Fuzzy Finder (Interactive)

Fuzzy search for anything piped into it.

```bash
# Interactive file search
find . -type f | fzf

# Search and open in vim
vim $(fzf)

# Search command history interactively (replaces Ctrl+R)
history | fzf

# Preview file contents while searching
fzf --preview 'cat {}'

# Search git branches
git branch | fzf
```

---

## Tips

- Use `rg` instead of `grep -r` — it's faster and smarter about what to skip.
- Use `fd` instead of `find` for simple filename lookups — less syntax to remember.
- `locate` is instant for "where is this config file?" but run `sudo updatedb` if files are missing.
- `fzf` transforms any list-based workflow — pipe anything into it for interactive filtering.

---

[← Linux](/coding/linux/)
