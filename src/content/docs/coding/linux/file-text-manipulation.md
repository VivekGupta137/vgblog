---
title: File Text Manipulation
---

# File & Text Manipulation — Quick Reference

---

## cat — Concatenate / Print Files

```bash
cat file.txt                  # print file
cat file1.txt file2.txt       # concatenate two files
cat -n file.txt               # print with line numbers
cat file1.txt file2.txt > combined.txt   # merge into new file
```

---

## less — Paginated File Viewer

Better than `cat` for large files — doesn't load everything at once.

```bash
less file.txt
less +F file.txt              # follow mode (like tail -f)
```

| Key | Action |
|-----|--------|
| `Space` / `f` | Page down |
| `b` | Page up |
| `g` | Go to start |
| `G` | Go to end |
| `/pattern` | Search forward |
| `n` / `N` | Next / previous match |
| `q` | Quit |

---

## head / tail — View Start or End of File

```bash
head file.txt                 # first 10 lines (default)
head -n 20 file.txt           # first 20 lines
tail file.txt                 # last 10 lines
tail -n 50 file.txt           # last 50 lines
tail -f app.log               # follow — stream new lines live
tail -f app.log | grep ERROR  # follow and filter
```

---

## sed — Stream Editor (Find & Replace)

```bash
# Replace first occurrence per line
sed 's/foo/bar/' file.txt

# Replace all occurrences (global flag)
sed 's/foo/bar/g' file.txt

# Edit file in place
sed -i 's/foo/bar/g' file.txt

# Delete lines matching a pattern
sed '/^#/d' file.txt          # delete comment lines

# Print only matching lines
sed -n '/error/p' file.txt

# Replace on a specific line number
sed '5s/foo/bar/' file.txt

# Delete blank lines
sed '/^$/d' file.txt
```

---

## awk — Column / Field Processing

```bash
# Print second column (whitespace-delimited)
awk '{print $2}' file.txt

# Custom delimiter (e.g. CSV)
awk -F',' '{print $1, $3}' file.csv

# Print lines where column 3 > 100
awk '$3 > 100' file.txt

# Sum a column
awk '{sum += $2} END {print sum}' file.txt

# Print line numbers with content
awk '{print NR": "$0}' file.txt

# Print lines between two patterns
awk '/START/,/END/' file.txt
```

---

## cut — Extract Columns

```bash
# Extract characters 1-5
cut -c1-5 file.txt

# Extract field 2 (tab-delimited by default)
cut -f2 file.txt

# Custom delimiter
cut -d',' -f1,3 file.csv      # fields 1 and 3 from CSV

# Extract from ls output
ls -l | cut -d' ' -f1         # permissions column
```

---

## sort — Sort Lines

```bash
sort file.txt                 # alphabetical
sort -r file.txt              # reverse
sort -n file.txt              # numeric sort
sort -u file.txt              # unique lines only
sort -k2 file.txt             # sort by 2nd column
sort -t',' -k2 -n file.csv    # CSV, sort numerically by col 2
```

---

## uniq — Deduplicate Lines

Works on **sorted** input.

```bash
sort file.txt | uniq           # remove duplicate lines
sort file.txt | uniq -c        # prefix each line with count
sort file.txt | uniq -d        # print only duplicates
sort file.txt | uniq -u        # print only unique lines
```

---

## wc — Count Lines, Words, Bytes

```bash
wc file.txt                   # lines, words, bytes
wc -l file.txt                # line count only
wc -w file.txt                # word count only
wc -c file.txt                # byte count

# Count files in directory
ls | wc -l
```

---

## diff — Compare Files

```bash
diff file1.txt file2.txt      # basic diff
diff -u file1.txt file2.txt   # unified format (like git diff)
diff -r dir1/ dir2/           # recursive directory diff
diff --color file1.txt file2.txt   # colored output
```

---

## tr — Translate / Delete Characters

```bash
# Lowercase to uppercase
echo "hello" | tr 'a-z' 'A-Z'

# Delete characters
echo "hello 123" | tr -d '0-9'    # remove digits

# Squeeze repeated characters
echo "aaabbbccc" | tr -s 'a-z'    # → abc

# Replace newlines with spaces
cat file.txt | tr '\n' ' '
```

---

## Tips

- `tail -f` is the go-to for watching live logs.
- `sed -i` edits in place — make a backup first if unsure: `sed -i.bak 's/foo/bar/g' file`.
- Chain `sort | uniq -c | sort -rn` to get a frequency count of lines.
- `awk` is overkill for simple column extraction — use `cut` for speed.

---

[← Linux](/coding/linux/)
