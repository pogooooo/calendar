/**
 * 바다의 프로젝트 화면 조각 — 보드와 타임라인이 같이 쓰는 것.
 * Celestial 은 금빛 실선 틀 안의 작은 머리글, Maple 은 먹선 틀. 바다는 틀 없이 판마다 굵은 머리글 한 줄과,
 * 상태를 말하는 작은 점 하나(진행 전 = 옅은 먹, 진행 중 = 청록, 완료 = 옅은 청록).
 */
import styled, { css, type DefaultTheme } from "styled-components";
import { SectionTitle as CelestialSectionTitle } from "@/components/project/celestial/section";
import { ink } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

/** 판 머리글 — 14px 굵은 글씨, 장식 없음 */
export const SectionTitle = styled(CelestialSectionTitle)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
    padding: 16px 18px 10px;

    ${MOBILE} { padding: 14px 16px 8px; }
`;

/** 상태 점의 색 */
export const statusColor = (t: DefaultTheme, status?: string) =>
    status === "in_progress" ? t.colors.primary : status === "done" ? withAlpha(t.colors.primary, 0.4) : ink(t, t.mode === "dark" ? 0.4 : 0.28);

/** 상태 점 — 6px 납작한 동그라미 */
export const statusDot = (status?: string) => css`
    width: 6px;
    height: 6px;
    flex: none;
    border-radius: 50%;
    background: ${(p) => statusColor(p.theme, status)};
`;

/** 보드 칸의 순서 → 상태 (칸은 진행 전 · 진행 중 · 완료 순으로 그려진다) */
export const COLUMN_STATUS = ["todo", "in_progress", "done"] as const;
