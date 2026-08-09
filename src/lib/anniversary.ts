import type { AnniversaryType } from "@/store/useAnniversaryStore";

export const anniversariesOn = (list: AnniversaryType[], date: Date) =>
    list.filter(a => a.month === date.getMonth() + 1 && a.day === date.getDate());
