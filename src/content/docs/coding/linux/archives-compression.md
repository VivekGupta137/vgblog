---
title: Archives Compression
---

# Archives & Compression — Quick Reference

---

## tar — Pack / Unpack Archives

The most common tool. Often combined with gzip (`.tar.gz` / `.tgz`) or bzip2 (`.tar.bz2`).

### Create Archives

```bash
tar -czf archive.tar.gz ./dir         # create gzip archive
tar -cjf archive.tar.bz2 ./dir        # create bzip2 archive (smaller, slower)
tar -cf archive.tar ./dir             # create uncompressed archive
tar -czf archive.tar.gz file1 file2   # archive specific files
```

### Extract Archives

```bash
tar -xzf archive.tar.gz               # extract gzip archive
tar -xjf archive.tar.bz2              # extract bzip2 archive
tar -xf archive.tar                   # extract uncompressed
tar -xzf archive.tar.gz -C /dest/     # extract to specific directory
```

### Inspect Without Extracting

```bash
tar -tzf archive.tar.gz               # list contents of gzip archive
tar -tf archive.tar                   # list contents of uncompressed
```

### Common Flags

| Flag | Meaning |
|------|---------|
| `-c` | Create archive |
| `-x` | Extract archive |
| `-t` | List contents |
| `-z` | Use gzip compression |
| `-j` | Use bzip2 compression |
| `-J` | Use xz compression |
| `-f` | Specify filename (always last) |
| `-v` | Verbose — show files as processed |
| `-C` | Change to directory before extracting |

---

## zip / unzip

```bash
zip archive.zip file1 file2           # zip specific files
zip -r archive.zip ./dir              # zip a directory recursively
zip -r archive.zip . -x "*.git*"      # exclude a pattern

unzip archive.zip                     # extract to current directory
unzip archive.zip -d /dest/           # extract to specific directory
unzip -l archive.zip                  # list contents without extracting
unzip -o archive.zip                  # overwrite existing files
```

---

## gzip / gunzip — Compress Single Files

Replaces the original file by default.

```bash
gzip file.txt                         # compress → file.txt.gz (removes original)
gzip -k file.txt                      # keep original
gzip -d file.txt.gz                   # decompress (same as gunzip)
gunzip file.txt.gz                    # decompress

gzip -9 file.txt                      # maximum compression
gzip -1 file.txt                      # fastest compression

# Compress multiple files
gzip file1.txt file2.txt
```

---

## xz — High Compression

Better compression ratio than gzip, but slower.

```bash
xz file.txt                           # compress → file.txt.xz
xz -d file.txt.xz                     # decompress
xz -k file.txt                        # keep original
xz -9 file.txt                        # maximum compression
```

---

## zcat / zless — Read Compressed Files Without Extracting

```bash
zcat file.txt.gz                      # print contents of gzip file
zcat file.txt.gz | grep "error"       # grep inside compressed log
zless file.txt.gz                     # page through gzip file
```

---

## Quick Reference — File Extensions

| Extension | Tool | Command to extract |
|-----------|------|--------------------|
| `.tar` | tar | `tar -xf file.tar` |
| `.tar.gz` / `.tgz` | tar + gzip | `tar -xzf file.tar.gz` |
| `.tar.bz2` | tar + bzip2 | `tar -xjf file.tar.bz2` |
| `.tar.xz` | tar + xz | `tar -xJf file.tar.xz` |
| `.gz` | gzip | `gunzip file.gz` |
| `.zip` | zip | `unzip file.zip` |
| `.xz` | xz | `xz -d file.xz` |

---

## Tips

- `tar -xzf` is the one you'll use 90% of the time.
- Add `-v` while learning to see what's happening; drop it in scripts.
- Use `tar -tzf archive.tar.gz` before extracting to know where files will land — avoids spilling into your current directory.
- `zcat logs.gz | grep ERROR | tail -100` lets you search compressed logs without unpacking them.
- For large files, prefer `xz` for storage and `gzip` when speed matters.

---

[← Linux](/coding/linux/)
