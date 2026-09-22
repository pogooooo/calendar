/**
 * Maple 의 로그인 화면 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 금빛 실선·빛무리 대신 먹 하이라인, 제목은 고운바탕, 표제 밑의 짧은 먹선.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSignIn.styles";
import { withAlpha } from "@/styles/color";
import { hair, leafBullet, shortRule } from "@/styles/maple/ink";

export * from "../celestial/CelestialSignIn.styles";

/** 서식 쪽 종이: 금빛 세로선 대신 먹 하이라인 */
export const FormPanel = styled(C.FormPanel)`
    border-left-color: ${(p) => hair(p.theme, 0.3)};

    ${"@media (max-width: 900px)"} {
        border-left: none;
        border-top: 1px solid ${(p) => hair(p.theme, 0.3)};
    }
`;

/** 표제: 고운바탕, 밑에 씨앗 셋 달린 짧은 먹선 */
export const FormTitle = styled(C.FormTitle)`
    letter-spacing: 0.12em;

    &::after {
        content: "";
        display: block;
        width: 70px;
        height: 12px;
        margin: 10px auto 0;
        ${shortRule("12px")}
        background-color: ${(p) => p.theme.colors.text};
        opacity: 0.65;
    }
`;

export const FormSubtitle = styled(C.FormSubtitle)`
    letter-spacing: 0.04em;
    color: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.95)};
`;

/** 가름줄: 금빛 실선 → 먹 하이라인 */
export const Separator = styled(C.Separator)`
    &::before, &::after { background: ${(p) => hair(p.theme, 0.3)}; }
`;

/** "로그인 유지" 표식: 마름모 → 잎 (윤곽 → 켜면 채운 잎) */
export const RememberRow = styled(C.RememberRow)`
    .box {
        ${leafBullet(false, "12px")}
        color: ${(p) => p.theme.colors.primary};
        background-color: ${(p) => p.theme.colors.primary};
        border: none;
        transform: none;
    }

    input:checked + .box { ${leafBullet(true, "12px")} background-color: ${(p) => p.theme.colors.primary}; }

    /* 마스크는 그림자까지 잘라내므로 초점 표시는 글자 밑줄로 */
    input:focus-visible + .box { box-shadow: none; }
    label:has(input:focus-visible) { text-decoration: underline; text-underline-offset: 3px; }
`;
