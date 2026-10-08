import { addDaysToKey, zonedDateKey } from "./timezone";
import { lastInstant } from "@/utils/DateUtils";

/** Calendar-day arithmetic preserves wall-clock time across DST and month/year boundaries. */
export function shiftZonedDays(value: string | number | Date, days: number, timeZone: string): string {
    const original = new Date(value);
    const targetKey = addDaysToKey(zonedDateKey(original, timeZone), days);
    const format = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    const parts = (date: Date) => Object.fromEntries(format.formatToParts(date).map(p => [p.type, p.value]));
    const wall = parts(original);
    const desired = Date.parse(`${targetKey}T${wall.hour}:${wall.minute}:${wall.second}.000Z`) + original.getUTCMilliseconds();
    let candidate = original.getTime() + days * 86400000;
    const visited = new Set<number>();
    for (let i = 0; i < 3; i++) {
        if (visited.has(candidate)) {
            // A wall time in a spring DST gap advances by the missing hour.
            candidate = Math.max(candidate, ...visited);
            break;
        }
        visited.add(candidate);
        const p = parts(new Date(candidate));
        const actual = Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}.000Z`) + original.getUTCMilliseconds();
        const error = desired - actual;
        if (!error) break;
        candidate += error;
    }
    return new Date(candidate).toISOString();
}

export function overlapsCalendarDays(start: string | number | Date, end: string | number | Date, from: string, to: string, timeZone: string): boolean {
    return zonedDateKey(start, timeZone) <= to && zonedDateKey(lastInstant(start, end), timeZone) >= from;
}

export function calendarDayDelta(from: string, to: string): number {
    return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

/** Resize only one edge, preserving its time and rejecting an inverted interval. */
export function resizeZonedRange(start: string | number | Date, end: string | number | Date, edge: 'start' | 'end', days: number, timeZone: string) {
    const startAt = edge === 'start' ? shiftZonedDays(start, days, timeZone) : new Date(start).toISOString();
    const endAt = edge === 'end' ? shiftZonedDays(end, days, timeZone) : new Date(end).toISOString();
    return Date.parse(startAt) <= Date.parse(endAt) ? { startAt, endAt } : null;
}

type DependencyTask = { id: string; blockedBy?: { id: string }[] | null };
export function dependencyIssue(tasks: DependencyTask[], predecessor: string, successor: string): "self" | "duplicate" | "cycle" | "missing" | null {
    if (predecessor === successor) return "self";
    const byId = new Map(tasks.map(t => [t.id, t]));
    if (!byId.has(predecessor) || !byId.has(successor)) return "missing";
    if (byId.get(successor)?.blockedBy?.some(t => t.id === predecessor)) return "duplicate";
    const visited = new Set<string>();
    const queue = [predecessor];
    while (queue.length) {
        const id = queue.pop()!;
        if (id === successor) return "cycle";
        if (visited.has(id)) continue;
        visited.add(id);
        queue.push(...(byId.get(id)?.blockedBy ?? []).map(t => t.id));
    }
    return null;
}
