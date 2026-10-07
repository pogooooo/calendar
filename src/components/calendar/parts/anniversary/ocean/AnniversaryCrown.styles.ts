/**
 * 바다의 기념일 표시(월간 칸의 날짜 숫자) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 고리·별·궤도를 도는 구슬(Celestial), 먹 고리와 잎(Maple) 대신 숫자 뒤의 산호 점 하나.
 * 기념일이 둘 이상이면 점이 둘. 올리면 이름이 옆으로 조용히 펼쳐진다. 끝없는 움직임 없음.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/AnniversaryCrown.styles";
import { MONO } from "@/styles/ocean/water";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";

export * from "../celestial/AnniversaryCrown.styles";

export const Root = styled(C.Root)`
    gap: 6px;
    color: ${(p) => p.theme.colors.textSecondary};
    &:hover svg { filter: none; }
    .ring { animation: none !important; }

    /* 둘 이상 — 점 하나를 옆에 더 찍는다 */
    ${(p) => p.$multi && css`
        ${C.Ring}::after {
            margin-right: 7px;
            box-shadow: 7px 0 0 ${p.theme.colors.weekend};
        }
    `}
`;

/** 고리 상자를 풀고 숫자 + 점 한 줄로 */
export const Ring = styled(C.Ring)`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    width: auto;
    height: auto;

    svg { display: none; }
    .dn { font-weight: inherit; font-size: inherit; line-height: inherit; }

    &::after {
        content: "";
        flex: none;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: ${(p) => p.theme.colors.weekend};
    }

    ${MOBILE} {
        ${NOT_WIDGET} & {
            width: auto;
            height: auto;
            margin: 0;
            gap: 3px;
            &::after { width: 4px; height: 4px; }
        }
    }
`;

/** 이름 — 금빛으로 그어지는 밑줄 없이 작은 글씨만 */
export const Reveal = styled(C.Reveal)`
    .nm { font-size: 0.66rem; letter-spacing: 0; }
    .rule { display: none; }
    .idx { font-family: ${MONO}; font-size: 0.56rem; letter-spacing: 0.04em; }
`;
