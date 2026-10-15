/**
 * Maple 의 로그인 화면(오른쪽 서식 판) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 서식의 말은 가입·비밀번호 화면과 함께 MapleAuthForm.styles 에. 여기는 로그인에만 있는 "또는" 가름줄과
 * "로그인 유지" 체크 — 체크는 둥근 네모(inkCheckbox, 켜면 붉게 채우고 흰 체크). 예전의 잎 윤곽 체크는 체크인 줄 몰랐다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialSignIn.styles";
import { withAlpha } from "@/styles/color";
import { hair, inkCheckbox } from "@/styles/maple/ink";
import { authInner, authPanel, authSubtitle, authSwitch, authTitle } from "./MapleAuthForm.styles";

export * from "../celestial/CelestialSignIn.styles";

export const FormPanel = styled(C.FormPanel)`${authPanel}`;
export const FormInner = styled(C.FormInner)`${authInner}`;
export const FormTitle = styled(C.FormTitle)`${authTitle}`;
export const FormSubtitle = styled(C.FormSubtitle)`${authSubtitle}`;
export const SwitchLink = styled(C.SwitchLink)`${authSwitch}`;

/** "또는" — 옅은 선 사이의 13px 옅은 글씨 */
export const Separator = styled(C.Separator)`
    font-size: 0.8125rem;
    letter-spacing: 0;

    &::before, &::after { border-bottom-color: ${(p) => hair(p.theme, 0.12)}; opacity: 1; }
`;

/** "로그인 유지"(가입 화면의 만 14세 확인도 같은 모양) — 둥근 네모 체크와 14px 이름, 아래 옅은 설명 */
export const RememberRow = styled(C.RememberRow)`
    gap: 6px;
    margin: 0 0 14px;

    label {
        gap: 10px;
        font-size: 0.875rem;
        font-weight: 500;
        color: ${(p) => p.theme.colors.text};
    }

    .box {
        flex: none;
        width: 18px;
        height: 18px;
        transform: none;
        ${inkCheckbox(false)}
    }
    label:hover .box { border-color: ${(p) => p.theme.colors.primary}; }
    label:hover .box::after { opacity: 0.35; }

    input:checked + .box { ${inkCheckbox(true)} }
    input:focus-visible + .box { box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.28)}; }

    small {
        font-size: 0.8125rem;
        line-height: 1.55;
        color: ${(p) => p.theme.colors.textSecondary};
        padding-left: 28px;
        word-break: keep-all;

        /* 개인정보처리방침 링크 — 옅은 글 사이에서 링크인 줄 보이게 */
        a {
            color: ${(p) => p.theme.colors.primary};
            font-weight: 600;
            text-decoration: underline;
            text-decoration-color: ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
            text-underline-offset: 3px;

            &:hover { text-decoration-color: ${(p) => p.theme.colors.primary}; }
        }
    }
`;

/* 안내 한 줄(비밀번호 재설정 화면의 것) — 인증 메일을 다시 보냈다는 말 */
export { Notice } from "@/app/resetPassword/maple/MapleResetPassword.styles";
