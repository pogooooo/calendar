import * as S from "./MapleNavIcon.styles";

/** D1 시트의 열두 칸 — scripts/maple-assets.mjs 의 NAV 순서와 같다 */
export type NavIconName =
    "home" | "calendar" | "project" | "challenge" | "anniversary" | "category" | "settings" | "download" | "plus" | "check" | "watch" | "more";

/** 먹으로 그린 내비 아이콘(D1). 색은 글자색(currentColor)을 따른다 */
export default function MapleNavIcon({ name, size }: { name: NavIconName; size: number }) {
    return <S.Ink $name={name} $size={size} aria-hidden="true" />;
}
