/**
 * 바다의 겉 틀(데스크톱 독·상표 칩, 폰 알약 탭바)이 함께 쓰는 조각 — 자리 값과 떠 있는 유리.
 * 사이드바(OceanSideBar)·폰 탭바(OceanMobileTabBar)·알림(저장 실패·업데이트)이 가져다 쓴다.
 */
import { css } from "styled-components";
import { sand } from "@/styles/ocean/water";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/**
 * 데스크톱의 떠 있는 조각 자리(px). 칩은 왼쪽 위, 독은 아래 가운데에 가장자리(edge)만큼 떨어져 뜬다.
 * 본문(MainContent)은 (main) 레이아웃이 읽는 두 값으로 비킨다:
 *   --app-top-clearance  위 여백(뼈대의 2rem)에 더하는 값 — 내용은 칩 밑으로 굴러갈 수 있다(칩은 귀퉁이만 덮는다)
 *   --app-dock-clearance 스크롤 칸 아래를 이만큼 뗀다(독 자리) — 판보다 긴 화면은 아래 여백 없이 칸 끝까지 굴러가서,
 *                         칸이 독 밑까지 내려가 있으면 마지막 줄이 독에 깔린다. 뗀 만큼 아래 여백은 2rem → 1rem.
 */
export const SHELL = {
    edge: 12,
    /** 상표 칩 높이 */
    chipH: 38,
    /** 상표(Cronos) 칸 폭 — 칩의 왼쪽 */
    logoW: 92,
    /** 독 높이 (44px 단추 + 위아래 5px) */
    dockH: 54,
    /** 칩 밑과 본문 사이 (칩은 왼쪽 귀퉁이만 덮어 조금 붙여도 된다) */
    gapTop: 10,
    /** 스크롤 칸 끝과 독 위 사이 */
    gapBottom: 4,
} as const;

/** MainContent 의 위 여백(2rem)에 더하는 값 */
export const TOP_CLEARANCE = SHELL.edge + SHELL.chipH + SHELL.gapTop - 32;
/** MainContent 스크롤 칸 아래를 떼는 값 (독 자리) */
export const DOCK_CLEARANCE = SHELL.edge + SHELL.dockH + SHELL.gapBottom;
/** 독 위로 뜨는 알림의 바닥 자리 */
export const ABOVE_DOCK = SHELL.edge + SHELL.dockH + 10;

/** 데스크톱 앱이면 맨 위에 제목 줄(36px, TitleBar 의 data-tauri-drag-region)이 있다 — 칩은 그 밑으로 비킨다 */
export const WITH_TITLEBAR = "[data-app-shell]:has([data-tauri-drag-region])";
export const TITLEBAR_H = 36;

/**
 * 떠 있는 막대 유리 — 물가 판(sand)을 조금 더 짙게 깔고, 위 가장자리에 빛 한 줄과 먼 그림자.
 * 독·칩·폰 탭바처럼 본문 위를 지나다니는 것이라 뒤의 글씨가 비쳐 어지럽지 않을 만큼만 투명하다. 모서리는 쓰는 쪽이 정한다.
 */
export const dockGlass = css`
    ${sand}
    background-color: ${(p) => (dark(p) ? "rgba(10, 28, 32, 0.72)" : "rgba(252, 253, 251, 0.66)")};
    border: 1px solid ${(p) => (dark(p) ? "rgba(160, 240, 230, 0.14)" : "rgba(255, 255, 255, 0.82)")};
    box-shadow:
        inset 0 1px 0 ${(p) => (dark(p) ? "rgba(180, 250, 240, 0.1)" : "rgba(255, 255, 255, 0.95)")},
        0 1px 2px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.3)" : "rgba(6, 60, 66, 0.06)")},
        0 18px 40px -18px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.75)" : "rgba(6, 60, 66, 0.45)")};
`;
