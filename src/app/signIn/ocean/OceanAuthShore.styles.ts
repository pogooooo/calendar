/**
 * 바다의 로그인·가입·비밀번호 화면이 함께 쓰는 조각 (OceanSignIn·OceanSignUp·OceanForgotPassword·OceanResetPassword).
 *
 *   화면 = 물빛 바탕 그대로. 가운데 위에 기울인 세리프 상표 "Cronos"와 한 줄 소개(OceanAuthPanel), 그 아래 떠 있는 판 하나.
 *   판 = surface("float"), 모서리 20px. 판의 면은 ::before 에 깐다 — 판 자체에 흐림(backdrop-filter)·transform 이 남으면
 *        언어 고르개의 떠 있는 차림표(position: fixed)가 판을 기준으로 잡혀 엉뚱한 자리에 열린다.
 *   입력칸은 판 폭·44px 로만 맞춘다(모양은 입력칸 갈래 파일), 제출은 청록으로 꽉 찬 넓은 단추, "또는" 은 머리카락 선 사이의 작은 글씨.
 * Celestial(왼쪽 그림판·금빛 세로선·마름모 체크), Maple(도감·먹선·잎 체크)과 짜임부터 다르다.
 */
import { css, keyframes } from "styled-components";
import { MOBILE, SAFE_T } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { EASE, hairline, ink, seaButton, surface } from "@/styles/ocean/water";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 판이 떠오른다 — 끝 상태는 transform: none (위 설명) */
const rise = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
`;

/** 화면 — 위아래 가운데. 넘치면 굴러가고, 위가 잘리지 않게 가운데 맞춤은 바깥 여백(auto)으로 한다 */
export const shorePage = css`
    flex-direction: column;
    align-items: center;
    gap: 28px;
    padding: 40px 20px;
    overflow-y: auto;
    background: transparent;

    & > :first-child { margin-top: auto; }
    & > :last-child { margin-bottom: auto; }

    ${MOBILE} {
        gap: 22px;
        padding: calc(${SAFE_T} + 36px) 16px 32px;
    }
`;

/** 판 */
export const shoreCard = css`
    position: relative;
    isolation: isolate;
    flex: none;
    display: block;
    width: 100%;
    max-width: 400px;
    padding: 36px 36px 28px;
    border-radius: 20px;
    background: transparent;
    animation: ${rise} 0.5s ${EASE} 0.06s both;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        pointer-events: none;
        ${surface("float")}
    }

    ${MOBILE} {
        width: 100%;
        padding: 30px 22px 24px;
    }
`;

export const shoreToggle = css`
    top: 22px;
    right: 22px;
`;

/** 서식 — 칸들이 판 폭을 꽉 채운다. 입력칸·글자 칸의 모양도 여기서 맞춘다 */
export const shoreInner = css`
    width: 100%;
    max-width: none;
    align-items: stretch;
    gap: 14px;
    animation: none;

    form { display: flex; flex-direction: column; }

    /* 입력칸 — 모양(흰 면에 선 하나, 칸 위로 올라가는 이름표)은 입력칸 갈래 파일이 맡고, 여기선 판 폭·44px 만 */
    form input:not([type="checkbox"]) {
        width: 100%;
        height: 44px;
    }

    /* 제출 — 청록으로 꽉 찬 넓은 단추 */
    form > button {
        ${seaButton("primary")}
        width: 100%;
        height: 44px;
        margin-top: 6px;
        font-size: 0.94rem;
        &:hover:not(:disabled) { border-color: transparent; box-shadow: none; }
    }

    ${MOBILE} {
        width: 100%;
        max-width: none;
    }
`;

export const shoreTitle = css`
    align-self: flex-start;
    margin: 0;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.015em;
    color: ${(p) => p.theme.colors.text};
`;

export const shoreSubtitle = css`
    margin: -8px 0 14px;
    font-size: 0.86rem;
    letter-spacing: -0.005em;
    color: ${(p) => p.theme.colors.textSecondary};
`;

export const shoreSwitch = css`
    margin: 0;
    font-size: 0.84rem;
    color: ${(p) => p.theme.colors.textSecondary};
`;

/** 보냈다·바뀌었다는 안내 — 옅은 청록 면의 쪽지 */
export const shoreNotice = css`
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 0.86rem;
    line-height: 1.6;
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.12 : 0.07)};
    border: 1px solid ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.22 : 0.14)};
`;

/** "또는" — 머리카락 선 사이의 작은 글씨 */
export const shoreSeparator = css`
    gap: 12px;
    font-size: 0.76rem;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.textSecondary};

    &::before, &::after {
        height: 1px;
        border-bottom: none;
        margin: 0;
        opacity: 1;
        background: ${(p) => hairline(p.theme, true)};
    }
`;

/** "로그인 유지" — 동그라미 체크: 켜면 청록으로 차고 흰 체크가 선다 */
export const shoreRemember = css`
    margin: 4px 0 6px;

    label { gap: 10px; font-size: 0.86rem; }

    .box {
        position: relative;
        width: 18px;
        height: 18px;
        flex: none;
        transform: none;
        border-radius: 50%;
        border: 1.5px solid ${(p) => ink(p.theme, 0.3)};
        background: transparent;
        transition: background-color 0.15s ease, border-color 0.15s ease;
    }
    .box::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid ${(p) => (dark(p) ? "#06110F" : "#FFFFFF")};
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        opacity: 0;
        transition: opacity 0.15s ease;
    }
    input:checked + .box {
        background: ${(p) => p.theme.colors.primary};
        border-color: ${(p) => p.theme.colors.primary};
    }
    input:checked + .box::after { opacity: 1; }
    input:focus-visible + .box {
        box-shadow: none;
        outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.55)};
        outline-offset: 2px;
    }

    small {
        padding-left: 28px;
        font-size: 0.76rem;
        line-height: 1.5;
    }
`;
