#!/usr/bin/env node
// Prints the Herdr todo list of the space this terminal belongs to.
// Herdr labels each terminal with its space ("herdr.space"); the todo mod keeps
// shared "todo.bySpace" = { spaceId: [{ text, done }] } in shared.json.
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");

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
