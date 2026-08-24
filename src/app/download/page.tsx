"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import styled, { keyframes, css } from "styled-components";
import { Globe, MonitorDown, ArrowRight, ArrowDown, Loader2 } from "lucide-react";
import CronosOrbit from "@/assets/download/CronosOrbit";
import CursorTrail from "@/components/download/CursorTrail";
import useAuthStore from "@/store/useAuthStore";
import { api } from "@/lib/apiBase";

const HeroScene = dynamic(() => import("@/components/download/HeroScene"), {
    ssr: false,
    loading: () => <CronosOrbit />,
});

const REPO = "https://github.com/pogooooo/calendar";

type PlatformKey = "windows" | "macos" | "linux";

type PlatformInfo = {
    available: boolean;
    name: string | null;
    size: number | null;
    version: string | null;
};

const PLATFORMS: { key: PlatformKey; label: string; ext: string; note: string }[] = [
    { key: "windows", label: "Windows", ext: ".exe", note: "Windows 10 이상" },
    { key: "macos", label: "macOS", ext: ".dmg", note: "macOS 11 이상 · Apple Silicon / Intel" },
    { key: "linux", label: "Linux", ext: ".AppImage", note: "x86_64" },
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
    if (/Win/i.test(ua)) return "windows";
    if (/Mac/i.test(ua)) return "macos";
    if (/Linux|X11/i.test(ua)) return "linux";
    return null;
}

function mb(size: number | null | undefined) {
    if (!size) return null;
    return `${(size / 1048576).toFixed(1)} MB`;
}

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
    const { ref, shown } = useReveal<HTMLDivElement>();
    return (
        <RevealBox ref={ref} $shown={shown} $delay={delay}>
            {children}
        </RevealBox>
    );
}

function RevealTitle({ children }: { children: string }) {
    const { ref, shown } = useReveal<HTMLHeadingElement>();
    return (
        <SectionTitle ref={ref}>
            <span>
                {children.split("").map((ch, i) => (
                    <Char key={i} $shown={shown} style={{ transitionDelay: `${i * 55}ms` }}>
                        {ch === " " ? " " : ch}
                    </Char>
                ))}
            </span>
        </SectionTitle>
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

const FEATURES = [
    {
        key: "calendar",
        title: "월간 · 주간 · 일간 캘린더",
        desc: "기간이 있는 일정은 막대로 이어지고, 하루는 시간대로 나뉩니다.",
        visual: () => (
            <MiniCalendar aria-hidden="true">
                {Array.from({ length: 28 }, (_, i) => (
                    <span key={i} className={`cell ${[3, 9, 16, 24].includes(i) ? "dot" : ""}`} />
                ))}
                <span className="bar" />
            </MiniCalendar>
        ),
    },
    {
        key: "project",
        title: "프로젝트 보드와 타임라인",
        desc: "태스크를 보드에서 옮기고, 타임라인에서 선행 관계를 확인합니다.",
        visual: () => (
            <MiniBoard aria-hidden="true">
                <span className="col"><i /><i /><i className="mover" /></span>
                <span className="col"><i /></span>
                <span className="col"><i /><i /></span>
            </MiniBoard>
        ),
    },
    {
        key: "challenge",
        title: "챌린지",
        desc: "반복 목표를 기록하면 달성한 날마다 별이 새겨집니다.",
        visual: () => (
            <MiniChallenge aria-hidden="true">
                {Array.from({ length: 7 }, (_, i) => (
                    <span
                        key={i}
                        className={`day ${i < 4 ? "on" : ""}`}
                        style={{ transitionDelay: `${i * 70}ms`, animationDelay: `${i * 0.4}s` }}
                    >
                        ✦
                    </span>
                ))}
            </MiniChallenge>
        ),
    },
    {
        key: "widget",
        title: "바탕화면 위젯",
        desc: "오늘 할 일, 메모, 보드까지 14가지 위젯을 화면에 고정합니다.",
        visual: () => (
            <MiniWidgets aria-hidden="true">
                <span className="pane p1" />
                <span className="pane p2" />
                <span className="pane p3" />
            </MiniWidgets>
        ),
    },
];

export default function DownloadPage() {
    const router = useRouter();
    const pageRef = React.useRef<HTMLDivElement>(null);
    const progressRef = React.useRef<HTMLDivElement>(null);
    const primaryRef = useMagnetic<HTMLButtonElement>();
    const ghostRef = useMagnetic<HTMLButtonElement>();
    const [mine, setMine] = React.useState<PlatformKey | null>(null);
    const [infos, setInfos] = React.useState<Partial<Record<PlatformKey, PlatformInfo>>>({});
    const [busy, setBusy] = React.useState<PlatformKey | null>(null);

    React.useEffect(() => setMine(detectPlatform()), []);

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
        window.setTimeout(() => setBusy(null), 4000);
    }, [infos, busy]);

    const mineInfo = mine ? infos[mine] : undefined;
    const mineLabel = PLATFORMS.find(p => p.key === mine)?.label;

    return (
        <Page ref={pageRef}>
            <ProgressBar ref={progressRef} aria-hidden="true" />
            <CursorTrail />

            <Sky aria-hidden="true">
                {STARS.map((s, i) => (
                    <Star
                        key={i}
                        $layer={s.layer}
                        style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }}
                    >
                        {s.glyph ? "✦" : ""}
                        {!s.glyph && <i style={{ width: s.s, height: s.s }} />}
                    </Star>
                ))}
            </Sky>

            <Nav>
                <NavBrand>CRONOS</NavBrand>
                <NavRight>
                    <NavLink as="a" href={REPO} target="_blank" rel="noreferrer">GitHub</NavLink>
                    <NavCta type="button" onClick={goToWeb}>
                        <Globe size={14} />
                        웹으로 열기
                    </NavCta>
                </NavRight>
            </Nav>

            <Hero>
                <HeroText>
                    <Brand>CRONOS</Brand>
                    <Tagline>일정과 목표를 하나의 별자리처럼</Tagline>
                    <Lead>
                        캘린더 · 프로젝트 · 챌린지를 한 곳에서 관리하는 할 일 앱.
                        웹에서 바로 쓰거나, 앱을 설치해 바탕화면 위젯까지 사용할 수 있습니다.
                    </Lead>

                    <CtaRow>
                        <PrimaryCta
                            ref={primaryRef}
                            type="button"
                            onClick={() => mine && download(mine)}
                            disabled={!mine || !mineInfo?.available || busy !== null}
                        >
                            {busy ? <Spinner size={15} /> : <MonitorDown size={15} />}
                            {mineLabel ? `${mineLabel}용 다운로드` : "다운로드"}
                            {mineInfo?.available && (
                                <CtaMeta>
                                    v{mineInfo.version} · {mb(mineInfo.size)}
                                </CtaMeta>
                            )}
                            {mine && infos[mine] && !mineInfo?.available && <CtaMeta>준비 중</CtaMeta>}
                        </PrimaryCta>
                        <GhostCta ref={ghostRef} type="button" onClick={goToWeb}>
                            웹에서 바로 사용
                            <ArrowRight size={14} className="arrow" />
                        </GhostCta>
                    </CtaRow>

                </HeroText>

                <HeroArt aria-hidden="true">
                    <HeroScene />
                </HeroArt>
            </Hero>

            <Section>
                <RevealTitle>기능</RevealTitle>
                <FeatureGrid>
                    {FEATURES.map((f, i) => (
                        <Reveal key={f.key} delay={i * 90}>
                            <Feature
                                tabIndex={0}
                                onPointerMove={tiltStart}
                                onPointerLeave={tiltEnd}
                            >
                                <FeatureVisual>{f.visual()}</FeatureVisual>
                                <FeatureTitle>{f.title}</FeatureTitle>
                                <FeatureDesc>{f.desc}</FeatureDesc>
                            </Feature>
                        </Reveal>
                    ))}
                </FeatureGrid>
            </Section>

            <Section id="all-downloads">
                <RevealTitle>모든 플랫폼</RevealTitle>
                <Reveal delay={80}>
                    <PlatformList>
                        {PLATFORMS.map(p => {
                            const info = infos[p.key];
                            const ready = info?.available;
                            return (
                                <PlatformRow
                                    key={p.key}
                                    type="button"
                                    onClick={() => download(p.key)}
                                    disabled={!ready || busy !== null}
                                    $mine={mine === p.key}
                                >
                                    <RowName>
                                        {p.label}
                                        {mine === p.key && <RowMine>내 운영체제</RowMine>}
                                    </RowName>
                                    <RowNote>{p.note}</RowNote>
                                    <RowMeta>
                                        {info === undefined && "확인 중"}
                                        {info !== undefined && !ready && "준비 중"}
                                        {ready && `${p.ext} · ${mb(info?.size)}`}
                                    </RowMeta>
                                    <RowAction>
                                        {busy === p.key ? <Spinner size={13} /> : <ArrowDown size={13} className="arrow" />}
                                    </RowAction>
                                </PlatformRow>
                            );
                        })}
                    </PlatformList>
                </Reveal>
            </Section>

            <Foot>
                <span>CRONOS</span>
                <FootLinks>
                    <a href={REPO} target="_blank" rel="noreferrer">GitHub</a>
                    <Link href="/signIn">로그인</Link>
                    <Link href="/signUp">회원가입</Link>
                </FootLinks>
            </Foot>
        </Page>
    );
}

const twinkle = keyframes`
    0%, 100% { opacity: 0.12; transform: scale(0.8); }
    50%      { opacity: 0.85; transform: scale(1.1); }
`;

const starPulse = keyframes`
    0%, 100% { opacity: 0.55; text-shadow: none; }
    50%      { opacity: 1; text-shadow: 0 0 6px currentColor; }
`;

const riseIn = keyframes`
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: none; }
`;

const letterIn = keyframes`
    from { opacity: 0; letter-spacing: 26px; filter: blur(6px); }
    to   { opacity: 1; letter-spacing: 12px; filter: none; }
`;

const spin = keyframes`
    to { transform: rotate(360deg); }
`;

const sheen = keyframes`
    from { transform: translateX(-130%); }
    to   { transform: translateX(230%); }
`;

const motionOnly = (rule: ReturnType<typeof css>) => css`
    @media (prefers-reduced-motion: no-preference) {
        ${rule}
    }
`;

const Page = styled.div`
    position: relative;
    /* 데스크톱 타이틀바 높이는 body 에서 이미 빠진다 */
    min-height: calc(100vh - var(--titlebar-h, 0px));
    background-color: ${p => p.theme.colors.background};
    color: ${p => p.theme.colors.text};
    overflow-x: hidden;
`;

const ProgressBar = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    z-index: 50;
    background: ${p => p.theme.colors.primary};
    box-shadow: 0 0 8px ${p => p.theme.colors.primary}88;
    transform: scaleX(0);
    transform-origin: left;
`;

const Sky = styled.div`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
`;

const Star = styled.span<{ $layer: number }>`
    position: absolute;
    color: ${p => p.theme.colors.primary};
    font-size: 9px;
    line-height: 1;
    opacity: 0.3;
    transform: translate3d(
        calc(var(--mx, 0) * ${p => 6 + p.$layer * 7}px),
        calc(var(--my, 0) * ${p => 4 + p.$layer * 5}px),
        0
    );

    i {
        display: block;
        background: ${p => p.theme.colors.primary};
        border-radius: 50%;
    }

    ${motionOnly(css`
        i, &:not(:empty) { animation: ${twinkle} 5s ease-in-out infinite; animation-delay: inherit; }
    `)}
`;

const Nav = styled.nav`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1080px;
    margin: 0 auto;
    padding: 20px 28px 0;
`;

const NavBrand = styled.span`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.9rem;
    letter-spacing: 5px;
`;

const NavRight = styled.div`
    display: flex;
    align-items: center;
    gap: 18px;
`;

const NavLink = styled.a`
    font-size: 0.78rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
    text-decoration: none;
    transition: color 0.2s;

    &:hover { color: ${p => p.theme.colors.primary}; }
`;

const NavCta = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    font-size: 0.76rem;
    font-family: inherit;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}55;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 0 8px ${p => p.theme.colors.primary}40;
    }
`;

const Hero = styled.header`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 48px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 76px 28px 96px;

    @media (max-width: 900px) {
        padding: 56px 24px 72px;
    }
`;

const HeroText = styled.div`
    flex: 1;
    min-width: 0;

    ${motionOnly(css`
        & > * { animation: ${riseIn} 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        & > *:nth-child(2) { animation-delay: 0.1s; }
        & > *:nth-child(3) { animation-delay: 0.2s; }
        & > *:nth-child(4) { animation-delay: 0.3s; }
        & > *:nth-child(5) { animation-delay: 0.4s; }
    `)}
`;

const Brand = styled.h1`
    margin: 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 3.2rem;
    font-weight: 400;
    letter-spacing: 12px;

    ${motionOnly(css`
        animation: ${letterIn} 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
    `)}

    @media (max-width: 720px) {
        font-size: 2.2rem;
        letter-spacing: 7px;
    }
`;

const Tagline = styled.p`
    margin: 12px 0 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1rem;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.primary};
`;

const Lead = styled.p`
    margin: 22px 0 0;
    max-width: 480px;
    font-size: 0.94rem;
    line-height: 1.75;
    color: ${p => p.theme.colors.textSecondary};
`;

const CtaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 12px;
    margin-top: 34px;
`;

const ctaBase = css`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 13px 22px;
    font-size: 0.87rem;
    font-family: inherit;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
    background: none;
    cursor: pointer;
    overflow: hidden;
    transform: translate(var(--magx, 0px), var(--magy, 0px));
    transition: box-shadow 0.25s, border-color 0.25s, transform 0.25s ease-out;

    .arrow { transition: transform 0.25s; }
    &:hover:not(:disabled) .arrow { transform: translateX(4px); }
    &:disabled { cursor: default; opacity: 0.6; }
`;

const PrimaryCta = styled.button`
    ${ctaBase}
    border: 1px solid ${p => p.theme.colors.primary};

    &::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        width: 42%;
        background: linear-gradient(100deg, transparent, ${p => p.theme.colors.primary}44, transparent);
        transform: translateX(-130%);
    }

    &:hover:not(:disabled) { box-shadow: 0 0 18px ${p => p.theme.colors.primary}55; }

    ${motionOnly(css`
        &:hover:not(:disabled)::after { animation: ${sheen} 0.9s ease-out; }
    `)}
`;

const CtaMeta = styled.span`
    padding-left: 10px;
    border-left: 1px solid ${p => p.theme.colors.primary}55;
    font-size: 0.74rem;
    white-space: nowrap;
    color: ${p => p.theme.colors.textSecondary};
`;

const GhostCta = styled.button`
    ${ctaBase}
    border: 1px solid ${p => p.theme.colors.primary}44;
    color: ${p => p.theme.colors.textSecondary};

    &:hover:not(:disabled) {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.text};
    }
`;

const HeroArt = styled.div`
    position: relative;
    flex: 0 0 auto;
    width: 340px;
    height: 340px;

    ${motionOnly(css`
        animation: ${riseIn} 1s cubic-bezier(0.22, 1, 0.36, 1) both;
    `)}

    @media (max-width: 1000px) { width: 250px; height: 250px; }
    @media (max-width: 860px) { display: none; }
`;

const RevealBox = styled.div<{ $shown: boolean; $delay: number }>`
    height: 100%;

    @media (prefers-reduced-motion: no-preference) {
        opacity: ${p => (p.$shown ? 1 : 0)};
        transform: ${p => (p.$shown ? "none" : "translateY(18px)")};
        transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: ${p => p.$delay}ms;
    }
`;

const Section = styled.section`
    position: relative;
    z-index: 1;
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 28px 88px;
    scroll-margin-top: 24px;
`;

const SectionTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 0 0 26px;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1.05rem;
    font-weight: 400;
    letter-spacing: 5px;

    &::after {
        content: "";
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, ${p => p.theme.colors.primary}88, transparent);
    }
`;

const Char = styled.span<{ $shown: boolean }>`
    display: inline-block;

    @media (prefers-reduced-motion: no-preference) {
        opacity: ${p => (p.$shown ? 1 : 0)};
        transform: ${p => (p.$shown ? "none" : "translateY(10px)")};
        filter: ${p => (p.$shown ? "none" : "blur(4px)")};
        transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s;
    }
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 14px;
`;

const Feature = styled.article`
    position: relative;
    height: 100%;
    padding: 20px;
    border: 1px solid ${p => p.theme.colors.primary}33;
    outline: none;
    transform: perspective(700px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--lift, 0px));
    transition: border-color 0.3s, transform 0.18s ease-out, box-shadow 0.3s;

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 14px;
        height: 14px;
        background: linear-gradient(315deg, transparent 48%, ${p => p.theme.colors.primary} 50%, transparent 52%);
        transition: width 0.3s, height 0.3s;
    }

    &:hover, &:focus-visible {
        --lift: -4px;
        border-color: ${p => p.theme.colors.primary}99;
        box-shadow: 0 10px 28px ${p => p.theme.colors.primary}1f;
    }

    &:hover::after, &:focus-visible::after { width: 24px; height: 24px; }
`;

const FeatureVisual = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 92px;
    margin-bottom: 16px;
    border-bottom: 1px dashed ${p => p.theme.colors.primary}33;
`;

const MiniCalendar = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: repeat(7, 14px);
    gap: 3px;

    .cell {
        height: 10px;
        border: 1px solid ${p => p.theme.colors.primary}40;
    }

    .cell.dot::after {
        content: "";
        display: block;
        width: 3px;
        height: 3px;
        margin: 2px auto 0;
        background: ${p => p.theme.colors.primary};
        border-radius: 50%;
    }

    .bar {
        position: absolute;
        left: 17px;
        top: 28px;
        width: 84px;
        height: 2px;
        background: ${p => p.theme.colors.primary};
        transform-origin: left;
        transform: scaleX(0.35);
        transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        box-shadow: 0 0 6px ${p => p.theme.colors.primary}66;
    }

    ${Feature}:hover &, ${Feature}:focus-visible & {
        .bar { transform: scaleX(1); }
    }
`;

const MiniBoard = styled.div`
    display: flex;
    gap: 6px;

    .col {
        display: flex;
        flex-direction: column;
        gap: 5px;
        width: 34px;
        padding: 5px 4px;
        border: 1px solid ${p => p.theme.colors.primary}40;
        min-height: 62px;
    }

    .col i {
        display: block;
        height: 3px;
        background: ${p => p.theme.colors.primary}99;
        transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s;
    }

    ${Feature}:hover .col .mover, ${Feature}:focus-visible .col .mover {
        transform: translateX(40px);
        box-shadow: 0 0 6px ${p => p.theme.colors.primary}88;
    }
`;

const MiniChallenge = styled.div`
    display: flex;
    gap: 7px;

    .day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border: 1px solid ${p => p.theme.colors.primary}66;
        font-size: 10px;
        color: ${p => p.theme.colors.primary};
        opacity: 0.3;
        transition: opacity 0.35s, text-shadow 0.35s, border-color 0.35s;
    }

    .day.on {
        opacity: 1;
        border-color: ${p => p.theme.colors.primary};
        text-shadow: 0 0 5px ${p => p.theme.colors.primary}99;
    }

    ${motionOnly(css`
        .day.on { animation: ${starPulse} 3.2s ease-in-out infinite; }
    `)}

    ${Feature}:hover .day, ${Feature}:focus-visible .day {
        opacity: 1;
        border-color: ${p => p.theme.colors.primary};
        text-shadow: 0 0 5px ${p => p.theme.colors.primary}99;
    }
`;

const MiniWidgets = styled.div`
    position: relative;
    width: 74px;
    height: 58px;

    .pane {
        position: absolute;
        inset: 0;
        border: 1px solid ${p => p.theme.colors.primary}55;
        transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        background: ${p => p.theme.colors.background};
    }

    .p2 { transform: translate(6px, 6px); }
    .p3 { transform: translate(12px, 12px); }

    ${Feature}:hover &, ${Feature}:focus-visible & {
        .p1 { transform: translate(-8px, -4px) rotate(-3deg); }
        .p2 { transform: translate(10px, 2px) rotate(2deg); }
        .p3 { transform: translate(2px, 14px); }
    }
`;

const FeatureTitle = styled.h3`
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.5px;
`;

const FeatureDesc = styled.p`
    margin: 8px 0 0;
    font-size: 0.8rem;
    line-height: 1.65;
    color: ${p => p.theme.colors.textSecondary};
`;

const PlatformList = styled.div`
    display: flex;
    flex-direction: column;
    border-top: 1px solid ${p => p.theme.colors.primary}44;
`;

const PlatformRow = styled.button<{ $mine: boolean }>`
    display: grid;
    grid-template-columns: auto 1fr auto 40px;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 16px 6px;
    font-family: inherit;
    text-align: left;
    color: inherit;
    background: none;
    border: none;
    border-bottom: 1px solid ${p => p.theme.colors.primary}33;
    cursor: pointer;
    transition: box-shadow 0.25s;

    .arrow { transition: transform 0.25s; }

    &:hover:not(:disabled) {
        box-shadow: inset 0 -1px 0 ${p => p.theme.colors.primary}, 0 6px 16px -8px ${p => p.theme.colors.primary}44;

        .arrow { transform: translateY(3px); }
    }

    &:disabled { cursor: default; opacity: 0.55; }

    @media (max-width: 620px) {
        grid-template-columns: auto 1fr 32px;

        & > :nth-child(2) { display: none; }
    }
`;

const RowName = styled.span`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 150px;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.98rem;
    letter-spacing: 2px;
    white-space: nowrap;

    @media (max-width: 620px) {
        min-width: 0;
    }
`;

const RowMine = styled.span`
    padding: 2px 7px;
    border: 1px solid ${p => p.theme.colors.primary}66;
    font-size: 0.6rem;
    letter-spacing: 1px;
    white-space: nowrap;
    color: ${p => p.theme.colors.primary};
`;

const RowNote = styled.span`
    font-size: 0.76rem;
    color: ${p => p.theme.colors.textSecondary};
`;

const RowMeta = styled.span`
    font-size: 0.76rem;
    letter-spacing: 0.5px;
    white-space: nowrap;
    text-align: right;
    color: ${p => p.theme.colors.primary};
`;

const RowAction = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid ${p => p.theme.colors.primary}55;
    color: ${p => p.theme.colors.primary};
`;

const Spinner = styled(Loader2)`
    ${motionOnly(css`
        animation: ${spin} 0.9s linear infinite;
    `)}
`;

const Foot = styled.footer`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 20px 28px 36px;
    border-top: 1px solid ${p => p.theme.colors.primary}33;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.74rem;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.textSecondary};
`;

const FootLinks = styled.div`
    display: flex;
    gap: 18px;

    a {
        color: ${p => p.theme.colors.textSecondary};
        text-decoration: none;
        letter-spacing: 1px;
        transition: color 0.2s;

        &:hover { color: ${p => p.theme.colors.primary}; }
    }
`;
