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
        // default 로 들여온다(import useSettingStore from) — 예전엔 default 가 없어 늘 기본 시간대(서울)로 셌다
        if (id === "@/store/useSettingStore") return { default: { getState: () => ({ timezone }) }, getState: () => ({ timezone }) };
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
// 여러 날 일정은 한 번 끝낸다 — 가운데 날에 적힌 예전 기록도 그 회차를 끝낸 것으로 (src/lib/todoDone.ts)
assert.equal(snapshot.todos.find(td => td.id === "multi-day").done, true, "A multi-day task ticked on any of its days is done");
assert.equal("completedDates" in snapshot.todos[0], false);
const occurrences = snapshot.todos.filter(td => td.id === "repeat");
assert.equal(occurrences.length, 3);
assert.deepEqual(occurrences.map(td => td.done), [false, true, false]);
assert.equal(snapshot.todos[0].color, "#123456");

const { localDateKey } = sourceModule("src/lib/dateKey.ts");
const { weeklyTaskStats } = sourceModule("src/lib/widgetStats.ts");
const weekStats = weeklyTaskStats([task], '2026-09-27');
assert.equal(weekStats.total, 3, 'Multi-day tasks count each scheduled day in the week');
assert.equal(weekStats.done, 3, 'A finished multi-day task counts as done on each of its days');
assert.deepEqual(weekStats.categories.get('c'), { total: 3, done: 3 }, 'Category rows must use the same weekly measure as the total');
const clippedStats = weeklyTaskStats([task], '2026-10-03');
assert.deepEqual(clippedStats.categories.get('c'), { total: 1, done: 1 });
const openTask = { ...task, completions: [] };
assert.deepEqual(weeklyTaskStats([openTask], '2026-09-27').categories.get('c'), { total: 3, done: 0 });
const { doneKeysIn, toggleOccurrence } = sourceModule('src/lib/todoDone.ts');
assert.deepEqual(doneKeysIn(task), ['2026-10-02']);
assert.deepEqual(doneKeysIn({ ...task, repeat: 1 }), [], 'Repeating occurrences only count a tick on their own first day');
const toggled = [];
await toggleOccurrence(task, async (k) => { toggled.push(k); });
assert.deepEqual(toggled, ['2026-10-02'], 'Unticking a finished occurrence clears the tick inside it');
toggled.length = 0;
await toggleOccurrence(openTask, async (k) => { toggled.push(k); });
assert.deepEqual(toggled, ['2026-10-01'], 'Ticking writes the first day of the occurrence');
const { zonedDayStart, addDaysToKey } = sourceModule("src/lib/timezone.ts");
const { shiftZonedDays, calendarDayDelta, dependencyIssue, overlapsCalendarDays } = sourceModule("src/lib/taskInteractions.ts");
const { resizeZonedRange } = sourceModule("src/lib/taskInteractions.ts");
assert.deepEqual(resizeZonedRange('2026-10-02T09:30:00+09:00','2026-10-04T10:30:00+09:00','end',2,'Asia/Seoul'),{startAt:'2026-10-02T00:30:00.000Z',endAt:'2026-10-06T01:30:00.000Z'});
assert.deepEqual(resizeZonedRange('2026-10-02T09:30:00+09:00','2026-10-04T10:30:00+09:00','start',1,'Asia/Seoul'),{startAt:'2026-10-03T00:30:00.000Z',endAt:'2026-10-04T01:30:00.000Z'});
assert.equal(resizeZonedRange('2026-10-02T09:30:00+09:00','2026-10-04T10:30:00+09:00','end',-3,'Asia/Seoul'),null);
assert.equal(calendarDayDelta("2026-12-31", "2027-01-02"), 2);
assert.equal(shiftZonedDays("2026-12-31T09:30:00+09:00", 1, "Asia/Seoul"), "2027-01-01T00:30:00.000Z");
assert.equal(shiftZonedDays("2026-03-07T09:00:00-08:00", 1, "America/Los_Angeles"), "2026-03-08T16:00:00.000Z", "A spring DST move must preserve 9 AM, rather than shifting it to 10 AM");
assert.equal(shiftZonedDays("2026-10-31T09:00:00-07:00", 1, "America/Los_Angeles"), "2026-11-01T17:00:00.000Z");
assert.equal(shiftZonedDays("2026-03-08T09:00:00-07:00", -1, "America/Los_Angeles"), "2026-03-07T17:00:00.000Z");
assert.equal(shiftZonedDays("2026-03-07T02:30:00-08:00", 1, "America/Los_Angeles"), "2026-03-08T10:30:00.000Z", "A nonexistent 2:30 AM advances to 3:30 AM during the DST gap");
assert.ok(overlapsCalendarDays("2026-10-03T09:30:00+09:00", "2026-10-03T10:30:00+09:00", "2026-09-27", "2026-10-03", "Asia/Seoul"), "A task starting after midnight on Saturday must remain visible in its week");
assert.equal(overlapsCalendarDays("2026-10-04T00:00:00+09:00", "2026-10-04T10:30:00+09:00", "2026-09-27", "2026-10-03", "Asia/Seoul"), false);
// 끝이 딱 0시인 일정(밤 11시 + 기본 한 시간)은 다음 날에 걸치지 않는다
assert.equal(overlapsCalendarDays("2026-10-03T23:00:00+09:00", "2026-10-04T00:00:00+09:00", "2026-10-04", "2026-10-10", "Asia/Seoul"), false, "An event ending exactly at midnight must not reach into the next week");
assert.ok(overlapsCalendarDays("2026-10-03T23:00:00+09:00", "2026-10-04T00:00:00+09:00", "2026-09-27", "2026-10-03", "Asia/Seoul"));
const { endDateKey } = sourceModule("src/lib/dateKey.ts");
assert.equal(endDateKey("2026-10-03T23:00:00+09:00", "2026-10-04T00:00:00+09:00"), "2026-10-03");
assert.equal(endDateKey("2026-10-04T00:00:00+09:00", "2026-10-04T00:00:00+09:00"), "2026-10-04", "A zero-length event at midnight stays on its own day");
assert.equal(endDateKey("2026-10-03T23:00:00+09:00", "2026-10-04T00:30:00+09:00"), "2026-10-04");
assert.equal(weeklyTaskStats([{ ...task, startAt: "2026-10-03T23:00:00+09:00", endAt: "2026-10-04T00:00:00+09:00", completions: [] }], "2026-10-04").total, 0, "A Saturday 23:00-24:00 event must not count in the next week");
const { isBetween } = sourceModule("src/utils/DateUtils.tsx");
// 이 세 줄은 이 기기 시각으로 적었다 — 고른 시간대를 이 기기의 것으로 두고 본다(isBetween 은 일정을 고른 시간대의 날로 센다)
timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
assert.equal(isBetween(new Date(2026, 9, 4), new Date(2026, 9, 3, 23), new Date(2026, 9, 4, 0)), false, "The calendar must not draw a 23:00-24:00 event on the next day");
assert.ok(isBetween(new Date(2026, 9, 3), new Date(2026, 9, 3, 23), new Date(2026, 9, 4, 0)));
assert.ok(isBetween(new Date(2026, 9, 4), new Date(2026, 9, 3, 23), new Date(2026, 9, 4, 0, 30)));
timezone = "Asia/Seoul";
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

// 고른 시간대가 기기와 달라도 달력·일간·고르개·창이 홈과 같은 날·시각을 쓴다 (src/lib/dateKey.ts 의 칸 Date·zonedTime).
// 기기 시간대와 상관없이 같은 답이어야 한다 — 같으면 예전(이 기기 Date) 셈, 다르면 고른 시간대 셈을 탄다
const { zonedTimeToDate, zonedWallTime } = sourceModule("src/lib/timezone.ts");
assert.equal(zonedTimeToDate("2026-03-08", 2, 30, "America/Los_Angeles").toISOString(), "2026-03-08T10:30:00.000Z", "A wall time in the spring gap moves forward like new Date()");
assert.equal(zonedTimeToDate("2026-11-01", 1, 30, "America/Los_Angeles").toISOString(), "2026-11-01T08:30:00.000Z", "A repeated fall-back wall time takes the earlier instant");
assert.equal(zonedTimeToDate("2026-10-04", 0, 0, "Australia/Sydney").toISOString(), "2026-10-03T14:00:00.000Z", "Midnight on an eastern DST day keeps that day's own offset");
assert.equal(zonedTimeToDate("2026-04-05", 2, 30, "Australia/Sydney").toISOString(), "2026-04-04T15:30:00.000Z");
assert.deepEqual(zonedWallTime("2026-10-12T14:30:00Z", "America/Los_Angeles"), { year: 2026, month: 10, day: 12, hour: 7, minute: 30, second: 0 });
const dateKeys = sourceModule("src/lib/dateKey.ts");
const { toLocalInput, fromLocalInput, todayKey } = sourceModule("src/lib/localTime.ts");
const { expandTodos } = sourceModule("src/hooks/useExpandedTodos.tsx");
assert.equal(dateKeys.labelKey(new Date(2026, 9, 12, 23, 30)), "2026-10-12", "A calendar cell's day is its own date, not the chosen zone's reading of it");
assert.equal(dateKeys.labelDate("2026-10-12").getDate(), 12);
assert.equal(dateKeys.zonedTime("2026-10-12", 7, 30).toISOString(), "2026-10-12T14:30:00.000Z");
assert.equal(dateKeys.wallTime("2026-10-13T03:00:00Z").hour, 20);
const wallDate = dateKeys.toWallDate("2026-10-13T03:00:00Z");
assert.deepEqual([wallDate.getDate(), wallDate.getHours()], [12, 20], "A cell Date carries the chosen zone's wall clock");
assert.equal(dateKeys.fromWallDate(wallDate).toISOString(), "2026-10-13T03:00:00.000Z");
assert.equal(toLocalInput("2026-10-12T14:30:00Z"), "2026-10-12T07:30", "Pickers show the chosen zone's wall clock");
assert.equal(fromLocalInput("2026-10-12T07:30"), "2026-10-12T14:30:00.000Z", "Pickers save the chosen zone's wall clock");
assert.equal(fromLocalInput("2026-10-12", "23:59"), "2026-10-13T06:59:00.000Z");
assert.equal(todayKey(new Date("2026-10-12T05:00:00Z")), "2026-10-11");
// 로스앤젤레스 10/12 저녁 8시 = 서울 10/13 정오 — 칸은 고른 시간대의 날(10/12)에 세운다
const evening = { id: "evening", title: "저녁", categoryId: "c", repeat: 0, startAt: "2026-10-13T03:00:00Z", endAt: "2026-10-13T04:00:00Z", completions: [] };
assert.ok(isBetween(dateKeys.labelDate("2026-10-12"), evening.startAt, evening.endAt), "A calendar cell matches the chosen-zone day of an event");
assert.equal(isBetween(dateKeys.labelDate("2026-10-13"), evening.startAt, evening.endAt), false);
assert.equal(expandTodos([evening], dateKeys.zonedTime("2026-10-12"), dateKeys.zonedTime("2026-10-12")).length, 1, "The window spans the chosen-zone day, not the device day");
assert.equal(expandTodos([evening], dateKeys.zonedTime("2026-10-13"), dateKeys.zonedTime("2026-10-13")).length, 0);
const nineAm = { ...evening, id: "nine", repeat: 1, repeatCount: 4, startAt: "2026-03-06T17:00:00Z", endAt: "2026-03-06T18:00:00Z" };
assert.deepEqual(expandTodos([nineAm], dateKeys.zonedTime("2026-03-01"), dateKeys.zonedTime("2026-03-31")).map(o => o.startAt),
    ["2026-03-06T17:00:00.000Z", "2026-03-07T17:00:00.000Z", "2026-03-08T16:00:00.000Z", "2026-03-09T16:00:00.000Z"], "Repeats keep 9 AM in the chosen zone across its DST change");
assert.deepEqual(expandTodos([{ ...nineAm, repeatCount: null, startAt: "2026-01-05T17:00:00Z", endAt: "2026-01-05T18:00:00Z" }], dateKeys.zonedTime("2026-03-07"), dateKeys.zonedTime("2026-03-09")).map(o => o.startAt),
    ["2026-03-07T17:00:00.000Z", "2026-03-08T16:00:00.000Z", "2026-03-09T16:00:00.000Z"], "Skipping ahead to the window keeps the wall time");
const until = { ...evening, id: "until", repeat: 1, repeatEndDate: fromLocalInput("2026-10-14", "00:00") };
assert.deepEqual(expandTodos([until], dateKeys.zonedTime("2026-10-10"), dateKeys.zonedTime("2026-10-20")).map(o => dateKeys.localDateKey(o.startAt)),
    ["2026-10-12", "2026-10-13", "2026-10-14"], "A repeat runs through its last chosen-zone day");
// 기기와 같은 시간대면 예전 셈(이 기기 Date) 그대로다
timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
assert.ok(dateKeys.sameAsDevice());
assert.equal(dateKeys.zonedTime("2026-10-12", 9, 30).getTime(), new Date(2026, 9, 12, 9, 30).getTime());
assert.ok(Math.abs(dateKeys.wallNow().getTime() - Date.now()) < 1000, "With the device's own zone, now is just now");
assert.equal(fromLocalInput("2026-10-12T09:30"), new Date("2026-10-12T09:30").toISOString());
timezone = "America/Los_Angeles";

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
