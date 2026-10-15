/**
 * Maple 의 둘째 단추 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 모양은 ink 의 stampButton 한 가지: 기본은 카드 같은 알약(옅은 선), 주된 단추는 단풍 붉음으로 채운 알약,
 * 위험은 붉은 글씨(올리면 채움). 서식의 제출 단추(type="submit")는 따로 고르지 않아도 주된 단추다 —
 * 로그인·가입·카테고리 추가의 "확인"이 옅은 선 단추라 무엇을 누를지 흐렸다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/SecondaryButton.styles";

import { stampButton } from "@/styles/maple/ink";

export * from "../celestial/SecondaryButton.styles";

type Variant = "default" | "primary" | "danger";

const variantOf = (p: C.ButtonProps): Variant =>
    p.$variant === "danger" ? "danger"
        : p.$variant === "primary" || p.type === "submit" ? "primary"
            : "default";

export const SecondaryButton = styled(C.SecondaryButton)`
    ${(p) => stampButton(variantOf(p))}
    gap: 6px;
    /* 정해 준 폭($width)을 따르되, 글(영어 등)이 길면 잘리지 않게 그만큼 넓어진다 */
    min-width: fit-content;
    padding: 0 14px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.9375rem;
    font-weight: 600;
    white-space: nowrap;

    /* 금박 결은 Celestial 만 — 스치는 빛(::after)은 stampButton 이 지운다 */
    background-image: none;
    /* 뼈대가 올렸을 때 테를 금빛(primary)으로 바꾼다 — 테는 stampButton 의 선 색을 따른다 */
    &:hover { border-color: var(--stamp-ink); }

    svg { flex: none; }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
    ${(p) => variantOf(p) === "primary" && css`
        &:disabled:hover { background-color: ${p.theme.colors.primary}; box-shadow: none; }
    `}
`;
