"use client";
/**
 * 바다 갈래의 그림들 — 햇살 비치는 물가에 놓인 조개·소라·불가사리·물방울·모래 동전·조약돌.
 * 사진 같은 그림 대신 그라데이션과 반사광으로 빚은 SVG 라, 어느 크기로도 또렷하고 저장소에 그림 파일이 없다.
 * (Celestial 은 별·천구 선화, Maple 은 먹 그림·눌러 말린 잎 — 바다는 색이 있는 둥근 입체감으로 다르게.)
 *
 * 모두 장식이다 (aria-hidden). 크기는 width/height 로, 색 벌은 tone 으로.
 */
import { useId, type SVGProps } from "react";

type Art = Omit<SVGProps<SVGSVGElement>, "children"> & { shadow?: boolean };
const useUid = () => useId().replace(/[:]/g, "");

/* ── 모양 계산 (한 번만) ───────────────────────────────────────────── */
const deg = (d: number) => (d * Math.PI) / 180;

/** 가리비: 아래 경첩에서 부채꼴로 펼쳐진 껍데기. 가장자리는 갈비 끝마다 둥글게 볼록 */
const SCALLOP = (() => {
    const hx = 50, hy = 84, rx = 41, ry = 74, n = 12;
    const at = (a: number, k = 1) => [hx + Math.sin(deg(a)) * rx * k, hy - Math.cos(deg(a)) * ry * k] as const;
    const angles = Array.from({ length: n + 1 }, (_, i) => -60 + (120 * i) / n);
    const pts = angles.map((a) => at(a));
    let d = `M${hx} ${hy} L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
        const [cx, cy] = at((angles[i] + angles[i + 1]) / 2, 1.07);
        d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`;
    }
    d += " Z";
    const ribs = angles.slice(0, n).map((a, i) => {
        const [x1, y1] = at(a, 0.98), [x2, y2] = at(angles[i + 1], 0.98), [mx, my] = at((a + angles[i + 1]) / 2, 1.0);
        return `M${hx} ${hy} L${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
    });
    return { d, ribs };
})();

/** 불가사리: 끝이 둥근 다섯 팔 */
const STAR = (() => {
    const cx = 50, cy = 53, R = 44, r = 17;
    let d = "";
    for (let i = 0; i < 5; i++) {
        const a = deg(-90 + i * 72), b = deg(-90 + i * 72 + 36), a2 = deg(-90 + (i + 1) * 72);
        const tip = [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
        const tipL = [cx + Math.cos(a - 0.09) * (R - 3), cy + Math.sin(a - 0.09) * (R - 3)];
        const tipR = [cx + Math.cos(a + 0.09) * (R - 3), cy + Math.sin(a + 0.09) * (R - 3)];
        const valley = [cx + Math.cos(b) * r, cy + Math.sin(b) * r];
        const next = [cx + Math.cos(a2 - 0.09) * (R - 3), cy + Math.sin(a2 - 0.09) * (R - 3)];
        if (i === 0) d += `M${tipL[0].toFixed(1)} ${tipL[1].toFixed(1)}`;
        d += ` Q${tip[0].toFixed(1)} ${tip[1].toFixed(1)} ${tipR[0].toFixed(1)} ${tipR[1].toFixed(1)}`;
        d += ` Q${valley[0].toFixed(1)} ${valley[1].toFixed(1)} ${next[0].toFixed(1)} ${next[1].toFixed(1)}`;
    }
    const dots: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) for (let k = 1; k <= 4; k++) {
        const a = deg(-90 + i * 72), t = 6 + k * 8;
        dots.push([cx + Math.cos(a) * t, cy + Math.sin(a) * t, 2.4 - k * 0.35]);
    }
    return { d: d + " Z", dots };
})();

/* ── 그림 ─────────────────────────────────────────────────────────── */

/** 가리비 — 복숭아빛 갈비 껍데기. tone: peach | coral | pearl */
export function Scallop({ shadow = true, tone = "peach", ...rest }: Art & { tone?: "peach" | "coral" | "pearl" }) {
    const id = useUid();
    const c = tone === "coral" ? ["#FFE6DA", "#F7A68A", "#D9684C"] : tone === "pearl" ? ["#FFFFFF", "#F1EADF", "#CDBFAE"] : ["#FFF1E2", "#FBC79E", "#E58A57"];
    return (
        <svg viewBox="0 0 100 100" aria-hidden="true" {...rest}>
            <defs>
                <radialGradient id={`b${id}`} cx="50%" cy="22%" r="85%">
                    <stop offset="0" stopColor={c[0]} />
                    <stop offset=".5" stopColor={c[1]} />
                    <stop offset="1" stopColor={c[2]} />
                </radialGradient>
                <linearGradient id={`r${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity=".55" />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
            </defs>
            {shadow && <ellipse cx="52" cy="89" rx="33" ry="5.5" fill="#5B4632" opacity=".16" />}
            <path d={SCALLOP.d} fill={`url(#b${id})`} />
            {SCALLOP.ribs.map((r, i) => i % 2 === 0 && <path key={i} d={r} fill={`url(#r${id})`} />)}
            <path d="M50 84 38 77 34 86 47 90Z M50 84 62 77 66 86 53 90Z" fill={c[2]} opacity=".85" />
            <ellipse cx="44" cy="30" rx="11" ry="5" fill="#FFFFFF" opacity=".35" transform="rotate(-18 44 30)" />
        </svg>
    );
}

/** 불가사리 — 주황 또는 물빛. 등에 오돌토돌한 점 */
export function Starfish({ shadow = true, tone = "amber", ...rest }: Art & { tone?: "amber" | "aqua" | "coral" }) {
    const id = useUid();
    const c = tone === "aqua" ? ["#BFF4EF", "#55CFC9", "#1F9EA5"] : tone === "coral" ? ["#FFD1C2", "#F28B6E", "#C9553D"] : ["#FFE0A6", "#F6AE48", "#D9782A"];
    return (
        <svg viewBox="0 0 100 100" aria-hidden="true" {...rest}>
            <defs>
                <radialGradient id={`s${id}`} cx="45%" cy="40%" r="70%">
                    <stop offset="0" stopColor={c[0]} />
                    <stop offset=".55" stopColor={c[1]} />
                    <stop offset="1" stopColor={c[2]} />
                </radialGradient>
            </defs>
            {shadow && <path d={STAR.d} fill="#5B4632" opacity=".18" transform="translate(3 4)" />}
            <path d={STAR.d} fill={`url(#s${id})`} />
            {STAR.dots.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={Math.max(0.9, r)} fill="#FFFFFF" opacity=".55" />)}
        </svg>
    );
}

/** 소라 — 뾰족한 끝으로 감겨 오르는 크림빛 껍데기, 입구는 분홍 */
export function Conch({ shadow = true, ...rest }: Art) {
    const id = useUid();
    return (
        <svg viewBox="0 0 100 100" aria-hidden="true" {...rest}>
            <defs>
                <linearGradient id={`c${id}`} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#F6C9A2" />
                    <stop offset=".55" stopColor="#FBE7D3" />
                    <stop offset="1" stopColor="#FFF8F0" />
                </linearGradient>
                <radialGradient id={`o${id}`} cx="40%" cy="45%" r="60%">
                    <stop offset="0" stopColor="#FFD9D2" />
                    <stop offset="1" stopColor="#E99A8D" />
                </radialGradient>
            </defs>
            {shadow && <ellipse cx="50" cy="86" rx="34" ry="5" fill="#5B4632" opacity=".15" />}
            <path d="M88 10 C70 18 52 30 36 46 C22 60 14 70 16 78 C18 86 30 86 42 80 C58 72 72 56 80 40 C86 28 90 18 88 10Z" fill={`url(#c${id})`} />
            {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M${80 - i * 11} ${17 + i * 9} C${70 - i * 11} ${24 + i * 10} ${62 - i * 11} ${38 + i * 9} ${58 - i * 12} ${52 + i * 8}`}
                    fill="none" stroke="#E7A67B" strokeWidth={2.4 - i * 0.3} strokeLinecap="round" opacity=".7" />
            ))}
            <ellipse cx="30" cy="72" rx="12" ry="7" fill={`url(#o${id})`} transform="rotate(-35 30 72)" />
            <path d="M74 20 C66 26 60 32 54 40" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity=".55" />
        </svg>
    );
}

/** 물방울 — 투명한 공, 테두리 빛과 왼쪽 위 반사 */
export function Bubble(rest: Art) {
    const id = useUid();
    return (
        <svg viewBox="0 0 100 100" aria-hidden="true" {...rest}>
            <defs>
                <radialGradient id={`u${id}`} cx="50%" cy="50%" r="50%">
                    <stop offset=".62" stopColor="#E9FBFB" stopOpacity="0" />
                    <stop offset=".92" stopColor="#BFF1F2" stopOpacity=".45" />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity=".9" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill={`url(#u${id})`} />
            <path d="M24 34 A30 30 0 0 1 46 18" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".85" />
            <circle cx="70" cy="70" r="4" fill="#FFFFFF" opacity=".6" />
        </svg>
    );
}

/** 모래 동전(성게 껍데기) — 꽃잎 다섯이 돋을새김된 둥근 판 */
export function SandDollar({ shadow = true, ...rest }: Art) {
    const id = useUid();
    return (
        <svg viewBox="0 0 100 100" aria-hidden="true" {...rest}>
            <defs>
                <radialGradient id={`d${id}`} cx="42%" cy="38%" r="70%">
                    <stop offset="0" stopColor="#FFF9EE" />
                    <stop offset="1" stopColor="#E8D6B8" />
                </radialGradient>
            </defs>
            {shadow && <ellipse cx="52" cy="90" rx="32" ry="5" fill="#5B4632" opacity=".14" />}
            <circle cx="50" cy="50" r="40" fill={`url(#d${id})`} />
            {[0, 1, 2, 3, 4].map((i) => (
                <ellipse key={i} cx="50" cy="31" rx="5.5" ry="13" fill="none" stroke="#C9AF88" strokeWidth="1.6" opacity=".8"
                    transform={`rotate(${i * 72} 50 50)`} />
            ))}
            <circle cx="50" cy="50" r="3" fill="#C9AF88" opacity=".8" />
        </svg>
    );
}

/** 조약돌 — 물에 닳은 매끈한 돌 */
export function Pebble({ shadow = true, ...rest }: Art) {
    const id = useUid();
    return (
        <svg viewBox="0 0 100 100" aria-hidden="true" {...rest}>
            <defs>
                <radialGradient id={`p${id}`} cx="40%" cy="35%" r="70%">
                    <stop offset="0" stopColor="#FBF7F1" />
                    <stop offset="1" stopColor="#C9C0B4" />
                </radialGradient>
            </defs>
            {shadow && <ellipse cx="52" cy="78" rx="34" ry="6" fill="#5B4632" opacity=".14" />}
            <ellipse cx="50" cy="56" rx="38" ry="24" fill={`url(#p${id})`} />
            <ellipse cx="38" cy="46" rx="12" ry="5" fill="#FFFFFF" opacity=".5" transform="rotate(-12 38 46)" />
        </svg>
    );
}
