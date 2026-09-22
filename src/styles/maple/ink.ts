/**
 * Maple 테마의 먹 장식 — 여러 화면의 *.styles.ts 가 같이 쓰는 조각.
 *
 * public/themes/maple 의 마스크(검정 먹 → 알파)를 CSS mask 로 씌우고 색은 background 로 입힌다.
 * 그래서 한 파일로 낮(먹 #3B2A20)·밤(크림 #EFE3D0) 어느 색이든 된다. 그림 목록은 scripts/maple-assets.mjs.
 *
 * 2차 그림(ASSETS-2, 2026-09-22)부터 조작부도 그림이다: 도장 틀(J1·J2)은 9조각 mask-box-image 로 어떤 크기의 단추에도 늘어나고,
 * 붓 밑줄(J3)·체크 칸(J9)·화환(J7)·책갈피(J5)·찢은 가장자리(J6)·잎 칩(J10)은 보통 mask 다.
 * mask-box-image 는 Chromium·WebKit 만 안다 — 데스크톱(WebView2)·안드로이드(WebView)·크롬은 되고, Firefox 는 @supports 로 걸러 CSS 테두리로 남는다.
 */
import { css } from "styled-components";
import { withAlpha } from "@/styles/color";

export const ASSET = "/themes/maple";

/** 먹 하이라인 — 선은 붉은 primary 가 아니라 먹(text)을 옅게. Celestial 의 금빛 실선 자리 */
export const hair = (theme: { colors: { text: string } }, alpha = 0.3) => withAlpha(theme.colors.text, alpha);

/** 9조각 틀. slice 는 원본 픽셀, width 는 화면 픽셀 — 틀의 선 굵기는 (원본 선 굵기 × width / slice) */
const boxMask = (file: string, slice: number, width: string) => css`
    -webkit-mask-box-image: url("${ASSET}/${file}") ${slice} fill / ${width} round;
    mask-border: url("${ASSET}/${file}") ${slice} fill / ${width} round;
`;
/** @supports 조건 — 9조각 틀을 그릴 수 있는 곳 */
const BOX_MASK = "(-webkit-mask-box-image: none)";

/** 마스크 그림을 씌운 상자. 색은 background 로 준다 (기본 currentColor) */
export const inkMask = (file: string, size = "contain") => css`
    mask: url("${ASSET}/${file}") center / ${size} no-repeat;
    -webkit-mask: url("${ASSET}/${file}") center / ${size} no-repeat;
    background-color: currentColor;
`;

/** 마스크만 (색은 그대로) — 단추 자체를 잘라낼 때 */
export const inkMaskOnly = (file: string, size = "contain") => css`
    mask: url("${ASSET}/${file}") center / ${size} no-repeat;
    -webkit-mask: url("${ASSET}/${file}") center / ${size} no-repeat;
`;

/** 할 일 줄 앞의 잎 — 안 한 일은 윤곽(C5 를 C6 에서 만든 것), 끝낸 일은 채운 잎(C6) */
export const leafBullet = (on: boolean, size = "11px") => css`
    width: ${size};
    height: ${size};
    flex-shrink: 0;
    border: none;
    transform: none;
    box-shadow: none;
    ${inkMask(on ? "bullet-filled.webp" : "bullet-outline.webp")}
`;

/**
 * 마스크에 색을 입힌다 — background-color 를 통째로 지우는 곳(데스크톱 위젯 페이지의
 * `& * { background-color: transparent }`)에서도 살아남도록 같은 색의 그라데이션을 함께 깐다.
 */
export const inkFill = (color: string) => css`
    background-color: ${color};
    background-image: linear-gradient(${color}, ${color});
`;

/** 머리글의 ✦ 자리 — 잎 문장(C4) */
export const crest = (size = "14px") => css`
    display: inline-block;
    width: ${size};
    height: ${size};
    ${inkMask("crest.webp")}
`;

/** 완료 체크 도장(C7) */
export const checkStamp = (size = "14px") => css`
    display: inline-block;
    width: ${size};
    height: ${size};
    ${inkMask("check.webp")}
`;

/** 짧은 먹선 장식(C2) — 가운데 씨앗 셋. 한 줄 전체 폭을 차지하며 가운데 정렬 */
export const shortRule = (height = "14px") => css`
    height: ${height};
    ${inkMask("divider-short.webp", "auto 100%")}
`;

/** 긴 덩굴 먹선(C1) — 섹션 머리글 옆 */
export const vineRule = (height = "12px") => css`
    height: ${height};
    ${inkMask("divider-vine.webp", "100% 100%")}
`;

/**
 * 머리글 뒤에 깔리는 옅은 수채 띠(A3). 낮·밤 그림이 따로 있다.
 * 글 뒤에 깔리므로 아주 옅게 — opacity 는 쓰는 쪽에서 조절.
 */
export const washBand = css`
    background-image: url("${ASSET}/wash-light.webp");
    background-size: auto 100%;
    background-repeat: repeat-x;
    background-position: center;
`;
export const washBandDark = css`
    background-image: url("${ASSET}/wash-dark.webp");
`;

/**
 * 일정 막대의 마스킹테이프 결(A4). 막대 자체에 mask 로 씌우면 위아래가 찢긴 종이처럼 된다.
 * 가로로 반복되므로 막대가 길어도 결이 늘어나지 않는다.
 */
export const tape = css`
    mask: url("${ASSET}/tape.webp") left center / auto 100% repeat-x;
    -webkit-mask: url("${ASSET}/tape.webp") left center / auto 100% repeat-x;
`;

/**
 * 색인 카드 틀(A5). 요소 위에 ::after 로 얹는다 — 9조각으로 늘어나므로 어떤 크기에도 맞는다.
 * (Chromium·WebKit 의 -webkit-mask-box-image. Firefox 는 틀 없이 테두리만 남는다)
 */
export const cardFrame = (color: string, width = "22px") => css`
    position: relative;

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: ${color};
        -webkit-mask-box-image: url("${ASSET}/card-frame.webp") 96 fill / ${width} repeat;
        mask-border: url("${ASSET}/card-frame.webp") 96 fill / ${width} repeat;
    }
`;

/* ── 조작부의 말 — 단추·입력칸·탭·칩. 화면마다 따로 그리면 손이 달라지므로 여기서 한 번 정한다 ──
   Celestial 이 "가는 금빛 선과 빛무리" 라면 Maple 은 "종이에 찍은 도장" 이다:
   납작한 종이 위에 먹 하이라인, 누르면 잉크가 살짝 번지듯 황토 물이 들고, 주된 단추는 밀랍 붉음. 빛무리(box-shadow glow)는 없다. */

type Themed = { theme: { mode: "light" | "dark"; colors: { text: string; primary: string; accent: string; background: string; surface: string; error: string; textSecondary: string } } };
type Fonted = Themed & { theme: { fonts: { display: string } } };

/** 종이 한 장 — 판·카드의 바탕. 살짝 짙은 종이(surface)에 먹 하이라인, 안쪽으로 옅은 괘선 하나 */
export const paperCard = (inset = "3px") => css`
    position: relative;
    background-color: ${(p: Themed) => p.theme.colors.surface};
    border: 1px solid ${(p: Themed) => hair(p.theme, 0.4)};
    border-radius: 2px;
    box-shadow: none;

    &::before {
        content: "";
        position: absolute;
        inset: ${inset};
        border: 1px solid ${(p: Themed) => hair(p.theme, 0.12)};
        border-radius: 1px;
        pointer-events: none;
    }
`;

/**
 * 도장 단추. default 는 먹 윤곽, primary 는 밀랍 붉음, danger 는 붉은 윤곽에서 누르면 채움, ghost 는 윤곽 없음.
 * 누르면 1px 내려앉고 안쪽 그늘이 진다 — 빛나지 않는다.
 *
 * 틀은 그림이다(J1 고무도장 틀, square 면 J2 네모 도장): 단추 자체를 "채운 도장" 마스크로 잘라 바탕색·글자의 가장자리가
 * 도장처럼 거칠고, 그 위에 ::after 로 틀을 얹는다. 틀의 색은 --stamp-ink — 쓰는 쪽에서 hover 에 바꾸려면 이 변수를 바꾼다
 * (CSS border-color 를 바꿔도 틀엔 안 먹는다; 틀을 못 그리는 Firefox 에서만 border 가 보인다).
 * 초점 고리는 outline 이 마스크에 잘리므로 안쪽 그림자로 그린다.
 */
export const stampButton = (variant: "default" | "primary" | "danger" | "ghost" = "default", { square = false } = {}) => css`
    position: relative;
    border: 1px solid var(--stamp-ink);
    border-radius: 2px;
    box-shadow: none;
    font-family: ${(p: Fonted) => p.theme.fonts.display};
    letter-spacing: 0.04em;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.08s ease;

    ${variant === "default" && css`
        --stamp-ink: ${(p: Themed) => hair(p.theme, 0.55)};
        background-color: transparent;
        color: ${(p: Themed) => p.theme.colors.text};

        &:hover {
            --stamp-ink: ${(p: Themed) => hair(p.theme, 0.85)};
            background-color: ${(p: Themed) => withAlpha(p.theme.colors.accent, p.theme.mode === "dark" ? 0.14 : 0.2)};
            box-shadow: none;
        }
    `}

    ${variant === "primary" && css`
        --stamp-ink: ${(p: Themed) => `color-mix(in srgb, ${p.theme.colors.primary} 72%, #000)`};
        background-color: ${(p: Themed) => p.theme.colors.primary};
        color: ${(p: Themed) => p.theme.colors.background};

        &:hover {
            background-color: ${(p: Themed) => `color-mix(in srgb, ${p.theme.colors.primary} 86%, #000)`};
            box-shadow: none;
        }
    `}

    ${variant === "danger" && css`
        --stamp-ink: ${(p: Themed) => p.theme.colors.error};
        background-color: transparent;
        color: ${(p: Themed) => p.theme.colors.error};

        &:hover {
            --stamp-ink: ${(p: Themed) => `color-mix(in srgb, ${p.theme.colors.error} 72%, #000)`};
            background-color: ${(p: Themed) => p.theme.colors.error};
            color: ${(p: Themed) => p.theme.colors.background};
            box-shadow: none;
        }
    `}

    ${variant === "ghost" && css`
        --stamp-ink: transparent;
        background-color: transparent;
        color: ${(p: Themed) => p.theme.colors.text};

        &:hover {
            background-color: ${(p: Themed) => withAlpha(p.theme.colors.accent, 0.18)};
            box-shadow: none;
        }
    `}

    &:active {
        transform: translateY(1px);
        box-shadow: inset 0 1px 2px ${withAlpha("#000000", 0.18)};
    }

    &:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px ${(p: Themed) => p.theme.colors.background}, inset 0 0 0 3px ${(p: Themed) => p.theme.colors.primary};
    }

    @supports ${BOX_MASK} {
        border-color: transparent !important;
        ${square ? inkMaskOnly("stamp-square-fill.webp", "100% 100%") : boxMask("stamp-fill.webp", 36, "4.5px")}

        &::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: var(--stamp-ink);
            transition: background-color 0.15s ease;
            ${square ? inkMaskOnly("stamp-square.webp", "100% 100%") : boxMask("stamp-frame.webp", 36, "4.5px")}
        }
    }
`;

/**
 * 체크 칸(J9)에 체크 도장(C7). 상자 크기는 쓰는 쪽에서(width·height). done 이면 도장이 찍혀 있고, 마우스를 올리면 옅게 비친다.
 * 안의 svg(체크 아이콘)는 숨긴다 — 도장이 대신한다.
 */
export const inkCheckbox = (done: boolean) => css`
    position: relative;
    border: none;
    border-radius: 0;
    background-color: transparent;
    box-shadow: none;
    color: transparent;

    svg { display: none; }

    &::before {
        content: "";
        position: absolute;
        inset: -12%;
        ${inkMask("check-box.webp")}
        background-color: ${(p: Themed) => hair(p.theme, 0.8)};
        pointer-events: none;
    }

    &::after {
        content: "";
        position: absolute;
        inset: -20%;
        ${inkMask("check.webp")}
        background-color: ${(p: Themed) => p.theme.colors.primary};
        opacity: ${done ? 1 : 0};
        transition: opacity 0.15s ease;
        pointer-events: none;
    }

    &:hover::after { opacity: ${done ? 1 : 0.3}; }
`;

/** 붓 밑줄(J3) — ::after 안에서 쓴다. a 는 또렷한 한 획, b 는 마른 붓, c 는 굵은 획 */
export const brushUnderline = (stroke: "a" | "b" | "c" = "a", height = "5px") => css`
    content: "";
    position: absolute;
    left: -2%;
    right: -2%;
    bottom: -3px;
    height: ${height};
    ${inkMask(`underline-${stroke}.webp`, "100% 100%")}
    pointer-events: none;
`;

/** 잎 화환(J7) — 둥근 것(사진·엠블럼) 둘레에 ::before 로. inset 은 음수로 줘서 바깥으로 둘러친다 */
export const wreathFrame = (inset = "-18%") => css`
    content: "";
    position: absolute;
    inset: ${inset};
    ${inkMask("wreath.webp")}
    pointer-events: none;
`;

/** 책갈피 리본(J5) — 세로로 긴 표식 */
export const bookmark = css`
    ${inkMask("bookmark.webp", "100% 100%")}
    border-radius: 0;
`;

/**
 * 위 가장자리를 찢은 종이(J6) — 아래에서 올라오는 시트에. 요소 전체를 두 겹 마스크로: 위 띠는 찢은 결, 그 아래는 통째로.
 * height 는 찢긴 띠의 높이 — 그림의 위 30% 가 결이므로 24px 이면 결이 7px 쯤 보인다.
 */
export const tornTop = (height = "24px") => css`
    mask: url("${ASSET}/torn-edge.webp") top center / auto ${height} repeat-x,
        linear-gradient(#000 0 0) 0 ${height} / 100% calc(100% - ${height}) no-repeat;
    -webkit-mask: url("${ASSET}/torn-edge.webp") top center / auto ${height} repeat-x,
        linear-gradient(#000 0 0) 0 ${height} / 100% calc(100% - ${height}) no-repeat;
    mask-composite: add;
    -webkit-mask-composite: source-over;
`;

/** 카테고리마다 다른 잎(J10) — 다섯·세·일곱 갈래. 색(또는 id)을 해시해 고른다 */
export type LeafShape = 3 | 5 | 7;
export const leafShapeOf = (key: string | null | undefined): LeafShape => {
    let h = 0;
    for (const ch of key ?? "") h = (h * 31 + ch.charCodeAt(0)) | 0;
    return ([5, 3, 7] as const)[Math.abs(h) % 3];
};
export const leafChip = (shape: LeafShape, size = "11px") => css`
    width: ${size};
    height: ${size};
    flex-shrink: 0;
    border: none;
    border-radius: 0;
    transform: none;
    box-shadow: none;
    ${inkMask(`leaves/chip-${shape}.webp`)}
`;

/** 입력칸 — 종이 위의 네모 칸. 초점이 오면 먹선이 붉어질 뿐 빛나지 않는다 */
export const inkInput = css`
    background-color: ${(p: Themed) => withAlpha(p.theme.colors.background, p.theme.mode === "dark" ? 0.4 : 0.6)};
    border: 1px solid ${(p: Themed) => hair(p.theme, 0.45)};
    border-radius: 2px;
    color: ${(p: Themed) => p.theme.colors.text};
    box-shadow: none;
    transition: border-color 0.15s ease;

    &::placeholder { color: ${(p: Themed) => withAlpha(p.theme.colors.textSecondary, 0.8)}; }

    &:focus, &:focus-within {
        outline: none;
        border-color: ${(p: Themed) => p.theme.colors.primary};
        box-shadow: none;
    }
`;

/** 종이 탭 — 고른 탭 밑에 붓으로 그은 붉은 획(J3). 안 고른 탭은 마우스를 올리면 옅게 비친다. 획은 ::after 다 */
export const paperTab = (active: boolean) => css`
    position: relative;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    color: ${(p: Themed) => (active ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    box-shadow: none;

    &::after {
        ${brushUnderline("a", "5px")}
        background-color: ${(p: Themed) => p.theme.colors.primary};
        opacity: ${active ? 1 : 0};
        transition: opacity 0.15s ease;
    }

    &:hover { color: ${(p: Themed) => p.theme.colors.text}; }
    &:hover::after { opacity: ${active ? 1 : 0.35}; }
`;

/** 칩(카테고리·필터) — 하이라인 네모에 황토 물 */
export const inkChip = (active: boolean) => css`
    border: 1px solid ${(p: Themed) => hair(p.theme, active ? 0.6 : 0.3)};
    border-radius: 2px;
    background-color: ${(p: Themed) => (active ? withAlpha(p.theme.colors.accent, 0.16) : "transparent")};
    color: ${(p: Themed) => (active ? p.theme.colors.text : p.theme.colors.textSecondary)};
    box-shadow: none;
`;

/* ── 창(모달) 안의 서식 — 머리글·줄·바닥. 창마다 조금씩 다른 이름을 쓰므로 조각으로 둔다 ── */

/** 창 머리글: 먹 하이라인 밑줄, 제목 입력칸은 초점이 오면 붉은 밑줄 */
export const formHeader = css`
    border-bottom: 1px solid ${(p: Themed) => hair(p.theme, 0.45)};
    border-radius: 0;

    .title-input {
        font-family: ${(p: Fonted) => p.theme.fonts.display};
        font-weight: 500;
        letter-spacing: 0.02em;

        &:focus { border-bottom-color: ${(p: Themed) => p.theme.colors.primary}; }
    }

    .close-btn:hover { color: ${(p: Themed) => p.theme.colors.primary}; }
`;

/** 서식의 한 줄: 먹 하이라인으로 나뉘고, 입력칸에 마우스가 오면 황토 물 */
export const formRow = css`
    border-bottom: 1px solid ${(p: Themed) => hair(p.theme, 0.18)};

    label { font-family: ${(p: Fonted) => p.theme.fonts.display}; }

    input[type="text"], input[type="date"], input[type="datetime-local"], input[type="number"], textarea, select {
        border-radius: 2px;

        &:hover, &:focus {
            background-color: ${(p: Themed) => withAlpha(p.theme.colors.accent, 0.14)};
            border-color: ${(p: Themed) => hair(p.theme, 0.4)};
            box-shadow: none;
        }
    }
`;

/** 서식 바닥: 먹 하이라인 윗줄 */
export const formFooter = css`
    border-top: 1px solid ${(p: Themed) => hair(p.theme, 0.3)};
    border-radius: 0;
`;

/** 켜고 끄는 스위치: 하이라인 홈에 종이 손잡이, 켜면 붉은 홈 */
export const paperToggle = css`
    .slider {
        background-color: transparent;
        border: 1px solid ${(p: Themed) => hair(p.theme, 0.5)};
        box-sizing: border-box;
        border-radius: 12px;
    }

    .slider::before {
        background-color: ${(p: Themed) => p.theme.colors.text};
        opacity: 0.55;
        box-shadow: none;
        height: 12px;
        width: 12px;
        left: 4px;
        bottom: 4px;
    }

    input:checked + .slider {
        background-color: ${(p: Themed) => p.theme.colors.primary};
        border-color: ${(p: Themed) => p.theme.colors.primary};
    }

    input:checked + .slider::before {
        background-color: ${(p: Themed) => p.theme.colors.background};
        opacity: 1;
    }
`;
