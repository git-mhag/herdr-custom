# mhag

A flat, dark Herdr layout: one charcoal tone for all chrome, no divider lines, spaces as collapsible repo
folders with branch rows, and a per-space todo panel that can feed tasks to agents.

![mhag](preview.png)

## What you see

Left to right:

- **Sidebar** (268px, `#161615`): brand row (46px, Herdr logo at 60% opacity, "Herdr" in `muted`), the
  **Spaces** list (fills), the **Agents** list (fits its rows, at the bottom), and the settings footer (69px).
  No lines between them.
- **Work area:** tab bar (26px; 8px top padding so the 18px tab text sits centered), then the terminals with
  an 8px gap around them and the side panel (368px, hidden until chosen), then the status bar (28px).
- **Terminals:** background `#1B1B19`, pane header `#2B2B28` with no line under it, 1px outline `#3D4039`.
- **Side panel:** Files, Changes or Todo; no fill or outline, 30px header like the pane header.
- **Theme** `mhag`: chrome/canvas `#161615`, surface `#1B1B19`, raised/selected `#2B2B28`, hover `#222220`,
  border `#3D4039`, foreground `#c9c9c4`; working `#d19a66`, blocked `#e06c75`, done `#98c379`; Atom-like ANSI.
- **Text:** brightest is `foreground`; anything not selected uses `dim`. Tabs and panel buttons highlight by text
  color only, no fill or outline.

## How it behaves

- **Spaces:** a repo's main checkout is a folder row (name, open-todo total, chevron). Under it, a branch row per
  space: worktrees, and the main branch itself. Click a folder to fold it (stored in the mod's localStorage).
  Clicking a folded folder unfolds it and selects its first branch. A folder whose branches show a status dot can't fold.
  Only the active space's folder and branch are bright.
- **Branch row:** status dot, branch icon, the program icon of the space's shown tab (an agent first), branch name,
  open-todo count on the right. Dot: `working` orange, pulsing (opacity loop 1.2s), shown always; `blocked` red and
  `done` green, shown only while that agent's terminal isn't focused. `idle` shows nothing.
- **Agents panel:** click "Agents" to fold it to its header (41px); open, it resizes its block so every agent shows
  without scrolling.
- **Todo panel:** todos per space in shared `todo.bySpace` = `{ spaceId: [{ id, text, done }] }`. Circle checkbox
  (`border` outline; done: filled `border` with a tick in `background`). Done items move to a "Done · n" section
  pinned at the bottom that opens upward. The send arrow on a task, or in the header for all open tasks, writes
  `- task` lines to the clipboard, focuses the last focused terminal and runs `terminal.paste` (no Enter).
- **Claude commands:** on every change the todo mod runs `node ~/.local/bin/todo.js --sync <json>`, which writes
  `~/.claude/commands/todo-<task>.md` per open task (marked `<!-- herdr-todo -->`, only marked files get removed).
  `/todo` (static file) runs the `todo` CLI, which finds the terminal's space via `hc get $HC_TERMINAL_ID`
  (label `herdr.space`) and reads `shared.json`.
- **Side panel choice** (files, changes, todo or closed) is shared state `panel.open`, the same in every space and window.

## Built from

- Layout cloned from `main`; every mod is a `mod.clone` of the shipped one (`mhag-` prefix) plus the new `mhag-todo`.
- Node tree: `row root` → `column sidebar` (`brand`, `sidebar-lists` [`spaces`, `agents`], `sidebar-footer`) and
  `column work` (`tabs`, `row work-body` [`main`, `column panel` → `stack panel-body` [`files`, `changes`, `todo`]], `status`).
- `herdr` functions: `spaces`, `panes`, `agents`, `focused`, `layout`, `shared`/`setShared`, `run`, `exec`, `hc`, `notify`.
- Commands: `layout.select/show/hide/resize`, `space.select/move`, `pane.focus`, `terminal.paste`.
- Programs: `git` (spaces), `node` (todo sync), `hc` (todo CLI). Icons: Lucide.

## Watch out

- `this.folded` already exists in the spaces mod (machine headers); the folder helper is `isShut`.
- `hc send` always presses Enter, hence the clipboard + `terminal.paste` route; it replaces the clipboard.
- `shared.json` is written by Herdr in the background; edit shared state through `setShared`, not the file.
- Claude commands are global, so `/todo-` lists open todos from every space (the description names the space).
