---
title: Disk System
---

# Disk & System — Quick Reference

---

## df — Disk Space by Filesystem

```bash
df -h                         # human-readable sizes (GB, MB)
df -h /                       # space on root partition only
df -hT                        # include filesystem type
df -i                         # inode usage instead of space
```

---

## du — Directory / File Size

```bash
du -sh *                      # size of each item in current dir
du -sh /var/log               # size of a specific directory
du -h --max-depth=1 /var      # one level deep
du -sh * | sort -rh           # sort by size, largest first
du -ah . | sort -rh | head -20  # top 20 largest files/dirs
```

---

## ls — List Files

```bash
ls                            # basic listing
ls -l                         # long format (permissions, size, date)
ls -lh                        # human-readable sizes
ls -la                        # include hidden files
ls -lt                        # sort by modification time
ls -lS                        # sort by file size
ls -R                         # recursive
ls -d */                      # directories only
```

---

## chmod — File Permissions

```bash
chmod 644 file.txt            # rw-r--r--
chmod 755 script.sh           # rwxr-xr-x (executable)
chmod 600 secret.key          # rw------- (private)
chmod +x script.sh            # add execute for all
chmod -x script.sh            # remove execute
chmod -R 755 ./dir            # recursive
```

**Permission Octal Reference:**

| Octal | Binary | Meaning |
|-------|--------|---------|
| `7` | 111 | read + write + execute |
| `6` | 110 | read + write |
| `5` | 101 | read + execute |
| `4` | 100 | read only |
| `0` | 000 | no permissions |

Order: `[owner][group][others]` — e.g. `755` = owner full, group+others read+execute.

---

## chown — Change Ownership

```bash
chown user file.txt           # change owner
chown user:group file.txt     # change owner and group
chown -R user:group ./dir     # recursive
chown :group file.txt         # change group only (same as chgrp)
```

---

## ln — Create Links

```bash
# Symbolic link (like a shortcut)
ln -s /path/to/target linkname

# Hard link (same inode, survives target deletion)
ln /path/to/file hardlink

# Update existing symlink
ln -sf /new/target linkname
```

---

## env / export — Environment Variables

```bash
env                           # list all environment variables
echo $PATH                    # print a specific variable
export MY_VAR=value           # set for current shell + child processes
unset MY_VAR                  # remove variable

# Set for a single command only
MY_VAR=value ./script.sh

# Add to PATH
export PATH="$PATH:/new/dir"
```

---

## which / whereis — Locate Binaries

```bash
which python3                 # full path of binary in PATH
which -a python3              # all matches in PATH
whereis python3               # binary + man page + source locations
type ls                       # whether it's a builtin, alias, or binary
```

---

## mount / umount — Filesystems

```bash
mount                         # list all mounted filesystems
mount /dev/sdb1 /mnt/disk     # mount a device
mount -t ext4 /dev/sdb1 /mnt  # specify filesystem type
umount /mnt/disk              # unmount
df -h                         # verify after mounting
```

---

## free — Memory Usage

```bash
free -h                       # human-readable RAM + swap usage
free -s 2                     # refresh every 2 seconds
```

---

## uname — System Info

```bash
uname -a                      # all system info
uname -r                      # kernel version
uname -m                      # architecture (x86_64, arm64, etc.)
```

---

## uptime — System Load

```bash
uptime                        # uptime + load averages (1m, 5m, 15m)
```

Load average > number of CPU cores = system under pressure.

---

## iostat — Disk I/O Stats

```bash
iostat                        # CPU + disk I/O stats
iostat -x 2                   # extended stats, refresh every 2s
iostat -h                     # human-readable
```

---

## Tips

- `du -sh * | sort -rh | head -10` is the fastest way to find what's eating disk space.
- `chmod 600` for private keys — SSH will refuse to use keys that are too permissive.
- Always use `-h` with `df` and `du` — raw bytes are unreadable at a glance.
- `ln -s` symlinks are relative by default — use absolute paths to avoid broken links when moving things around.

---

[← Linux](/coding/linux/)
