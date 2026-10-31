/** New categories start visible; intentionally hiding every existing category remains valid. */
export function reconcileCategorySelection(selected: string[], previous: readonly string[] | null, current: readonly string[]): string[] {
    if(previous===null) return [...current];
    const valid=new Set(current), known=new Set(previous);
    const next=[...selected.filter(id=>valid.has(id)),...current.filter(id=>!known.has(id))];
    return next.length===selected.length && next.every((id,i)=>id===selected[i]) ? selected : next;
}
