/**
 * Maple 테마의 먹 장식 — 여러 화면의 *.styles.ts 가 같이 쓰는 조각.
 *
 * public/themes/maple 의 마스크(검정 먹 → 알파)를 CSS mask 로 씌우고 색은 background 로 입힌다.
 * 그래서 한 파일로 낮(먹 #3B2A20)·밤(크림 #EFE3D0) 어느 색이든 된다. 그림 목록은 scripts/maple-assets.mjs.
 */
import { css } from "styled-components";
import { withAlpha } from "@/styles/color";

export const ASSET = "/themes/maple";

/** 먹 하이라인 — 선은 붉은 primary 가 아니라 먹(text)을 옅게. Celestial 의 금빛 실선 자리 */
export const hair = (theme: { colors: { text: string } }, alpha = 0.3) => withAlpha(theme.colors.text, alpha);

/** 마스크 그림을 씌운 상자. 색은 background 로 준다 (기본 currentColor) */
export const inkMask = (file: string, size = "contain") => css`
    mask: url("${ASSET}/${file}") center / ${size} no-repeat;
    -webkit-mask: url("${ASSET}/${file}") center / ${size} no-repeat;
    background-color: currentColor;
`;

/** 할 일 줄 앞의 잎 — 안 한 일은 윤곽(C5), 끝낸 일은 채운 잎(C6) */
export const leafBullet = (on: boolean, size = "11px") => css`
    width: ${size};
    height: ${size};
    flex-shrink: 0;
    border: none;
    transform: none;
    box-shadow: none;
    ${inkMask(on ? "bullet-filled.webp" : "bullet-outline.webp")}
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
