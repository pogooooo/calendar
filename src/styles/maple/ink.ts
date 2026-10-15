/**
 * Maple 테마의 조각 — 여러 화면의 *.styles.ts 가 같이 쓰는 것.
 *
 * 2026-10-15 다시 그렸다(사용자: "maple 테마가 안 예쁜 것 같아, 에셋이 정 안 좋으면 안 써도 돼"). 예전엔 이미지 모델이 그린 먹 그림을
 * 마스크로 씌웠다 — 도장 틀 단추, 찢은 종이, 마스킹테이프 막대, 먹 카드 테, 붓 밑줄, 먹 체크 칸, 수채 띠. 한 화면에 여럿이 겹쳐
 * 어수선했고 결이 제각각이었다. 이제는 "가을 노트" 한 가지 말로: 따뜻한 종이 바탕 위의 깨끗한 카드(둥근 모서리·부드러운 그림자·옅은 선),
 * 단풍 붉음 하나, 그리고 또렷한 벡터 단풍잎 하나(글머리표·문장). 그림 파일은 쓰지 않는다.
 *
 * 내보내는 이름은 예전 그대로다 — 쓰는 쪽(*.styles.ts 50여 개)을 고치지 않아도 새 모양이 된다. 이름이 그림을 가리키던 것
 * (stampButton·tornTop·tape …)은 이제 그 자리의 깨끗한 모양을 낸다.
 */
import { css } from "styled-components";
import { withAlpha } from "@/styles/color";

/** 선 — 붉은 primary 가 아니라 글자색(text)을 옅게 */
export const hair = (theme: { colors: { text: string } }, alpha = 0.3) => withAlpha(theme.colors.text, alpha);

/* ── 벡터 그림 (마스크로 쓴다 — 색은 background 로 입힌다) ───────────────────── */

const svgUrl = (viewBox: string, body: string, extra = "") =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}'${extra}>${body}</svg>`)}")`;

/** 단풍잎 — 다섯 갈래, 곧은 마디(작게 그려도 또렷하다) */
export const LEAF_PATH = "M12 1.6 13.7 5.3 16.3 4.1 15.7 8.7 19.5 7.1 18.7 9.5 22.4 10.7 19.6 12.7 20.5 14.5 15.4 14.1 15.8 16.1 12.7 15 12.6 22.4 11.4 22.4 11.3 15 8.2 16.1 8.6 14.1 3.5 14.5 4.4 12.7 1.6 10.7 5.3 9.5 4.5 7.1 8.3 8.7 7.7 4.1 10.3 5.3Z";
export const LEAF_FILLED = svgUrl("0 0 24 24", `<path d='${LEAF_PATH}' fill='black' stroke='black' stroke-width='0.7' stroke-linejoin='round'/>`);
export const LEAF_OUTLINE = svgUrl("0 0 24 24", `<path d='${LEAF_PATH}' fill='none' stroke='black' stroke-width='1.6' stroke-linejoin='round'/>`);
const CHECK = svgUrl("0 0 24 24", "<path d='M5.5 12.6l4.1 4.1L18.6 7.6' fill='none' stroke='black' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'/>");
const RING = svgUrl("0 0 100 100", "<circle cx='50' cy='50' r='48' fill='none' stroke='black' stroke-width='1.5'/>");
/** 짧은 선 장식 — 가운데 작은 잎, 양쪽에 가는 선 */
const SHORT_RULE = svgUrl("0 0 160 14",
    `<rect x='0' y='6.5' width='62' height='1' rx='0.5' fill='black'/><rect x='98' y='6.5' width='62' height='1' rx='0.5' fill='black'/>` +
    `<g transform='translate(73 0) scale(0.58)'><path d='${LEAF_PATH}' fill='black'/></g>`);
const LONG_RULE = svgUrl("0 0 100 10", "<rect y='4.5' width='100' height='1' fill='black'/>", " preserveAspectRatio='none'");
/** 책갈피 — 아래가 V 로 파인 띠 */
const BOOKMARK = svgUrl("0 0 20 40", "<path d='M0 0H20V40L10 32 0 40Z' fill='black'/>", " preserveAspectRatio='none'");

/** 벡터 마스크 — 위의 svg 하나를 씌우고 색은 background 로 */
const vectorMask = (url: string, size = "contain", position = "center") => css`
    mask: ${url} ${position} / ${size} no-repeat;
    -webkit-mask: ${url} ${position} / ${size} no-repeat;
    background-color: currentColor;
`;

/** 할 일 줄 앞의 잎 — 안 한 일은 윤곽, 끝낸 일은 채운 잎 */
export const leafBullet = (on: boolean, size = "11px") => css`
    width: ${size};
    height: ${size};
    flex-shrink: 0;
    border: none;
    transform: none;
    box-shadow: none;
    ${vectorMask(on ? LEAF_FILLED : LEAF_OUTLINE)}
`;

/**
 * 마스크에 색을 입힌다 — background-color 를 통째로 지우는 곳(데스크톱 위젯 페이지의
 * `& * { background-color: transparent }`)에서도 살아남도록 같은 색의 그라데이션을 함께 깐다.
 */
export const inkFill = (color: string) => css`
    background-color: ${color};
    background-image: linear-gradient(${color}, ${color});
`;

/** 머리글의 ✦ 자리 — 작은 단풍잎 */
export const crest = (size = "14px") => css`
    display: inline-block;
    width: ${size};
    height: ${size};
    ${vectorMask(LEAF_FILLED)}
`;

/** 완료 표시 — 또렷한 체크 */
export const checkStamp = (size = "14px") => css`
    display: inline-block;
    width: ${size};
    height: ${size};
    ${vectorMask(CHECK)}
`;

/** 짧은 선 장식 — 가운데 작은 잎. 한 줄 전체 폭을 차지하며 가운데 정렬 */
export const shortRule = (height = "14px") => css`
    height: ${height};
    ${vectorMask(SHORT_RULE, "auto 100%")}
`;

/** 긴 선 — 섹션 머리글 옆의 가는 선 하나 */
export const vineRule = (height = "12px") => css`
    height: ${height};
    ${vectorMask(LONG_RULE, "100% 100%")}
`;

/** 머리글 뒤에 깔던 수채 띠 — 이제 없다(쓰는 쪽의 투명도·크기는 그대로 두어도 된다) */
export const washBand = css`
    background-image: none;
`;
export const washBandDark = css`
    background-image: none;
`;

/** 일정 막대 — 예전엔 마스킹테이프처럼 위아래를 찢었다. 이제는 둥근 모서리의 깨끗한 막대 */
export const tape = css`
    mask: none;
    -webkit-mask: none;
    border-radius: 5px;
`;

/** 카드 둘레의 먹 테 — 이제 없다(카드는 paperCard 의 옅은 선과 그림자로 선다) */
export const cardFrame = (color: string, width = "22px") => {
    void color; void width; // 예전 이름 그대로 받는다
    return css`
        position: relative;
        &::after { content: none; }
    `;
};

/* ── 조작부 — 단추·입력칸·탭·칩. 화면마다 따로 그리면 손이 달라지므로 여기서 한 번 정한다 ──
   종이 위의 깨끗한 단추: 기본은 흰 카드 같은 단추(옅은 선), 주된 단추는 단풍 붉음으로 채움, 위험은 붉은 글씨. */

type Themed = { theme: { mode: "light" | "dark"; colors: { text: string; primary: string; accent: string; background: string; surface: string; error: string; textSecondary: string } } };
type Fonted = Themed & { theme: { fonts: { display: string } } };

const dark = (p: Themed) => p.theme.mode === "dark";
/** 채운 붉음 위의 글자색 */
const onPrimary = (p: Themed) => (dark(p) ? "#1A1512" : "#FFFFFF");
/** 카드의 그림자 — 종이에서 살짝 떠 있게 */
export const cardShadow = (p: Themed) => (dark(p)
    ? "0 1px 2px rgba(0, 0, 0, 0.35), 0 10px 28px -14px rgba(0, 0, 0, 0.55)"
    : "0 1px 2px rgba(86, 54, 32, 0.05), 0 10px 28px -14px rgba(86, 54, 32, 0.18)");

/** 카드 한 장 — 판·카드의 바탕. 종이보다 밝은 카드에 옅은 선, 둥근 모서리, 부드러운 그림자 */
export const paperCard = (inset = "3px") => {
    void inset; // 예전의 안쪽 괘선 간격 — 이제 괘선이 없다
    return paperCardCss;
};
const paperCardCss = css`
    position: relative;
    background-color: ${(p: Themed) => p.theme.colors.surface};
    border: 1px solid ${(p: Themed) => hair(p.theme, dark(p) ? 0.1 : 0.08)};
    border-radius: 14px;
    box-shadow: ${cardShadow};

    &::before { content: none; }
`;

/**
 * 단추. default 는 카드 같은 단추(옅은 선), primary 는 단풍 붉음 채움, danger 는 붉은 글씨(누르면 채움), ghost 는 바탕 없음.
 * --stamp-ink 는 예전 이름 그대로 선의 색이다(쓰는 쪽이 hover 에 바꾸던 것). square 면 둥근 네모(아이콘 단추), 아니면 알약.
 */
export const stampButton = (variant: "default" | "primary" | "danger" | "ghost" = "default", { square = false } = {}) => css`
    position: relative;
    border: 1px solid var(--stamp-ink);
    border-radius: ${square ? "10px" : "999px"};
    box-shadow: none;
    font-weight: 600;
    letter-spacing: 0;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease;

    ${variant === "default" && css`
        --stamp-ink: ${(p: Themed) => hair(p.theme, dark(p) ? 0.16 : 0.14)};
        background-color: ${(p: Themed) => p.theme.colors.surface};
        color: ${(p: Themed) => p.theme.colors.text};

        &:hover {
            --stamp-ink: ${(p: Themed) => hair(p.theme, 0.26)};
            background-color: ${(p: Themed) => withAlpha(p.theme.colors.primary, dark(p) ? 0.1 : 0.05)};
            box-shadow: none;
        }
    `}

    ${variant === "primary" && css`
        --stamp-ink: transparent;
        background-color: ${(p: Themed) => p.theme.colors.primary};
        color: ${onPrimary};
        box-shadow: 0 1px 2px ${(p: Themed) => withAlpha(p.theme.colors.primary, 0.3)};

        &:hover {
            background-color: ${(p: Themed) => `color-mix(in srgb, ${p.theme.colors.primary} 88%, #000)`};
            box-shadow: 0 2px 8px -2px ${(p: Themed) => withAlpha(p.theme.colors.primary, 0.45)};
        }
    `}

    ${variant === "danger" && css`
        --stamp-ink: ${(p: Themed) => withAlpha(p.theme.colors.error, 0.4)};
        background-color: transparent;
        color: ${(p: Themed) => p.theme.colors.error};

        &:hover {
            --stamp-ink: ${(p: Themed) => p.theme.colors.error};
            background-color: ${(p: Themed) => p.theme.colors.error};
            color: ${onPrimary};
            box-shadow: none;
        }
    `}

    ${variant === "ghost" && css`
        --stamp-ink: transparent;
        background-color: transparent;
        color: ${(p: Themed) => p.theme.colors.text};

        &:hover {
            background-color: ${(p: Themed) => hair(p.theme, 0.06)};
            box-shadow: none;
        }
    `}

    &:active { transform: translateY(1px); }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px ${(p: Themed) => withAlpha(p.theme.colors.primary, 0.28)};
    }

    &::after { content: none; }
`;

/**
 * 체크 칸 — 둥근 네모. done 이면 단풍 붉음으로 채우고 흰 체크, 아니면 옅은 선만(마우스를 올리면 체크가 옅게 비친다).
 * 크기는 쓰는 쪽에서(width·height). 안의 svg(체크 아이콘)는 숨긴다 — ::after 가 대신 그린다.
 */
export const inkCheckbox = (done: boolean) => css`
    position: relative;
    border: 1.5px solid ${(p: Themed) => (done ? p.theme.colors.primary : hair(p.theme, 0.32))};
    border-radius: 6px;
    background-color: ${(p: Themed) => (done ? p.theme.colors.primary : "transparent")};
    ${(p: Themed) => (done ? `background-image: linear-gradient(${p.theme.colors.primary}, ${p.theme.colors.primary});` : "")}
    box-shadow: none;
    color: transparent;
    transition: border-color 0.15s ease, background-color 0.15s ease;

    svg { display: none; }
    &::before { content: none; }

    &::after {
        content: "";
        position: absolute;
        inset: 8%;
        ${vectorMask(CHECK)}
        background-color: ${(p: Themed) => (done ? onPrimary(p) : p.theme.colors.primary)};
        opacity: ${done ? 1 : 0};
        transition: opacity 0.15s ease;
        pointer-events: none;
    }

    &:hover { border-color: ${(p: Themed) => p.theme.colors.primary}; }
    &:hover::after { opacity: ${done ? 1 : 0.35}; }
`;

/** 밑줄 — ::after 안에서 쓴다. 둥근 끝의 가는 막대(색은 쓰는 쪽의 background-color) */
export const brushUnderline = (stroke: "a" | "b" | "c" = "a", height = "2px") => {
    void stroke; // 예전의 붓 결 — 이제 한 가지
    return brushUnderlineCss(height);
};
const brushUnderlineCss = (height: string) => css`
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -3px;
    height: ${height === "5px" ? "2px" : height};
    border-radius: 2px;
    pointer-events: none;
`;

/** 둥근 것(사진·문장) 둘레의 가는 고리 — ::before 로. inset 은 음수로 줘서 바깥으로 둘러친다 (색은 background-color) */
export const wreathFrame = (inset = "-18%") => css`
    content: "";
    position: absolute;
    inset: ${inset};
    ${vectorMask(RING)}
    pointer-events: none;
`;

/** 책갈피 — 세로로 긴 표식 */
export const bookmark = css`
    ${vectorMask(BOOKMARK, "100% 100%")}
    border-radius: 0;
`;

/** 아래에서 올라오는 시트의 위 가장자리 — 예전엔 찢은 종이. 이제는 둥근 위 모서리만 */
export const tornTop = (height = "24px") => {
    void height; // 예전의 찢긴 띠 높이
    return tornTopCss;
};
const tornTopCss = css`
    mask: none;
    -webkit-mask: none;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
`;

/** 카테고리마다 다르던 잎 칩 — 이제 같은 단풍잎 하나(색이 카테고리를 가른다) */
export type LeafShape = 3 | 5 | 7;
export const leafShapeOf = (key: string | null | undefined): LeafShape => {
    let h = 0;
    for (const ch of key ?? "") h = (h * 31 + ch.charCodeAt(0)) | 0;
    return ([5, 3, 7] as const)[Math.abs(h) % 3];
};
export const leafChip = (shape: LeafShape, size = "11px") => {
    void shape; // 예전엔 갈래 수가 달랐다
    return leafChipCss(size);
};
const leafChipCss = (size: string) => css`
    width: ${size};
    height: ${size};
    flex-shrink: 0;
    border: none;
    border-radius: 0;
    transform: none;
    box-shadow: none;
    ${vectorMask(LEAF_FILLED)}
`;

/** 입력칸 — 카드 위의 둥근 칸. 초점이 오면 붉은 테와 옅은 번짐 */
export const inkInput = css`
    background-color: ${(p: Themed) => (dark(p) ? withAlpha("#000000", 0.18) : withAlpha("#FFFFFF", 0.85))};
    border: 1px solid ${(p: Themed) => hair(p.theme, dark(p) ? 0.16 : 0.14)};
    border-radius: 10px;
    color: ${(p: Themed) => p.theme.colors.text};
    box-shadow: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &::placeholder { color: ${(p: Themed) => withAlpha(p.theme.colors.textSecondary, 0.85)}; }

    &:focus, &:focus-within {
        outline: none;
        border-color: ${(p: Themed) => p.theme.colors.primary};
        box-shadow: 0 0 0 3px ${(p: Themed) => withAlpha(p.theme.colors.primary, 0.14)};
    }
`;

/** 탭 — 고른 탭은 진한 글씨와 밑의 붉은 막대. 안 고른 탭은 옅은 글씨 */
export const paperTab = (active: boolean) => css`
    position: relative;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    color: ${(p: Themed) => (active ? p.theme.colors.text : p.theme.colors.textSecondary)};
    font-weight: ${active ? 600 : 500};
    box-shadow: none;

    &::after {
        ${brushUnderline("a", "2px")}
        background-color: ${(p: Themed) => p.theme.colors.primary};
        opacity: ${active ? 1 : 0};
        transition: opacity 0.15s ease;
    }

    &:hover { color: ${(p: Themed) => p.theme.colors.text}; }
    &:hover::after { opacity: ${active ? 1 : 0.3}; }
`;

/** 칩(카테고리·필터) — 알약. 고르면 붉음이 옅게 */
export const inkChip = (active: boolean) => css`
    border: 1px solid ${(p: Themed) => (active ? withAlpha(p.theme.colors.primary, 0.35) : hair(p.theme, 0.14))};
    border-radius: 999px;
    background-color: ${(p: Themed) => (active ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.08) : "transparent")};
    color: ${(p: Themed) => (active ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    box-shadow: none;
`;

/* ── 창(모달) 안의 서식 — 머리글·줄·바닥 ── */

/** 창 머리글: 옅은 밑줄, 제목 입력칸은 명조 */
export const formHeader = css`
    border-bottom: 1px solid ${(p: Themed) => hair(p.theme, 0.1)};
    border-radius: 0;

    .title-input {
        font-family: ${(p: Fonted) => p.theme.fonts.display};
        font-weight: 700;
        letter-spacing: 0;

        &:focus { border-bottom-color: ${(p: Themed) => p.theme.colors.primary}; }
    }

    .close-btn:hover { color: ${(p: Themed) => p.theme.colors.primary}; }
`;

/** 서식의 한 줄: 옅은 선으로 나뉘고, 입력칸에 마우스가 오면 옅게 물든다 */
export const formRow = css`
    border-bottom: 1px solid ${(p: Themed) => hair(p.theme, 0.07)};

    label { font-weight: 600; }

    input[type="text"], input[type="date"], input[type="datetime-local"], input[type="number"], textarea, select {
        border-radius: 8px;

        &:hover, &:focus {
            background-color: ${(p: Themed) => hair(p.theme, 0.04)};
            border-color: ${(p: Themed) => hair(p.theme, 0.2)};
            box-shadow: none;
        }
    }
`;

/** 서식 바닥: 옅은 윗줄 */
export const formFooter = css`
    border-top: 1px solid ${(p: Themed) => hair(p.theme, 0.1)};
    border-radius: 0;
`;

/** 켜고 끄는 스위치: 옅은 홈에 흰 손잡이, 켜면 붉은 홈 */
export const paperToggle = css`
    /* 치수까지 여기서 — 뼈대의 60×22 에 18px 손잡이를 얹으면 손잡이가 한쪽으로 쏠렸다. 40×24, 손잡이 18px, 둘레 3px */
    width: 40px;
    min-width: 40px !important;
    height: 24px;

    .slider {
        background-color: ${(p: Themed) => hair(p.theme, 0.18)};
        border: none;
        box-sizing: border-box;
        border-radius: 999px;
        transition: background-color 0.18s ease;
    }

    .slider::before {
        background-color: #FFFFFF;
        opacity: 1;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        transition: transform 0.2s cubic-bezier(0.3, 0.7, 0.4, 1);
    }

    input:checked + .slider {
        background-color: ${(p: Themed) => p.theme.colors.primary};
        border-color: ${(p: Themed) => p.theme.colors.primary};
    }

    input:checked + .slider::before {
        background-color: #FFFFFF;
        opacity: 1;
        transform: translateX(16px);
    }
`;
