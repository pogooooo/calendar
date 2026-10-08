"use client";

/**
 * 테마 고르기 — 갈래 진열장 + 고른 갈래의 무대.
 *
 * 예전에는 갈래 × 벌(밝게·어둡게) 마다 큰 카드를 한 장씩 냈다. 갈래가 셋일 때 이미 여섯 장이고,
 * 갈래가 늘수록 판이 끝없이 길어져 무엇이 있는지 한눈에 안 들어왔다.
 * 이제 갈래는 작은 타일 하나씩 늘어놓고(폰에서는 옆으로 밀어 보는 띠), 벌은 고른 갈래의 무대에서 고른다.
 * 모양은 갈래마다의 설정 판 짜임(L)이 맡는다 — 여기에는 짜임만 있다.
 *
 * 타일과 무대에는 그 갈래의 오브제가 하나씩 선다(Celestial 혼천의 · Maple 잎 · Ocean 구슬). 가만히 있다가
 * 타일에 올리거나(초점) 고르면 천천히 돈다. 오브제의 색은 지금 테마가 아니라 그 갈래의 것(지금의 밝기)으로 —
 * Ocean 화면에서도 Celestial 타일의 혼천의는 금빛이다. 축소판 그림·글자는 덮지 않는다(ThemePicker.styles).
 */
import { useState } from "react";
import { ThemeProvider, useTheme } from "styled-components";
import Objet, { type ObjetName } from "@/components/objet/Objet";
import { themes, type ThemeChoice } from "@/styles/theme";
import type * as Layout from "../celestial/CelestialSettings.layout";
import * as P from "./ThemePicker.styles";

type L = typeof Layout;

/** 갈래마다의 오브제 — 작은 자리(타일)와 큰 자리(무대) */
const OBJET: Record<string, { name: ObjetName; small: Record<string, unknown>; large: Record<string, unknown> }> = {
    maple: { name: "maple/leaf", small: { still: true }, large: { still: true } },
    ocean: { name: "ocean/orb", small: { still: true }, large: { still: true } },
};

/**
 * Celestial 의 표 — 3D 기구 대신 천체 타로 한 장(금 선화: 겉테·속테·별). 이 테마의 중심은 타로 카드다.
 */
function ArcanaMark() {
    return (
        <P.Arcana viewBox="0 0 24 34" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="21" height="31" rx="2" />
            <rect x="4" y="4" width="16" height="26" rx="1" className="inner" />
            <path d="M12 10.2l1.15 3.65L16.8 15l-3.65 1.15L12 19.8l-1.15-3.65L7.2 15l3.65-1.15z" className="star" />
            <path d="M9 25.5h6" className="inner" />
        </P.Arcana>
    );
}

/** 그 갈래의 오브제 — 그 갈래의 색(지금 화면의 밝기)으로 칠한다. Celestial 은 타로 한 장(선화) */
function FamilyObjet({ id, size, active, large = false }: { id: string; size: string; active: boolean; large?: boolean }) {
    const page = useTheme();
    const family = themes[page.mode === "dark" ? `${id}-dark` : id] ?? themes[id] ?? page;
    if (id === "celestial") return <ThemeProvider theme={family}><ArcanaMark /></ThemeProvider>;
    const spec = OBJET[id];
    if (!spec) return null;
    return (
        <ThemeProvider theme={family}>
            <Objet name={spec.name} size={size} active={active} options={large ? spec.large : spec.small} interaction="none" />
        </ThemeProvider>
    );
}

/** 축소판 달력 한 판. 오늘 하루와 일정 사흘이 들어간다. */
const CELL_PLAN = [
    "", "", "event", "", "", "", "",
    "", "today", "", "event", "", "", "",
    "", "", "", "", "event", "", "",
] as const;

/** 갈래 하나의 축소판 — 그림이 있는 갈래(Maple)는 그림, 없으면 색(또는 바다처럼 무늬)으로 그린 앱 화면 */
function ThemeThumb({ L, theme, option, height }: { L: L; theme: ThemeChoice; option: string; height: number }) {
    const g = theme.grounds[option] ?? theme.grounds[theme.options[0]];
    if (theme.preview?.[option]) return <L.MiniImage src={theme.preview[option]} alt="" draggable={false} $h={height} />;
    return (
        <L.Mini $bg={g.bg} $h={height}>
            <L.MiniRail $bg={g.rail}>
                <i style={{ background: g.accent, width: "66%" }} />
                <i style={{ background: g.dimInk, width: "90%" }} />
                <i style={{ background: g.dimInk, width: "58%" }} />
                <i style={{ background: g.dimInk, width: "78%" }} />
                <i style={{ background: g.dimInk, width: "68%" }} />
            </L.MiniRail>
            <L.MiniBody>
                <div className="title" style={{ background: g.ink }} />
                <div className="week">
                    {Array.from({ length: 7 }, (_, i) => <b key={i} style={{ background: g.dimInk }} />)}
                </div>
                <div className="grid">
                    {CELL_PLAN.map((kind, i) => (
                        <span key={i} style={{ background: kind === "today" ? g.accent : kind === "event" ? g.event : g.cell }} />
                    ))}
                </div>
            </L.MiniBody>
        </L.Mini>
    );
}

interface Props {
    L: L;
    themes: ThemeChoice[];
    currentTheme: string;
    themeOptions: Record<string, string>;
    onThemeChange: (id: string) => void;
    onThemeOptionChange: (id: string, option: string) => void;
    /** light → "밝게" 처럼 벌 이름 */
    optionLabels: Record<string, string>;
    label: string;
    variantLabel: string;
}

export default function ThemePicker({ L, themes: choices, currentTheme, themeOptions, onThemeChange, onThemeOptionChange, optionLabels, label, variantLabel }: Props) {
    const current = choices.find((th) => th.id === currentTheme) ?? choices[0];
    const currentOption = themeOptions[current.id] ?? current.options[0];
    // 올리거나 초점이 온 타일 — 그 타일의 오브제가 돈다
    const [lit, setLit] = useState<string | null>(null);

    return (
        <>
            <P.GalleryFit>
            <L.ThemeGallery role="radiogroup" aria-label={label}>
                {choices.map((th) => {
                    const option = themeOptions[th.id] ?? th.options[0];
                    const on = th.id === current.id;
                    const off = () => setLit((v) => (v === th.id ? null : v));
                    return (
                        <L.FamilyTile
                            key={th.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            title={th.description}
                            $selected={on}
                            onClick={() => { if (!on) onThemeChange(th.id); }}
                            onMouseEnter={() => setLit(th.id)}
                            onMouseLeave={off}
                            onFocus={() => setLit(th.id)}
                            onBlur={off}
                        >
                            <ThemeThumb L={L} theme={th} option={option} height={84} />
                            <L.FamilyFoot>
                                <L.Star $on={on} $small />
                                <L.FamilyName>{th.label}</L.FamilyName>
                                {th.options.length > 1 && (
                                    <L.VariantDots aria-hidden="true">
                                        {th.options.map((o) => <i key={o} className={o === option ? "on" : undefined} />)}
                                    </L.VariantDots>
                                )}
                                <P.TileObjet aria-hidden="true">
                                    <FamilyObjet id={th.id} size="100%" active={on || lit === th.id} />
                                </P.TileObjet>
                            </L.FamilyFoot>
                        </L.FamilyTile>
                    );
                })}
            </L.ThemeGallery>
            </P.GalleryFit>

            <L.ThemeStage key={current.id}>
                <L.StageThumb>
                    <ThemeThumb L={L} theme={current} option={currentOption} height={168} />
                </L.StageThumb>
                <L.StageInfo>
                    <P.StageHead>
                        <L.StageName>{current.label}</L.StageName>
                        <P.StageObjet aria-hidden="true">
                            <FamilyObjet id={current.id} size="100%" active large />
                        </P.StageObjet>
                    </P.StageHead>
                    <L.StageDesc>{current.description}</L.StageDesc>
                    {current.options.length > 1 && (
                        <L.SegGroup role="radiogroup" aria-label={variantLabel}>
                            {current.options.map((o) => (
                                <L.Seg
                                    key={o}
                                    type="button"
                                    role="radio"
                                    aria-checked={o === currentOption}
                                    $selected={o === currentOption}
                                    onClick={() => onThemeOptionChange(current.id, o)}
                                >
                                    <L.Star $on={o === currentOption} $small />
                                    {optionLabels[o] ?? o}
                                </L.Seg>
                            ))}
                        </L.SegGroup>
                    )}
                </L.StageInfo>
            </L.ThemeStage>
        </>
    );
}
