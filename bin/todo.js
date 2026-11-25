#!/usr/bin/env node
// Prints the Herdr todo list of the space this terminal belongs to.
// Herdr labels each terminal with its space ("herdr.space"); the todo mod keeps
// shared "todo.bySpace" = { spaceId: [{ text, done }] } in shared.json.
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");

// `todo --sync <json>` (run by the todo mod on every change): one Claude command per open task,
// ~/.claude/commands/todo-<task>.md, so typing /todo- lists them. <json>: [{ space, text }].
if (process.argv[2] === "--sync") {
  const dir = path.join(os.homedir(), ".claude", "commands");
  const MARK = "<!-- herdr-todo -->";
  fs.mkdirSync(dir, { recursive: true });
  const want = new Map();
  for (const { space, text } of JSON.parse(process.argv[3] || "[]")) {
    const base = "todo-" + (text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "task");
    let name = base;
    for (let n = 2; want.has(name); n++) name = `${base}-${n}`;
    const desc = `${space}: ${text}`.replace(/\s+/g, " ");
    want.set(name, `---
description: ${JSON.stringify(desc)}
---
${MARK}
Todo from the Herdr panel (space ${space}): ${text}

$ARGUMENTS

If nothing else is asked above, work on this todo.
`);
  }
  // Only files this sync wrote (they carry MARK) are removed.
  for (const f of fs.readdirSync(dir)) {
    if (!/^todo-.*\.md$/.test(f) || want.has(f.slice(0, -3))) continue;
    const full = path.join(dir, f);
    if (fs.readFileSync(full, "utf8").includes(MARK)) fs.unlinkSync(full);
  }
  for (const [name, body] of want) {
    const full = path.join(dir, `${name}.md`);
    if (!fs.existsSync(full) || fs.readFileSync(full, "utf8") !== body) fs.writeFileSync(full, body);
  }
  process.exit(0);
}

const all = process.argv.includes("--all");
const term = process.env.HC_TERMINAL_ID;
if (!term) { console.error("todo: not inside a Herdr terminal (HC_TERMINAL_ID is unset)"); process.exit(1); }

let space;
try { space = JSON.parse(execFileSync("hc", ["get", term, "--json"], { encoding: "utf8" })).labels?.["herdr.space"]; }
catch (e) { console.error(`todo: hc get ${term} failed: ${e.message}`); process.exit(1); }
if (!space) { console.error(`todo: terminal ${term} has no Herdr space`); process.exit(1); }

const home = process.env.HERDR_APP_HOME || path.join(os.homedir(), ".config", "herdr-app");
let shared = {};
try { shared = JSON.parse(fs.readFileSync(path.join(home, "shared.json"), "utf8")); } catch {}
const list = shared["todo.bySpace"]?.[space] ?? [];
const open = list.filter(i => !i.done), done = list.filter(i => i.done);

if (!open.length) console.log("Nothing to do");
for (const i of open) console.log(`[ ] ${i.text}`);
if (all) for (const i of done) console.log(`[x] ${i.text}`);
else if (done.length) console.log(`(${done.length} done, todo --all to show)`);
