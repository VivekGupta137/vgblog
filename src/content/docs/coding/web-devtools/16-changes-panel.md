---
title: 16 Changes Panel
---

# Chrome DevTools: Changes Panel

## Table of Contents

1. [What Is the Changes Panel](#1-what-is-the-changes-panel)
2. [How to Open the Changes Panel](#2-how-to-open-the-changes-panel)
3. [UI Layout](#3-ui-layout)
4. [What Gets Tracked](#4-what-gets-tracked)
5. [Reading the Diff](#5-reading-the-diff)
6. [Multiple Files Tracked](#6-multiple-files-tracked)
7. [Copying Changes](#7-copying-changes)
8. [Reverting Changes](#8-reverting-changes)
9. [Integration with Workspaces](#9-integration-with-workspaces)
10. [Workflow: Extracting CSS Tweaks and Applying to Source Code](#10-workflow-extracting-css-tweaks-and-applying-to-source-code)
11. [Step-by-Step Workflow Example](#11-step-by-step-workflow-example)
12. [Limitations](#12-limitations)
13. [Advanced: Workspaces + Changes Panel for Live-Edit and Design-to-Code Workflows](#13-advanced-workspaces--changes-panel-for-live-edit-and-design-to-code-workflows)

---

## 1. What Is the Changes Panel

The Changes panel is a built-in DevTools utility that records every CSS and JavaScript edit you make during a DevTools session. Think of it as a live, session-scoped diff tool — every time you change a property value in the Styles pane, add a new CSS rule, or edit JavaScript in the Sources panel, the Changes panel captures that modification and presents it in a standard unified diff format.

Before the Changes panel existed, there was no straightforward way to recover edits made directly in DevTools. You would tweak colors, spacing, and typography interactively, get the design looking right, then have to manually hunt through every rule you changed to reconstruct what you did. The Changes panel solves that by acting as an automatic audit log for all in-browser edits.

Key characteristics:

- **Session-scoped by default.** Changes accumulate from the moment DevTools is opened on a page until the page is reloaded or DevTools is closed. A reload wipes the slate.
- **File-level granularity.** Each source file that was modified gets its own entry in the panel. You can inspect the diff for each file independently.
- **Read-only tracking, not an editor.** The panel shows you what changed; you copy those changes out and apply them to your actual source files yourself (or let Workspaces do it automatically).
- **No setup required.** The panel is always running in the background during a DevTools session. You do not have to enable any flag or setting for it to record changes.

The Changes panel is most valuable as a bridge between exploratory in-browser editing and your actual codebase. It answers the question: "What exactly did I change to make that look right?"

---

## 2. How to Open the Changes Panel

The Changes panel is not pinned to any default DevTools tab. It lives inside the drawer, reachable through "More Tools."

**Method 1: Through the menu (most reliable)**

1. Open DevTools (`F12` or `Cmd+Option+I` on macOS, `Ctrl+Shift+I` on Windows/Linux).
2. Click the three-dot menu icon (`...`) in the top-right corner of DevTools (the "Customize and control DevTools" menu).
3. Hover over **More Tools**.
4. Click **Changes**.

The Changes panel opens as a tab in the DevTools drawer at the bottom.

**Method 2: Command Menu (fastest once you know it)**

1. Open DevTools.
2. Open the Command Menu: `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux).
3. Type `changes` and select **Show Changes**.

**Method 3: From the drawer directly**

1. Open DevTools.
2. Press `Escape` to toggle the drawer open.
3. Click the `+` icon (More tabs) in the drawer tab bar.
4. Select **Changes** from the list.

Once opened, the Changes panel persists as a drawer tab for the rest of your DevTools session. It will reappear automatically the next time you open DevTools on any page, as Chrome remembers which drawer tabs you had open.

---

## 3. UI Layout

The Changes panel has a simple two-column layout.

```
+-------------------------------------------------------+
| CHANGES                                               |
+-------------------+-----------------------------------+
|                   |                                   |
|  FILE LIST        |  DIFF VIEW                        |
|  (left column)    |  (right column)                   |
|                   |                                   |
|  > style.css      |  --- a/style.css                  |
|    main.js        |  +++ b/style.css                  |
|                   |  @@ -12,7 +12,7 @@               |
|                   |                                   |
|                   |   .hero {                         |
|                   | -   background: #333;             |
|                   | +   background: #1a1a2e;          |
|                   |     padding: 20px;                |
|                   |   }                               |
|                   |                                   |
+-------------------+-----------------------------------+
|  [Revert all changes]                                 |
+-------------------------------------------------------+
```

**Left column — File List**

- Lists every file that has at least one recorded change during the current session.
- Files are shown by their URL path (e.g., `style.css`, `app.bundle.js`).
- The currently selected file is highlighted. Click any file to load its diff in the right column.
- There is no search or filter field; if you have many changed files you scroll the list.

**Right column — Diff View**

- Shows the unified diff for the selected file.
- Lines prefixed with `+` (green background) are additions.
- Lines prefixed with `-` (red background) are removals.
- Unchanged context lines have no prefix and a neutral background.
- Each diff hunk begins with a `@@ ... @@` header showing the line numbers affected.
- A **Copy** button appears in the top-right corner of the diff view. It copies the entire diff for the selected file to the clipboard.

**Bottom bar**

- Contains the **Revert all changes** button, which undoes every edit tracked in the session.

---

## 4. What Gets Tracked

### CSS Edits in the Styles Pane

Any modification made through the **Elements > Styles** pane is tracked:

- Changing a property value (e.g., changing `color: red` to `color: blue`).
- Adding a new CSS property to an existing rule.
- Deleting a CSS property by unchecking it or pressing Backspace.
- Adding a new rule block via the `+` (New Style Rule) button.
- Editing the selector of an existing rule.

The diff is attributed to the stylesheet file that originally contained the rule. If you edit an inline style (i.e., a `style=""` attribute on an HTML element), the change is tracked in the Changes panel under the HTML document URL, not a separate CSS file.

### JavaScript Edits in the Sources Panel

Any edit made directly in the **Sources** panel code editor is tracked:

- Modifying a function body.
- Adding or removing lines of JavaScript.
- Editing content in a `.js` file opened in the Sources panel.

Note that changes made through the Sources panel require you to save the file within DevTools (`Cmd+S` / `Ctrl+S`) before they are applied to the running page. The Changes panel records the diff from the moment you save, not from when you start typing.

### What Does NOT Get Tracked

Several categories of edits are intentionally excluded:

| Action | Tracked? | Reason |
|---|---|---|
| DOM edits in Elements panel (e.g., editing HTML attributes, text content) | No | DOM mutations are not source-file changes |
| `console.log(...)` or JS run in the Console panel | No | Console execution is ephemeral and not a source edit |
| Network throttling, device emulation settings | No | These are DevTools configuration, not source changes |
| Edits to CSS Custom Properties (`--var`) via the computed panel | Partial | Tracked only if the edit modifies the rule in the Styles pane |
| Changes to files served from `localhost` via Workspaces if already saved to disk | Tracked | Workspaces changes appear and are also written to disk |
| Overrides (Local Overrides feature) | Yes | Override file edits appear as changes |

The most common misconception is that editing the HTML tree in the Elements panel would be tracked. It is not — the Changes panel is purely for stylesheet and script source files.

---

## 5. Reading the Diff

The Changes panel uses the **unified diff format**, which is the same format produced by `git diff` or `diff -u`. Understanding it is essential for extracting your changes accurately.

### Anatomy of a Unified Diff

```diff
--- a/css/styles.css
+++ b/css/styles.css
@@ -45,9 +45,11 @@
 .card {
   border-radius: 4px;
-  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
+  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
   padding: 16px;
+  transition: box-shadow 0.2s ease;
 }
 
 .card:hover {
-  background-color: #f5f5f5;
+  background-color: #eef2ff;
+  cursor: pointer;
 }
```

**Line-by-line breakdown:**

- `--- a/css/styles.css` — the "before" file (what the file looked like before your edits).
- `+++ b/css/styles.css` — the "after" file (what the file looks like with your edits applied).
- `@@ -45,9 +45,11 @@` — the hunk header. `-45,9` means the original content started at line 45 and spanned 9 lines. `+45,11` means the modified version starts at line 45 and spans 11 lines (2 lines were added).
- Lines starting with `-` (displayed with a red/pink background in DevTools) — lines that were removed or replaced.
- Lines starting with `+` (displayed with a green background in DevTools) — lines that were added or are the replacement.
- Lines with no prefix (neutral background) — context lines. They are unchanged and exist in the diff only to give you surrounding context for each edit hunk.

### Practical Reading Tips

- If you see a `-` line immediately followed by a `+` line with similar content, that is a value change on an existing property.
- Multiple `+` lines with no corresponding `-` lines mean new properties were added.
- A `-` line with no corresponding `+` line means a property was deleted.
- Multiple `@@ ... @@` sections in one file diff mean changes were made in several non-adjacent areas of the same file. Each section is an independent hunk.

---

## 6. Multiple Files Tracked

When your session involves edits to more than one file — for example, tweaking a component's CSS in `components.css` and also fixing a JavaScript function in `app.js` — both files appear in the left column file list.

**Navigating between changed files:**

- Click any file in the left column to load its diff in the right column.
- The panel does not combine diffs from multiple files into a single view. Each file is reviewed individually.
- The file list is ordered by the time the first change to each file was made (earliest first).

**Identifying which file to look at:**

DevTools shows the file path as it appears in the network request, which usually mirrors your project directory structure. For example:

```
/static/css/main.chunk.css     <- bundled React app CSS
/js/app.bundle.js              <- bundled JavaScript
/styles/base.css               <- unbundled CSS link
```

If you are working with source maps, the Changes panel may show the original source file path rather than the bundled output, depending on how source maps are configured.

---

## 7. Copying Changes

The **Copy** button in the top-right of the diff view copies the entire unified diff for the currently selected file to your clipboard.

**What gets copied:**

The raw diff text, including the `---`/`+++` header lines, all `@@` hunk headers, context lines, and `+`/`-` diff lines. This is exactly what `git diff` or `patch` would expect as input.

Example of what is copied to clipboard:

```diff
--- a/styles/main.css
+++ b/styles/main.css
@@ -103,6 +103,7 @@
 .nav-link {
   color: #555;
   font-size: 14px;
+  letter-spacing: 0.5px;
 }
```

**How to use the copied diff:**

- Paste it directly into your terminal and apply it with the `patch` command:
  ```bash
  patch -p1 < changes.diff
  ```
- Paste it into a code editor and manually apply the `+` lines to your source file.
- Share it with a colleague as a plain-text description of your changes.
- Use it as input in a code review or issue comment.

**Important:** The Copy button only copies the diff for the file currently visible in the right column. If you want diffs from multiple files, you must switch to each file and copy them individually. There is no "copy all changes" button that exports a multi-file patch.

---

## 8. Reverting Changes

**Reverting all changes via the button:**

The **Revert all changes** button at the bottom of the Changes panel undoes every tracked edit in one action. The page's CSS and JavaScript are restored to their state when DevTools was first opened. The file list in the Changes panel clears.

This is useful when you have been experimenting and want to start over from a clean state without reloading the page.

**Reverting by reloading the page:**

A hard reload (`Cmd+Shift+R` / `Ctrl+Shift+R`) or a normal reload (`Cmd+R` / `Ctrl+R`) discards all in-memory changes and fetches fresh files from the server. After a reload, the Changes panel is empty. This is the most thorough reset.

**Reverting a single file:**

There is no built-in "revert this one file" button in the Changes panel UI. To revert changes to a single file without affecting others, your options are:

1. Manually undo changes in the Styles pane by editing the properties back.
2. If using Workspaces, you can use your code editor's git history to revert the file on disk.
3. Copy the `-` lines from the diff and use them to manually reconstruct what to change back.

**There is no partial revert UI.** The Changes panel is a viewer, not an interactive undo tree. For granular undo, use `Cmd+Z` / `Ctrl+Z` while focus is in the Styles pane or the Sources editor immediately after the change.

---

## 9. Integration with Workspaces

Workspaces (also called "filesystem mapping" or "Local Overrides" in some DevTools versions) is a feature that maps DevTools directly to your local source files on disk. Understanding how Changes interacts with Workspaces is critical for a production-grade workflow.

### Without Workspaces (default behavior)

All edits exist only in browser memory. The Changes panel records them. When you reload, everything is lost. You must manually copy changes from the Changes panel to your source files.

### With Workspaces enabled

1. Go to **Sources > Filesystem** (or in newer DevTools, **Sources > Overrides** for Local Overrides).
2. Click **Add folder to workspace** and select your project's source directory.
3. Grant DevTools permission to access that directory.
4. Chrome maps network requests to local files.

Now when you edit a CSS property in the Styles pane:

- The change is reflected live in the browser as usual.
- The change is **also written to disk** immediately — your actual `.css` file on the filesystem is updated.
- The Changes panel still shows the diff, now acting as a change log for what was written to disk during the session.

**The key behavioral difference with Workspaces:**

| Scenario | Changes Panel Shows | Written to Disk |
|---|---|---|
| No Workspaces, edit CSS | Yes — shows diff | No |
| No Workspaces, reload | Panel cleared | No |
| Workspaces active, edit CSS | Yes — shows diff | Yes, immediately |
| Workspaces active, reload | Panel cleared on reload, but disk files retain changes | Yes — changes persist |

### Local Overrides vs. Workspaces

Chrome DevTools has two related but distinct features:

- **Workspaces:** Maps a local folder directly to the served files. Edits go to the original source files. Best for projects where you are serving files directly from the source directory (e.g., a simple static site with a local server).
- **Local Overrides:** Saves override copies of specific files in a designated overrides folder. Original source files are not touched. DevTools serves the override version instead. Changes panel shows diffs against the override copies.

In both cases, the Changes panel accurately reflects what was modified. The difference is where those modifications are stored on disk.

---

## 10. Workflow: Extracting CSS Tweaks and Applying to Source Code

This is the primary use case for the Changes panel in day-to-day front-end work.

### The Problem It Solves

When visually debugging a UI, developers typically:

1. Inspect an element.
2. Tweak values in the Styles pane (padding, color, font-size, border-radius, etc.).
3. Iterate until the result matches the design.
4. Then realize they have made a dozen small changes across three stylesheets and cannot remember exactly what they changed.

Without the Changes panel, reconstructing those changes means either remembering each one or comparing the browser's rendered state to the source file manually.

### The Workflow

1. **Make changes freely.** Use the Styles pane as an interactive sandbox. Do not worry about taking notes as you go.
2. **Open the Changes panel.** `More Tools > Changes` or Command Menu `> Show Changes`.
3. **Review each file in the file list.** For each file, scan the diff to confirm the changes are intentional and correct.
4. **Copy the diff** using the Copy button.
5. **Apply to source.** Open your actual CSS file in your editor and apply the `+` lines from the diff.
6. **Verify.** Save the source file, rebuild if necessary, reload the page, confirm it looks correct.

### Tips for Keeping Changes Clean Before Copying

- Avoid toggling properties on and off multiple times. Each toggle creates additional diff noise, though DevTools usually collapses them into a clean final state.
- If you added an experimental rule you do not want to keep, revert it in the Styles pane (delete the property) before copying from the Changes panel.
- If changes span multiple files, handle one file at a time: copy, apply to source, verify, then move to the next file.

---

## 11. Step-by-Step Workflow Example

This end-to-end example demonstrates the full Changes panel workflow for a realistic scenario: updating a card component's visual style.

### Setup

Assume you have a webpage at `http://localhost:3000` with a `.card` component. The card has too much shadow, the border-radius feels too sharp, and the hover state is not defined. You want to fix all three issues.

Your source file is `src/styles/components.css`.

### Step 1: Inspect and Tweak in the Styles Pane

1. Open the page in Chrome. Open DevTools (`F12`).
2. Click the **Elements** panel. Hover over a `.card` element and click to inspect it.
3. In the **Styles** pane on the right, find the `.card {}` rule block.
4. Click on the `box-shadow` value and change it from `0 2px 8px rgba(0,0,0,0.3)` to `0 4px 16px rgba(0,0,0,0.08)`.
5. Click on the `border-radius` value and change it from `2px` to `8px`.
6. Scroll down in the Styles pane. Click the `+` button to add a new rule. Type `.card:hover` and press Enter.
7. In the new `.card:hover {}` rule, add `box-shadow: 0 8px 24px rgba(0,0,0,0.12)` and `transform: translateY(-2px)`.

### Step 2: Open the Changes Panel

1. Click the three-dot menu in DevTools.
2. Hover **More Tools** and click **Changes**.
3. The Changes panel opens in the drawer at the bottom of DevTools.

### Step 3: Review the Diff

The file list on the left shows `components.css` (or the full path as served). Click it. The diff view shows:

```diff
--- a/src/styles/components.css
+++ b/src/styles/components.css
@@ -18,7 +18,14 @@
 .card {
   background: #ffffff;
-  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
+  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
-  border-radius: 2px;
+  border-radius: 8px;
   padding: 20px;
   margin-bottom: 16px;
 }
+
+.card:hover {
+  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
+  transform: translateY(-2px);
+}
```

Verify that this matches your intentions. Everything looks correct.

### Step 4: Copy the Diff

Click the **Copy** button in the top-right of the diff view. The diff is now on your clipboard.

### Step 5: Apply to Your Source File

Open `src/styles/components.css` in your editor (VS Code, Vim, etc.).

Find the `.card {}` block. Apply the changes manually:

- Change `box-shadow: 0 2px 8px rgba(0,0,0,0.3)` to `box-shadow: 0 4px 16px rgba(0,0,0,0.08)`.
- Change `border-radius: 2px` to `border-radius: 8px`.
- After the closing `}` of `.card`, add the new `.card:hover {}` block.

Alternatively, if your project uses `patch`:

```bash
# Save the clipboard content to a file first
pbpaste > card-changes.diff   # macOS
# or: xclip -selection clipboard -o > card-changes.diff  (Linux)

# Apply the patch
patch -p1 < card-changes.diff
```

### Step 6: Verify

Save the source file. If your project uses a build step (webpack, Vite, etc.), it will hot-reload automatically. If not, reload the browser tab. The card should now render with the updated shadow, rounded corners, and the hover effect.

### Step 7: Clean Up

Delete `card-changes.diff` if you created it. The Changes panel in DevTools still shows the session diff, but you can ignore it or reload the page to clear it.

---

## 12. Limitations

### Changes Are Lost on Page Reload

This is the most important limitation to internalize. The Changes panel is entirely in-memory. A page reload — whether triggered by pressing `R`, using the browser's reload button, or by hot module replacement (HMR) in a dev server — clears all tracked changes. There is no recovery.

**Mitigation:** If you are about to reload and have unsaved changes in the panel, copy each file's diff to a text file or directly apply them to your source files before reloading.

### No Direct "Export as Patch File" from the UI

There is no button to export all tracked changes as a single `.patch` or `.diff` file. You must:

- Copy each file's diff individually using the Copy button.
- Manually concatenate them if you need a multi-file patch.

**Workaround:** For multi-file sessions, use the Command Menu to open each changed file and copy its diff before proceeding.

### No Timestamp or Session History

The Changes panel records what changed during the current session, but it does not record when each change was made, how many intermediate states existed, or provide a history of revisions. You see only the final diff from the session start state to the current state. If you changed a property five times during the session, the diff only shows the difference between the first value and the last value.

### Only Tracks File-Backed Resources

Changes to inline `<style>` tags or `<script>` tags embedded directly in HTML are not tracked with the same fidelity as external file edits. The Changes panel may attribute those changes to the HTML document URL but the diff context can be harder to apply back to source.

### No Syntax Validation

The Changes panel does not validate that your edits are valid CSS or JavaScript. If you type an invalid value in the Styles pane and it gets silently rejected by the browser, the Changes panel may show no change, or may show the last accepted value. Always verify the final rendered state matches your intent before applying the diff to source.

### Source Maps and Bundled Files

If your project uses bundlers (webpack, Rollup, Vite) and the Changes panel shows diffs against the bundled output (`main.chunk.css`, `bundle.js`) rather than the original source files, those diffs cannot be applied directly to your source. You must interpret the changed values and apply them manually to the original source files. Source maps help with JS debugging but their support in the Changes panel for CSS has historically been inconsistent — verify in your specific DevTools version.

---

## 13. Advanced: Workspaces + Changes Panel for Live-Edit and Design-to-Code Workflows

### Live-Edit Workflow with Workspaces

The Changes panel becomes dramatically more powerful when combined with Workspaces because the copy-and-paste step is eliminated entirely.

**Setup:**

1. Start your local development server (e.g., `npm run dev` at `http://localhost:5173`).
2. Open DevTools and go to **Sources > Filesystem**.
3. Click **Add folder to workspace** and select your project root.
4. Grant Chrome the requested file access permission. A green dot appears next to files in the Sources panel that are successfully mapped.
5. Ensure your dev server serves files directly from the source directory without an intermediate build step for CSS (Vite and Parcel handle this well; webpack requires additional configuration).

**The live-edit loop:**

1. Inspect an element and edit properties in the Styles pane as normal.
2. Every save is written immediately to your source file on disk.
3. Your editor (VS Code, etc.) reflects the change in real time.
4. The Changes panel logs the diff for your reference, giving you a session-level summary of everything modified.
5. When you are done, commit the changes from your editor using normal git workflow. No manual copy-paste needed.

**Benefit of the Changes panel in this context:** Even though Workspaces saves changes automatically, the Changes panel remains valuable as a session summary. Before committing, open it to review all the CSS properties you touched during the session, catching any accidental edits or experimental rules you forgot to clean up.

### Design-to-Code Handoff Workflow

The Changes panel is useful in handoff scenarios where a designer or reviewer makes visual adjustments in the browser and a developer needs to implement them in code.

**Scenario:** A designer has access to the staging environment but not the codebase. They open DevTools, make visual adjustments to match a Figma spec, and need to communicate those adjustments to a developer.

**Workflow:**

1. Designer opens the staging URL in Chrome.
2. Opens DevTools and uses the Styles pane to adjust spacing, typography, colors, and layout until the page matches the spec.
3. Opens the Changes panel, navigates to each changed file, copies the diff.
4. Pastes the diffs into the relevant GitHub issue, pull request comment, or Slack message.

The developer receives a precise, structured description of every change needed — not a list of vague instructions like "make the button bigger" but an exact diff:

```diff
--- a/components/Button.css
+++ b/components/Button.css
@@ -5,6 +5,6 @@
 .btn-primary {
-  padding: 8px 16px;
+  padding: 10px 20px;
-  font-size: 13px;
+  font-size: 14px;
 }
```

This eliminates ambiguity in the handoff and reduces back-and-forth between design and development.

### Using Changes Panel as a Pre-Commit Review Tool

In a Workspaces setup where edits are written to disk automatically, it is easy to accidentally introduce changes you did not intend to keep (e.g., debugging experiments left in place). Before running `git add`, open the Changes panel and treat it as a pre-commit review:

- Scan each file's diff in the panel.
- Look for properties that were added experimentally and not cleaned up.
- Look for any `!important` hacks added during debugging that should not be committed.
- Cross-reference the diff against your intended design changes.

This habit adds a structured review step between "experimenting in the browser" and "committing to version control," reducing the chance of noisy or incorrect commits.

### Combining with Local Overrides for Third-Party Sites

Local Overrides (a related but distinct DevTools feature) lets you override files on any website, not just your own. The Changes panel works with Local Overrides just as it does with Workspaces. This is useful for:

- Debugging CSS issues on a production site you have access to but cannot serve locally.
- Preparing a patch for a third-party library hosted on a CDN.
- Prototyping changes to a client's live site before implementing them in the CMS.

In all cases, the workflow is identical: make changes, review the diff in the Changes panel, copy the diff, apply it to the real source.

---

## Quick Reference

| Task | How to Do It |
|---|---|
| Open Changes panel | `...` menu > More Tools > Changes, or `Cmd+Shift+P` > "Show Changes" |
| See what changed in a file | Click the file in the left column |
| Copy a file's diff | Click the Copy button (top-right of diff view) |
| Revert all session changes | Click "Revert all changes" button |
| Clear the panel (without reverting) | Reload the page |
| Prevent losing changes on reload | Set up Workspaces or copy diffs before reloading |
| Apply diff with patch command | `patch -p1 < changes.diff` |
| Track changes to disk automatically | Sources > Filesystem > Add folder to workspace |

---

[← Web Devtools](/coding/web-devtools/)
