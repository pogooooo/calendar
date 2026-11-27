"use client";

import { Component, createRef, type ReactNode, type RefObject } from "react";
import * as S from "./MaplePaperTurn.styles";
import type { Dir } from "@/styles/motion";

type Props = {
    children: ReactNode;
    turnKey: string;
    level: "full" | "gentle" | "off";
    direction: Dir;
    className?: string;
    contentRef?: RefObject<HTMLDivElement | null>;
};

/** The outgoing sheet is inert. The live page is already mounted underneath it. */
export default class MaplePaperTurn extends Component<Props, never, HTMLElement | null> {
    private readonly body = createRef<HTMLDivElement>();
    private readonly overlay = createRef<HTMLDivElement>();
    private animation: Animation | null = null;

    getSnapshotBeforeUpdate(previous: Props) {
        const body = this.body.current;
        if (!body || this.props.level !== "full" || this.props.turnKey === previous.turnKey || document.hidden) return null;
        const bounds = body.getBoundingClientRect();
        if (bounds.height < 24 || bounds.bottom < 0 || bounds.top >= innerHeight) return null;
        const copy = body.cloneNode(true) as HTMLElement;
        copy.removeAttribute("data-maple-sheet");
        copy.querySelectorAll("[data-turning]").forEach(layer => layer.remove());
        copy.querySelectorAll("[id], [autofocus], [aria-live]").forEach(element => {
            element.removeAttribute("id");
            element.removeAttribute("autofocus");
            element.removeAttribute("aria-live");
        });
        const fields = body.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea");
        copy.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea").forEach((field, index) => {
            const live = fields[index];
            if (!live || (field instanceof HTMLInputElement && field.type === "file")) return;
            field.value = live.value;
            if (field instanceof HTMLInputElement && live instanceof HTMLInputElement) field.checked = live.checked;
        });
        Object.assign(copy.style, { width: `${bounds.width}px`, height: `${bounds.height}px` });
        return copy;
    }

    componentDidUpdate(previous: Props, _state: never, snapshot: HTMLElement | null) {
        if (this.props.level !== previous.level) this.clear();
        const { direction, level, turnKey } = this.props;
        const overlay = this.overlay.current;
        if (!overlay || level === "off" || turnKey === previous.turnKey || document.hidden) return;
        this.clear();
        if (level === "full" && !snapshot) return;
        const compact = matchMedia("(max-width: 768px)").matches;
        const backward = direction < 0;
        const duration = level === "gentle" ? 145 : compact ? 280 : 435;
        overlay.dataset.turning = level;
        overlay.dataset.turnDirection = backward ? "backward" : "forward";
        overlay.style.transformOrigin = backward ? "right center" : "left center";
        if (snapshot) overlay.append(snapshot);
        this.animation = overlay.animate(
            level === "gentle"
                ? [{ opacity: 0 }, { opacity: .44, offset: .32 }, { opacity: 0 }]
                : [
                    { transform: "perspective(1400px) rotateY(0deg)", opacity: 1 },
                    { transform: `perspective(1400px) rotateY(${direction * 29}deg)`, opacity: 1, offset: .48 },
                    { transform: `perspective(1400px) rotateY(${direction * 77}deg)`, opacity: 1, offset: .89 },
                    { transform: `perspective(1400px) rotateY(${direction * 89}deg)`, opacity: 0 },
                ],
            { duration, easing: "cubic-bezier(.22,.68,.28,1)", fill: "both" },
        );
        this.animation.onfinish = this.clear;
    }

    componentWillUnmount() {
        this.clear();
    }

    private clear = () => {
        if (this.animation) {
            this.animation.onfinish = null;
            this.animation.cancel();
            this.animation = null;
        }
        const overlay = this.overlay.current;
        overlay?.replaceChildren();
        overlay?.removeAttribute("data-turning");
    };

    private setBody = (node: HTMLDivElement | null) => {
        this.body.current = node;
        if (this.props.contentRef) this.props.contentRef.current = node;
    };

    render() {
        return <S.Region className={this.props.className}>
            <S.Sheet ref={this.setBody} data-maple-sheet={this.props.level !== "off" || undefined}>{this.props.children}</S.Sheet>
            <S.Overlay ref={this.overlay} aria-hidden="true" inert />
        </S.Region>;
    }
}
