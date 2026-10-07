"use client";

/**
 * 테마 고르기 — 갈래 진열장 + 고른 갈래의 무대.
 *
 * 예전에는 갈래 × 벌(밝게·어둡게) 마다 큰 카드를 한 장씩 냈다. 갈래가 셋일 때 이미 여섯 장이고,
 * 갈래가 늘수록 판이 끝없이 길어져 무엇이 있는지 한눈에 안 들어왔다.
 * 이제 갈래는 작은 타일 하나씩 늘어놓고(폰에서는 옆으로 밀어 보는 띠), 벌은 고른 갈래의 무대에서 고른다.
 * 모양은 갈래마다의 설정 판 짜임(L)이 맡는다 — 여기에는 짜임만 있다.
 */
import type * as Layout from "../celestial/CelestialSettings.layout";
import type { ThemeChoice } from "@/styles/theme";

type L = typeof Layout;

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

export default function ThemePicker({ L, themes, currentTheme, themeOptions, onThemeChange, onThemeOptionChange, optionLabels, label, variantLabel }: Props) {
    const current = themes.find((th) => th.id === currentTheme) ?? themes[0];
    const currentOption = themeOptions[current.id] ?? current.options[0];

    return (
        <>
            <L.ThemeGallery role="radiogroup" aria-label={label}>
                {themes.map((th) => {
                    const option = themeOptions[th.id] ?? th.options[0];
                    const on = th.id === current.id;
                    return (
                        <L.FamilyTile
                            key={th.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            title={th.description}
                            $selected={on}
                            onClick={() => { if (!on) onThemeChange(th.id); }}
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
                            </L.FamilyFoot>
                        </L.FamilyTile>
                    );
                })}
            </L.ThemeGallery>

            <L.ThemeStage key={current.id}>
                <L.StageThumb>
                    <ThemeThumb L={L} theme={current} option={currentOption} height={168} />
                </L.StageThumb>
                <L.StageInfo>
                    <L.StageName>{current.label}</L.StageName>
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
