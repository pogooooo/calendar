/** Regression checks for day-specific widget data and touch gestures. No browser or account required. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const cache = new Map();
let timezone = "Asia/Seoul";
const hookCleanups = [];
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
        if (id === "react" && filename.endsWith("useDragTarget.ts")) {
            return { useRef: value => ({ current: value }), useState: value => [value, () => {}], useEffect: fn => hookCleanups.push(fn()) };
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
const { inkOnFill } = sourceModule("src/styles/color.ts");
assert.equal(inkOnFill(themes.celestial.colors.primary), '#111111');
assert.equal(inkOnFill(themes['celestial-dark'].colors.primary), '#111111');
assert.equal(inkOnFill(themes.maple.colors.primary), '#FFFFFF');
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
const { weeklyTaskStats } = sourceModule("src/lib/widgetStats.ts");
const weekStats = weeklyTaskStats([task], '2026-09-27');
assert.equal(weekStats.total, 3, 'Multi-day tasks count each scheduled day in the week');
assert.equal(weekStats.done, 1, 'A completion on another day of the week must count');
assert.deepEqual(weekStats.categories.get('c'), { total: 3, done: 1 }, 'Category rows must use the same weekly measure as the total');
const clippedStats = weeklyTaskStats([task], '2026-10-03');
assert.deepEqual(clippedStats.categories.get('c'), { total: 1, done: 0 });
const { zonedDayStart, addDaysToKey } = sourceModule("src/lib/timezone.ts");
const { shiftZonedDays, calendarDayDelta, dependencyIssue, overlapsCalendarDays } = sourceModule("src/lib/taskInteractions.ts");
assert.equal(calendarDayDelta("2026-12-31", "2027-01-02"), 2);
assert.equal(shiftZonedDays("2026-12-31T09:30:00+09:00", 1, "Asia/Seoul"), "2027-01-01T00:30:00.000Z");
assert.equal(shiftZonedDays("2026-03-07T09:00:00-08:00", 1, "America/Los_Angeles"), "2026-03-08T16:00:00.000Z", "A spring DST move must preserve 9 AM, rather than shifting it to 10 AM");
assert.equal(shiftZonedDays("2026-10-31T09:00:00-07:00", 1, "America/Los_Angeles"), "2026-11-01T17:00:00.000Z");
assert.equal(shiftZonedDays("2026-03-08T09:00:00-07:00", -1, "America/Los_Angeles"), "2026-03-07T17:00:00.000Z");
assert.equal(shiftZonedDays("2026-03-07T02:30:00-08:00", 1, "America/Los_Angeles"), "2026-03-08T10:30:00.000Z", "A nonexistent 2:30 AM advances to 3:30 AM during the DST gap");
assert.ok(overlapsCalendarDays("2026-10-03T09:30:00+09:00", "2026-10-03T10:30:00+09:00", "2026-09-27", "2026-10-03", "Asia/Seoul"), "A task starting after midnight on Saturday must remain visible in its week");
assert.equal(overlapsCalendarDays("2026-10-04T00:00:00+09:00", "2026-10-04T10:30:00+09:00", "2026-09-27", "2026-10-03", "Asia/Seoul"), false);
const graph = [{ id: "a", blockedBy: [] }, { id: "b", blockedBy: [{ id: "a" }] }, { id: "c", blockedBy: [{ id: "b" }] }, { id: "d", blockedBy: [] }];
assert.equal(dependencyIssue(graph, "a", "a"), "self");
assert.equal(dependencyIssue(graph, "a", "b"), "duplicate");
assert.equal(dependencyIssue(graph, "c", "a"), "cycle", "Indirect cycles must be rejected");
assert.equal(dependencyIssue(graph, "d", "a"), null);
assert.equal(dependencyIssue(graph, "missing", "a"), "missing");
const { UpdateTodoSchema } = sourceModule("src/lib/schema.ts");
assert.equal(UpdateTodoSchema.parse({ id: 'repeat', excludedDates: '["2026-10-11"]' }).excludedDates, '["2026-10-11"]', "Moved exclusions must reach the API instead of being silently stripped");
assert.equal(UpdateTodoSchema.safeParse({ id: 'repeat', excludedDates: '["2026-02-30"]' }).success, false);
assert.equal(UpdateTodoSchema.safeParse({ id: 'repeat', excludedDates: '{"invalid":true}' }).success, false);
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

const projectStore = sourceModule("src/store/useProjectStore.ts").default;
const originalProjects = [{ id: "p", title: "Original", categoryId: "c", tasks: [{ id: "a", title: "First", blockedBy: [] }, { id: "b", title: "Second", blockedBy: [] }] }];
projectStore.setState({ projects: originalProjects });
try {
    console.error = () => {};
    const failed = async () => new Response(JSON.stringify({ message: "Retry your draft" }), { status: 503 });
    assert.equal(await projectStore.getState().updateProject(failed, "p", { title: "Unsaved" }), "Retry your draft");
    assert.deepEqual(projectStore.getState().projects, originalProjects);
    assert.equal(await projectStore.getState().addProject(failed, { title: "Unsaved", categoryId: "c" }), "Retry your draft");
    assert.deepEqual(projectStore.getState().projects, originalProjects);
    assert.equal(await projectStore.getState().addProjectTask(failed, "p", { title: "Unsaved" }), "Retry your draft");
    assert.deepEqual(projectStore.getState().projects, originalProjects);
    assert.equal(await projectStore.getState().updateProjectTask(failed, "p", "b", { blockedBy: [{ id: "a" }] }), "Retry your draft");
    assert.deepEqual(projectStore.getState().projects, originalProjects, "A failed dependency save must roll back the optimistic connection");
} finally { console.error = originalConsoleError; }

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

// Exercise the actual gesture controller without native input or a browser account.
const listeners = new Map();
const eventTarget = { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
let targetDate = '2026-10-03', prevented = 0;
globalThis.document = { ...eventTarget, documentElement: { setAttribute: () => {}, removeAttribute: () => {} }, elementFromPoint: () => ({ closest: () => targetDate ? ({ getAttribute: () => targetDate }) : null }) };
globalThis.window = eventTarget;
globalThis.requestAnimationFrame = fn => { fn(); return 1; };
globalThis.cancelAnimationFrame = () => {};
const element = { captured: false, hasPointerCapture() { return this.captured; }, setPointerCapture() { this.captured = true; }, releasePointerCapture() { this.captured = false; } };
const dropCalls = [];
const drag = sourceModule('src/hooks/useDragTarget.ts').default('data-calendar-date', (source, target) => dropCalls.push([source, target]));
const pointer = (clientX, pointerType = 'mouse') => ({ isPrimary:true, button:0, pointerType, pointerId:1, clientX, clientY:100, currentTarget:element, preventDefault: () => prevented++ });
drag.begin(pointer(100), 'click');
listeners.get('pointermove')(pointer(103)); listeners.get('pointerup')(pointer(103));
assert.deepEqual(dropCalls, []); assert.equal(drag.consumeClick(), false);
drag.begin(pointer(100), 'task');
listeners.get('pointermove')(pointer(140)); listeners.get('pointerup')(pointer(140));
assert.deepEqual(dropCalls, [['task','2026-10-03']]); assert.equal(drag.consumeClick(), true); assert.equal(drag.consumeClick(), false); assert.equal(element.captured, false);
drag.begin(pointer(100), 'cancelled'); listeners.get('pointermove')(pointer(150));
listeners.get('keydown')({ key:'Escape', preventDefault: () => prevented++ }); listeners.get('pointerup')(pointer(150));
assert.equal(dropCalls.length,1);
const beforeScroll = prevented;
drag.begin(pointer(100,'touch'), 'scroll'); listeners.get('pointermove')(pointer(120,'touch')); listeners.get('pointerup')(pointer(120,'touch'));
assert.equal(dropCalls.length,1); assert.equal(prevented,beforeScroll, 'A touch moving before the long press must remain a scroll');
drag.begin(pointer(100,'touch'), 'touch-task');
await new Promise(resolve => setTimeout(resolve,360));
listeners.get('pointerup')(pointer(140,'touch'));
assert.deepEqual(dropCalls[1], ['touch-task','2026-10-03']);
targetDate = null;
drag.begin(pointer(100), 'outside'); listeners.get('pointermove')(pointer(150)); listeners.get('pointerup')(pointer(150));
assert.equal(dropCalls.length,2, 'Dropping outside a target must not save');
hookCleanups.forEach(fn => fn?.());
console.log('Calendar drag, click suppression, cancellation, touch long-press and scroll checks passed; dependency cycles and project failure rollback checks passed.');
