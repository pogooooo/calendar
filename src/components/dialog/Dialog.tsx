"use client";

import { GemEmblem } from '@/assets/gem/GemAssets';
import { GEM_DIALOGS } from '@/assets/gem/GemAssets';
import * as GemS from "./gem/GemDialog.styles";
import * as React from "react";
import { createPortal } from "react-dom";
import ArcanaEmblem from "./ArcanaEmblem";
import MapleEmblem from "./maple/MapleEmblem";
import { ARCANA, PLATES, VARIANT_BY_KIND, type DialogKind, type DialogVariant } from "./arcana";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialDialog.styles";
import * as MapleS from "./maple/MapleDialog.styles";
import * as OceanS from './ocean/OceanDialog.styles';
import OceanArcanaEmblem from './OceanArcanaEmblem';
import { ARCANA as OceanARCANA } from './Oceanarcana';
import useThemeMotion from "@/hooks/useThemeMotion";
import { startOnNextFrame, useMotionSet } from "@/hooks/useMotion";
import { exitFrames, optionsOf } from "@/styles/motion";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

export interface DialogRequest {
    kind: DialogKind;
    title: string;
    message?: string;
    confirmLabel: string;
    cancelLabel?: string;
    variant?: DialogVariant;
}

interface Props extends DialogRequest {
    onResolve: (accepted: boolean) => void;
    /** 답을 받고 닫히는 중 — 누를 수도 읽힐 수도 없고, 갈래의 몸짓(dialogOut)으로 나간 뒤 onExited */
    closing?: boolean;
    onExited?: () => void;
}

const Pips = () => {
    const S = usePickTheme(STYLES);
    return (
        <>
            <S.Pip data-dialog-decoration/><S.Pip data-dialog-decoration/><S.Pip data-dialog-decoration/><S.Pip data-dialog-decoration/>
        </>
    );
};

export default function Dialog({
    kind, title, message, confirmLabel, cancelLabel, variant, onResolve, closing = false, onExited,
}: Props) {
    const S = usePickTheme(STYLES);
    // 문장과 번호도 갈래마다 다르다 — Celestial 은 타로 아르카나, Maple 은 도감 도판
    const Emblem = usePickTheme({ celestial: ArcanaEmblem, maple: MapleEmblem, ocean: OceanArcanaEmblem , gem: GemEmblem });
    const arcanum = usePickTheme({ celestial: ARCANA, maple: PLATES, ocean: OceanARCANA , gem: GEM_DIALOGS })[kind];
    const shape = variant ?? VARIANT_BY_KIND[kind];
    const confirmRef = React.useRef<HTMLButtonElement>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const previousFocus = React.useRef<HTMLElement | null>(null);
    const veilRef = React.useRef<HTMLDivElement>(null);
    const motionLevel = useThemeMotion();
    const motionSet = useMotionSet();
    const exited = React.useRef(onExited);
    exited.current = onExited;

    React.useEffect(() => {
        previousFocus.current=document.activeElement instanceof HTMLElement ? document.activeElement : null;
        (kind==='danger' && cancelRef.current ? cancelRef.current : confirmRef.current)?.focus();
        // One dialog instance keeps its initial focus while its title or exit state changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* 닫힐 때 — 카드는 갈래의 몸짓으로 나가고(바다: 가라앉으며 흐려짐 · Maple: 집어 들리듯 · Celestial: 옅게 작아짐),
       막은 색·흐림이 걷힌다(막의 투명도를 움직이면 바다 카드의 유리가 그동안 뒤를 못 본다). 다 나간 뒤 지운다 */
    React.useLayoutEffect(() => {
        if (!closing) return;
        const veil = veilRef.current;
        const done = () => exited.current?.();
        if (!veil) { done(); return; }
        veil.style.pointerEvents = "none";
        veil.setAttribute("aria-hidden", "true");
        veil.querySelector("[aria-modal]")?.removeAttribute("aria-modal");
        if (document.activeElement instanceof HTMLElement && veil.contains(document.activeElement)) {
            if(previousFocus.current?.isConnected) previousFocus.current.focus({preventScroll:true});
            else document.activeElement.blur();
        }
        const step = motionLevel === "off" ? null : motionSet.dialogOut(motionLevel);
        if (!step) { done(); return; }
        const timing: KeyframeAnimationOptions = { duration: step.duration, easing: "ease-out", fill: "forwards" };
        const fade = startOnNextFrame(veil.animate([{ backgroundColor: "transparent", backdropFilter: "blur(0px)" }], timing));
        startOnNextFrame(veil.animate([{ backdropFilter: "blur(0px)" }], { ...timing, pseudoElement: "::before" }));
        const card = veil.firstElementChild?.animate(exitFrames(step.pose), { ...optionsOf(step), fill: "forwards" });
        if (card) startOnNextFrame(card);
        let over = false;
        const finish = () => { if (!over) { over = true; done(); } };
        fade.onfinish = finish;
        const t = window.setTimeout(finish, step.duration + 300);
        return () => window.clearTimeout(t);
        // 닫히기 시작할 때 한 번 — 그 뒤 설정이 바뀌어도 다시 하지 않는다
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [closing]);

    React.useEffect(() => {
        // 닫히는 중인 창은 자판을 받지 않는다 — Esc·Tab 은 아래 창의 몫
        if (closing) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                // 위에 열려 있던 모달이 함께 닫히지 않도록 여기서 이벤트를 끊는다
                e.stopImmediatePropagation();
                e.preventDefault();
                onResolve(false);
                return;
            }
            if (e.key !== "Tab") return;

            const focusables = veilRef.current?.querySelectorAll<HTMLButtonElement>("button");
            if (!focusables || focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [onResolve, closing]);

    const actions = (
        <S.Actions>
            {cancelLabel && (
                <S.ActionButton ref={cancelRef} type="button" $tone="plain" onClick={() => onResolve(false)}>
                    {cancelLabel}
                </S.ActionButton>
            )}
            <S.ActionButton
                ref={confirmRef}
                type="button"
                $tone={kind === "danger" ? "danger" : "go"}
                onClick={() => onResolve(true)}
            >
                {confirmLabel}
            </S.ActionButton>
        </S.Actions>
    );

    let card: React.ReactNode;

    if (shape === "full") {
        card = (
            <S.FullCard $kind={kind} role="alertdialog" aria-modal="true" aria-label={title}>
                <Pips />
                <div className="head">
                    <S.Numeral>{arcanum.num}</S.Numeral>
                    <S.ArcanaName>{arcanum.name}</S.ArcanaName>
                </div>
                <Emblem kind={kind} size={76} />
                <S.Title>{title}</S.Title>
                {message && <S.Message>{message}</S.Message>}
                <div className="rule" />
                {actions}
            </S.FullCard>
        );
    } else if (shape === "band") {
        card = (
            <S.BandCard $kind={kind} role="alertdialog" aria-modal="true" aria-label={title}>
                <Pips />
                <div className="banner">
                    <S.Numeral>{arcanum.num}</S.Numeral>
                    <S.ArcanaName>{arcanum.name}</S.ArcanaName>
                </div>
                <div className="inner">
                    <Emblem kind={kind} size={62} />
                    <S.Title>{title}</S.Title>
                    {message && <S.Message>{message}</S.Message>}
                    {actions}
                </div>
            </S.BandCard>
        );
    } else if (shape === "land") {
        card = (
            <S.LandCard $kind={kind} role="alertdialog" aria-modal="true" aria-label={title}>
                <Pips />
                <div className="side">
                    <Emblem kind={kind} size={46} />
                    <S.Numeral>{arcanum.num}</S.Numeral>
                </div>
                <div className="body">
                    <S.Title>{title}</S.Title>
                    {message && <S.Message>{message}</S.Message>}
                    {actions}
                </div>
            </S.LandCard>
        );
    } else {
        card = (
            <S.PlainCard $kind={kind} role="alertdialog" aria-modal="true" aria-label={title}>
                <Pips />
                <div className="top">
                    <Emblem kind={kind} size={34} />
                    <div>
                        <S.Numeral>{arcanum.num}</S.Numeral>
                        <S.ArcanaName>{arcanum.name}</S.ArcanaName>
                    </div>
                </div>
                <S.Title>{title}</S.Title>
                {message && <S.Message>{message}</S.Message>}
                {actions}
            </S.PlainCard>
        );
    }

    if (typeof document === "undefined") return null;

    return createPortal(
        <S.Veil
            ref={veilRef}
            onMouseDown={(e) => { if (e.target === e.currentTarget) onResolve(false); }}
        >
            {card}
        </S.Veil>,
        document.body,
    );
}
