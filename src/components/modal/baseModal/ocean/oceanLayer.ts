/**
 * 바다의 떠 있는 층(창·알림·차림표·고르개)이 함께 쓰는 작은 조각 — 요즘 화면의 문법으로.
 * 창 틀(BaseModal) 옆에 두고, 할 일·프로젝트·챌린지·카테고리·더보기 창, 고르개·날짜 고르기·알림이 가져다 쓴다.
 *
 *   바탕: 옅게 어두워지는 장막 + 약한 흐림 / 창: 거의 불투명한 흰 판(surface "float"), 모서리 16px
 *   제목 15–16px·600, 머리·바닥은 머리카락 선 하나로 가르고, 닫기는 28px 글자 단추, 바닥 단추는 오른쪽 정렬
 *   서식 한 줄은 상자 없이 이름(옅은 글씨) + 칸, 칸은 10px 모서리의 흰 면에 선 하나
 * Celestial(금빛 실선 상자)·Maple(먹선 종이)과 달리 선은 아주 옅고, 장식은 없다.
 */
import { css, keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";
import { EASE, focusRing, hairline, ink, pearlToggle, tideInput } from "@/styles/ocean/water";

/* ── 움직임 (모두 한 번, 짧게) ─────────────────────────────────────── */

/** 아래로 펼치는 차림표 — 살짝 내려앉으며 나타난다 */
export const menuIn = keyframes`
    from { opacity: 0; transform: translateY(-4px) scale(0.98); }
    to   { opacity: 1; transform: none; }
`;
/** 위로 펼치는 차림표 */
export const menuInUp = keyframes`
    from { opacity: 0; transform: translateY(4px) scale(0.98); }
    to   { opacity: 1; transform: none; }
`;
/** 알림 창 — 살짝 떠오르며 커진다 */
export const popIn = keyframes`
    from { opacity: 0; transform: translateY(6px) scale(0.98); }
    to   { opacity: 1; transform: none; }
`;

/* ── 겉 ─────────────────────────────────────────────────────────────── */

/** 창 뒤의 장막 — 옅게 어두워지고 아주 조금 흐려진다 */
export const veil = css`
    background-color: ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(18, 33, 32, 0.26)")};
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
`;

/** 창·차림표 제목 — 15–16px, 600, 살짝 좁힌 자간 */
export const titleType = (size = "1rem") => css`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: ${size};
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
`;

/** 서식 칸 이름 — 13px 옅은 글씨, 아이콘도 같은 색 */
export const fieldLabel = css`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.005em;
    color: ${(p) => p.theme.colors.textSecondary};
    svg { width: 15px; height: 15px; stroke-width: 1.75; color: ${(p) => p.theme.colors.textSecondary}; }
`;

/** 글자 단추(닫기·넘기기) — 28px, 8px 모서리. 올리면 옅게 칠해진다 */
export const ghostIcon = (size = "28px") => css`
    width: ${size};
    height: ${size};
    min-width: 0;
    min-height: 0;
    flex: none;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: ${(p) => p.theme.colors.textSecondary};
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;

    svg { width: 16px; height: 16px; stroke-width: 1.75; }

    &:hover:not(:disabled) {
        color: ${(p) => p.theme.colors.text};
        background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05)};
    }
    &:active:not(:disabled) { transform: scale(0.96); }
    &:disabled { opacity: 0.4; cursor: default; }
    ${focusRing}
`;

/** 서식 입력칸 — 10px 모서리의 흰 면에 선 하나, 13–14px 글씨 */
export const field = css`
    ${tideInput}
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    color: ${(p) => p.theme.colors.text};
    caret-color: ${(p) => p.theme.colors.primary};
    &::placeholder { color: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.7)}; }
`;

/** 스위치 — 36×20 납작한 홈 위를 흰 손잡이가 미끄러진다 (Celestial 의 60×22 를 줄인다) */
export const switch36 = css`
    ${pearlToggle}
    width: 36px;
    min-width: 36px !important;
    height: 20px;
    flex: none;

    .slider { transition: background-color 0.15s ease; }
    .slider::before {
        width: 16px;
        height: 16px;
        left: 2px;
        bottom: 2px;
        transition: transform 0.2s ${EASE};
    }
    input:checked + .slider::before { transform: translateX(16px); }
    input:focus-visible + .slider {
        outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.55)};
        outline-offset: 2px;
    }
`;

/** 머리 — 아래에 머리카락 선 하나 */
export const headRule = css`
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
`;

/** 바닥 — 위에 머리카락 선 하나, 단추는 오른쪽 */
export const footRule = css`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    border-top: 1px solid ${(p) => hairline(p.theme)};
    border-radius: 0;
`;

/** 차림표 한 줄 — 32px, 8px 모서리 칠 */
export const menuRow = css`
    min-height: 32px;
    padding: 0 8px;
    border-radius: 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    color: ${(p) => p.theme.colors.text};
    transition: background-color 0.12s ease, color 0.12s ease;
    &:hover { background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05)}; }
`;

/** 체크 표시(그림 대신 lucide check 모양을 마스크로) — 색은 background-color */
const CHECK = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 6 9 17l-5-5'/></svg>",
)}")`;
export const checkMark = (size = "14px") => css`
    width: ${size};
    height: ${size};
    flex: none;
    background-color: ${(p) => p.theme.colors.primary};
    -webkit-mask: ${CHECK} center / contain no-repeat;
    mask: ${CHECK} center / contain no-repeat;
`;

/** 아래 화살 (lucide chevron-down) — 고르개 손잡이 */
const CHEVRON = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#000' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>",
)}")`;
export const chevronMark = (size = "14px") => css`
    width: ${size};
    height: ${size};
    flex: none;
    background-color: ${(p) => p.theme.colors.textSecondary};
    -webkit-mask: ${CHEVRON} center / contain no-repeat;
    mask: ${CHEVRON} center / contain no-repeat;
`;
