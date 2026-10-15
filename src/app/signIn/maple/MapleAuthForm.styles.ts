/**
 * Maple 의 로그인·가입·비밀번호 화면이 함께 쓰는 서식 조각 (MapleSignIn·MapleSignUp·MapleForgotPassword·MapleResetPassword).
 * 오른쪽 서식 판만 맡는다 — 왼쪽 그림판(MapleAuthPanel)은 따로.
 *
 * 2026-10-15 다시 그림: 표제 밑의 잎 달린 짧은 선(장식)·넓은 자간을 걷고 읽히는 서식으로.
 *   표제는 고운바탕 26px 굵게, 소개는 14px 옅은 글씨. 입력칸은 52px 둥근 칸(이름이 칸 안 위로 올라간다 — 입력칸 갈래 파일),
 *   제출은 붉은 알약(SecondaryButton 의 type="submit"), 링크는 붉은 글씨, 안내는 옅은 붉음 판.
 */
import { css } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { hair } from "@/styles/maple/ink";

/** 서식 판 — 카드 색, 그림판과의 경계는 옅은 세로선 하나 */
export const authPanel = css`
    background-color: ${(p) => p.theme.colors.surface};
    border-left: 1px solid ${(p) => hair(p.theme, 0.08)};

    ${MOBILE} { border-left: none; }
`;

/** 서식 — 칸 사이를 고르게. 비밀번호 칸의 눈 단추는 옅은 선 색이라 잘 안 보였다 — 옅은 글씨 색으로 */
export const authInner = css`
    gap: 14px;

    form button[aria-pressed] {
        color: ${(p) => p.theme.colors.textSecondary};
        &:hover { color: ${(p) => p.theme.colors.text}; }
    }
`;

/** 표제 — 고운바탕 굵게, 자간 0 */
export const authTitle = css`
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 1.625rem;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.3;
    color: ${(p) => p.theme.colors.text};
    margin: 0;

    &::after { content: none; }
`;

/** 소개 한 줄 */
export const authSubtitle = css`
    font-size: 0.875rem;
    line-height: 1.55;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.textSecondary};
    margin: -6px 0 8px;
    word-break: keep-all;
`;

/** 아래의 링크 줄 */
export const authSwitch = css`
    font-size: 0.875rem;
    color: ${(p) => p.theme.colors.textSecondary};
    margin-top: 0;
`;

/** 안내(메일을 보냈다·링크가 잘못됐다) — 옅은 붉음 판 */
export const authNotice = css`
    padding: 12px 14px;
    border-radius: 10px;
    background-color: ${(p) => withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.12 : 0.06)};
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.6;
    color: ${(p) => p.theme.colors.text};
    word-break: keep-all;
`;
