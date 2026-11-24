"use client";

import type { ComponentProps } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GemButton, GemDate } from "@/features/gem/GemParts";
import styles from "./GemCalendarPreview.module.css";

type ButtonProps = Pick<ComponentProps<typeof GemButton>, "onClick" | "disabled">;

export function GemSettingCorners() {
    return <span className={styles.settingCorners} aria-hidden="true">
        <svg viewBox="0 0 14 14"><path d="M.75 13V6L6 .75h7M3.5 8V6.9l3.4-3.4H8" /></svg>
        <svg viewBox="0 0 14 14"><path d="M.75 13V6L6 .75h7M3.5 8V6.9l3.4-3.4H8" /></svg>
    </span>;
}

export function GemMonthStep({ direction, ...props }: ButtonProps & { direction: "previous" | "next" }) {
    const previous = direction === "previous";
    const Chevron = previous ? ChevronLeft : ChevronRight;
    return <GemButton variant="quiet" className={styles.monthStep} aria-label={previous ? "이전 달" : "다음 달"} {...props}>
        <Chevron size={18} strokeWidth={1.6} aria-hidden="true" />
    </GemButton>;
}

export function GemTodayJump(props: ButtonProps) {
    return <GemButton variant="quiet" className={styles.todayJump} {...props}>오늘</GemButton>;
}

export function GemCalendarDate({ today, selected, children, ...props }: ComponentProps<typeof GemDate>) {
    return <GemDate today={today} selected={selected} {...props}>
        {!today && selected && <span className={styles.dateCut} aria-hidden="true" />}
        {children}
    </GemDate>;
}
