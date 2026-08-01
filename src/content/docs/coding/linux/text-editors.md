---
title: Text Editors
---

# Text Editors (Terminal) — Quick Reference

---

## vim — The Essential One

You'll encounter it on remote servers whether you like it or not. Knowing enough to edit and escape is survival-level knowledge.

### Modes

| Mode | How to enter | Purpose |
|------|-------------|---------|
| **Normal** | `Esc` | Navigation, commands (default) |
| **Insert** | `i`, `a`, `o` | Type text |
| **Visual** | `v`, `V`, `Ctrl+V` | Select text |
| **Command** | `:` | Save, quit, search, replace |

### The Most Important Commands

```
i       insert before cursor
a       insert after cursor
o       insert new line below
O       insert new line above

Esc     return to Normal mode

:w      save
:q      quit
:wq     save and quit
:q!     quit without saving (force)
:wq!    force save and quit
ZZ      save and quit (shortcut for :wq)
```

### Navigation (Normal Mode)

```
h j k l     left, down, up, right
w           jump to next word
b           jump to previous word
0           start of line
$           end of line
gg          go to first line
G           go to last line
:42         go to line 42
Ctrl+D      page down
Ctrl+U      page up
```

### Editing (Normal Mode)

```
x       delete character under cursor
dd      delete (cut) current line
yy      yank (copy) current line
p       paste after cursor
P       paste before cursor
u       undo
Ctrl+R  redo
.       repeat last action

dw      delete word
d$      delete to end of line
cw      change word (delete + insert)
```

### Search & Replace

```
/pattern        search forward
?pattern        search backward
n               next match
N               previous match

:%s/old/new/g   replace all in file
:%s/old/new/gc  replace all, confirm each
:5,10s/old/new  replace in lines 5–10
```

### Visual Mode (Select Text)

```
v           character-wise select
V           line-wise select
Ctrl+V      block/column select

After selecting:
y   copy
d   delete/cut
>   indent
<   unindent
```

### Multiple Files & Splits

```
:e file.txt         open file
:vsplit file.txt    vertical split
:split file.txt     horizontal split
Ctrl+W + arrow      move between splits
:tabnew file.txt    open in new tab
gt / gT             next / previous tab
```

---

## nano — Beginner-Friendly

Simpler than vim, controls shown at the bottom of the screen.

```bash
nano file.txt
```

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Save (Write Out) |
| `Ctrl+X` | Exit |
| `Ctrl+K` | Cut line |
| `Ctrl+U` | Paste line |
| `Ctrl+W` | Search |
| `Ctrl+\` | Search and replace |
| `Ctrl+G` | Help |
| `Alt+U` | Undo |

---

## Tips

- Memorize `:wq` and `:q!` first — everything else is secondary.
- `vimtutor` (run in terminal) is an interactive 30-minute lesson built into vim itself.
- Use `nano` when you just need to make a quick edit and don't want to think about modes.
- On most servers, if `vim` isn't available, `vi` (its predecessor) almost certainly is — the core commands are the same.

---

[← Linux](/coding/linux/)
