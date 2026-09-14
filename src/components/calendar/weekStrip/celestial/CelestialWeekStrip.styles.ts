/**
 * CelestialWeekStrip 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 */
import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
    from { opacity: 0; transform: translateY(-3px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const Strip = styled.section`
    flex: 0 0 auto;
    padding: 6px 8px 8px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}55;
    background: ${p => p.theme.colors.background};
    user-select: none;
    touch-action: pan-y;
`;

export const Head = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    margin-bottom: 4px;

    .title {
        flex: 1;
        text-align: center;
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.86rem;
        letter-spacing: 0.14em;
        color: ${p => p.theme.colors.text};
        animation: ${slideIn} 0.25s ease both;
        font-variant-numeric: tabular-nums;
    }

    button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        min-height: 36px;
        padding: 0 8px;
        background: none;
        border: 1px solid transparent;
        border-radius: 6px;
        color: ${p => p.theme.colors.primary};
        cursor: pointer;
        font-family: inherit;

        &:active { background: ${p => p.theme.colors.primary}1F; }
    }

    .today {
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.66rem;
        letter-spacing: 0.12em;
        border-color: ${p => p.theme.colors.primary}66;
    }
`;

export const Days = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
`;

export const Day = styled.button<{ $selected: boolean; $today: boolean; $weekend: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    min-height: 58px;
    padding: 6px 0 5px;
    background: ${p => p.$selected ? `${p.theme.colors.primary}1A` : "transparent"};
    border: 1px solid ${p => p.$selected ? p.theme.colors.primary : "transparent"};
    border-radius: 8px;
    color: ${p => p.$weekend ? p.theme.colors.weekend : p.theme.colors.text};
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s, border-color 0.15s;

    .name {
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.56rem;
        letter-spacing: 0.1em;
        color: ${p => p.theme.colors.textSecondary};
    }

    .num {
        font-size: 1rem;
        font-variant-numeric: tabular-nums;
        /* 날마다 같은 26px 상자에 숫자를 둔다 — 오늘만 고리를 두르면 그 칸만 8px 커져
           아래 점들의 높이가 달라졌다. 상자는 늘 같고, 고리는 오늘만 보인다. */
        width: 26px; height: 26px; line-height: 24px;
        text-align: center;
        border: 1px solid transparent;
        border-radius: 50%;
        /* 오늘은 금빛 고리로 표시한다 — 월간 달력의 오늘 원반과 같은 말 */
        ${p => p.$today && `
            border-color: ${p.theme.colors.primary};
            color: ${p.theme.colors.primary};
        `}
    }

    .dots {
        display: flex;
        align-items: center;
        gap: 3px;
        min-height: 8px;

        i {
            display: block;
            width: 6px; height: 6px;
            transform: rotate(45deg);
            border-radius: 1px;
        }
        em {
            font-style: normal;
            font-size: 0.56rem;
            color: ${p => p.theme.colors.textSecondary};
        }
    }

    &:active { background: ${p => p.theme.colors.primary}26; }
`;
