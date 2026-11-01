import styled from "styled-components";
import { MOBILE } from '@/styles/breakpoints';
import { SectionWrapper, SectionTitle as BaseTitle } from "@/components/project/celestial/section";
export { SectionWrapper };
export const SectionTitle=styled(BaseTitle)`display:flex;align-items:center;justify-content:space-between;gap:12px;`;
export const TodayButton=styled.button`
    min-height:30px;padding:3px 12px;border:1px solid ${p=>p.theme.colors.primary}66;background:transparent;color:${p=>p.theme.colors.text};font:inherit;font-size:.7rem;cursor:pointer;
    &:hover{background:${p=>p.theme.colors.primary}12;} &:focus-visible{outline:2px solid ${p=>p.theme.colors.primary};outline-offset:2px;}
`;
export const UndatedTasks=styled.details`
    flex:none;font-size:.75rem;padding:0 12px 8px;color:${p=>p.theme.colors.textSecondary};
    summary{cursor:pointer;width:fit-content;} >div{display:flex;flex-wrap:wrap;gap:6px;max-height:100px;overflow:auto;margin-top:8px;}
    >div>span{display:inline-flex;align-items:center;gap:4px;max-width:100%;} >div>span>button:first-child{min-width:0;}
    button{padding:4px 8px;border:1px solid ${p=>p.theme.colors.border};background:${p=>p.theme.colors.surface};color:${p=>p.theme.colors.text};font:inherit;cursor:pointer;max-width:100%;overflow-wrap:anywhere;}
    button[aria-pressed=true]{border-color:${p=>p.theme.colors.primary};background:${p=>p.theme.colors.primary}18;} button:focus-visible{outline:2px solid ${p=>p.theme.colors.primary};outline-offset:2px;}
`;
export const GraphEmpty=styled.p`position:sticky;left:16px;top:20px;width:fit-content;padding:14px 16px;color:${p=>p.theme.colors.textSecondary};font-size:.78rem;margin:0;z-index:3;`;

export const LinkHint = styled.div`
    padding: 5px 12px 7px;
    font-size: 0.68rem;
    color: ${(p) => p.theme.colors.textSecondary};
    min-height: 22px;
    ${MOBILE} { font-size:.75rem; line-height:1.5; }
`;
export const MobileTaskRow = styled.div`display: flex; align-items: center; gap: 6px;`;
export const MobileConnector = styled.button`
    flex-shrink: 0;
    width: 40px; height: 40px;
    ${MOBILE} { width:44px; height:44px; }
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; border: 1px solid ${(p) => p.theme.colors.primary}55;
    color: ${(p) => p.theme.colors.primary}; cursor: pointer;
    &[aria-pressed="true"] { background: ${(p) => p.theme.colors.primary}22; }
`;
export const Connector = styled(MobileConnector)`
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    width: 22px; height: 22px; border-radius: 50%;
    background: ${(p) => p.theme.colors.background};
    z-index: 4; touch-action: none;
    transition: box-shadow 0.18s ease, background 0.18s ease;
    &:hover { box-shadow: 0 0 0 3px ${(p) => p.theme.colors.primary}22; }
`;

/* 폰에서 간트 대신 읽는 목록 — 같은 자료를 세로로 */
export const AgendaList = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 6px 10px 10px;
    ${MOBILE} { flex:none; overflow:visible; }
`;

export const AgendaEmpty = styled.div`
    padding: 18px 4px;
    text-align: center;
    font-size: 0.78rem;
    color: ${(props) => props.theme.colors.textSecondary};
    opacity: 0.8;
`;

export const AgendaRow = styled.button<{ $status?: string }>`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 8px 6px;
    text-align: left;
    background: none;
    border: none;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}26;
    cursor: pointer;

    /* 진행 중인 것에만 금빛 눈금 하나 — 목록에서 지금 할 것이 드러난다 */
    border-left: 2px solid ${(props) => (props.$status === "in_progress" ? props.theme.colors.primary : "transparent")};

    &:active { background: ${(props) => props.theme.colors.primary}12; }
`;

export const AgendaWhen = styled.span`
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 5.4em;
    font-variant-numeric: tabular-nums;

    b {
        font-weight: 400;
        font-size: 0.76rem;
        color: ${(props) => props.theme.colors.primary};
    }

    em {
        font-style: normal;
        font-size: 0.68rem;
        color: ${(props) => props.theme.colors.textSecondary};
    }
`;

export const AgendaTitle = styled.span<{ $done: boolean }>`
    flex: 1;
    min-width: 0;
    font-size: 0.86rem;
    color: ${(props) => (props.$done ? props.theme.colors.textSecondary : props.theme.colors.text)};
    text-decoration: ${(props) => (props.$done ? "line-through" : "none")};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${MOBILE} { white-space:normal; overflow-wrap:anywhere; line-height:1.45; font-size:.92rem; }
`;

export const TimelineLayout = styled.div`
    display: flex;
    flex-direction:column;
    flex: 1;
    min-height:0;min-width:0;
    overflow: hidden;
`;

export const TimelineGridArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    overflow-y: auto;
    position: relative;
    min-height:0;min-width:0;overscroll-behavior:contain;
    &:focus-visible{outline:2px solid ${(p)=>p.theme.colors.primary};outline-offset:-2px;}
`;

export const TimelineContent = styled.div`
    display: flex;
    flex-direction: column;
    min-width: max-content; /* 내부 컨텐츠 크기에 맞게 부모를 강제로 늘려 스크롤 생성 */
    min-height: 100%;
    flex:none;
`;

export const TimelineDateHeader = styled.div`
    display: flex;
    height: 56px;min-height:56px;flex:none;flex-direction:column;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
    position: sticky;
    top: 0;
    background: ${(props) => props.theme.colors.background};
    z-index: 5;
`;
export const TimelineMonthRow=styled.div`height:20px;display:flex;flex:none;border-bottom:1px solid ${p=>p.theme.colors.border}44;`;
export const MonthCell=styled.div`
    flex:none;position:relative;border-right:1px solid ${p=>p.theme.colors.border}66;line-height:20px;font-size:.62rem;color:${p=>p.theme.colors.textSecondary};
    span{position:sticky;left:8px;display:inline-block;padding:0 8px;font-variant-numeric:tabular-nums;}
`;
export const TimelineDayRow=styled.div`display:flex;height:36px;flex:none;`;

export const TimelineGraphContainer = styled.div`
    position: relative;
    min-height:0;flex:none;isolation:isolate;z-index:0;
`;

export const TimelineBackground = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    display: flex;
    z-index: 1;
`;

export const TimelineVerticalLine = styled.div<{ $isToday?: boolean }>`
    width: 48px;
    min-width: 48px;
    flex:0 0 48px;box-sizing:border-box;
    border-right: 1px dashed ${(props) => props.theme.colors.primary}22;
    background-color: ${(props) => props.$isToday ? props.theme.colors.primary + '11' : 'transparent'};
`;

export const DateCell = styled.div<{ $isToday?: boolean }>`
    width: 48px;
    min-width: 48px;
    flex:0 0 48px;box-sizing:border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px dashed ${(props) => props.theme.colors.primary}22;
    background-color: ${(props) => props.$isToday ? props.theme.colors.primary + '11' : 'transparent'};
`;

export const DateNumber = styled.span<{ $isToday?: boolean }>`
    font-size: 0.7rem;
    color: ${(props) => props.$isToday ? props.theme.colors.primary : props.theme.colors.textSecondary};
    font-weight: ${(props) => props.$isToday ? 'bold' : 'normal'};
    ${(props) => props.$isToday && `
        filter: drop-shadow(0 0 4px ${props.theme.colors.primary}80);
    `}
`;

export const DependencySvg = styled.svg`
    color: ${(p) => p.theme.colors.primary};
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    overflow: visible;
`;

export const DependencyLine = styled.path`
    fill: none;
    stroke: ${(props) => props.theme.colors.primary};
    stroke-width: 1.5;
    opacity: 0.8;
`;

export const TaskNode = styled.div<{ $status?: string; $isDragging?: boolean; $connectTarget?: boolean }>`
    outline: ${(p) => p.$connectTarget ? `2px solid ${p.theme.colors.primary}` : 'none'};
    outline-offset: 3px;
    position: absolute;
    /* top / left / width 는 style prop 으로 전달 (CSS 클래스 재생성 방지) */
    height: 28px;
    /* 진한 금빛 덩어리 대신 옅은 금빛 면 + 앞쪽 띠 — 월간 달력의 일정 막대와 같은 말 */
    background: ${(props) => `color-mix(in srgb, ${props.theme.colors.primary} ${props.$status === 'done' ? "8%" : props.theme.mode === "dark" ? "14%" : "24%"}, ${props.theme.colors.background})`};
    border: none;
    border-radius: 2px;
    color: ${(props) => props.$status === 'done' ? props.theme.colors.textSecondary : props.theme.colors.text};
    text-decoration: ${(props) => props.$status === 'done' ? 'line-through' : 'none'};
    display: flex;
    align-items: center;
    padding: 0 8px;
    &[data-has-connector]{padding-right:36px;}
    /* Labels remain inside their interval so tasks sharing a row never cover one another. */

    cursor: ${(props) => props.$isDragging ? 'grabbing' : 'grab'};
    z-index: ${(props) => props.$isDragging ? 10 : 3};
    opacity: ${(props) => props.$isDragging ? 0.8 : 1};
    box-shadow: ${(props) => [
        props.$isDragging ? '0 4px 12px rgba(0,0,0,0.3)' : '',
        props.$status === 'done' ? '' : `inset 2px 0 0 ${props.theme.colors.primary}`,
        // 밤에는 금빛을 섞은 면이 흙빛으로 탁해진다 — 면은 옅게 두고 금빛 머리카락 테를 두른다
        props.$status !== 'done' && props.theme.mode === 'dark' ? `inset 0 0 0 1px ${props.theme.colors.primary}59` : '',
    ].filter(Boolean).join(', ') || 'none'};
    will-change: transform;
    transition: ${(props) => props.$isDragging ? 'none' : 'box-shadow 0.2s, background 0.2s'};

    &:hover {
        background: ${(props) => `color-mix(in srgb, ${props.theme.colors.primary} 38%, ${props.theme.colors.background})`};
        color: ${(props) => props.theme.colors.text};
        text-decoration: none;
    }
    &:focus-visible{outline:2px solid ${(p)=>p.theme.colors.primary};outline-offset:2px;}
`;

export const TaskNodeText = styled.span`
    min-width: 0;
    max-width: 100%;
    text-overflow: ellipsis;
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: hidden;
    user-select: none;

`;

export const TaskResizeHandle = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    background-color: transparent;
    transition: background-color 0.2s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }
`;
