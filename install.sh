#!/bin/sh
# Installs the mhag layout, theme and mods into Herdr (macOS / Linux).
# Usage: ./install.sh   (re-run to update; only mhag files are replaced)
set -e
SRC=$(cd "$(dirname "$0")" && pwd)
APP=${HERDR_APP_HOME:-$HOME/.config/herdr-app}

[ -d "$APP" ] || { echo "No Herdr folder at $APP. Start Herdr once, then run this again." >&2; exit 1; }

echo "Herdr folder: $APP"
mkdir -p "$APP/layouts" "$APP/themes" "$APP/mods"
cp "$SRC/layouts/mhag.json" "$APP/layouts/"
cp "$SRC/themes/mhag.json" "$APP/themes/"
for m in "$SRC"/mods/mhag-*; do
  rm -rf "$APP/mods/$(basename "$m")"
  cp -R "$m" "$APP/mods/"
done
echo "  layout, theme and $(ls -d "$SRC"/mods/mhag-* | wc -l | tr -d ' ') mods copied"

# The `todo` command (prints a space's todos in its terminal) and the Claude /todo commands.
mkdir -p "$HOME/.local/bin" "$HOME/.claude/commands"
cp "$SRC/bin/todo.js" "$SRC/bin/todo" "$HOME/.local/bin/"
chmod +x "$HOME/.local/bin/todo"
cp "$SRC/claude/commands/todo.md" "$HOME/.claude/commands/"
echo "  todo command copied to ~/.local/bin, /todo to ~/.claude/commands"
case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) echo "  note: add ~/.local/bin to your PATH to use \`todo\`" ;; esac
command -v node >/dev/null 2>&1 || echo "  note: Node.js is not installed; \`todo\` and the /todo-<task> commands need it"

if command -v herdr-app >/dev/null 2>&1; then
  for m in "$APP"/mods/mhag-*; do herdr-app check "mods/$(basename "$m")" >/dev/null 2>&1 || echo "  check failed: $m" >&2; done
  herdr-app do layout.switch '{"name":"mhag"}' >/dev/null 2>&1 && echo "Switched to mhag." || echo "Pick \"mhag\" with ctrl-shift-l in Herdr."
else
  echo "Pick \"mhag\" with ctrl-shift-l in Herdr."
fi
