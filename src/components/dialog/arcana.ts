export type DialogKind = "info" | "confirm" | "danger" | "ok";
export type DialogVariant = "full" | "plain" | "band" | "land";

export interface Arcanum {
    num: string;
    name: string;
}

/**
 * 창 종류마다 아르카나를 고정한다. 숫자가 매번 달라지면 장식일 뿐이고,
 * 고정돼 있어야 사용자가 문구를 읽기 전에 XIII 만 보고 위험한 창임을 안다.
 */
export const ARCANA: Record<DialogKind, Arcanum> = {
    info:    { num: "II",   name: "The High Priestess" },
    confirm: { num: "VI",   name: "The Lovers" },
    danger:  { num: "XIII", name: "Death" },
    ok:      { num: "XIX",  name: "The Sun" },
};

/**
 * Maple 은 타로가 아니라 도감이다 — 도판 번호와 라틴어 한 마디.
 * 알림 Nota(적어 둠) · 물음 Quaestio(묻는다) · 위험 Cave(조심) · 완료 Factum(되었다). 번호는 Celestial 과 같은 자리를 지킨다.
 */
export const PLATES: Record<DialogKind, Arcanum> = {
    info:    { num: "Pl. II",   name: "Nota" },
    confirm: { num: "Pl. VI",   name: "Quaestio" },
    danger:  { num: "Pl. XIII", name: "Cave" },
    ok:      { num: "Pl. XIX",  name: "Factum" },
};

/** 종류별 기본 변형. 여기만 바꾸면 전체 톤이 바뀐다. */
export const VARIANT_BY_KIND: Record<DialogKind, DialogVariant> = {
    info:    "plain",
    confirm: "plain",
    danger:  "full",
    ok:      "plain",
};
