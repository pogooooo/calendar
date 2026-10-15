/**
 * Maple 의 프로젝트 화면 틀 — 타임라인을 먼저 놓는 JSX 에 공용 조작 스타일을 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialProjectPage.styles";
import { hair } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialProjectPage.styles";

/** 두 카드 사이의 손잡이 — 옅은 알약 하나(올리면 붉게). 예전의 잎 달린 먹선은 걷었다 */
export const Resizer = styled(C.Resizer)`
    height: 16px;
    margin: 2px 0;

    &::after {
        width: 44px;
        height: 4px;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.18 : 0.14)};
    }

    &:hover::after, &:active::after { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.65)}; }
`;

/** 프로젝트가 하나도 없을 때 — 작은 그림 아래 한 줄 */
export const Empty = styled(C.Empty)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 14px;
    line-height: 1.6;
`;
