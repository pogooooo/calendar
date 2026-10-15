/**
 * Maple 의 셋째 단추(글자 단추·링크) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 붉은 글씨(본문 글꼴, 굵게). 올리면 가는 밑줄 — 예전의 붓 밑줄 그림과 명조 글씨는 작은 크기에서 흐렸다.
 */
import styled from "styled-components";
import * as C from "../celestial/TertiaryButton.styles";
import { withAlpha } from "@/styles/color";

export * from "../celestial/TertiaryButton.styles";

export const TertiaryButton = styled(C.TertiaryButton)`
    display: inline;
    padding: 0;
    border: none;
    background: none;
    color: ${(p) => p.theme.colors.primary};
    font: inherit;
    font-family: ${(p) => p.theme.fonts.body};
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    border-radius: 4px;
    transition: text-decoration-color 0.15s ease, color 0.15s ease;

    &:hover {
        text-decoration: underline;
        text-decoration-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)};
    }

    &:focus-visible { outline-offset: 2px; }
`;
