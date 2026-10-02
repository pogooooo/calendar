/** Regression checks for day-specific widget data and touch gestures. No browser or account required. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const cache = new Map();
let timezone = "Asia/Seoul";
function sourceModule(relative) {
    const filename = path.resolve(relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const localRequire = (id) => {
        if (id === "@/store/useSettingStore") return { getState: () => ({ timezone }) };
        if (id === "@/store/useAuthStore") return { default: { getState: () => ({ user: { id: "local-test" } }) } };
        if (id === "@/lib/saveError") return { reportSaveFailure: () => {} };
        if (id === "react" && filename.endsWith("useSwipe.ts")) {
            return { useRef: (value) => ({ current: value }), useCallback: (fn) => fn };
        }
        if (id.startsWith("@/") || id.startsWith(".")) {
            const base = id.startsWith("@/") ? path.resolve("src", id.slice(2)) : path.resolve(path.dirname(filename), id);
            const resolved = [base, `${base}.ts`, `${base}.tsx`].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
            if (resolved) return sourceModule(resolved);
        }
        return require(id);
    };
    new Function("require", "module", "exports", code)(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
}

const { buildWidgetSnapshot } = sourceModule("src/lib/widgetSnapshot.ts");
const t = sourceModule("src/i18n/ko.ts").default;
const { themes } = sourceModule("src/styles/theme.ts");
const task = {
    id: "multi-day", title: "여러 날 일정", categoryId: "c", repeat: 0, isAllDay: true,
    startAt: "2026-10-01T00:00:00+09:00", endAt: "2026-10-03T23:59:00+09:00",
    completions: [{ targetDate: "2026-10-02T00:00:00.000Z" }],
};
const snapshot = buildWidgetSnapshot({
    todos: [task, { ...task, id: "repeat", title: "반복 일정", endAt: "2026-10-01T23:59:00+09:00", repeat: 1, repeatCount: 3 }],
    categories: [{ id: "c", name: "할 일", color: "#123456" }], challenges: [], anniversaries: [], projects: [],
    memo: "오늘의 메모", t, locale: "ko", theme: themes.celestial, now: new Date("2026-10-02T00:30:00+09:00"),
});
assert.equal(snapshot.date, "2026-10-02");
assert.deepEqual(snapshot.todos.find(td => td.id === "multi-day").completedDates, ["2026-10-02"]);
const occurrences = snapshot.todos.filter(td => td.id === "repeat");
assert.equal(occurrences.length, 3);
assert.deepEqual(occurrences.map(td => td.done), [false, true, false]);
assert.equal(snapshot.todos[0].color, "#123456");

const { localDateKey } = sourceModule("src/lib/dateKey.ts");
const { zonedDayStart, addDaysToKey } = sourceModule("src/lib/timezone.ts");
timezone = "America/Los_Angeles";
assert.equal(localDateKey(zonedDayStart("2026-10-02", timezone)), "2026-10-02");
assert.equal(addDaysToKey("2026-12-31", 1), "2027-01-01");
assert.equal(addDaysToKey("2026-03-01", -1), "2026-02-28");

const dailyStore = sourceModule("src/store/useDailyStore.ts").default;
const date = zonedDayStart("2026-10-02", timezone);
const originalConsoleError = console.error;
let failedSave;
try {
    console.error = () => {};
    failedSave = await dailyStore.getState().addDailyTask(async () => ({ ok: false }), date, "Keep my draft");
} finally { console.error = originalConsoleError; }
assert.ok(failedSave, "A failed quick add must return an error so the input can retain its draft");
assert.deepEqual(dailyStore.getState().tasks, [], "A failed optimistic quick add must roll back its temporary row");
const savedTask = { id: "saved-task", text: "Saved draft", isDone: false, date: date.toISOString() };
assert.equal(await dailyStore.getState().addDailyTask(async () => ({ ok: true, json: async () => savedTask }), date, savedTask.text), null);
assert.deepEqual(dailyStore.getState().tasks, [savedTask]);

const swipeFactory = sourceModule("src/hooks/useSwipe.ts").default;
let left = 0, right = 0;
const swipe = swipeFactory(() => left++, () => right++);
const container = {};
const target = (overflow = "visible", interactive = false) => ({
    scrollWidth: 200, clientWidth: 100, parentElement: container, overflow,
    closest: () => interactive ? {} : null,
});
globalThis.window = { getComputedStyle: node => ({ overflowX: node.overflow }) };
const begin = (node) => swipe.onTouchStart({ target: node, currentTarget: container, touches: [{ clientX: 100, clientY: 10 }] });
const end = () => swipe.onTouchEnd({ changedTouches: [{ clientX: 0, clientY: 12 }] });
begin(target("hidden")); end(); assert.equal(left, 1, "Clipped text must not prevent calendar navigation");
begin(target("auto")); end(); assert.equal(left, 1, "Horizontal lists retain their gesture");
begin(target("visible", true)); end(); assert.equal(left, 1, "Editing controls retain their gesture");
begin(target()); swipe.onTouchCancel(); end(); assert.equal(left, 1, "Cancelled gestures must not navigate");
begin(target()); swipe.onTouchMove({ touches: [{ clientX: 95, clientY: 120 }] }); end(); assert.equal(left, 1, "Vertical scrolling must not change the date");
begin(target()); swipe.onTouchMove({ touches: [{}, {}] }); end(); assert.equal(left, 1, "Pinch gestures must not change the date");
assert.equal(right, 0);
delete globalThis.window;
console.log("Widget completion dates, recurrence, date boundaries, quick-add failures and touch gesture regressions passed.");
