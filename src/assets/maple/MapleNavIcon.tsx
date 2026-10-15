import { CalendarDays, Check, Clock, Download, Gift, Leaf, MoreHorizontal, Mountain, NotebookTabs, Plus, Settings, Tags } from "lucide-react";

/** 내비 아이콘 열두 가지 — 갈래마다 같은 이름으로 제 그림을 고른다 */
export type NavIconName =
    "home" | "calendar" | "project" | "challenge" | "anniversary" | "category" | "settings" | "download" | "plus" | "check" | "watch" | "more";

/**
 * Maple 의 내비 아이콘 — 가는 선 아이콘(lucide). 홈만 단풍잎 대신 잎, 프로젝트는 노트, 챌린지는 산.
 * 2026-10-15 다시 그리며 먹으로 그린 아이콘 시트(icons/nav-*.webp)를 걷었다 — 작은 크기에서 뭉개지고 붓 자국이 지저분했다.
 */
const ICONS = {
    home: Leaf, calendar: CalendarDays, project: NotebookTabs, challenge: Mountain, anniversary: Gift, category: Tags,
    settings: Settings, download: Download, plus: Plus, check: Check, watch: Clock, more: MoreHorizontal,
};

export default function MapleNavIcon({ name, size }: { name: NavIconName; size: number }) {
    const Icon = ICONS[name];
    return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}
