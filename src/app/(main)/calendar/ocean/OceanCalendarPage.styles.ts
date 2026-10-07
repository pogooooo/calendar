/**
 * 바다의 달력 화면 틀 — Celestial(월간 왼쪽·일간 오른쪽, 사이 나눔선을 끌어 폭 조절)과도,
 * Maple(일간 먼저)과도 다르게 **월간이 위에 넓게 펼쳐지고 그날은 아래 물가 띠**로 눕는다.
 * 띠 안은 가로로 [그날 목록 | 시간표 | 챌린지·체크·메모] (OceanDayCalendar.styles).
 * 두 판은 유리 웅덩이처럼 떠 있고, 좌우로 끄는 나눔선은 쓰지 않는다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialCalendarPage.styles";
import { glass, R, waveRule, surfaceIn, calm, seaButton } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialCalendarPage.styles";

export const PageWrapper = styled(C.PageWrapper)`
    padding: 22px 28px 26px;
    background: transparent;

    @media (max-width: 1250px) { padding: 16px; }
    @media (max-width: 768px) { padding: 0; }
`;

export const CalendarContainer = styled(C.CalendarContainer)`
    flex-direction: column;
    gap: ${(p) => (p.$collapsed ? "12px" : "18px")};
    max-width: 1500px;
`;

/** 위: 월간 — 큰 유리 웅덩이 */
export const MonthSection = styled(C.MonthSection)`
    flex: 1 1 0 !important;
    height: auto;
    min-height: 0;
    ${glass("soft")}
    border-radius: ${R.lg};
    padding: 14px 16px 10px;
    transition: flex-grow 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    animation: ${surfaceIn} 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    ${calm}

    @media (max-width: 1250px) { height: auto; }
`;

/** 아래: 그날 — 물가에 누운 띠 */
export const DaySection = styled(C.DaySection)`
    /* 띠는 화면 높이의 4분의 1 남짓만 — 월간 칸에 막대가 두 층은 들어가야 한다 (900px 화면에서 210px) */
    flex: ${(p) => (p.$collapsed ? "0 0 46px" : "0 0 clamp(200px, calc(24vh - 6px), 320px)")} !important;
    min-width: 0;
    height: auto;
    min-height: ${(p) => (p.$collapsed ? "46px" : "200px")};
    border: none;
    ${glass("soft")}
    border-radius: ${R.lg};
    padding: 0;
    margin: 0;
    overflow: visible;
    transition: flex-basis 0.45s cubic-bezier(0.22, 1, 0.36, 1), min-height 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    animation: ${surfaceIn} 0.6s 0.06s cubic-bezier(0.22, 1, 0.36, 1) both;
    ${calm}

    /* 띠 위쪽 가장자리에 잔물결 한 줄 */
    &::before {
        content: "";
        position: absolute;
        left: 22px;
        right: 22px;
        top: -12px;
        ${waveRule(0.35)}
        pointer-events: none;
    }

    @media (max-width: 1250px) {
        border-top: none;
        padding-top: 0;
        margin-top: 0;
    }
`;

export const DayClip = styled(C.DayClip)`
    height: 100%;
    border-radius: inherit;
    overflow: hidden;
    @media (max-width: 1250px) { height: 100%; overflow: hidden; }
`;

export const DayBody = styled(C.DayBody)`
    height: 100%;
    padding: 10px 16px 10px;
    transform: translateY(${(p) => (p.$collapsed ? "10px" : "0")});
`;

/** 접힌 띠의 이름표 — 세로 글씨(Celestial) 대신 가로로 누운 물결 이름표 */
export const CollapsedRail = styled(C.CollapsedRail)`
    flex-direction: row;
    gap: 10px;
    .label { writing-mode: horizontal-tb; letter-spacing: 0.08em; font-family: ${(p) => p.theme.fonts.display}; }
    .star {
        font-size: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        opacity: 1;
        background: radial-gradient(circle at 35% 30%, #FFFFFF 0 22%, transparent 45%), ${(p) => p.theme.colors.primary};
    }
    @media (max-width: 1250px) { display: flex; }
`;

/** 띠를 접고 펴는 단추 — 오른쪽 위에 뜬 진주 단추 */
export const ToggleButton = styled(C.ToggleButton)`
    top: 10px;
    left: auto;
    right: 12px;
    width: 30px;
    height: 30px;
    ${seaButton("default")}
    display: flex;
    align-items: center;
    justify-content: center;
    svg { transform: rotate(${(p) => (p.$collapsed ? "-90deg" : "90deg")}); transition: transform 0.35s ease; }

    @media (max-width: 1250px) { top: 10px; right: 12px; left: auto; }
`;

/** 좌우로 끄는 나눔선은 바다에 없다 — 위아래로 쌓으니 */
export const Resizer = styled(C.Resizer)`
    display: none;
`;

/* ── 폰: 월간·일간 갈아 끼우기 ── */

/** 전환 단추 — 네모 칸 둘(Celestial) 대신 아래로 뜬 알약 하나 안의 두 물방울 */
export const ViewSwitch = styled(C.ViewSwitch)`
    border: none;
    padding: 4px;
    gap: 4px;
    ${glass("solid")}
    border-radius: ${R.pill};
`;

export const SwitchButton = styled(C.SwitchButton)`
    border: none;
    border-radius: ${R.pill};
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.06em;
    font-size: 0.86rem;
    padding: 10px 0;
    background: ${(p) => (p.$on ? `linear-gradient(135deg, ${p.theme.colors.primary}, ${p.theme.colors.accent})` : "transparent")};
    color: ${(p) => (p.$on ? (p.theme.mode === "dark" ? p.theme.colors.background : "#FFFFFF") : p.theme.colors.textSecondary)};
    box-shadow: ${(p) => (p.$on ? `0 4px 12px ${withAlpha(p.theme.colors.primary, 0.3)}` : "none")};
    transition: background 0.3s ease, color 0.3s ease;
    &:active { background-color: transparent; transform: scale(0.97); }
`;

/** 떠 있는 + — 네모 단추 대신 물방울 */
export const Fab = styled(C.Fab)`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    color: ${(p) => (p.theme.mode === "dark" ? p.theme.colors.background : "#FFFFFF")};
    background:
        radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.75) 0 10%, transparent 32%),
        linear-gradient(145deg, ${(p) => p.theme.colors.accent}, ${(p) => p.theme.colors.primary});
    box-shadow: 0 10px 22px ${(p) => withAlpha(p.theme.colors.primary, 0.38)};
    ${(p) => p.theme.mode === "dark" && css`box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5);`}
`;

export const MonthArea = styled(C.MonthArea)``;
