"use client";

import { useId, type ButtonHTMLAttributes, type ComponentPropsWithRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { Check, ChevronDown } from "lucide-react";
import styles from "./GemParts.module.css";

export { DEFAULT_STONE } from "./color";

type Material = "pearl" | "amethyst-cut" | "amethyst" | "quartz" | "refraction";

export function GemMaterial({ tone, className }: { tone: Material; className?: string }) {
    return <span className={[styles.material, className].filter(Boolean).join(" ")}
        data-material={tone} aria-hidden="true" />;
}

export function GemFacet() {
    return <span className={styles.facet} aria-hidden="true" />;
}

export function GemButton({ variant = "solid", children, className, type = "button", ...props }:
    ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "pearl" | "quiet" }) {
    return <button type={type} className={[styles.button, className].filter(Boolean).join(" ")} data-variant={variant} {...props}>
        {children}
    </button>;
}

export function GemField({ label, error, hint, ...props }:
    ComponentPropsWithRef<"input"> & { label: string; error?: string; hint?: string }) {
    const id = useId();
    const description = error || hint;
    return <div className={styles.field}>
        <label htmlFor={id}>{label}</label>
        <input {...props} id={id} className={styles.input} aria-invalid={error ? true : undefined}
            aria-describedby={description ? `${id}-description` : undefined} />
        {description && <small id={`${id}-description`} data-error={Boolean(error)} role={error ? "alert" : undefined}>{description}</small>}
    </div>;
}

export function GemSelect({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
    const id = useId();
    return <div className={styles.field}>
        <label htmlFor={id}>{label}</label>
        <div className={styles.select}>
            <select {...props} id={id} className={styles.input}>{children}</select>
            <ChevronDown size={15} aria-hidden="true" />
        </div>
    </div>;
}

export function GemSegments<T extends string>({ options, value, onChange }: {
    options: readonly T[]; value: T; onChange: (option: T) => void;
}) {
    return <div className={styles.segments} role="group" aria-label="캘린더 보기">
        {options.map(option => <button type="button" key={option} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}
    </div>;
}

type EventState = "event" | "anniversary" | "done";

export function GemEvent({ children, state = "event" }: { children: ReactNode; state?: EventState }) {
    return <span className={styles.event} data-state={state}>
        {state === "done" ? <Check size={11} aria-label="완료" /> : <GemFacet />}
        <span>{children}</span>
    </span>;
}

export function GemTodayMark() {
    return <span className={styles.today} data-gem-today aria-hidden="true" />;
}

export function GemDate({ day, today, selected, muted, weekend, monthLabel, children, ...props }:
    ButtonHTMLAttributes<HTMLButtonElement> & {
        day: number; today?: boolean; selected?: boolean; muted?: boolean; weekend?: boolean; monthLabel?: string;
    }) {
    return <button {...props} type="button" className={styles.date} aria-pressed={Boolean(selected)}
        aria-current={today ? "date" : undefined} data-muted={Boolean(muted)} data-weekend={Boolean(weekend)}>
        <span className={styles.dateHead} data-gem-date-head>
            <span>{day}</span>
            {monthLabel && <span className={styles.monthLabel} data-gem-month aria-hidden="true">{monthLabel}</span>}
            {today && <GemTodayMark />}
        </span>
        {children}
    </button>;
}

export function GemAgendaItem({ time, dateTime, children, state = "event" }: {
    time: string; dateTime?: string; children: ReactNode; state?: EventState;
}) {
    return <li className={styles.agendaItem} data-state={state}>
        <time dateTime={dateTime}>{time}</time>
        <span>{state === "done" ? <Check size={15} aria-label="완료" /> : <GemFacet />}{children}</span>
    </li>;
}
