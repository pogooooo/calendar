/**
 * 바다의 달력 화면 틀 — Celestial(월간 왼쪽·일간 오른쪽, 사이 나눔선을 끌어 폭 조절)과도,
 * Maple(일간 먼저)과도 다르게 **월간이 위에 넓게 펼쳐지고 그날은 아래 띠**로 눕는다.
 * 띠 안은 가로로 [그날 목록 | 시간표 | 챌린지·체크·메모] (OceanDayCalendar.styles).
 * 두 판은 물 위에 뜬 반투명 판이고, 좌우로 끄는 나눔선은 쓰지 않는다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialCalendarPage.styles";
import { EASE, MONO, R, calm, focusRing, ink, seaButton, surface, surfaceIn } from "@/styles/ocean/water";

export * from "../celestial/CelestialCalendarPage.styles";

export const PageWrapper = styled(C.PageWrapper)`
    padding: 20px 24px 20px 4px;
    background: transparent;

    @media (max-width: 1250px) { padding: 16px; }
    @media (max-width: 768px) { padding: 0; }
`;

export const CalendarContainer = styled(C.CalendarContainer)`
    flex-direction: column;
    gap: 12px;
    max-width: 1500px;
`;

/** 위: 월간 — 큰 판 */
export const MonthSection = styled(C.MonthSection)`
    flex: 1 1 0 !important;
    height: auto;
    min-height: 0;
    ${surface("panel")}
    border-radius: ${R.lg};
    padding: 18px 18px 12px;
    animation: ${surfaceIn} 0.5s ${EASE} both;
    ${calm}

    @media (max-width: 1250px) { height: auto; }
`;

/** 아래: 그날 — 띠. 화면 높이의 4분의 1 남짓만 (월간 칸에 막대가 두 층은 들어가야 한다, 900px 화면에서 210px) */
export const DaySection = styled(C.DaySection)`
    flex: ${(p) => (p.$collapsed ? "0 0 46px" : "0 0 clamp(200px, calc(24vh - 6px), 320px)")} !important;
    min-width: 0;
    height: auto;
    min-height: ${(p) => (p.$collapsed ? "46px" : "200px")};
    border: none;
    ${surface("panel")}
    border-radius: ${R.lg};
    padding: 0;
    margin: 0;
    overflow: visible;
    transition: flex-basis 0.4s ${EASE}, min-height 0.4s ${EASE};
    animation: ${surfaceIn} 0.55s 0.05s ${EASE} both;
    ${calm}

    @media (max-width: 1250px) {
        border-top: none;
        padding-top: 0;
        margin-top: 0;
    }
`;

/** 띠의 상자에 딱 맞춰 자른다 — 띠의 높이가 flex 로만 정해져 100% 가 안 풀리는 때가 있어 절대 자리로 */
export const DayClip = styled(C.DayClip)`
    position: absolute;
    inset: 0;
    height: auto;
    border-radius: inherit;
    overflow: hidden;
    @media (max-width: 1250px) { position: relative; inset: auto; height: 100%; overflow: hidden; }
`;

export const DayBody = styled(C.DayBody)`
    height: 100%;
    padding: 12px 16px 12px;
    transform: translateY(${(p) => (p.$collapsed ? "8px" : "0")});
`;

/** 접힌 띠의 이름표 — 세로 글씨(Celestial) 대신 가로로 누운 작은 꼬리표 */
export const CollapsedRail = styled(C.CollapsedRail)`
    flex-direction: row;
    gap: 8px;
    .label {
        writing-mode: horizontal-tb;
        font-family: ${MONO};
        font-size: 0.68rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    .star { display: none; }
    @media (max-width: 1250px) { display: flex; }
`;

/** 띠를 접고 펴는 단추 — 오른쪽 위의 작은 글씨 단추 */
export const ToggleButton = styled(C.ToggleButton)`
    top: 10px;
    left: calc(100% - 38px) !important;
    right: auto;
    width: 28px;
    height: 28px;
    ${seaButton("ghost")}
    display: flex;
    align-items: center;
    justify-content: center;
    svg { transform: rotate(${(p) => (p.$collapsed ? "-90deg" : "90deg")}); transition: transform 0.3s ${EASE}; }

    @media (max-width: 1250px) { top: 10px; }
`;

/** 좌우로 끄는 나눔선은 바다에 없다 — 위아래로 쌓으니 */
export const Resizer = styled(C.Resizer)`
    display: none;
`;

/* ── 폰: 월간·일간 갈아 끼우기 ── */

/** 전환 단추 — 네모 칸 둘(Celestial) 대신 홈 안에서 미끄러지는 흰 판 (분절 단추) */
export const ViewSwitch = styled(C.ViewSwitch)`
    border: none;
    padding: 3px;
    gap: 2px;
    border-radius: 12px;
    background: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.1 : 0.06)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
`;

export const SwitchButton = styled(C.SwitchButton)`
    border: none;
    border-radius: 9px;
    font-family: ${(p) => p.theme.fonts.body};
    font-weight: ${(p) => (p.$on ? 600 : 500)};
    font-size: 0.85rem;
    letter-spacing: 0;
    padding: 8px 0;
    background: ${(p) => (p.$on ? (p.theme.mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "#FFFFFF") : "transparent")};
    color: ${(p) => (p.$on ? p.theme.colors.text : p.theme.colors.textSecondary)};
    box-shadow: ${(p) => (p.$on ? "0 1px 3px rgba(18, 33, 32, 0.12)" : "none")};
    transition: background-color 0.2s ease, color 0.2s ease;
    &:active { background-color: transparent; transform: scale(0.98); }
    ${focusRing}
`;

/** 떠 있는 + — 청록 동그라미 하나 */
export const Fab = styled(C.Fab)`
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    color: ${(p) => (p.theme.mode === "dark" ? "#06110F" : "#FFFFFF")};
    background: ${(p) => p.theme.colors.primary};
    box-shadow: 0 10px 24px -8px ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.6)" : "rgba(15, 107, 107, 0.45)")};
`;

/** 폰의 월간 — 물 위에 바로 놓지 않고 유리 판 한 장 위에 (숫자가 물빛에 묻히지 않게) */
export const MonthArea = styled(C.MonthArea)`
    @media (max-width: 768px) {
        ${surface("panel")}
        margin: 0 8px;
        padding: 8px 6px 6px;
        border-radius: 20px;
    }
`;
