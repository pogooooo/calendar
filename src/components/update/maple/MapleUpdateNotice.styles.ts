/**
 * Maple 의 업데이트 쪽지(데스크톱 오른쪽 아래) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 덩굴 귀(먹 그림)·먹 하이라인 두 겹을 걷고 떠 있는 카드 한 장(16px 모서리·얕은 그림자).
 * 머리는 13px 붉은 꼬리표, 판 이름은 고운바탕 굵게, 고친 것 목록의 글머리표는 작은 벡터 단풍잎, 단추는 글자 단추와 붉은 알약.
 * 내려받는 동안의 막대는 둥근 4px 홈에 붉은 채움.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialUpdateNotice.styles";
import { crest, hair, stampButton } from "@/styles/maple/ink";
import { popCard, roundIcon, titleType } from "@/components/modal/baseModal/maple/mapleLayer";

export * from "../celestial/CelestialUpdateNotice.styles";

export const Panel = styled(C.Panel)`
    ${popCard("16px")}
    width: 300px;
    padding: 14px 14px 16px 18px;
`;

/** 귀퉁이 장식은 그리지 않는다 */
export const Corner = styled(C.Corner)`
    display: none;
`;

export const Label = styled(C.Label)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.primary};
`;

export const CloseBtn = styled(C.CloseBtn)`
    ${roundIcon("28px", "15px")}
    margin: -4px -4px 0 0;
`;

/** 판 이름 — 카테고리 초대 쪽지(MapleInviteNotice)는 이 자리에 초대 한 문장을 쓴다 */
export const Version = styled(C.Version)`
    ${titleType("1.125rem")}
    margin-top: 2px;
    padding-right: 4px;
    word-break: keep-all;
`;

/** 고친 것 목록 — 글머리표는 작은 벡터 단풍잎 */
export const Notes = styled(C.Notes)`
    margin-top: 10px;
    padding-left: 0;
    padding-right: 4px;
    list-style: none;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: ${(p) => p.theme.colors.text};
    word-break: keep-all;

    li {
        position: relative;
        padding-left: 18px;
    }
    li + li { margin-top: 4px; }
    li::before {
        content: "";
        position: absolute;
        left: 1px;
        top: 0.4em;
        ${crest("10px")}
        color: ${(p) => p.theme.colors.primary};
    }
`;

export const Desc = styled(C.Desc)`
    margin-top: 10px;
    padding-right: 4px;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: ${(p) => p.theme.colors.textSecondary};
    word-break: keep-all;
`;

export const Row = styled(C.Row)`
    gap: 6px;
    margin-top: 16px;
    padding-right: 2px;
`;

export const GhostBtn = styled(C.GhostBtn)`
    ${stampButton("ghost")}
    height: 34px;
    padding: 0 14px;
    font-size: 0.8125rem;
    color: ${(p) => p.theme.colors.textSecondary};
    &:hover { color: ${(p) => p.theme.colors.text}; border-color: transparent; }
    &:disabled { opacity: 0.5; cursor: default; }
`;

export const PrimaryBtn = styled(C.PrimaryBtn)`
    ${stampButton("primary")}
    height: 34px;
    padding: 0 16px;
    font-size: 0.8125rem;

    svg { width: 14px; height: 14px; }
    &:hover { border-color: transparent; }
    &:disabled { opacity: 0.5; cursor: default; }
`;

export const Rail = styled(C.Rail)`
    height: 4px;
    margin-top: 14px;
    border-radius: 999px;
    background: ${(p) => hair(p.theme, 0.1)};
    overflow: hidden;
`;

export const Fill = styled(C.Fill)`
    border-radius: inherit;
    box-shadow: none;
`;
