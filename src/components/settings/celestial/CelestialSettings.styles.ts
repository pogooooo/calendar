import styled from "styled-components";

/* ── Page Layout ─────────────────────────────────────────────────────────── */

export const PageWrapper = styled.div`
    display: flex;
    gap: 56px;
    max-width: 880px;
    margin: 0 auto;
    padding: 2.5rem 2rem 8rem;
    color: ${p => p.theme.colors.text};
    align-items: flex-start;
`;

export const MainContent = styled.div`
    flex: 1;
    min-width: 0;
`;

export const PageHeader = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1rem;
    font-weight: 500;
    color: ${p => p.theme.colors.text};
    letter-spacing: 3px;
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 36px;

    & > span { white-space: nowrap; }

    & > hr {
        flex: 1;
        border: none;
        border-top: 1px solid ${p => p.theme.colors.primary};
        margin: 0;
    }
`;

/* ── Section ─────────────────────────────────────────────────────────────── */

export const Section = styled.section`
    margin-bottom: 32px;
    scroll-margin-top: 32px;
`;

export const SectionTitle = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.85rem;
    color: ${p => p.theme.colors.textSecondary};
    padding: 8px 14px;
    letter-spacing: 2px;
    border: 1px solid ${p => p.theme.colors.primary};
    border-bottom: none;
`;

export const SectionBody = styled.div`
    border: 1px solid ${p => p.theme.colors.primary};
    padding: 20px 24px;
`;

/* ── Theme Grid ──────────────────────────────────────────────────────────── */

export const ThemeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    border: 1px solid ${p => p.theme.colors.primary};
`;

export const ThemeCard = styled.div<{ $selected: boolean }>`
    cursor: pointer;
    border-right: 1px solid ${p => p.theme.colors.primary};
    transition: background-color 0.1s;
    background-color: ${p => p.$selected ? `${p.theme.colors.primary}12` : "transparent"};

    &:last-child { border-right: none; }
    &:hover { background-color: ${p => p.theme.colors.primary}1A; }
`;

export const ThemePreview = styled.div`
    padding: 14px 14px 10px;
    border-bottom: 1px solid ${p => p.theme.colors.primary};
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const PreviewBar = styled.div<{ $color: string }>`
    height: 5px;
    width: 45%;
    background: ${p => p.$color};
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
    opacity: 0.4;
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

/* ── Info rows ───────────────────────────────────────────────────────────── */

export const InfoRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid ${p => p.theme.colors.primary};

    &:last-child { border-bottom: none; }
`;

export const InfoLabel = styled.span`
    font-size: 0.8rem;
    color: ${p => p.theme.colors.textSecondary};
`;

export const InfoValue = styled.span`
    font-size: 0.85rem;
    color: ${p => p.theme.colors.text};
`;

/* ── Form ─────────────────────────────────────────────────────────────────── */

export const FormRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;

    &:last-child { margin-bottom: 0; }
`;

export const FormLabel = styled.label`
    font-size: 0.78rem;
    color: ${p => p.theme.colors.textSecondary};
    letter-spacing: 0.3px;
`;

export const FormInput = styled.input`
    width: 100%;
    padding: 9px 12px;
    background: transparent;
    border: 1px solid ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.text};
    font-family: inherit;
    font-size: 0.88rem;
    outline: none;
    box-sizing: border-box;
    transition: box-shadow 0.15s;

    &:focus {
        box-shadow: 0 0 0 2px ${p => p.theme.colors.primary}30;
    }

    &::placeholder {
        color: ${p => p.theme.colors.textSecondary};
        opacity: 0.5;
    }
`;

export const ButtonRow = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 16px;
`;

export const FormButton = styled.button<{ $variant?: "primary" | "danger" | "default" }>`
    padding: 8px 20px;
    border: 1px solid ${p =>
        p.$variant === "danger"  ? "#e57373" :
        p.theme.colors.primary};
    background: transparent;
    color: ${p =>
        p.$variant === "danger" ? "#e57373" :
        p.theme.colors.primary};
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.78rem;
    letter-spacing: 1.5px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover:not(:disabled) {
        background: ${p =>
            p.$variant === "danger" ? "#e5737318" :
            p.theme.colors.primary + "15"};
    }

    &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
`;

export const StatusMessage = styled.div<{ $type: "success" | "error" }>`
    font-size: 0.78rem;
    margin-top: 12px;
    padding: 8px 12px;
    border-left: 2px solid ${p => p.$type === "success" ? "#4caf50" : "#e57373"};
    color: ${p => p.$type === "success" ? "#4caf50" : "#e57373"};
`;

export const WarningText = styled.p`
    font-size: 0.83rem;
    line-height: 1.7;
    color: ${p => p.theme.colors.textSecondary};
    margin: 0 0 16px;
`;

/* ── Right Nav ───────────────────────────────────────────────────────────── */

export const NavPanel = styled.nav`
    width: 156px;
    flex-shrink: 0;
    position: sticky;
    top: 32px;
    align-self: flex-start;
`;

export const NavTitle = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.65rem;
    letter-spacing: 2.5px;
    color: ${p => p.theme.colors.textSecondary};
    text-transform: uppercase;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${p => p.theme.colors.primary};
`;

export const NavItem = styled.button<{ $active: boolean }>`
    display: block;
    width: 100%;
    padding: 6px 0 6px 12px;
    border: none;
    border-left: 2px solid ${p =>
        p.$active ? p.theme.colors.primary : "transparent"};
    background: transparent;
    color: ${p =>
        p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary};
    font-family: inherit;
    font-size: 0.8rem;
    text-align: left;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    line-height: 1.4;

    &:hover {
        color: ${p => p.theme.colors.primary};
        border-left-color: ${p => p.theme.colors.primary};
    }
`;
