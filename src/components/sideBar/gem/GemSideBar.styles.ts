import styled, { keyframes } from "styled-components";
import * as C from "../celestial/CelestialSideBar.styles";
import * as M from "../maple/MapleSideBar.styles";
import { gemPanel, gemQuietButton } from "@/features/gem/GemLive.styles";
import geodeGloss from "@/features/gem/materials/geode-neutral-gloss.webp";
import geodeShadow from "@/features/gem/materials/geode-neutral-shadow.webp";

export * from "../maple/MapleSideBar.styles";

export const SideBarWrapper = styled(C.SideBarWrapper)`
    margin-inline-end: 0;
    padding-inline: clamp(11px, 1.2vw, 20px);
    border-inline-end: 1px solid var(--gem-frame-gold);
    background: linear-gradient(156deg, #f5e9f0, #d8bfd5 65%, #c2a2c3);
    isolation: isolate;
    html[data-theme-mode="dark"] & {
        background: linear-gradient(152deg, #1c1023, color-mix(in srgb, var(--gem-stone, #4c224e) 29%, #18101d) 46%, #180d1e);
    }
`;

export const Content = styled(C.Content)`
    position: relative;
    align-self: flex-start;
    --gem-rail-reading: color-mix(in srgb, var(--gem-stone, #4c224e) 9%, #fff8fc);

    html[data-theme-mode="dark"] & {
        --gem-rail-reading: color-mix(in srgb, var(--gem-stone, #4c224e) 13%, #100b16);
    }

    &::before {
        content: "";
        position: absolute;
        inset: 0 calc(-1 * clamp(11px, 1.2vw, 20px)) -26px;
        z-index: -1;
        pointer-events: none;
        background: linear-gradient(90deg, color-mix(in srgb, var(--gem-rail-reading) 83%, transparent),
            color-mix(in srgb, var(--gem-rail-reading) 68%, transparent) 54%, transparent 100%);
        mask-image: linear-gradient(#000 0 calc(100% - 44px), transparent);
    }
`;

const shimmer = keyframes`
    0%, 100% { background-position: 15% 20%; opacity: .12; }
    48% { background-position: 75% 55%; opacity: .3; }
    72% { background-position: 90% 80%; opacity: .2; }
`;

export const GeodeSurface = styled.div`
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
    --gem-rail-stone: var(--gem-stone, #4c224e);
    --gem-rail-glow: oklch(from var(--gem-rail-stone) .76 min(clamp(.13, c, .19), calc(c * 3)) h);
    --gem-rail-glint: #fff8f0;
    --gem-rail-glint-soft: #ffe5f4b0;
    --gem-rail-key: #fff1d9;
    --gem-rail-shadow: color-mix(in srgb, var(--gem-rail-stone) 65%, #201123);
    html[data-theme-mode="dark"] & {
        --gem-rail-glint: oklch(from var(--gem-rail-stone) .88 min(clamp(.12, c, .18), calc(c * 3)) h);
        --gem-rail-glint-soft: color-mix(in oklch, var(--gem-rail-glow) 75%, transparent);
        --gem-rail-key: oklch(from var(--gem-rail-stone) .93 min(clamp(.08, c, .135), calc(c * 3)) h);
    }
    html[data-gem-custom-color] &[data-light-mode] {
        --gem-rail-key: oklch(from var(--gem-rail-stone) .93 min(calc(c * .6), .105) h);
        --gem-rail-glint-soft: color-mix(in oklch, var(--gem-rail-glow) 52%, transparent);
    }
`;

export const GeodeFacet = styled.span`
    position: absolute;
    inset: -10% -12%;
    display: block;
    isolation: isolate;
    z-index: 0;
    --gem-gloss-delay: -1.4s;
    /* One continuous native-resolution material; light and shadow masks use the same crop. */
    background: var(--gem-geode-map) center / cover no-repeat;

    & > i {
        position: absolute;
        inset: 0;
        z-index: 1;
        mask: url("${geodeShadow.src}") center / cover no-repeat luminance;
        background: radial-gradient(ellipse 95px 130px at calc(var(--gem-facet-light-x, 50%) + 30px) calc(var(--gem-facet-light-y, 48%) + 24px),
            var(--gem-rail-shadow), transparent 85%);
        opacity: calc(var(--gem-rail-energy, 0) * .3);
        mix-blend-mode: multiply;
    }

    &::before, &::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 2;
        mask: url("${geodeGloss.src}") center / cover no-repeat luminance;
    }
    &::before {
        background: radial-gradient(ellipse at 68% 25%, var(--gem-rail-glint) 0, var(--gem-rail-glint-soft) 38%, transparent 70%);
        background-size: 130% 150%;
        opacity: .2;
        mix-blend-mode: screen;
    }
    &::after {
        opacity: calc(var(--gem-rail-energy, 0) * .82);
        background: radial-gradient(ellipse 68px 88px at var(--gem-facet-light-x, 50%) var(--gem-facet-light-y, 48%),
            var(--gem-rail-key) 0, var(--gem-rail-glint) 25%, var(--gem-rail-glint-soft) 58%, transparent 93%);
        mix-blend-mode: screen;
    }
    [data-gem-rail-motion="full"] &::before { animation: ${shimmer} 10s var(--gem-gloss-delay) ease-in-out infinite; }
    [data-gem-rail-motion="gentle"] &::before { animation: ${shimmer} 20s var(--gem-gloss-delay) ease-in-out infinite; }
`;

export const SoundButton = styled.button`
    position: absolute;
    z-index: 2;
    right: 14px;
    bottom: 12px;
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    ${gemQuietButton}
    &[aria-pressed="true"] {
        border-color: var(--gem-frame-gold);
    }
    @media (max-height: 685px) {
        top: 3px;
        bottom: auto;
        width: 24px;
        height: 24px;
    }
`;

export const SidebarContour = styled(C.SidebarContour)`
    inset-inline-end: -5px;
    width: 10px;
    z-index: 2;
    &::before { inset-inline-start: 4px; width: 1px; background: var(--gem-gold-edge); opacity: .8; }
`;

export const LogoRow = styled(M.LogoRow)`
    &::before { content: none; }
`;

export const Logo = styled(M.Logo)`
    font-family: ${({ theme }) => theme.fonts.display};
    color: var(--gem-ink);
    &::before { content: none; }
`;

export const UserClickable = styled(M.UserClickable)`
    ${gemQuietButton}
    min-height: 38px;
    padding: 2px 8px;
    justify-content: flex-start;
    > svg:first-child { width: 19px; height: 19px; flex: none; }
`;
export const UserName = styled(M.UserName)`min-width: 0; font-size: .86rem;`;
export const ProfilePopup = styled(M.ProfilePopup)`${gemPanel}`;
