/**
 * Maple 의 떠 있는 층(창·알림·고르개·날짜 고르기·쪽지)이 함께 쓰는 조각 — "가을 노트"의 깨끗한 카드.
 * 창 틀(BaseModal) 옆에 두고, 할 일·프로젝트·카테고리·챌린지·더보기 창, 고르개·날짜 고르기, 알림 창이 가져다 쓴다.
 *
 *   장막: 밤색으로 옅게 어두워지고 살짝 흐려진다 / 창: 18px 모서리의 카드(폰은 위 모서리만 둥근 시트), 옅은 선, 깊고 부드러운 그림자
 *   제목은 고운바탕 굵게, 칸 이름은 14px 옅은 글씨, 칸은 ink 의 inkInput, 단추는 ink 의 stampButton
 *   차림표·고르개는 12px 카드, 그 안의 줄은 8px 모서리로 옅게 물든다
 * 예전의 먹 그림(도장 틀·찢은 종이·덩굴 귀)은 쓰지 않는다 — 표식은 벡터 단풍잎(ink 의 crest)과 lucide 아이콘까지.
 */
import { css, keyframes, type DefaultTheme } from "styled-components";
import { withAlpha } from "@/styles/color";
import { hair, inkInput, paperToggle } from "@/styles/maple/ink";

const dark = (t: DefaultTheme) => t.mode === "dark";

/** 채운 색(붉음·초록) 위의 글자 — ink 의 stampButton 과 같은 값 */
export const onFill = (t: DefaultTheme) => (dark(t) ? "#1A1512" : "#FFFFFF");

/** 고른 것·오늘의 옅은 붉음 — 밝음 0.1, 어둠 0.16 (설계 지침 5) */
export const tint = (t: DefaultTheme, light = 0.1, night = 0.16) => withAlpha(t.colors.primary, dark(t) ? night : light);

/** 마우스를 올린 줄의 옅은 칠 — 붉음이 아니라 글자색을 옅게(고른 것과 헷갈리지 않게) */
export const wash = (t: DefaultTheme) => hair(t, dark(t) ? 0.08 : 0.05);

/** 떠 있는 판의 테 */
export const floatLine = (t: DefaultTheme) => hair(t, dark(t) ? 0.12 : 0.08);

/** 창의 그림자 — 종이에서 한 뼘 떠 있게 (카드의 cardShadow 보다 깊고 넓게) */
export const floatShadow = (t: DefaultTheme) => (dark(t)
    ? "0 1px 2px rgba(0, 0, 0, 0.4), 0 28px 64px -20px rgba(0, 0, 0, 0.8)"
    : "0 1px 2px rgba(86, 54, 32, 0.06), 0 28px 64px -24px rgba(86, 54, 32, 0.38)");

/** 차림표·고르개·쪽지의 그림자 — 창보다 얕게 */
export const popShadow = (t: DefaultTheme) => (dark(t)
    ? "0 1px 2px rgba(0, 0, 0, 0.35), 0 16px 36px -12px rgba(0, 0, 0, 0.7)"
    : "0 1px 2px rgba(86, 54, 32, 0.06), 0 16px 36px -14px rgba(86, 54, 32, 0.3)");

/** 아래에서 올라오는 시트의 그림자 — 위로 번진다 */
export const sheetShadow = (t: DefaultTheme) => (dark(t)
    ? "0 -12px 40px -12px rgba(0, 0, 0, 0.75)"
    : "0 -12px 40px -16px rgba(86, 54, 32, 0.32)");

/** 창 뒤의 장막 — 밤색으로 옅게 어두워지고 살짝 흐려진다 */
export const veil = css`
    background-color: ${(p) => (dark(p.theme) ? withAlpha("#000000", 0.56) : withAlpha(p.theme.colors.text, 0.3))};
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
`;

/** 떠 있는 판(차림표·고르개·쪽지) — 종이보다 밝은 카드, 옅은 선, 얕은 그림자 */
export const popCard = (radius = "12px") => css`
    background-color: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => floatLine(p.theme)};
    border-radius: ${radius};
    box-shadow: ${(p) => popShadow(p.theme)};
`;

/* ── 움직임 (모두 한 번, 짧게) ─────────────────────────────────────── */

/** 아래로 펼치는 차림표 — 살짝 내려앉으며 */
export const dropIn = keyframes`
    from { opacity: 0; transform: translateY(-4px) scale(0.98); }
    to   { opacity: 1; transform: none; }
`;
/** 위로 펼치는 차림표 */
export const dropInUp = keyframes`
    from { opacity: 0; transform: translateY(4px) scale(0.98); }
    to   { opacity: 1; transform: none; }
`;
/** 폰의 시트 — 아래에서 올라온다 */
export const sheetUp = keyframes`
    from { transform: translateY(100%); }
    to   { transform: none; }
`;
/** 알림 창 — 살짝 떠오르며 커진다 (예전의 "카드를 내려놓는" 기울임은 걷었다) */
export const riseIn = keyframes`
    from { opacity: 0; transform: translateY(10px) scale(0.97); }
    to   { opacity: 1; transform: none; }
`;

/* ── 글·칸·단추 ─────────────────────────────────────────────────────── */

/** 창 제목 — 고운바탕 굵게, 자간 0 */
export const titleType = (size = "1.25rem") => css`
    font-family: ${(p) => p.theme.fonts.display};
    font-size: ${size};
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.4;
    color: ${(p) => p.theme.colors.text};
`;

/** 서식 칸 이름 — 14px 옅은 글씨, 아이콘도 같은 색 */
export const fieldLabel = css`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.textSecondary};

    svg { width: 16px; height: 16px; flex: none; stroke-width: 1.8; }
`;

/**
 * 서식 칸 — ink 의 inkInput(10px 모서리·옅은 선·초점이면 붉은 테와 번짐)에 본문 글꼴 14px.
 * 단추로 된 칸(고르개·날짜)은 눌러서 생긴 초점에는 테를 두르지 않는다 — 열렸을 때와 자판 초점만.
 */
export const field = css`
    ${inkInput}
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    line-height: 1.4;
    letter-spacing: 0;
    caret-color: ${(p) => p.theme.colors.primary};

    &:hover:not(:focus):not(:disabled) { border-color: ${(p) => hair(p.theme, 0.26)}; }
    &:disabled { opacity: 0.55; cursor: default; }
`;

/** 단추로 된 칸 — 마우스로 눌러 생긴 초점(:focus 이지만 :focus-visible 아님)은 테를 그리지 않는다 */
export const fieldButton = css`
    ${field}
    &:focus:not(:focus-visible) {
        border-color: ${(p) => hair(p.theme, dark(p.theme) ? 0.16 : 0.14)};
        box-shadow: none;
    }
`;

/** 동그란 글자 단추(닫기·달 넘기기) — 올리면 옅게 칠해진다 */
export const roundIcon = (size = "36px", icon = "20px") => css`
    width: ${size};
    height: ${size};
    min-width: ${size};
    min-height: ${size};
    flex: none;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: ${(p) => p.theme.colors.textSecondary};
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.08s ease;

    svg { width: ${icon}; height: ${icon}; stroke-width: 1.8; }

    &:hover:not(:disabled) {
        color: ${(p) => p.theme.colors.text};
        background-color: ${(p) => hair(p.theme, dark(p.theme) ? 0.1 : 0.06)};
    }
    &:active:not(:disabled) { transform: scale(0.94); }
    &:disabled { opacity: 0.4; cursor: default; }
    &:focus-visible { outline: none; box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.28)}; }
`;

/** 켜고 끄는 스위치 — ink 의 paperToggle(옅은 홈·흰 손잡이·켜면 붉은 홈, 40×24) 그대로, 줄에서 줄지 않게 */
export const switchToggle = css`
    ${paperToggle}
    flex: none;

    input:focus-visible + .slider { outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.5)}; outline-offset: 2px; }
`;

/** 차림표 한 줄 — 36px, 8px 모서리. 올리면 옅게 칠해진다 */
export const menuRow = css`
    min-height: 36px;
    padding: 0 10px;
    border-radius: 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};
    transition: background-color 0.12s ease, color 0.12s ease;

    &:hover { background-color: ${(p) => wash(p.theme)}; }
`;

/** 아래 화살 (lucide chevron-down) — 고르개 손잡이. 안의 글자(▾)는 숨기고 색은 background-color 로 */
const CHEVRON = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>",
)}")`;
export const chevronMark = (size = "16px") => css`
    width: ${size};
    height: ${size};
    flex: none;
    font-size: 0;
    color: transparent;
    background-color: ${(p) => p.theme.colors.textSecondary};
    -webkit-mask: ${CHEVRON} center / contain no-repeat;
    mask: ${CHEVRON} center / contain no-repeat;
`;
