"use client";
/**
 * 오브제 — 화면 어디에나 떨어뜨려 둘 수 있는 작은 3D 물건 (three.js).
 *
 *   <Objet name="maple/leaf" size={120} />
 *   <Objet name="ocean/orb" size={88} options={{ still: true }} interaction="none" />
 *   <Objet name="ocean/drop" size="min(46vh, 420px)" active={busy} fallback={<옛그림 />} />
 *
 * props
 *   name         '갈래/이름' — 목록은 components/objet/{maple,ocean}/index.ts (타입이 잡아 준다)
 *   size         한 변(px 숫자 또는 CSS 길이). 가로·세로가 다르면 width·height
 *   active       켜면 커서를 올린 것처럼 반응한다(빨리 돌기 등) — 바깥 손잡이에 올렸을 때, 로그인 중일 때
 *   options      오브제마다 다른 값 (예: leaf 의 sprite·still, orb 의 still). 바뀌면 새로 만든다
 *   interaction  손 받기 — 'drag'(끌어서 돌리기)·'hover'(올리기만)·'none'(누름이 뒤로 통과). 기본은 오브제가 정한다
 *   fallback     WebGL 이 없을 때 대신 보일 것 (없으면 빈자리)
 *   onFail       WebGL 이 없을 때 한 번 불린다 — 둘레 그림을 예전 모습으로 되돌릴 때
 *   label        있으면 그림으로 읽힌다(role="img"), 없으면 장식(aria-hidden)
 *
 * 무대(stage.ts)가 WebGL 맥락 하나로 모든 칸을 그린다 — 오브제를 여럿 놓아도 맥락은 하나다.
 * 화면에 보일 때만 그리고, 움직임 '끄기'·위젯 창(/widget)에서는 한 장만 그린다(위젯은 투명 창이라 계속 그리면 깜빡인다).
 * 밝은 벌·어두운 벌이 바뀌면 오브제가 제 색을 다시 칠한다. 새 오브제를 만드는 법은 types.ts.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "styled-components";
import useThemeMotion from "@/hooks/useThemeMotion";
import { attachObjet, type ObjetHandle, type ObjetInteraction, type ObjetMotion } from "./stage";
import type { ObjetName } from "./registry";
import type { ObjetTone } from "./types";
import * as S from "./Objet.styles";

export type { ObjetName } from "./registry";

export interface ObjetProps {
    name: ObjetName;
    size?: number | string;
    width?: number | string;
    height?: number | string;
    active?: boolean;
    options?: Record<string, unknown>;
    interaction?: ObjetInteraction;
    fallback?: ReactNode;
    onFail?: () => void;
    label?: string;
    className?: string;
    style?: CSSProperties;
}

const css = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

export default function Objet({ name, size = 96, width, height, active = false, options, interaction, fallback = null, onFail, label, className, style }: ObjetProps) {
    const ref = useRef<HTMLCanvasElement>(null);
    const handle = useRef<ObjetHandle | null>(null);
    const theme = useTheme();
    const setting = useThemeMotion();
    const pathname = usePathname();
    const motion: ObjetMotion = pathname?.startsWith("/widget") ? "off" : setting;
    const [failed, setFailed] = useState(false);

    const c = theme.colors;
    const dark = theme.mode === "dark";
    const tone = useMemo<ObjetTone>(
        () => ({ dark, primary: c.primary, accent: c.accent, text: c.text, surface: c.surface, background: c.background }),
        [dark, c.primary, c.accent, c.text, c.surface, c.background],
    );
    const optKey = JSON.stringify(options ?? {});

    // 처음 올릴 때 쓸 최신 값 — 올리는 효과는 이름·옵션이 바뀔 때만 다시 돈다
    const latest = useRef({ tone, motion, active, onFail });
    latest.current = { tone, motion, active, onFail };

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const h = attachObjet(canvas, {
            name,
            tone: latest.current.tone,
            motion: latest.current.motion,
            options: JSON.parse(optKey) as Record<string, unknown>,
            interaction,
            onFail: () => { setFailed(true); latest.current.onFail?.(); },
        });
        h.setActive(latest.current.active);
        handle.current = h;
        return () => { h.detach(); handle.current = null; };
    }, [name, optKey, interaction]);

    useEffect(() => { handle.current?.setTone(tone); }, [tone]);
    useEffect(() => { handle.current?.setMotion(motion); }, [motion]);
    useEffect(() => { handle.current?.setActive(active); }, [active]);

    if (failed) return <>{fallback}</>;
    return (
        <S.Canvas
            ref={ref}
            className={className}
            style={{ width: css(width ?? size), height: css(height ?? size), ...style }}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            data-objet={name}
        />
    );
}
