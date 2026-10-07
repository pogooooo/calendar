/**
 * 바다의 알림 창 — 타로 카드(금빛 테두리·귀퉁이 마름모·로마 숫자, Celestial), 도감 도판(먹선 종이·덩굴 귀, Maple) 대신
 * **장식 없는 확인 창**: 흰 판(surface "float", 16px 모서리) 왼쪽에 무채색 동그라미 아이콘(OceanArcanaEmblem),
 * 그 옆에 15px·600 제목과 13px 옅은 설명, 아래 오른쪽에 단추. 위험한 일은 산호색 단추 하나로만 알린다.
 * 번호·이름(아르카나)·귀퉁이 장식·나눔선은 그리지 않는다. 나타날 때 살짝 떠오른다(한 번).
 * 창(오른쪽 시트) 위에서 물을 때도 화면 가운데의 작은 카드 그대로 — 시트와 겹치지 않고 눈길이 한곳에 모인다.
 * 장막은 투명도 대신 색과 흐림이 짙어지며 나타난다 — 투명도가 움직이는 막 안에서는 카드의 흐림이 뒤 화면을 못 본다(oceanLayer.veil).
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialDialog.styles";
import { EASE, seaButton, surface } from "@/styles/ocean/water";
import { popIn, veil, veilBlurIn, veilIn } from "@/components/modal/baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialDialog.styles";

export const Veil = styled(C.Veil)`
    ${veil}
    animation: ${veilIn} 0.18s ease-out both;
    &::before { animation: ${veilBlurIn} 0.18s ease-out both; }
`;

/** 아이콘 왼쪽 · 글 오른쪽 · 단추 아래 오른쪽 — 네 꼴 모두 같은 틀로 */
const grid = css`
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    column-gap: 14px;
    align-items: start;
    text-align: left;

    ${C.Title} { grid-column: 2; grid-row: 1; margin: 0; padding-top: 9px; }
    ${C.Message} { grid-column: 2; grid-row: 2; margin: 6px 0 0; }
    ${C.Actions} { grid-column: 1 / -1; grid-row: 3; justify-content: flex-end; margin-top: 20px; }
`;

const card = css`
    ${surface("float")}
    width: 380px;
    max-width: 100%;
    padding: 20px;
    border-radius: 20px;
    animation: ${popIn} 0.22s ${EASE} both;

    &::before { display: none; }
    /* 뼈대가 꼴마다 다르게 주는 제목 크기·여백을 하나로 */
    ${C.Title} { font-size: 0.9375rem; }
    ${C.Message} { margin-bottom: 0; }
`;

/** 귀퉁이 장식은 그리지 않는다 */
export const Pip = styled(C.Pip)`
    display: none;
`;

/** 아르카나 번호·이름은 감춘다 */
export const Numeral = styled(C.Numeral)`
    display: none;
`;

export const ArcanaName = styled(C.ArcanaName)`
    display: none;
`;

export const Title = styled(C.Title)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.45;
    color: ${(p) => p.theme.colors.text};
    word-break: keep-all;
`;

/** 한글이 낱자로 꺾이지 않게 낱말 단위로 줄을 바꾼다 */
export const Message = styled(C.Message)`
    font-size: 0.8125rem;
    line-height: 1.6;
    word-break: keep-all;
    overflow-wrap: anywhere;
`;

export const Actions = styled(C.Actions)`
    gap: 8px;
`;

/** 단추 — 취소는 흰 면, 확인은 청록, 위험은 산호 */
export const ActionButton = styled(C.ActionButton)`
    ${(p) => seaButton(p.$tone === "go" ? "primary" : p.$tone === "danger" ? "danger" : "default")}
    height: 32px;
    padding: 0 14px;
    font-size: 0.8125rem;
`;

/* ── 정통(위험) ─────────────────────────────────────────────────────── */
export const FullCard = styled(C.FullCard)`
    ${card}
    ${grid}
    text-align: left;

    .head, .rule { display: none; }
    & > span { grid-column: 1; grid-row: 1 / span 2; }
    svg { margin: 0; }
`;

/* ── 간결 ─────────────────────────────────────────────────────────── */
export const PlainCard = styled(C.PlainCard)`
    ${card}
    ${grid}

    .top { grid-column: 1; grid-row: 1 / span 2; margin: 0; }
    .top > div { display: none; }
`;

/* ── 띠 — 색 띠는 쓰지 않고 다른 꼴과 같은 틀로 ───────────────────── */
export const BandCard = styled(C.BandCard)`
    ${card}

    .banner { display: none; }
    .inner {
        ${grid}
        padding: 0;
        & > span { grid-column: 1; grid-row: 1 / span 2; }
    }
    .inner svg { margin: 0; }
`;

/* ── 가로 — 왼쪽 칸의 실선을 걷고 아이콘만 ───────────────────────── */
export const LandCard = styled(C.LandCard)`
    ${card}
    gap: 14px;

    .side { width: auto; padding-right: 0; border-right: none; }
    ${C.Title} { margin-bottom: 6px; padding-top: 9px; }
    ${C.Actions} { justify-content: flex-end; margin-top: 20px; }
`;
