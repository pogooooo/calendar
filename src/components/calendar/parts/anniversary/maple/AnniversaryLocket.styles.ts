/**
 * Maple 의 기념일 표시(주간 달력의 요일 칸) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 사슬에 매단 로켓·실에 꿴 종이 꼬리표 대신 요일 칸 오른쪽의 작은 둥근 배지 하나.
 * 바탕에 붉음이 옅게 들고 그 위에 기념일 아이콘. 오늘이 기념일이면 붉음으로 채운다. 흔들리지 않는다.
 * 마우스를 올리면 아래로 이름 카드가 뜬다(여럿이면 휠로 넘긴다).
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/AnniversaryLocket.styles";
import { withAlpha } from "@/styles/color";
import { cardShadow } from "@/styles/maple/ink";

export * from "../celestial/AnniversaryLocket.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Root = styled(C.Root)`
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.18 : 0.1)};
    color: ${(p) => p.theme.colors.primary};
    animation: none !important;
    transition: background-color 0.15s ease;

    /* 사슬·마름모 액자·매단 구슬은 걷는다 */
    .art { display: none; }

    .ic {
        top: 6px;
        animation: none !important;
        filter: none !important;
    }

    &:hover {
        filter: none;
        animation: none !important;
        background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.28 : 0.18)};

        .ic { transform: none; filter: none; }
    }

    ${(p) => p.$today && css`
        background-color: ${p.theme.colors.primary};
        color: ${dark(p) ? "#1A1512" : "#FFFFFF"};

        &:hover { background-color: ${p.theme.colors.primary}; }
    `}
`;

/** 이름 카드 — 둥근 작은 카드, 읽히는 글씨 */
export const Plaque = styled(C.Plaque)`
    top: 30px;
    right: -8px;
    width: 140px;
    gap: 6px;
    padding: 5px 9px;
    border: 1px solid ${(p) => withAlpha(p.theme.colors.text, dark(p) ? 0.1 : 0.08)};
    border-radius: 10px;
    background: ${(p) => p.theme.colors.surface};
    box-shadow: ${cardShadow};
    font-size: 0.75rem;
    font-weight: 600;
    color: ${(p) => p.theme.colors.text};

    .idx {
        font-size: 0.6875rem;
        color: ${(p) => p.theme.colors.textSecondary};
        opacity: 1;
    }
`;
