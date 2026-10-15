/**
 * MapleEmblem 의 모양 — 옅게 물든 동그라미 안의 아이콘 하나. 색은 종류를 따른다:
 * 알림·물음은 단풍 붉음, 위험은 오류색, 완료는 초록. 나타날 때 한 번 살짝 부풀었다 앉는다.
 */
import styled, { keyframes, type DefaultTheme } from "styled-components";
import type { DialogKind } from "../arcana";
import { withAlpha } from "@/styles/color";
import { crest } from "@/styles/maple/ink";

const pop = keyframes`
    from { opacity: 0; transform: scale(0.6); }
    60%  { opacity: 1; transform: scale(1.06); }
    to   { opacity: 1; transform: none; }
`;

const tone = (theme: DefaultTheme, kind: DialogKind) =>
    kind === "danger" ? theme.colors.error : kind === "ok" ? theme.colors.success : theme.colors.primary;

export const Mark = styled.span<{ $kind: DialogKind }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    color: ${(p) => tone(p.theme, p.$kind)};
    background-color: ${(p) => withAlpha(tone(p.theme, p.$kind), p.theme.mode === "dark" ? 0.16 : 0.1)};
    animation: ${pop} 0.36s cubic-bezier(0.2, 0.8, 0.3, 1.2) 0.06s both;

    svg { width: 22px; height: 22px; margin: 0; stroke-width: 2; }

    :where(html[data-theme-motion="off"]) & { animation: none; }
`;

/** 알림의 문장 — 벡터 단풍잎 하나 (색은 동그라미의 글자색) */
export const Leaf = styled.span`
    ${crest("22px")}
`;
