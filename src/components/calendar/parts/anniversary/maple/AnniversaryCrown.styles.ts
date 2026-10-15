/**
 * Maple 의 기념일 관(월간 칸의 숫자 둘레) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 빛나는 금빛 고리·구슬·별(그리고 예전 Maple 의 먹 고리 위 잎) 대신, 숫자를 감싸는 둥근 판 하나 —
 * 붉음이 옅게 들고 가는 붉은 테. 오늘의 붉은 알약과 같은 꼴(24px)이라 날짜 줄 높이가 칸마다 같다.
 * 예전 고리(30px)는 날짜 줄보다 커서 그 칸의 막대만 아래로 밀려 이웃 칸과 어긋났다. 움직이지 않는다.
 */
import styled from "styled-components";
import * as C from "../celestial/AnniversaryCrown.styles";
import { withAlpha } from "@/styles/color";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";

export * from "../celestial/AnniversaryCrown.styles";

export const Root = styled(C.Root)`
    color: ${(p) => p.theme.colors.primary};

    &:hover svg { filter: none; }
    .ring { animation: none !important; }
`;

export const Ring = styled(C.Ring)`
    width: 24px;
    height: 24px;
    box-sizing: border-box;
    border: 1px solid ${(p) => withAlpha(p.theme.colors.primary, 0.5)};
    border-radius: 50%;
    background-color: ${(p) => withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.16 : 0.08)};

    /* 고리·별·구슬 그림은 걷는다 — 테두리가 고리다 */
    svg { display: none; }

    ${MOBILE} {
        ${NOT_WIDGET} & {
            width: 20px;
            height: 20px;
            margin: 0;
        }
    }
`;

/** 마우스를 올리면 펼쳐지는 이름 — 읽히는 크기로 */
export const Reveal = styled(C.Reveal)`
    .nm {
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0;
    }

    .idx { font-size: 0.625rem; }
`;
