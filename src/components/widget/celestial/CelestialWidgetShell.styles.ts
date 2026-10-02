/**
 * 데스크톱 위젯의 틀 — 유리판, 손잡이 줄, 설정 패널.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled, { keyframes } from "styled-components";

/* ── 모양 ─────────────────────────────────────────────────────────── */

/** 유리판이 창 밖으로 넘겨 그리는 여백 — 화면(WidgetShell)이 가짜 모니터를 밀 때 같은 값을 본다 */
export const GLASS_MARGIN = 30;

export const Shell = styled.div<{ $locked?: boolean }>`
    --widget-pad: 10px;

    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${p => p.theme?.colors?.primary};
    box-sizing: border-box;
    user-select: none;
    border-radius: 0;
    position: relative;
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    contain: layout paint;
`;

export const FakeGlassLayer = styled.div<{ $opacity: number }>`
    position: absolute;
    top: -${GLASS_MARGIN}px; left: -${GLASS_MARGIN}px;
    right: -${GLASS_MARGIN}px; bottom: -${GLASS_MARGIN}px;
    z-index: -1;
    filter: blur(${p => Math.round(p.$opacity * 40)}px) saturate(140%);
    will-change: filter;
    pointer-events: none;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
    }
`;

/** 테마의 종이결(theme.paper). 바탕 투명도 슬라이더가 이 겹의 투명도다 */
export const PaperLayer = styled.div<{ $url: string; $opacity: number }>`
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: url('${p => p.$url}') center / 384px auto repeat;
    opacity: ${p => p.$opacity};
`;

export const GlossOverlay = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.03) 15%, transparent 30%);
    box-shadow: inset 0px 0px 15px rgba(255, 255, 255, 0.05);
`;

export const VirtualMonitor = styled.div<{ $url: string; $mw: number; $mh: number }>`
    position: absolute;
    width: ${p => p.$mw}px;
    height: ${p => p.$mh}px;
    left: 0;
    top: 0;
    background-image: url('${p => p.$url}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 0;
    will-change: transform;
`;

/** 상단 바 높이. 내용과 설정 패널이 이 값만큼 비켜선다. */
const TOP_BAR_H = 30;

export const TopBar = styled.div`
    position: absolute;
    height: ${TOP_BAR_H}px;
    box-sizing: border-box;
    top: 0;
    left: 0;
    right: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 9px;
    cursor: default;
    opacity: 0.45;
    transition: opacity 0.14s ease;
    /* 유리 배경에서도 보석이 읽히도록 살짝만 어둡게 */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.18), transparent);

    &:active { cursor: default; }

    ${Shell}:hover &,
    &:focus-within { opacity: 1; }

    ${Shell}:has(> [data-settings-open]) & { opacity: 1; }
`;

export const Gem = styled.span<{ $grip?: boolean; $active?: boolean; $danger?: boolean }>`
    width: 9px;
    height: 9px;
    flex-shrink: 0;
    padding: 0;
    transform: rotate(45deg);
    border: 1px solid ${p => p.theme?.colors?.primary};
    background: ${p => p.$active ? (p.theme?.colors?.primary) : "transparent"};
    opacity: ${p => p.$grip ? 0.55 : 0.8};
    cursor: ${p => p.$grip ? "grab" : "pointer"};
    transition: background 0.12s, opacity 0.12s, box-shadow 0.12s;

    &:hover {
        opacity: 1;
        background: ${p => p.$danger ? "#C8687A" : (p.theme?.colors?.primary)};
        border-color: ${p => p.$danger ? "#C8687A" : (p.theme?.colors?.primary)};
        box-shadow: 0 0 5px ${p => p.theme?.colors?.primary}80;
    }

`;

export const Rule = styled.span`
    flex: 1;
    height: 1px;
    background: ${p => p.theme?.colors?.primary}66;
`;

export const BtnGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
`;

export const Control = styled.button<{ $active?: boolean; $danger?: boolean }>`
    width: 24px;
    height: 24px;
    padding: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: ${(p) => p.$active ? `${p.theme.colors.primary}22` : "transparent"};
    color: ${(p) => p.$danger ? p.theme.colors.error : p.theme.colors.primary};
    cursor: pointer;
    &:hover { background: ${(p) => p.theme.colors.primary}22; }
`;

const slideDown = keyframes`
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const SettingsPanel = styled.div`
    position: absolute;
    /* 상단 바 바로 아래에서 시작한다. 예전에는 30px 로 못 박혀 있어
       200px 짜리 위젯에서 내용(176px)이 칸(167px)을 넘어 잘렸다. */
    top: ${TOP_BAR_H}px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: var(--widget-pad);
    background: ${p => p.theme?.baseColors?.surface ?? p.theme?.colors?.surface};
    border-top: 1px solid ${p => p.theme?.colors?.primary}66;
    animation: ${slideDown} 0.15s ease;

    &, & * {
        color: ${p => p.theme?.baseColors?.text ?? p.theme?.colors?.text} !important;
    }
`;

export const PanelDone = styled.button`
    /**
     * 패널 안이 넘쳐 굴려야 할 때도 이 단추는 늘 아래에 붙어 있어야 한다.
     * 예전에는 목록 끝에 매달려 있어서, 작은 위젯에서는 끝까지 굴려야 나왔다.
     */
    position: sticky;
    bottom: 0;
    z-index: 1;
    background-color: ${p => p.theme?.baseColors?.surface ?? p.theme?.colors?.surface};

    margin-top: auto;
    padding-top: 10px;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-top: 1px solid ${p => p.theme?.colors?.primary}33;
    cursor: pointer;
    font-family: ${p => p.theme?.fonts?.display};
    font-size: 0.7rem;
    letter-spacing: 2px;
    opacity: 0.75;

    &:hover { opacity: 1; }

    &::before {
        content: "";
        width: 7px;
        height: 7px;
        transform: rotate(45deg);
        border: 1px solid ${p => p.theme?.colors?.primary};
    }

`;

export const PanelLabel = styled.div`
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: ${p => p.theme?.colors?.text};
    opacity: 0.6;
    margin: 8px 0 4px;
    &:first-child { margin-top: 0; }
`;

export const PanelDivider = styled.div`
    height: 1px;
    background: ${p => p.theme?.colors?.primary}20;
    margin: 10px 0 8px;
`;

export const ToggleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

export const ToggleLabel = styled.span`
    font-size: 0.68rem;
    color: ${p => p.theme?.colors?.text};
    opacity: 0.85;
    letter-spacing: 0.3px;
`;

export const ToggleSwitch = styled.button<{ $on: boolean }>`
    padding: 2px 8px;
    font-size: 0.62rem;
    letter-spacing: 0.5px;
    border: 1px solid ${p => p.$on
            ? p.theme?.colors?.primary
            : (p.theme?.colors?.primary) + "50"};
    background: ${p => p.$on ? (p.theme?.colors?.primary) + "25" : "transparent"};
    color: ${p => p.theme?.colors?.text};
    cursor: pointer;
    transition: all 0.12s;
    opacity: ${p => p.$on ? 1 : 0.5};
`;

export const ModeRow = styled.div`
    display: flex;
    gap: 5px;
`;

export const ModeChip = styled.button<{ $active: boolean }>`
    padding: 3px 10px;
    font-size: 0.7rem;
    border: 1px solid ${p => p.$active
            ? p.theme?.colors?.primary
            : (p.theme?.colors?.primary) + "40"};
    background: ${p => p.$active ? (p.theme?.colors?.primary) + "20" : "transparent"};
    color: ${p => p.theme?.colors?.text};
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.12s;
    opacity: ${p => p.$active ? 1 : 0.55};
`;

export const Slider = styled.input`
    width: 100%;
    accent-color: ${p => p.theme?.colors?.primary};
    cursor: pointer;
`;

export const ColorRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const ColorPicker = styled.input`
    width: 32px;
    height: 24px;
    border: 1px solid ${p => p.theme?.colors?.primary}60;
    background: transparent;
    cursor: pointer;
    padding: 1px;
`;

export const ColorHex = styled.span`
    font-size: 0.72rem;
    color: ${p => p.theme?.colors?.text};
    opacity: 0.7;
    letter-spacing: 1px;
    font-family: monospace;
`;

export const Content = styled.div<{ $kind?: string; $locked?: boolean }>`
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    position: relative;

    /**
     * 상단 바 자리는 잠기지 않은 동안 늘 비워 둔다.
     *
     * 예전에는 마우스를 올릴 때만 바 높이만큼 내용을 밀었다. 그러면 바가 내용을
     * 덮진 않지만, 위젯에 마우스가 닿을 때마다 안의 내용이 24px 씩 들썩였다.
     * 자리를 고정해 두면 바가 나타나도 내용은 그대로다. 잠그면 바가 없으니
     * 그 자리도 내용에 돌려준다.
     */
    padding: ${p => p.$locked ? 0 : TOP_BAR_H}px 0 0;

    & *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
    }
    & * {
        scrollbar-width: none !important;
    }
`;
