---
title: Process Management
---

# Process Management — Quick Reference

---

## ps — Snapshot of Running Processes

```bash
ps aux                        # all processes, full detail
ps aux | grep nginx           # find a specific process
ps -ef                        # full-format listing (alt style)
ps -p 1234                    # info for a specific PID
```

| Column | Meaning |
|--------|---------|
| `USER` | Owner of the process |
| `PID` | Process ID |
| `%CPU` | CPU usage |
| `%MEM` | Memory usage |
| `STAT` | State (R=running, S=sleeping, Z=zombie) |
| `COMMAND` | Command that started the process |

---

## top / htop — Live Process Monitor

```bash
top                           # built-in live monitor
htop                          # better UI (may need install)
```

**top key bindings:**

| Key | Action |
|-----|--------|
| `k` | Kill a process (enter PID) |
| `M` | Sort by memory |
| `P` | Sort by CPU |
| `q` | Quit |

---

## kill / killall — Terminate Processes

```bash
kill 1234                     # graceful stop (SIGTERM)
kill -9 1234                  # force kill (SIGKILL)
kill -HUP 1234                # reload config (SIGHUP)

killall nginx                 # kill all processes named nginx
killall -9 node               # force kill all node processes
```

**Common signals:**

| Signal | Number | Meaning |
|--------|--------|---------|
| `SIGTERM` | 15 | Graceful shutdown (default) |
| `SIGKILL` | 9 | Force kill, cannot be caught |
| `SIGHUP` | 1 | Reload config / restart |
| `SIGINT` | 2 | Interrupt (same as Ctrl+C) |

---

## Background & Foreground Jobs

```bash
command &                     # run in background
Ctrl+Z                        # suspend current process
bg                            # resume suspended job in background
fg                            # bring background job to foreground
fg %2                         # bring job #2 to foreground
jobs                          # list all background/suspended jobs
```

---

## nohup — Survive Terminal Close

Runs a command that keeps running after you log out.

```bash
nohup ./script.sh &           # run in background, immune to hangup
nohup ./script.sh > out.log 2>&1 &   # capture stdout + stderr
```

Output goes to `nohup.out` by default unless redirected.

---

## Redirect & Pipes

```bash
command > file.txt            # stdout to file (overwrite)
command >> file.txt           # stdout to file (append)
command 2> err.txt            # stderr to file
command > out.txt 2>&1        # stdout + stderr to same file
command 2>/dev/null           # discard stderr
command1 | command2           # pipe stdout of cmd1 into cmd2
```

---

## pgrep / pkill — Find & Kill by Name

```bash
pgrep nginx                   # print PIDs of processes named nginx
pgrep -l nginx                # print PID + name
pkill nginx                   # kill all processes named nginx
pkill -9 node                 # force kill by name
```

---

## lsof — List Open Files / Ports

```bash
lsof -i :8080                 # what process is using port 8080
lsof -i TCP                   # all TCP connections
lsof -p 1234                  # files opened by PID 1234
lsof -u username              # files opened by user
```

---

## systemctl — Manage Services (systemd)

```bash
systemctl start nginx         # start a service
systemctl stop nginx          # stop a service
systemctl restart nginx       # restart
systemctl reload nginx        # reload config without restart
systemctl status nginx        # check status
systemctl enable nginx        # start on boot
systemctl disable nginx       # don't start on boot
systemctl list-units          # list all active units
```

---

## Tips

- Always try `kill` (SIGTERM) before `kill -9` — give the process a chance to clean up.
- `pgrep -l` is faster than `ps aux | grep` for finding a PID.
- Use `nohup` + `&` for long-running jobs on remote servers.
- `lsof -i :PORT` is the fastest way to find what's occupying a port.

---

[← Linux](/coding/linux/)
