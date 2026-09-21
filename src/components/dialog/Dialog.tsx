"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import ArcanaEmblem from "./ArcanaEmblem";
import MapleEmblem from "./maple/MapleEmblem";
import { ARCANA, PLATES, VARIANT_BY_KIND, type DialogKind, type DialogVariant } from "./arcana";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialDialog.styles";
import * as MapleS from "./maple/MapleDialog.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

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
}

const Pips = () => {
    const S = usePickTheme(STYLES);
    return (
        <>
            <S.Pip /><S.Pip /><S.Pip /><S.Pip />
        </>
    );
};

export default function Dialog({
    kind, title, message, confirmLabel, cancelLabel, variant, onResolve,
}: Props) {
    const S = usePickTheme(STYLES);
    // 문장과 번호도 갈래마다 다르다 — Celestial 은 타로 아르카나, Maple 은 도감 도판
    const Emblem = usePickTheme({ celestial: ArcanaEmblem, maple: MapleEmblem });
    const arcanum = usePickTheme({ celestial: ARCANA, maple: PLATES })[kind];
    const shape = variant ?? VARIANT_BY_KIND[kind];
    const confirmRef = React.useRef<HTMLButtonElement>(null);
    const veilRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        confirmRef.current?.focus();
    }, []);

    React.useEffect(() => {
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
    }, [onResolve]);

    const actions = (
        <S.Actions>
            {cancelLabel && (
                <S.ActionButton type="button" $tone="plain" onClick={() => onResolve(false)}>
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
