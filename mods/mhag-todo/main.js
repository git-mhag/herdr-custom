// A simple todo list in the side panel. Done items move to a collapsed "Done" section.
// The send arrows paste a task (or all open ones) into the last focused terminal and press Enter;
// `todo` in a terminal prints that space's list (bin/todo.js reads shared.json).
import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { theme, shared, setShared, spaces, focused, hc, notify } from "herdr";

// Todos are kept per space (a branch's worktree is its own space): shared "todo.bySpace" = { spaceId: [items] }.
const all = () => { const v = shared("todo.bySpace"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; };
const current = () => spaces().find(s => s.active)?.id;
const items = () => { const l = all()[current()]; return Array.isArray(l) ? l : []; };
const save = (list) => { const id = current(); if (id) setShared("todo.bySpace", { ...all(), [id]: list }); };

export default class Todo extends View {
  init() {
    this.doneOpen = false;
    this.typing = false;
    this.input = InputState.new({});
    this.text = "";
    this.input.on("change", (_e, cx) => { this.text = this.input.value(); cx.notify(); });
    this.input.on("submit", (_e, cx) => this.add(cx));
    this.input.on("focus", (_e, cx) => { this.typing = true; cx.notify(); });
    this.input.on("blur", (_e, cx) => { this.typing = false; cx.notify(); });
  }

  add(cx) {
    const text = this.input.value().trim();
    if (!text) return;
    save([...items(), { id: `${Date.now()}${Math.floor(Math.random() * 1000)}`, text, done: false }]);
    this.input.set_value("");
    this.text = "";
    cx.notify();
  }

  // Clicking this panel may take focus from the terminal, so remember the last focused one.
  send(text) {
    const term = this.lastTerm;
    if (!term) return notify({ title: "Todo", body: "Click a terminal first, then send.", level: "warning" });
    hc(["send", term, text]).then(r => { if (r.code) notify({ title: "Todo: send failed", body: r.stderr || r.stdout, level: "error" }); },
      e => notify({ title: "Todo: send failed", body: String(e), level: "error" }));
  }

  sendButton(id, onClick, t) {
    return div().id(id).size(20).flex_none().flex().items_center().justify_center().rounded(5).text_color(t.dim).cursor_pointer()
      .hover(s => s.bg(t.raised).text_color(t.foreground)).on_click(onClick)
      .child(svg("mods/mhag-todo/send.svg").size(12));
  }

  update(id, fn) { save(items().flatMap(i => i.id === id ? fn(i) : [i])); }

  row(i, t) {
    const box = div().id(`todo-box-${i.id}`).size(16).flex_none().flex().items_center().justify_center().rounded_full().border_1().border_color(t.border).cursor_pointer()
      .on_click(() => this.update(i.id, x => [{ ...x, done: !x.done }]))
      .when(i.done, el => el.bg(t.border).child(svg("mods/mhag-todo/check.svg").size(11).text_color(t.background)));
    return h_flex().id(`todo-${i.id}`).min_h(30).flex_none().px(8).py(5).gap(9).items_center().rounded(7).hover(s => s.bg(t.hover))
      .child(box)
      .child(div().flex_1().min_w(0).text_size(13).text_color(i.done ? t.dim : t.muted).when(i.done, el => el.line_through()).child(i.text))
      .when(!i.done, el => el.child(this.sendButton(`todo-send-${i.id}`, () => this.send(i.text), t)))
      .child(div().id(`todo-del-${i.id}`).size(20).flex_none().flex().items_center().justify_center().rounded(5).text_color(t.dim).cursor_pointer()
        .hover(s => s.bg(t.raised).text_color(t.foreground)).on_click(() => this.update(i.id, () => []))
        .child(svg("mods/mhag-todo/x.svg").size(12)));
  }

  render() {
    const t = theme();
    const f = focused();
    if (f?.terminal) this.lastTerm = f.terminal;
    const list = items();
    const open = list.filter(i => !i.done), done = list.filter(i => i.done);
    return v_flex().id("todo").size_full().min_h(0).overflow_hidden().bg(t.chrome).text_color(t.foreground).text_size(13)
      .child(h_flex().h(30).flex_none().px(10).gap(8).items_center().text_size(12).text_color(t.dim)
        .child(div().font_medium().child("Todo"))
        .child(div().flex_1().text_color(t.dim).text_right().child(open.length ? `${open.length} open` : ""))
        .when(open.length > 0, el => el.child(this.sendButton("todo-send-all", () => this.send(`Todo:\n${open.map(i => `- ${i.text}`).join("\n")}`), t))))
      .child(h_flex().flex_none().m(8).h(32).gap(6).items_center()
        .child(div().id("todo-input").flex_1().min_w(0).h_full().px(10).flex().items_center().rounded(8).bg(t.background).cursor_text()
          .on_mouse_down("left", (_e, cx) => cx.stop_propagation()).relative().child(Input.new(this.input).h_full().text_size(12).text_color(t.muted))
          // Own placeholder, styled like the "Todo" header (the input's own can't be colored).
          .when(!this.text, el => el.child(div().id("todo-ph").absolute().left(10).top(0).bottom(0).flex().items_center().text_size(12).font_medium().text_color(t.dim)
            .on_click(() => this.input.focus()).child("Add a task")))))
      .child(v_flex().id("todo-list").flex_1().min_h(0).overflow_y_scrollbar().px(6).pb(6)
        .children(open.map(i => this.row(i, t)))
        .when(!open.length, el => el.child(div().p(8).text_size(12).text_color(t.dim).child(done.length ? "All done" : "Nothing to do"))))
      // Pinned to the bottom: opening it grows the done list upward, the header stays put.
      .child(v_flex().flex_none().px(6).pb(6)
        .when(this.doneOpen, el => el.child(v_flex().id("todo-done").max_h(280).overflow_y_scrollbar().children(done.map(i => this.row(i, t)))))
        .child(h_flex().id("todo-done-head").h(28).flex_none().px(8).gap(7).items_center().rounded(7).text_size(11.5).text_color(t.dim).cursor_pointer()
          .hover(s => s.text_color(t.foreground))
          .on_click((_e, cx) => { this.doneOpen = !this.doneOpen; cx.notify(); })
          .child(svg(`mods/mhag-todo/chevron-${this.doneOpen ? "down" : "right"}.svg`).size(11).flex_none())
          .child(`Done · ${done.length}`)));
  }
}
