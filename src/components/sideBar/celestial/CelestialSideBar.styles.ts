/**
 * 사이드바(SideBar·Menu·Profile)의 Celestial 모양.
 *
 * 세 파일의 styled-components 를 한곳에 모았다 — 갈래를 더할 때 이 파일 하나를 maple/ 에 짝지어 두면 된다.
 */
import styled from "styled-components";
import { motion } from "framer-motion";
import { celestial_corner_accent, celestial_star } from "@/styles/celestial_theme";

export const SideBarWrapper = styled.div<{ $width: number, $isResizing: boolean }>`
    background-color: ${(props) => props.theme.colors.background};
    display: flex;
    flex-shrink: 0;
    width: ${(props) => props.$width}px;

    will-change: width;
    contain: layout style;
    container-type: inline-size;
    transform: translateZ(0);
    transition: ${(props) => props.$isResizing ? 'none' : 'width 0.15s ease-out'};
    
    padding: 0 20px 0 20px;
    margin-right: 50px;
    cursor: default;
    color: ${(props) => props.theme.colors.text};
    position: relative;
    
    pointer-events: ${(props) => props.$isResizing ? 'none' : 'auto'};
`

export const Content = styled.div`
    flex: 1;
    min-width: 0;
    z-index: 1;
`

export const SidebarContour = styled.div<{ $height: number, $isResizing: boolean }>`
    height: ${(props) => props.$height ? `${props.$height}px` : '100vh'};
    position: absolute;
    right: -60px;
    
    cursor: col-resize;
    transition: filter 0.2s ease-in-out;
    pointer-events: auto;
    
    &:hover {
        stroke: ${(props) => props.theme.colors.primary};
    }

    &::before {
        content: "";
        position: absolute;
        left: 58px;
        width: 90px;
        height: 100%;
        background: transparent;
    }

    user-select: none;
`

export const ResizeOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    cursor: col-resize;
    background: transparent;
`

export const MenuWrapper = styled.div`
    & > * {
        margin-top: 10px;
    }
`

export const Divider = styled.div`
    position: relative;
    height: 1px;
    margin: 18px 8px 6px;
    background: linear-gradient(to right, transparent, ${(props) => props.theme.colors.primary}66, transparent);

    i {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 5px;
        height: 5px;
        transform: translate(-50%, -50%) rotate(45deg);
        border: 1px solid ${(props) => props.theme.colors.primary};
        background: ${(props) => props.theme.colors.background};
    }
`

export const ProfileWrapper = styled.div`
    & > * {
        margin-top: 10px;
    }
    display: flex;
    flex-direction: column;
    margin-bottom: 100px;
`;

export const LogoRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 30px;
    cursor: pointer;

    & > hr {
        flex: 1;
        min-width: 0;
        border: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        margin: 0;
    }
`;

export const Logo = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.display};
    font-size: clamp(0.85rem, 13cqw, ${(props) => props.theme.fontSizes.h3});
    line-height: 1.2;
    white-space: nowrap;
    flex-shrink: 0;
`;

export const UserWrapper = styled.div`
    position: relative;
    margin: 20px 0 10px 0;
`;

export const UserClickable = styled.div<{ $open: boolean }>`
    display: flex;
    font-size: ${(props) => props.theme.fontSizes.body};
    align-items: center;
    cursor: pointer;
    padding: 5px 7px;
    background: transparent;
    border: 1px solid ${(props) => props.$open
        ? props.theme.colors.primary
        : "transparent"};
    transition: border-color 0.25s ease;
    user-select: none;
    color: ${(props) => props.theme.colors.text};

    &:hover {
        border-color: ${(props) => props.theme.colors.primary}80;
    }

    &:focus-visible {
        outline: none;
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const ProfileImage = styled.img`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
`;

export const UserName = styled.div`
    margin-left: 10px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ProfilePopup = styled(motion.div)`
    ${celestial_corner_accent}

    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: auto;
    width: 100%;
    min-width: 240px;
    max-width: 320px;
    box-sizing: border-box;
    background: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary};
    padding: 6px 0 9px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 200;
`;

export const PopupHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 14px 11px;
`;

export const Sigil = styled.div`
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border: 1px solid ${(props) => props.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: ${(props) => props.theme.colors.primary};
    text-transform: uppercase;
`;

export const SigilImage = styled.img`
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    object-fit: cover;
    border: 1px solid ${(props) => props.theme.colors.primary};
`;

export const PopupIdentity = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

export const PopupName = styled.div`
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: ${(props) => props.theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const PopupEmail = styled.div`
    font-size: 0.75rem;
    color: ${(props) => props.theme.colors.textSecondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const StarDivider = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    margin: 4px 14px 6px;
`;

export const SectionLabel = styled.div`
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.68rem;
    letter-spacing: 2px;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 2px 14px 6px;
`;

export const RuleLine = styled(motion.span)<{ $origin: "left" | "right" }>`
    display: block;
    flex: 1 1 0;
    min-width: 0;
    height: 1px;
    background-color: ${(props) => props.theme.colors.primary}59;
    transform-origin: ${(props) => props.$origin} center;
`;

export const RuleStar = styled(motion.span)`
    display: block;
    flex: 0 0 auto;
    ${celestial_star}
`;

export const PopupDivider = styled.div`
    height: 0;
    margin: 3px 14px;
    border-top: 1px dashed ${(props) => props.theme.colors.primary}40;
`;

export const PopupItem = styled.button<{ $danger?: boolean }>`
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px 13px;
    box-sizing: border-box;
    border: none;
    color: ${(props) => props.$danger ? props.theme.colors.error : props.theme.colors.text};
    font-size: 0.87rem;
    letter-spacing: 0.3px;
    font-family: inherit;
    cursor: pointer;
    text-align: left;

    background-color: transparent;
    background-image: linear-gradient(
        ${(props) => props.$danger ? props.theme.colors.error : props.theme.colors.primary},
        ${(props) => props.$danger ? props.theme.colors.error : props.theme.colors.primary}
    );
    background-repeat: no-repeat;
    background-position: 24px calc(100% - 5px);
    background-size: 0 1px;
    transition: background-size 0.3s ease;

    & > span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    & > svg {
        flex: 0 0 auto;
    }

    &::before,
    &::after {
        content: "";
        position: absolute;
        bottom: 2px;
        ${celestial_star}
        background-color: ${(props) => props.$danger ? props.theme.colors.error : props.theme.colors.primary};
        transform: scale(0) rotate(-45deg);
        transition: transform 0.35s ease 0.08s;
    }

    &::before {
        left: 14px;
    }

    &::after {
        right: 14px;
    }

    &:hover, &:focus-visible {
        outline: none;
        background-size: calc(100% - 48px) 1px;
    }

    &:hover::before, &:hover::after,
    &:focus-visible::before, &:focus-visible::after {
        transform: scale(1) rotate(0deg);
    }
`;

