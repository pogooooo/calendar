"use client";
/**
 * 사이드바 옆선 — 모래 물가에 밀려와 부서지는 물거품. 마우스를 올리면 물이 한 번 더 밀려온다.
 * 물가 선은 shoreArt 의 shoreX 를 그대로 따른다 (모래 판을 오려 낸 마스크와 같은 선).
 * 모래 위 아래쪽에는 조개·불가사리·소라를 몇 개 흩어 둔다 — 참고 그림의 물가처럼.
 *
 * 이 판(SidebarContour)은 사이드바 끝 20px 안쪽에서 시작하는 80px 폭이라, 그림 안의 x=20 이 사이드바 끝이다.
 */
import { Bubble, Conch, Pebble, SandDollar, Scallop, Starfish } from "@/assets/ocean/SeaLife";
import { shoreX } from "@/styles/ocean/shoreArt";
import * as S from "./OceanSidebarDesign.styles";

const H = 2400;      // 어떤 화면보다 길게 그려 두고 넘치는 것은 잘린다
const EDGE = 20;     // 그림 안에서 사이드바 끝의 x
const at = (y: number) => EDGE + shoreX(y);

/** 물가 선을 따라 dx(y) 만큼 떨어진 선을 위에서 아래로 */
const along = (dx: (y: number) => number, step = 6) => {
    let d = "";
    for (let y = 0; y <= H; y += step) d += `${y ? "L" : "M"}${(at(y) + dx(y)).toFixed(1)} ${y} `;
    return d;
};
/** 두 선 사이를 채운 띠 (왼쪽 선은 내려가고 오른쪽 선은 올라온다) */
const band = (left: (y: number) => number, right: (y: number) => number, step = 6) => {
    let d = along(left, step);
    for (let y = H; y >= 0; y -= step) d += `L${(at(y) + right(y)).toFixed(1)} ${y} `;
    return d + "Z";
};

const WET = band((y) => -24 - Math.sin(y / 53) * 3, () => -3);
const SHALLOW = band(() => 2, (y) => 44 + Math.sin(y / 61) * 6);
const FOAM = band((y) => -7 - Math.sin(y / 17) * 1.5, (y) => 4 + Math.abs(Math.sin(y / 23)) * 3 + Math.sin(y / 7) * 1.1, 4);
const LACE = along((y) => 13 + Math.sin(y / 31 + 1) * 3.5, 5);
const LACE_FAR = along((y) => 25 + Math.sin(y / 47) * 5, 6);
/** 거품 속 구멍 — 자리를 고정해 두어야 그릴 때마다 흔들리지 않는다 */
const HOLES = Array.from({ length: 150 }, (_, i) => {
    const y = 9 + i * 16 + ((i * 37) % 9);
    return { x: at(y) - 2 + ((i * 53) % 7) - 3, y, r: 0.9 + ((i * 29) % 10) / 10 };
});
const SPRAY = Array.from({ length: 90 }, (_, i) => {
    const y = 20 + i * 26 + ((i * 41) % 13);
    return { x: at(y) + 9 + ((i * 67) % 22), y, r: 0.7 + ((i * 13) % 8) / 10 };
});

export default function OceanSidebarDesign({ isHovered = false }: { isHovered?: boolean }) {
    return (
        <S.Shore $hovered={isHovered} aria-hidden="true" data-ambient="ocean-shore">
            <div className="clip"><svg className="water" width="80" height={H} viewBox={`0 0 80 ${H}`}>
                <defs>
                    <linearGradient id="ocean-shore-wet" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0" className="wet-a" />
                        <stop offset="1" className="wet-b" />
                    </linearGradient>
                    <linearGradient id="ocean-shore-shallow" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0" className="shallow-a" />
                        <stop offset="1" className="shallow-b" />
                    </linearGradient>
                </defs>
                <path d={WET} fill="url(#ocean-shore-wet)" />
                <path d={SHALLOW} fill="url(#ocean-shore-shallow)" />
                <g className="lace-far"><path d={LACE_FAR} /></g>
                <g className="lace">
                    <path d={LACE} />
                    {SPRAY.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} />)}
                </g>
                <g className="foam">
                    <path className="glow" d={FOAM} />
                    <path className="body" d={FOAM} />
                    {HOLES.map((h, i) => <circle key={i} className="hole" cx={h.x} cy={h.y} r={h.r} />)}
                </g>
            </svg></div>

            <div className="beach">
                <Bubble className="b b1" />
                <Bubble className="b b2" />
                <Starfish className="p star-aqua" tone="aqua" />
                <Conch className="p conch" />
                <SandDollar className="p dollar" />
                <Scallop className="p scallop" tone="peach" />
                <Starfish className="p star" tone="amber" />
                <Pebble className="p pebble" />
                <Scallop className="p scallop-sm" tone="pearl" />
            </div>
        </S.Shore>
    );
}
