"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Globe, MonitorDown, ArrowRight, ArrowDown } from "lucide-react";
import CronosOrbit from "@/assets/download/CronosOrbit";
import CursorTrail from "@/components/download/CursorTrail";
import useAuthStore from "@/store/useAuthStore";
import { api } from "@/lib/apiBase";
import { useT } from "@/i18n/useT";
import { useTheme } from "styled-components";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialDownload.styles";
import * as MapleS from "./maple/MapleDownload.styles";
import * as OceanS from './ocean/OceanDownload.styles';

const HeroScene = dynamic(() => import("@/components/download/HeroScene"), {
    ssr: false,
    loading: () => <CronosOrbit />,
});

const REPO = "https://github.com/pogooooo/calendar";
/**
 * 저장소가 밖에서 안 보이는 동안(계정 플래그)에는 GitHub 줄을 감춘다 — 누르면 404 만 나온다.
 * 다시 보이게 되면 이 값만 true 로 바꾸면 된다. 내려받기 자체는 /api/download 가 서버에서 받아 오므로 무관하다.
 */
const SHOW_REPO_LINK = false;

type PlatformKey = "windows" | "macos" | "linux" | "android";

type PlatformInfo = {
    available: boolean;
    name: string | null;
    size: number | null;
    version: string | null;
};

type DlReason = "platform" | "unreleased" | "upstream" | "error";

const PLATFORMS: { key: PlatformKey; label: string; ext: string }[] = [
    { key: "windows", label: "Windows", ext: ".exe" },
    { key: "macos", label: "macOS", ext: ".dmg" },
    { key: "linux", label: "Linux", ext: ".AppImage" },
    { key: "android", label: "Android", ext: ".apk" },
];

const STARS = Array.from({ length: 42 }, (_, i) => ({
    x: (i * 137 + 29) % 100,
    y: (i * 61 + 7) % 100,
    s: 1 + (i % 3) * 0.7,
    d: (i % 8) * 0.55,
    layer: i % 3,
    glyph: i % 11 === 0,
}));

function detectPlatform(): PlatformKey | null {
    if (typeof navigator === "undefined") return null;
    const ua = navigator.userAgent;
    // 안드로이드 UA 에도 "Linux" 가 들어 있다. 리눅스보다 먼저 봐야 한다.
    if (/Android/i.test(ua)) return "android";
    if (/Win/i.test(ua)) return "windows";
    if (/Mac/i.test(ua)) return "macos";
    if (/Linux|X11/i.test(ua)) return "linux";
    return null;
}

function mb(size: number | null | undefined) {
    if (!size) return null;
    return `${(size / 1048576).toFixed(1)} MB`;
}

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

function useReveal<T extends HTMLElement>() {
    const ref = React.useRef<T>(null);
    const [shown, setShown] = React.useState(false);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return { ref, shown };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const S = usePickTheme(STYLES);
    const { ref, shown } = useReveal<HTMLDivElement>();
    return (
        <S.RevealBox ref={ref} $shown={shown} $delay={delay}>
            {children}
        </S.RevealBox>
    );
}

function RevealTitle({ children }: { children: string }) {
    const S = usePickTheme(STYLES);
    const { ref, shown } = useReveal<HTMLHeadingElement>();
    return (
        <S.SectionTitle ref={ref}>
            <span>
                {children.split("").map((ch, i) => (
                    <S.Char key={i} $shown={shown} style={{ transitionDelay: `${i * 55}ms` }}>
                        {ch === " " ? " " : ch}
                    </S.Char>
                ))}
            </span>
        </S.SectionTitle>
    );
}

function useMagnetic<T extends HTMLElement>(strength = 0.22) {
    const ref = React.useRef<T>(null);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            el.style.setProperty("--magx", `${dx * strength}px`);
            el.style.setProperty("--magy", `${dy * strength}px`);
        };

        const leave = () => {
            el.style.setProperty("--magx", "0px");
            el.style.setProperty("--magy", "0px");
        };

        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
        };
    }, [strength]);

    return ref;
}

function tiltStart(e: React.PointerEvent<HTMLElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${((e.clientY - r.top) / r.height - 0.5) * -7}deg`);
    el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 7}deg`);
}

function tiltEnd(e: React.PointerEvent<HTMLElement>) {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
}

type Look = typeof CelestialS;

/** 소개 칸의 작은 그림들 — 모양(S)을 받아 그린다 */
const FEATURES = [
    {
        key: "calendar",
        visual: (S: Look) => (
            <S.MiniCalendar aria-hidden="true">
                {Array.from({ length: 28 }, (_, i) => (
                    <span key={i} className={`cell ${[3, 9, 16, 24].includes(i) ? "dot" : ""}`} />
                ))}
                <span className="bar" />
            </S.MiniCalendar>
        ),
    },
    {
        key: "project",
        visual: (S: Look) => (
            <S.MiniBoard aria-hidden="true">
                <span className="col"><i /><i /><i className="mover" /></span>
                <span className="col"><i /></span>
                <span className="col"><i /><i /></span>
            </S.MiniBoard>
        ),
    },
    {
        key: "challenge",
        visual: (S: Look) => (
            <S.MiniChallenge aria-hidden="true">
                {Array.from({ length: 7 }, (_, i) => (
                    <span
                        key={i}
                        className={`day ${i < 4 ? "on" : ""}`}
                        style={{ transitionDelay: `${i * 70}ms`, animationDelay: `${i * 0.4}s` }}
                    >
                        ✦
                    </span>
                ))}
            </S.MiniChallenge>
        ),
    },
    {
        key: "widget",
        visual: (S: Look) => (
            <S.MiniWidgets aria-hidden="true">
                <span className="pane p1" />
                <span className="pane p2" />
                <span className="pane p3" />
            </S.MiniWidgets>
        ),
    },
];

export default function DownloadPage() {
    const S = usePickTheme(STYLES);
    const family = useTheme().family;
    const t = useT();
    const router = useRouter();
    const pageRef = React.useRef<HTMLDivElement>(null);
    const progressRef = React.useRef<HTMLDivElement>(null);
    const primaryRef = useMagnetic<HTMLButtonElement>();
    const ghostRef = useMagnetic<HTMLButtonElement>();
    const [mine, setMine] = React.useState<PlatformKey | null>(null);
    const [infos, setInfos] = React.useState<Partial<Record<PlatformKey, PlatformInfo>>>({});
    const [busy, setBusy] = React.useState<PlatformKey | null>(null);
    const busyTimer = React.useRef<number | null>(null);
    const [dlError, setDlError] = React.useState<string | null>(null);

    // 문구는 언어 설정을 따른다
    const DL_MESSAGES: Record<DlReason, string> = React.useMemo(() => ({
        platform: t.download.errPlatform,
        unreleased: t.download.errUnreleased,
        upstream: t.download.errUpstream,
        error: t.download.errGeneric,
    }), [t]);
    const NOTES: Record<PlatformKey, string> = {
        windows: t.download.winNote,
        macos: t.download.macNote,
        linux: t.download.linuxNote,
        android: t.download.androidNote,
    };
    const FEATURE_TEXT: Record<string, { title: string; desc: string }> = {
        calendar:  { title: t.download.featCalendar,  desc: t.download.featCalendarDesc },
        project:   { title: t.download.featProject,   desc: t.download.featProjectDesc },
        challenge: { title: t.download.featChallenge, desc: t.download.featChallengeDesc },
        widget:    { title: t.download.featWidget,    desc: t.download.featWidgetDesc },
    };

    React.useEffect(() => setMine(detectPlatform()), []);

    React.useEffect(() => {
        const reason = new URLSearchParams(window.location.search).get("dl");
        if (!reason) return;

        setDlError(DL_MESSAGES[reason as DlReason] ?? DL_MESSAGES.error);

        const url = new URL(window.location.href);
        url.searchParams.delete("dl");
        window.history.replaceState(null, "", url.toString());
    }, [DL_MESSAGES]);

    React.useEffect(() => {
        PLATFORMS.forEach(({ key }) => {
            fetch(api(`/api/download?platform=${key}&check=1`))
                .then(r => r.ok ? r.json() : null)
                .then((d: PlatformInfo | null) => {
                    if (d) setInfos(s => ({ ...s, [key]: d }));
                })
                .catch(() => {});
        });
    }, []);

    React.useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const el = pageRef.current;
        if (!el) return;

        let raf = 0;
        const onMove = (e: PointerEvent) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.setProperty("--mx", (e.clientX / window.innerWidth * 2 - 1).toFixed(3));
                el.style.setProperty("--my", (e.clientY / window.innerHeight * 2 - 1).toFixed(3));
            });
        };

        window.addEventListener("pointermove", onMove);
        return () => {
            window.removeEventListener("pointermove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    React.useEffect(() => {
        const bar = progressRef.current;
        if (!bar) return;

        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    const goToWeb = React.useCallback(() => {
        const token = useAuthStore.getState().accessToken;
        router.push(token ? "/" : "/signIn");
    }, [router]);

    const download = React.useCallback((platform: PlatformKey) => {
        const info = infos[platform];
        if (!info?.available || busy) return;
        setBusy(platform);
        window.location.href = api(`/api/download?platform=${platform}`);
        if (busyTimer.current !== null) window.clearTimeout(busyTimer.current);
        busyTimer.current = window.setTimeout(() => {
            busyTimer.current = null;
            setBusy(null);
        }, 4000);
    }, [infos, busy]);

    React.useEffect(() => {
        const reset = () => {
            if (document.visibilityState !== "visible") return;
            if (busyTimer.current !== null) {
                window.clearTimeout(busyTimer.current);
                busyTimer.current = null;
            }
            setBusy(null);
        };

        document.addEventListener("visibilitychange", reset);
        return () => {
            document.removeEventListener("visibilitychange", reset);
            if (busyTimer.current !== null) window.clearTimeout(busyTimer.current);
        };
    }, []);

    const mineInfo = mine ? infos[mine] : undefined;
    const mineLabel = PLATFORMS.find(p => p.key === mine)?.label;

    return (
        <S.Page ref={pageRef}>
            <S.ProgressBar ref={progressRef} aria-hidden="true" />
            <CursorTrail />

            <S.Sky aria-hidden="true">
                {STARS.map((s, i) => (
                    <S.Star
                        key={i}
                        $layer={s.layer}
                        style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }}
                    >
                        {s.glyph ? "✦" : ""}
                        {!s.glyph && <i style={{ width: s.s, height: s.s }} />}
                    </S.Star>
                ))}
            </S.Sky>

            <S.Nav>
                <S.NavBrand>CRONOS</S.NavBrand>
                <S.NavRight>
                    {SHOW_REPO_LINK && <S.NavLink as="a" href={REPO} target="_blank" rel="noreferrer">GitHub</S.NavLink>}
                    <S.NavCta type="button" onClick={goToWeb}>
                        <Globe size={14} />
                        {t.download.openWeb}
                    </S.NavCta>
                </S.NavRight>
            </S.Nav>

            <S.Hero>
                <S.HeroText>
                    <S.Brand>CRONOS</S.Brand>
                    {/* 갈래마다 제 말 — Celestial 은 별자리, Maple 은 도감, Ocean 은 맑은 물 */}
                    <S.Tagline>{family === "maple" ? t.download.taglineMaple : family === "ocean" ? t.download.taglineOcean : t.download.tagline}</S.Tagline>
                    <S.Lead>{t.download.lead}</S.Lead>

                    <S.CtaRow>
                        <S.PrimaryCta
                            ref={primaryRef}
                            type="button"
                            onClick={() => mine && download(mine)}
                            disabled={!mine || !mineInfo?.available || busy !== null}
                        >
                            <S.IconSwap data-busy={busy ? "1" : "0"}>
                                <S.Spinner size={15} className="on-busy" />
                                <MonitorDown size={15} className="on-idle" />
                            </S.IconSwap>
                            {mineLabel ? t.download.downloadFor(mineLabel) : t.download.download}
                            {mineInfo?.available && (
                                <S.CtaMeta>{`v${mineInfo.version} · ${mb(mineInfo.size)}`}</S.CtaMeta>
                            )}
                            {mine && infos[mine] && !mineInfo?.available && <S.CtaMeta>{t.download.preparing}</S.CtaMeta>}
                        </S.PrimaryCta>
                        <S.GhostCta ref={ghostRef} type="button" onClick={goToWeb}>
                            {t.download.useOnWeb}
                            <ArrowRight size={14} className="arrow" />
                        </S.GhostCta>
                    </S.CtaRow>

                    {dlError && <S.DownloadNotice role="alert">{dlError}</S.DownloadNotice>}

                </S.HeroText>

                <S.HeroArt aria-hidden="true">
                    <HeroScene />
                </S.HeroArt>
            </S.Hero>

            <S.Section>
                <RevealTitle>{t.download.featuresTitle}</RevealTitle>
                <S.FeatureGrid>
                    {FEATURES.map((f, i) => (
                        <Reveal key={f.key} delay={i * 90}>
                            <S.Feature
                                tabIndex={0}
                                onPointerMove={tiltStart}
                                onPointerLeave={tiltEnd}
                            >
                                <S.FeatureVisual>{f.visual(S)}</S.FeatureVisual>
                                <S.FeatureTitle>{FEATURE_TEXT[f.key].title}</S.FeatureTitle>
                                <S.FeatureDesc>{FEATURE_TEXT[f.key].desc}</S.FeatureDesc>
                            </S.Feature>
                        </Reveal>
                    ))}
                </S.FeatureGrid>
            </S.Section>

            <S.Section id="all-downloads">
                <RevealTitle>{t.download.platformsTitle}</RevealTitle>
                <Reveal delay={80}>
                    <S.PlatformList>
                        {PLATFORMS.map(p => {
                            const info = infos[p.key];
                            const ready = info?.available;
                            return (
                                <S.PlatformRow
                                    key={p.key}
                                    type="button"
                                    onClick={() => download(p.key)}
                                    disabled={!ready || busy !== null}
                                    $mine={mine === p.key}
                                >
                                    <S.RowName>
                                        {p.label}
                                        {mine === p.key && <S.RowMine>{t.download.myOs}</S.RowMine>}
                                    </S.RowName>
                                    <S.RowNote>{NOTES[p.key]}</S.RowNote>
                                    <S.RowMeta>
                                        {info === undefined
                                            ? t.download.checking
                                            : !ready
                                                ? t.download.preparing
                                                : `${p.ext} · ${mb(info?.size)}`}
                                    </S.RowMeta>
                                    <S.RowAction data-busy={busy === p.key ? "1" : "0"}>
                                        <S.Spinner size={13} className="on-busy" />
                                        <ArrowDown size={13} className="arrow on-idle" />
                                    </S.RowAction>
                                </S.PlatformRow>
                            );
                        })}
                    </S.PlatformList>
                </Reveal>
            </S.Section>

            <S.Foot>
                <span>CRONOS</span>
                <S.FootLinks>
                    {SHOW_REPO_LINK && <a href={REPO} target="_blank" rel="noreferrer">GitHub</a>}
                    <Link href="/signIn">{t.download.signIn}</Link>
                    <Link href="/signUp">{t.download.signUp}</Link>
                    {/* 개인정보처리방침은 누리집에 늘 걸어 둔다(개인정보보호법 제30조, 시행령 제31조) */}
                    <Link href="/privacy">{t.auth.privacyPolicy}</Link>
                </S.FootLinks>
            </S.Foot>
        </S.Page>
    );
}
