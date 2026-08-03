"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled, { keyframes, css } from "styled-components";
import { CalendarDays, KanbanSquare, Flame, LayoutGrid, Globe, MonitorDown, RefreshCw, ArrowRight, Loader2 } from "lucide-react";
import CronosOrbit from "@/assets/download/CronosOrbit";
import useAuthStore from "@/store/useAuthStore";
import { api } from "@/lib/apiBase";

const REPO = "https://github.com/pogooooo/calendar";

type PlatformKey = "windows" | "macos" | "linux";
type CardState = "idle" | "checking" | "unreleased" | "error";

const PLATFORMS: { key: PlatformKey; label: string; ext: string; note: string }[] = [
    { key: "windows", label: "Windows", ext: ".exe", note: "Windows 10 이상" },
    { key: "macos", label: "macOS", ext: ".dmg", note: "Apple Silicon · Intel" },
    { key: "linux", label: "Linux", ext: ".AppImage", note: "x86_64" },
];

const FEATURES = [
    { icon: CalendarDays, title: "월간 · 주간 · 일간 캘린더", desc: "하나의 일정을 세 가지 시야로 봅니다. 기간이 있는 할 일은 막대로 이어지고, 하루는 시간대로 나뉩니다." },
    { icon: KanbanSquare, title: "프로젝트 보드와 타임라인", desc: "진행 전·진행 중·완료 보드로 태스크를 옮기고, 타임라인에서 일정과 선행 관계를 한눈에 확인합니다." },
    { icon: Flame, title: "챌린지와 스티커 보드", desc: "매일 또는 주기마다 반복하는 목표를 기록하고, 달성할수록 캘린더에 장식이 더해집니다." },
    { icon: LayoutGrid, title: "바탕화면 위젯", desc: "오늘 할 일, 메모, 프로젝트 보드 같은 14가지 위젯을 바탕화면에 고정해 두고 씁니다." },
];

function detectPlatform(): PlatformKey | null {
    if (typeof navigator === "undefined") return null;
    const ua = navigator.userAgent;
    if (/Win/i.test(ua)) return "windows";
    if (/Mac/i.test(ua)) return "macos";
    if (/Linux|X11/i.test(ua)) return "linux";
    return null;
}

/** 화면에 들어오면 한 번만 켜지는 등장 애니메이션용 훅 */
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

function Reveal({ children, delay = 0, as }: { children: React.ReactNode; delay?: number; as?: "div" | "section" }) {
    const { ref, shown } = useReveal<HTMLDivElement>();
    return (
        <RevealBox ref={ref} $shown={shown} $delay={delay} as={as}>
            {children}
        </RevealBox>
    );
}

export default function DownloadPage() {
    const router = useRouter();
    const [states, setStates] = React.useState<Record<string, CardState>>({});
    const [mine, setMine] = React.useState<PlatformKey | null>(null);

    React.useEffect(() => setMine(detectPlatform()), []);

    // 로그인 상태면 앱으로, 아니면 로그인 화면으로 보낸다.
    const goToWeb = React.useCallback(() => {
        const token = useAuthStore.getState().accessToken;
        router.push(token ? "/" : "/signIn");
    }, [router]);

    const download = React.useCallback(async (platform: PlatformKey) => {
        setStates(s => ({ ...s, [platform]: "checking" }));
        try {
            const res = await fetch(api(`/api/download?platform=${platform}&check=1`));
            const data = await res.json() as { available: boolean };

            if (!data.available) {
                setStates(s => ({ ...s, [platform]: "unreleased" }));
                return;
            }

            setStates(s => ({ ...s, [platform]: "idle" }));
            // 첨부 파일 응답이라 페이지 이동 없이 곧바로 내려받는다.
            window.location.href = api(`/api/download?platform=${platform}`);
        } catch {
            setStates(s => ({ ...s, [platform]: "error" }));
        }
    }, []);

    return (
        <Page>
            <Backdrop aria-hidden="true">
                <span className="glow g1" />
                <span className="glow g2" />
                <Grain />
            </Backdrop>

            <Inner>
                <Hero>
                    <HeroArt aria-hidden="true">
                        <CronosOrbit />
                    </HeroArt>

                    <HeroText>
                        <Brand>CRONOS</Brand>
                        <Tagline>일정과 목표를 하나의 별자리처럼</Tagline>
                        <Lead>
                            캘린더 · 프로젝트 · 챌린지를 한 곳에서 관리하는 할 일 앱입니다.
                            웹에서 바로 쓰거나, 데스크톱 앱을 설치해 바탕화면 위젯까지 함께 사용할 수 있습니다.
                        </Lead>

                        <CtaRow>
                            <PrimaryCta type="button" onClick={goToWeb}>
                                <Globe size={16} />
                                웹으로 시작하기
                                <ArrowRight size={15} className="arrow" />
                            </PrimaryCta>
                            <GhostCta href="#download">
                                <MonitorDown size={16} />
                                데스크톱 앱 다운로드
                            </GhostCta>
                        </CtaRow>

                        <Fineprint>설치 없이 브라우저에서 바로 사용할 수 있습니다.</Fineprint>
                    </HeroText>
                </Hero>

                <Divider />

                <Reveal>
                    <SectionTitle>기능</SectionTitle>
                </Reveal>

                <FeatureGrid>
                    {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                        <Reveal key={title} delay={i * 90}>
                            <Feature>
                                <FeatureIcon><Icon size={18} /></FeatureIcon>
                                <FeatureTitle>{title}</FeatureTitle>
                                <FeatureDesc>{desc}</FeatureDesc>
                            </Feature>
                        </Reveal>
                    ))}
                </FeatureGrid>

                <Divider />

                <Reveal>
                    <SectionTitle id="download">다운로드</SectionTitle>
                    <DownloadNote>
                        운영체제에 맞는 설치 파일을 바로 내려받습니다. 다른 사이트로 이동하지 않습니다.
                    </DownloadNote>
                </Reveal>

                <PlatformGrid>
                    {PLATFORMS.map((p, i) => {
                        const state = states[p.key] ?? "idle";
                        return (
                            <Reveal key={p.key} delay={i * 90}>
                                <Platform
                                    type="button"
                                    onClick={() => download(p.key)}
                                    disabled={state === "checking"}
                                    $mine={mine === p.key}
                                >
                                    {mine === p.key && <MineTag>내 운영체제</MineTag>}
                                    <PlatformName>{p.label}</PlatformName>
                                    <PlatformExt>{p.ext}</PlatformExt>
                                    <PlatformNote>{p.note}</PlatformNote>
                                    <PlatformCta $state={state}>
                                        {state === "checking" && <><Spinner size={13} /> 확인 중</>}
                                        {state === "idle" && <>내려받기 <ArrowRight size={13} className="arrow" /></>}
                                        {state === "unreleased" && "아직 준비 중"}
                                        {state === "error" && "다시 시도해주세요"}
                                    </PlatformCta>
                                </Platform>
                            </Reveal>
                        );
                    })}
                </PlatformGrid>

                <Reveal delay={120}>
                    <UpdateCard>
                        <UpdateIcon><RefreshCw size={16} /></UpdateIcon>
                        <div>
                            <UpdateTitle>한 번 설치하면 계속 최신 상태</UpdateTitle>
                            <UpdateDesc>
                                새 버전이 나오면 앱이 스스로 확인하고 알려줍니다. 다시 받을 필요 없이
                                &lsquo;지금 설치&rsquo;를 누르면 내려받아 적용한 뒤 한 번 다시 시작합니다.
                            </UpdateDesc>
                        </div>
                    </UpdateCard>
                </Reveal>

                <Foot>
                    <span>CRONOS</span>
                    <FootLinks>
                        <a href={REPO} target="_blank" rel="noreferrer">GitHub</a>
                        <Link href="/signIn">로그인</Link>
                    </FootLinks>
                </Foot>
            </Inner>
        </Page>
    );
}

/* ── 애니메이션 ─────────────────────────────── */

const float = keyframes`
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50%      { transform: translate3d(24px, -18px, 0) scale(1.06); }
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
    from { transform: translateX(-120%); }
    to   { transform: translateX(220%); }
`;

/** 모션을 원치 않는 사용자에게는 애니메이션을 붙이지 않는다. */
const motionOnly = (rule: ReturnType<typeof css>) => css`
    @media (prefers-reduced-motion: no-preference) {
        ${rule}
    }
`;

/* ── 레이아웃 ───────────────────────────────── */

const Page = styled.div`
    position: relative;
    min-height: 100vh;
    background-color: ${p => p.theme.colors.background};
    color: ${p => p.theme.colors.text};
    overflow-x: hidden;
`;

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;

    .glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(90px);
        opacity: 0.18;
        background: ${p => p.theme.colors.primary};
    }

    .g1 { top: -160px; right: -120px; width: 520px; height: 520px; }
    .g2 { bottom: -220px; left: -160px; width: 460px; height: 460px; opacity: 0.12; }

    ${motionOnly(css`
        .g1 { animation: ${float} 26s ease-in-out infinite; }
        .g2 { animation: ${float} 34s ease-in-out infinite reverse; }
    `)}
`;

const Grain = styled.span`
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image: radial-gradient(currentColor 0.5px, transparent 0.5px);
    background-size: 22px 22px;
    color: ${p => p.theme.colors.primary}22;
    mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 72%);
`;

const Inner = styled.div`
    position: relative;
    z-index: 1;
    max-width: 1040px;
    margin: 0 auto;
    padding: 72px 28px 60px;

    @media (max-width: 720px) {
        padding: 44px 20px 48px;
    }
`;

const RevealBox = styled.div<{ $shown: boolean; $delay: number }>`
    opacity: 1;
    height: 100%;

    @media (prefers-reduced-motion: no-preference) {
        opacity: ${p => (p.$shown ? 1 : 0)};
        transform: ${p => (p.$shown ? "none" : "translateY(18px)")};
        transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: ${p => p.$delay}ms;
    }
`;

const Hero = styled.header`
    display: flex;
    align-items: center;
    gap: 44px;

    @media (max-width: 860px) {
        gap: 24px;
    }
`;

const HeroArt = styled.div`
    flex: 0 0 auto;
    width: 300px;
    height: 300px;

    ${motionOnly(css`
        animation: ${riseIn} 1s cubic-bezier(0.22, 1, 0.36, 1) both;
    `)}

    @media (max-width: 980px) {
        width: 220px;
        height: 220px;
    }

    @media (max-width: 860px) {
        display: none;
    }
`;

const HeroText = styled.div`
    flex: 1;
    min-width: 0;

    ${motionOnly(css`
        & > * {
            animation: ${riseIn} 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        & > *:nth-child(2) { animation-delay: 0.12s; }
        & > *:nth-child(3) { animation-delay: 0.22s; }
        & > *:nth-child(4) { animation-delay: 0.32s; }
        & > *:nth-child(5) { animation-delay: 0.42s; }
    `)}
`;

const Brand = styled.h1`
    margin: 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 3rem;
    letter-spacing: 12px;
    font-weight: 400;
    color: ${p => p.theme.colors.text};

    ${motionOnly(css`
        animation: ${letterIn} 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
    `)}

    @media (max-width: 720px) {
        font-size: 2.2rem;
        letter-spacing: 7px;
    }
`;

const Tagline = styled.p`
    margin: 10px 0 0;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1rem;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.primary};
`;

const Lead = styled.p`
    margin: 22px 0 0;
    max-width: 560px;
    font-size: 0.94rem;
    line-height: 1.75;
    color: ${p => p.theme.colors.textSecondary};
`;

const CtaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
`;

const ctaBase = css`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 22px;
    font-size: 0.86rem;
    font-family: inherit;
    letter-spacing: 1px;
    text-decoration: none;
    background: none;
    cursor: pointer;
    overflow: hidden;
    transition: box-shadow 0.25s, border-color 0.25s, transform 0.25s, color 0.25s;

    .arrow { transition: transform 0.25s; }
    &:hover .arrow { transform: translateX(4px); }
    &:hover { transform: translateY(-2px); }
`;

const PrimaryCta = styled.button`
    ${ctaBase}
    border: 1px solid ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.text};

    &::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        width: 42%;
        background: linear-gradient(100deg, transparent, ${p => p.theme.colors.primary}44, transparent);
        transform: translateX(-120%);
    }

    &:hover { box-shadow: 0 0 18px ${p => p.theme.colors.primary}55; }

    ${motionOnly(css`
        &:hover::after { animation: ${sheen} 0.9s ease-out; }
    `)}
`;

const GhostCta = styled.a`
    ${ctaBase}
    border: 1px solid ${p => p.theme.colors.primary}55;
    color: ${p => p.theme.colors.textSecondary};

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.text};
    }
`;

const Fineprint = styled.p`
    margin: 14px 0 0;
    font-size: 0.76rem;
    letter-spacing: 0.5px;
    color: ${p => p.theme.colors.textSecondary};
`;

const Divider = styled.hr`
    margin: 64px 0 40px;
    border: none;
    border-top: 1px solid ${p => p.theme.colors.primary}44;
`;

const SectionTitle = styled.h2`
    margin: 0 0 22px;
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 5px;
    color: ${p => p.theme.colors.text};
    scroll-margin-top: 24px;
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
`;

const Feature = styled.article`
    position: relative;
    height: 100%;
    padding: 22px 20px 24px;
    border: 1px solid ${p => p.theme.colors.primary}33;
    background-color: ${p => p.theme.colors.background};
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;

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

    &:hover {
        border-color: ${p => p.theme.colors.primary}99;
        transform: translateY(-4px);
        box-shadow: 0 10px 30px ${p => p.theme.colors.primary}1f;
    }

    &:hover::after { width: 24px; height: 24px; }
`;

const FeatureIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid ${p => p.theme.colors.primary}66;
    color: ${p => p.theme.colors.primary};
    transition: transform 0.3s, border-color 0.3s;

    ${Feature}:hover & {
        transform: rotate(-6deg) scale(1.08);
        border-color: ${p => p.theme.colors.primary};
    }
`;

const FeatureTitle = styled.h3`
    margin: 14px 0 0;
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: ${p => p.theme.colors.text};
`;

const FeatureDesc = styled.p`
    margin: 8px 0 0;
    font-size: 0.82rem;
    line-height: 1.7;
    color: ${p => p.theme.colors.textSecondary};
`;

const DownloadNote = styled.p`
    margin: -8px 0 22px;
    font-size: 0.84rem;
    color: ${p => p.theme.colors.textSecondary};
`;

const PlatformGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
`;

const Platform = styled.button<{ $mine: boolean }>`
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 20px;
    text-align: left;
    font-family: inherit;
    cursor: pointer;
    background: none;
    border: 1px solid ${p => p.$mine ? p.theme.colors.primary : `${p.theme.colors.primary}55`};
    overflow: hidden;
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;

    &::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        width: 40%;
        background: linear-gradient(100deg, transparent, ${p => p.theme.colors.primary}33, transparent);
        transform: translateX(-120%);
    }

    &:hover:not(:disabled) {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 10px 28px ${p => p.theme.colors.primary}26;
        transform: translateY(-4px);
    }

    &:disabled { cursor: progress; }

    ${motionOnly(css`
        &:hover:not(:disabled)::after { animation: ${sheen} 0.9s ease-out; }
    `)}
`;

const MineTag = styled.span`
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 3px 8px;
    font-size: 0.64rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.primary};
    border: 1px solid ${p => p.theme.colors.primary}66;
`;

const PlatformName = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 1.05rem;
    letter-spacing: 2px;
    color: ${p => p.theme.colors.text};
`;

const PlatformExt = styled.div`
    margin-top: 4px;
    font-size: 0.76rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.primary};
`;

const PlatformNote = styled.div`
    margin-top: 10px;
    font-size: 0.76rem;
    color: ${p => p.theme.colors.textSecondary};
`;

const PlatformCta = styled.div<{ $state: CardState }>`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    padding-top: 10px;
    border-top: 1px dashed ${p => p.theme.colors.primary}44;
    font-size: 0.78rem;
    letter-spacing: 1px;
    color: ${p => p.$state === "idle" ? p.theme.colors.text : p.theme.colors.textSecondary};

    .arrow { transition: transform 0.25s; }
    ${Platform}:hover & .arrow { transform: translateX(4px); }
`;

const Spinner = styled(Loader2)`
    ${motionOnly(css`
        animation: ${spin} 0.9s linear infinite;
    `)}
`;

const UpdateCard = styled.section`
    display: flex;
    gap: 16px;
    margin-top: 30px;
    padding: 20px;
    border: 1px solid ${p => p.theme.colors.primary}33;
    transition: border-color 0.3s;

    &:hover { border-color: ${p => p.theme.colors.primary}66; }
`;

const UpdateIcon = styled.span`
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid ${p => p.theme.colors.primary}66;
    color: ${p => p.theme.colors.primary};
    transition: transform 0.5s;

    ${UpdateCard}:hover & { transform: rotate(180deg); }
`;

const UpdateTitle = styled.h3`
    margin: 4px 0 0;
    font-size: 0.92rem;
    letter-spacing: 0.5px;
    color: ${p => p.theme.colors.text};
`;

const UpdateDesc = styled.p`
    margin: 8px 0 0;
    font-size: 0.82rem;
    line-height: 1.7;
    color: ${p => p.theme.colors.textSecondary};
`;

const Foot = styled.footer`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 64px;
    padding-top: 20px;
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
