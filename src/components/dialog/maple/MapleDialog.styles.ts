/**
 * Maple 의 알림 창 — 깨끗한 확인 카드 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 도감 도판(먹 하이라인 종이·네 귀퉁이 덩굴·"Pl. XIII" 번호와 라틴어 이름)을 걷었다.
 * 이제 네 꼴(정통·간결·띠·가로) 모두 한 틀: 18px 모서리의 카드 가운데에 옅게 물든 동그라미 아이콘(MapleEmblem),
 * 그 아래 고운바탕 굵은 제목과 14px 옅은 설명, 맨 아래 폭을 나눠 가진 알약 단추 둘(취소 · 확인).
 * 위험한 일은 확인 단추를 오류색으로 채워 알린다. 나타날 때 살짝 떠오른다(한 번).
 * (바다는 아이콘 왼쪽·글 오른쪽의 가로 틀 — Maple 은 가운데로 쌓는다)
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialDialog.styles";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { stampButton } from "@/styles/maple/ink";
import { floatLine, floatShadow, onFill, riseIn, veil } from "@/components/modal/baseModal/maple/mapleLayer";

export * from "../celestial/CelestialDialog.styles";

export const Veil = styled(C.Veil)`${veil}`;

/** 네 꼴이 함께 쓰는 카드 — 가운데로 쌓는다. 뼈대가 꼴마다 다르게 준 제목 크기·여백도 여기서 하나로 */
const card = css`
    width: 340px;
    max-width: 100%;
    padding: 28px 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background-color: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => floatLine(p.theme)};
    border-radius: 18px;
    box-shadow: ${(p) => floatShadow(p.theme)};
    animation: ${riseIn} 0.24s cubic-bezier(0.2, 0.8, 0.3, 1) both;

    /* 안쪽 괘선 */
    &::before { content: none; }

    ${C.Title} { font-size: 1.125rem; margin: 14px 0 0; }
    ${C.Message} { margin: 6px 0 0; }
    ${C.Actions} { width: 100%; justify-content: center; margin-top: 22px; }

    ${MOBILE} { padding: 26px 20px 18px; }
`;

/** 귀퉁이 장식은 그리지 않는다 */
export const Pip = styled(C.Pip)`
    display: none;
`;

/** 도판 번호·이름("Pl. XIII · Cave")은 감춘다 — 로마 숫자 장식은 걷는다 */
export const Numeral = styled(C.Numeral)`
    display: none;
`;

export const ArcanaName = styled(C.ArcanaName)`
    display: none;
`;

export const Title = styled(C.Title)`
    font-family: ${(p) => p.theme.fonts.display};
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.45;
    color: ${(p) => p.theme.colors.text};
    word-break: keep-all;
`;

/** 한글이 낱자로 꺾이지 않게 낱말 단위로 줄을 바꾼다 */
export const Message = styled(C.Message)`
    font-size: 0.875rem;
    line-height: 1.6;
    color: ${(p) => p.theme.colors.textSecondary};
    word-break: keep-all;
    overflow-wrap: anywhere;
    text-wrap: pretty;
`;

export const Actions = styled(C.Actions)`
    gap: 8px;
`;

/** 단추 — 취소는 카드 같은 알약, 확인은 붉은 알약, 위험한 확인은 오류색으로 채운 알약. 둘이면 폭을 반씩 */
export const ActionButton = styled(C.ActionButton)`
    ${(p) => stampButton(p.$tone === "go" ? "primary" : p.$tone === "danger" ? "danger" : "default")}
    flex: 1 1 0;
    min-width: 0;
    height: 42px;
    padding: 0 16px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: 0;

    /* 뼈대가 올렸을 때 테를 primary 로 바꾼다 — 테는 stampButton 의 선 색을 따른다 */
    &:hover { border-color: var(--stamp-ink); }
    &:focus-visible { outline: none; }

    ${(p) => p.$tone === "go" && css`
        &:hover { color: ${onFill(p.theme)}; }
    `}

    ${(p) => p.$tone === "danger" && css`
        --stamp-ink: transparent;
        background-color: ${p.theme.colors.error};
        color: ${onFill(p.theme)};
        box-shadow: 0 1px 2px ${withAlpha(p.theme.colors.error, 0.3)};

        &:hover {
            --stamp-ink: transparent;
            background-color: color-mix(in srgb, ${p.theme.colors.error} 88%, #000);
            color: ${onFill(p.theme)};
            box-shadow: 0 2px 8px -2px ${withAlpha(p.theme.colors.error, 0.45)};
        }
        &:focus-visible { box-shadow: 0 0 0 3px ${withAlpha(p.theme.colors.error, 0.3)}; }
    `}

    ${MOBILE} { height: 46px; }
`;

/* ── 정통(위험) — 머리의 번호·이름과 나눔선은 감추고 같은 틀로 ─────────── */
export const FullCard = styled(C.FullCard)`
    ${card}

    .head, .rule { display: none; }
    svg { margin: 0; }
`;

/* ── 간결 — 아이콘 옆의 번호·이름은 감춘다 ─────────────────────────── */
export const PlainCard = styled(C.PlainCard)`
    ${card}

    .top { margin: 0; }
    .top > div { display: none; }
`;

/* ── 띠 — 색 띠는 쓰지 않고 같은 틀로 ───────────────────────────────── */
export const BandCard = styled(C.BandCard)`
    ${card}
    overflow: visible;

    .banner { display: none; }
    .inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 0;
    }
    .inner svg { margin: 0; }
`;

/* ── 가로 — 왼쪽 칸과 그 실선을 걷고 같은 틀로 ─────────────────────── */
export const LandCard = styled(C.LandCard)`
    ${card}
    gap: 0;

    .side { width: auto; padding: 0; border-right: none; }
    .body {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
`;
