import styled from "styled-components";

export const PageWrapper = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    color: ${p => p.theme.colors.text};
`;

export const PageHeader = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1rem;
    font-weight: 500;
    color: ${p => p.theme.colors.text};
    letter-spacing: 2px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;

    & > span { white-space: nowrap; }

    & > hr {
        flex: 1;
        border: none;
        border-top: 1px solid ${p => p.theme.colors.primary};
        margin: 0;
    }
`;

export const Section = styled.section`
    margin-bottom: 30px;
`;

export const SectionHeader = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.95rem;
    color: ${p => p.theme.colors.textSecondary};
    padding: 8px 12px;
    border: 1px solid ${p => p.theme.colors.primary};
    border-bottom: none;
    letter-spacing: 2px;
    background-color: ${p => p.theme.colors.surface};
`;

export const ThemeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    border: 1px solid ${p => p.theme.colors.primary};
    background-color: ${p => p.theme.colors.surface};
`;

export const ThemeCard = styled.div<{ $selected: boolean }>`
    cursor: pointer;
    border-right: 1px solid ${p => p.theme.colors.primary}55;
    transition: background-color 0.1s;
    background-color: ${p => p.$selected ? `${p.theme.colors.primary}0F` : "transparent"};

    &:last-child { border-right: none; }
    &:hover { background-color: ${p => p.theme.colors.primary}1A; }
`;

export const ThemePreview = styled.div`
    padding: 14px 14px 10px;
    border-bottom: 1px solid ${p => p.theme.colors.primary}55;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background-color: ${p => p.theme.colors.background};
`;

export const PreviewBar = styled.div<{ $color: string }>`
    height: 5px;
    width: 45%;
    background: ${p => p.$color};
    opacity: 0.9;
`;

export const PreviewRow = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

export const PreviewDot = styled.div<{ $color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => p.$color};
    flex-shrink: 0;
    opacity: 0.8;
`;

export const PreviewLines = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
`;

export const PreviewLine = styled.div<{ $color: string; $w: number }>`
    height: 3px;
    width: ${p => p.$w}%;
    background: ${p => p.$color};
    opacity: 0.45;
`;

export const ThemeInfo = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 12px;
    gap: 8px;
`;

export const ThemeLabelGroup = styled.div`
    flex: 1;
`;

export const ThemeLabel = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.88rem;
    color: ${p => p.theme.colors.text};
    letter-spacing: 1px;
`;

export const ThemeDesc = styled.div`
    font-size: 0.72rem;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 2px;
    letter-spacing: 0.5px;
`;

export const CheckMark = styled.div`
    width: 18px;
    height: 18px;
    border: 1px solid ${p => p.theme.colors.primary};
    background-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.surface};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;
