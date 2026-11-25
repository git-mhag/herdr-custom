# mhag for Herdr

A quieter, flatter skin for [Herdr](https://herdr.dev): one dark tone for the chrome, no divider lines,
spaces shown as collapsible folders with their branches, and a per-space todo list you can hand to your agents.
Fonts, functions and shortcuts are Herdr's own.

![mhag](preview.png)

## Install with Claude

Copy this prompt into Claude Code running in a Herdr terminal (the copy button is at the top right of the box):

```text
Install the mhag layout for Herdr from https://github.com/git-mhag/herdr-custom.
Clone the repo into a temporary folder and read README.md and both installers before running anything.
Then run install.ps1 on Windows (powershell -ExecutionPolicy Bypass -File install.ps1)
or ./install.sh on macOS and Linux. It copies the mhag layout, theme and mods into my Herdr folder,
the `todo` command into ~/.local/bin and the /todo command into ~/.claude/commands.
Tell me what it installed, whether every mod check passed, and anything I still need to do
(Node.js, ~/.local/bin on PATH). Do not change my other layouts, mods or settings.
```

## Install by hand

Needs Herdr (started at least once). Node.js is optional; it powers the `todo` command and the Claude `/todo` commands.

```sh
git clone https://github.com/git-mhag/herdr-custom
cd herdr-custom
./install.sh                                              # macOS / Linux
powershell -ExecutionPolicy Bypass -File install.ps1      # Windows
```

The installer copies `layouts/mhag.json`, `themes/mhag.json` and `mods/mhag-*` into your Herdr folder
(`~/.config/herdr-app`, or `$HERDR_APP_HOME`) and switches to the layout. Your own layouts, themes and mods are not touched;
re-running it updates the mhag files. Switch layouts any time with `ctrl-shift-l`.

It also installs:
- `todo` into `~/.local/bin`: prints the open todos of the space the terminal belongs to (`todo --all` adds the done ones).
- `/todo` into `~/.claude/commands`: in Claude Code, `/todo work out all todos` hands the list to the agent.

## What's different

- **Colors:** chrome `#161615`, terminals `#1B1B19`, pane headers `#2B2B28`, outlines `#3D4039`; no divider lines.
- **Spaces:** each repo is a folder with its branches (including `main`) underneath; click to fold. A branch row shows the
  running program's icon and a status dot: orange pulsing while an agent works, red when it needs input, green when it finished
  and you haven't looked. Folders with agent activity can't fold; opening a folded one selects its first branch.
- **Todo panel** next to Files and Changes: per space, round checkboxes, done items in a collapsed section at the bottom.
  The send arrow pastes `- task` lines into the last focused terminal without pressing Enter. Open-todo counts show in the sidebar.
  Every open task is also a Claude command, `/todo-<task>`.
- **Panels:** Files / Changes / Todo is one choice for all spaces and windows.
- **Agents panel** at the bottom, folds by clicking "Agents", grows to fit every agent.

## Uninstall

Delete `layouts/mhag.json`, `themes/mhag.json` and `mods/mhag-*` from your Herdr folder, plus `~/.local/bin/todo*`,
`~/.claude/commands/todo.md` and `~/.claude/commands/todo-*.md`.

## License

Apache-2.0. The mods are modified copies of Herdr's shipped layout and mods; see [NOTICE](NOTICE).
