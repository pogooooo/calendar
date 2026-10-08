/**
 * 바다의 제목 줄(데스크톱 창) — 반투명 서리 띠 한 줄, 아래는 머리카락 선.
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 *
 * 이름은 기울인 세리프 "Cronos"(사이드바 상표와 같은 꼴), 창 단추는 칸을 채우는 네모(Celestial·Maple) 대신
 * 가운데의 조용한 28px 단추 — 올리면 옅게 칠해지고, 닫기만 산호빛으로 찬다.
 * 끌어 옮기는 자리(data-tauri-drag-region)는 그대로 둔다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialTitleBar.styles";
import { SERIF, hairline, ink, sand } from "@/styles/ocean/water";

export * from "../celestial/CelestialTitleBar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Bar = styled(C.Bar)`
    ${sand}
    position: relative;
    z-index: 5;
    padding-left: 14px;
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
`;

/**
 * 글자는 CRONOS 로 들어오지만 기울인 세리프에는 Cronos 가 어울린다.
 * 앞의 작은 물방울(OceanTitleMark)은 글자 흐름 밖에 떠 있고 제목이 그만큼 비켜 준다 — 글자 앞에 칸이 끼면 ::first-letter 가 듣지 않는다.
 */
export const Title = styled(C.Title)`
    position: relative;
    &:has(> span) { margin-left: 26px; }
    font-family: ${SERIF};
    font-style: italic;
    font-size: 1.02rem;
    font-weight: 400;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};
    text-transform: lowercase;
    &::first-letter { text-transform: uppercase; }
`;

export const Controls = styled(C.Controls)`
    align-items: center;
    gap: 2px;
    padding-right: 6px;
`;

export const Btn = styled(C.Btn)`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: ${(p) => p.theme.colors.textSecondary};
    transition: background-color 0.15s ease, color 0.15s ease;

    line { stroke-linecap: round; }

    &:hover {
        background-color: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};
        color: ${(p) => p.theme.colors.text};
    }
    &:active { background-color: ${(p) => ink(p.theme, dark(p) ? 0.14 : 0.1)}; }
`;

/** 닫기 — 올리면 산호빛으로 찬다 */
export const CloseBtn = styled(Btn)`
    &:hover {
        background-color: ${(p) => p.theme.colors.error};
        color: #FFFFFF;
    }
    &:active { background-color: ${(p) => p.theme.colors.error}; }
`;
