export interface TimelineInterval { id: string; start: number; end: number }

/** Calendar columns count dates, not elapsed milliseconds across a DST change. */
export const calendarDayNumber = (day: Date): number =>
    Math.round(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / 86400000);

/** Inclusive date intervals share a row only when the earlier one has ended. */
export function packTimelineRows(intervals: readonly TimelineInterval[]) {
    const rowEnds: number[] = [];
    const rows = new Map<string, number>();
    const ordered = [...intervals].sort((a,b)=>a.start-b.start || a.end-b.end || a.id.localeCompare(b.id));
    for (const item of ordered) {
        const available = rowEnds.findIndex(end=>end < item.start);
        const row = available < 0 ? rowEnds.length : available;
        rowEnds[row] = Math.max(item.start,item.end);
        rows.set(item.id,row);
    }
    return {rows,rowCount:rowEnds.length};
}
