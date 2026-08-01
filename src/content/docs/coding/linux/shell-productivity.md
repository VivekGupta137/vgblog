---
title: Shell Productivity
---

# Shell Productivity — Quick Reference

---

## history — Command History

```bash
history                       # list all previous commands
history 20                    # last 20 commands
history | grep git            # search history
!!                            # re-run last command
!42                           # re-run command #42 from history
!git                          # re-run last command starting with "git"
!$                            # last argument of previous command
Ctrl+R                        # interactive reverse search through history
```

---

## alias — Command Shortcuts

```bash
alias ll='ls -lah'            # define alias
alias gs='git status'
alias ..='cd ..'
alias grep='grep --color=auto'

unalias ll                    # remove alias
alias                         # list all aliases
```

To make aliases permanent, add them to `~/.bashrc` or `~/.zshrc`.

---

## source — Load a Script into Current Shell

```bash
source ~/.bashrc              # reload shell config
source .env                   # load env file into current shell
. ~/.bashrc                   # same as source (shorthand)
```

---

## tee — Write to File AND stdout

```bash
command | tee output.txt              # write to file and print to terminal
command | tee -a output.txt           # append instead of overwrite
command | tee file.txt | grep ERROR   # branch the pipe
```

Useful when you want to save output while still seeing it live.

---

## watch — Repeat a Command on Interval

```bash
watch -n 2 df -h              # run df -h every 2 seconds
watch -n 1 'ps aux | grep node'   # monitor a process
watch -d free -h              # highlight changes between runs
```

---

## set — Shell Script Behavior

Put at the top of bash scripts:

```bash
set -e          # exit immediately on any error
set -u          # treat unset variables as errors
set -x          # print each command before running (debug mode)
set -o pipefail # catch errors in piped commands (set -e misses these)

# All together (recommended for scripts)
set -euo pipefail
```

---

## Keyboard Shortcuts (bash / zsh)

| Shortcut | Action |
|----------|--------|
| `Ctrl+R` | Reverse search history |
| `Ctrl+C` | Kill current process |
| `Ctrl+Z` | Suspend current process |
| `Ctrl+D` | Exit / EOF |
| `Ctrl+L` | Clear screen |
| `Ctrl+A` | Move cursor to start of line |
| `Ctrl+E` | Move cursor to end of line |
| `Ctrl+W` | Delete word before cursor |
| `Ctrl+U` | Delete from cursor to start of line |
| `Ctrl+K` | Delete from cursor to end of line |
| `Alt+.` | Insert last argument of previous command |
| `Tab` | Autocomplete |

---

## Redirection & Pipes

```bash
command > file.txt            # stdout to file (overwrite)
command >> file.txt           # stdout to file (append)
command 2> err.txt            # stderr to file
command &> file.txt           # stdout + stderr to file
command 2>/dev/null           # discard stderr
command1 | command2           # pipe stdout of cmd1 to cmd2
command1 |& command2          # pipe stdout + stderr
tee file.txt                  # write to file AND pass through
```

---

## Brace Expansion

```bash
mkdir -p src/{components,utils,hooks}        # create multiple dirs
touch file{1..5}.txt                         # file1.txt ... file5.txt
cp config.yaml config.yaml.bak              # quick backup
mv file.{txt,md}                            # rename extension
echo {a,b,c}.log                            # a.log b.log c.log
```

---

## Parameter Expansion

```bash
file="report.tar.gz"

${file%.*}       # remove shortest suffix match  → report.tar
${file%%.*}      # remove longest suffix match   → report
${file#*.}       # remove shortest prefix match  → tar.gz
${file##*.}      # remove longest prefix match   → gz
${file/old/new}  # replace first match
${file//old/new} # replace all matches
${#file}         # length of string              → 13
${file:-default} # use default if unset
```

---

## Useful One-Liners

```bash
# Run last command as sudo
sudo !!

# Create a timestamped backup
cp config.yaml config.yaml.$(date +%Y%m%d)

# Run a command every time a file changes (using watch)
watch -n 1 cat output.txt

# Find and kill a process on a port
kill $(lsof -ti :8080)

# Print lines 10-20 of a file
sed -n '10,20p' file.txt

# Count unique IPs in an access log
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# Monitor disk usage every 5 seconds
watch -n 5 df -h
```

---

## Tips

- `set -euo pipefail` at the top of every bash script — catches most silent failures.
- `Ctrl+R` is the fastest way to re-run a long command you used recently.
- Store `alias` definitions in `~/.bashrc` (bash) or `~/.zshrc` (zsh) to persist across sessions.
- `tee` is invaluable for debugging pipelines — branch output to a file without breaking the chain.

---

[← Linux](/coding/linux/)
