"use client";

import * as React from "react";
import Dialog, { type DialogRequest } from "./Dialog";
import type { DialogKind, DialogVariant } from "./arcana";
import { useT } from "@/i18n/useT";

interface AskOptions {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    kind?: DialogKind;
    variant?: DialogVariant;
}

interface DialogApi {
    /** 알리기만 한다. 닫으면 resolve. */
    notify: (opts: AskOptions) => Promise<void>;
    /** 확인/취소. 확인이면 true. */
    confirm: (opts: AskOptions) => Promise<boolean>;
    /** 되돌릴 수 없는 동작. XIII 카드로 뜬다. */
    confirmDanger: (opts: AskOptions) => Promise<boolean>;
    /** 완료 통지. */
    done: (opts: AskOptions) => Promise<void>;
}

const DialogContext = React.createContext<DialogApi | null>(null);

interface Pending extends DialogRequest {
    /** 창마다 하나 — 닫히는 동안에도 같은 창(같은 요소)으로 남아 나가는 몸짓을 한다 */
    id: number;
    resolve: (accepted: boolean) => void;
}

let dialogSeq = 0;

export function DialogProvider({ children }: { children: React.ReactNode }) {
    const t = useT();
    // 여러 곳에서 연달아 부를 수 있으므로 대기열로 처리한다
    const [queue, setQueue] = React.useState<Pending[]>([]);
    // 답을 받고 닫히는 중인 창 — 답은 곧바로 돌려주고(부른 쪽은 기다리지 않는다) 모습만 잠깐 남아 나간다
    const [leaving, setLeaving] = React.useState<Pending[]>([]);

    const push = React.useCallback((req: DialogRequest) => {
        return new Promise<boolean>(resolve => {
            setQueue(prev => [...prev, { ...req, id: ++dialogSeq, resolve }]);
        });
    }, []);

    const api = React.useMemo<DialogApi>(() => ({
        notify: async (o) => {
            await push({
                kind: o.kind ?? "info",
                title: o.title,
                message: o.message,
                confirmLabel: o.confirmLabel ?? t.dialog.confirm,
                variant: o.variant,
            });
        },
        confirm: (o) => push({
            kind: o.kind ?? "confirm",
            title: o.title,
            message: o.message,
            confirmLabel: o.confirmLabel ?? t.dialog.confirm,
            cancelLabel: o.cancelLabel ?? t.dialog.cancel,
            variant: o.variant,
        }),
        confirmDanger: (o) => push({
            kind: "danger",
            title: o.title,
            message: o.message,
            confirmLabel: o.confirmLabel ?? t.dialog.delete,
            cancelLabel: o.cancelLabel ?? t.dialog.cancel,
            variant: o.variant,
        }),
        done: async (o) => {
            await push({
                kind: "ok",
                title: o.title,
                message: o.message,
                confirmLabel: o.confirmLabel ?? t.dialog.confirm,
                variant: o.variant,
            });
        },
    }), [push, t]);

    const current = queue[0];
    const queueRef = React.useRef(queue);
    queueRef.current = queue;
    const answered = React.useRef(new WeakSet<Pending>());

    const resolveCurrent = React.useCallback((accepted: boolean) => {
        const head = queueRef.current[0];
        // 두 번 눌러도 한 번만 (닫히는 사이 같은 창의 단추·Esc)
        if (!head || answered.current.has(head)) return;
        answered.current.add(head);
        head.resolve(accepted);
        setLeaving(prev => [...prev, head]);
        setQueue(prev => prev.filter(p => p !== head));
    }, []);
    const dropLeaving = React.useCallback((id: number) => setLeaving(prev => prev.filter(p => p.id !== id)), []);
    const noop = React.useCallback(() => {}, []);

    // 닫히는 창이 먼저, 지금 창이 그 위에 — 열쇠는 창마다 하나라 닫힐 때 같은 요소가 그대로 남는다
    const shown = current ? [...leaving, current] : leaving;

    return (
        <DialogContext.Provider value={api}>
            {children}
            {shown.map((d) => {
                const closing = d !== current;
                return (
                    <Dialog
                        key={d.id}
                        kind={d.kind}
                        title={d.title}
                        message={d.message}
                        confirmLabel={d.confirmLabel}
                        cancelLabel={d.cancelLabel}
                        variant={d.variant}
                        onResolve={closing ? noop : resolveCurrent}
                        closing={closing}
                        onExited={() => dropLeaving(d.id)}
                    />
                );
            })}
        </DialogContext.Provider>
    );
}

/**
 * 브라우저 기본 alert/confirm 대신 쓴다.
 * Provider 밖에서 불리면 기본 창으로 조용히 내려간다 (위젯 등).
 */
export function useDialog(): DialogApi {
    const ctx = React.useContext(DialogContext);
    return React.useMemo<DialogApi>(() => ctx ?? {
        notify: async (o) => { window.alert(o.message ? `${o.title}\n\n${o.message}` : o.title); },
        confirm: async (o) => window.confirm(o.message ? `${o.title}\n\n${o.message}` : o.title),
        confirmDanger: async (o) => window.confirm(o.message ? `${o.title}\n\n${o.message}` : o.title),
        done: async (o) => { window.alert(o.message ? `${o.title}\n\n${o.message}` : o.title); },
    }, [ctx]);
}
