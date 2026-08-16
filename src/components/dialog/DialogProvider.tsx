"use client";

import * as React from "react";
import CelestialDialog, { type DialogRequest } from "./CelestialDialog";
import type { DialogKind, DialogVariant } from "./arcana";

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
    resolve: (accepted: boolean) => void;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
    // 여러 곳에서 연달아 부를 수 있으므로 대기열로 처리한다
    const [queue, setQueue] = React.useState<Pending[]>([]);

    const push = React.useCallback((req: DialogRequest) => {
        return new Promise<boolean>(resolve => {
            setQueue(prev => [...prev, { ...req, resolve }]);
        });
    }, []);

    const api = React.useMemo<DialogApi>(() => ({
        notify: async (o) => {
            await push({
                kind: o.kind ?? "info",
                title: o.title,
                message: o.message,
                confirmLabel: o.confirmLabel ?? "확인",
                variant: o.variant,
            });
        },
        confirm: (o) => push({
            kind: o.kind ?? "confirm",
            title: o.title,
            message: o.message,
            confirmLabel: o.confirmLabel ?? "확인",
            cancelLabel: o.cancelLabel ?? "취소",
            variant: o.variant,
        }),
        confirmDanger: (o) => push({
            kind: "danger",
            title: o.title,
            message: o.message,
            confirmLabel: o.confirmLabel ?? "삭제",
            cancelLabel: o.cancelLabel ?? "취소",
            variant: o.variant,
        }),
        done: async (o) => {
            await push({
                kind: "ok",
                title: o.title,
                message: o.message,
                confirmLabel: o.confirmLabel ?? "확인",
                variant: o.variant,
            });
        },
    }), [push]);

    const current = queue[0];

    const resolveCurrent = React.useCallback((accepted: boolean) => {
        setQueue(prev => {
            const [head, ...rest] = prev;
            head?.resolve(accepted);
            return rest;
        });
    }, []);

    return (
        <DialogContext.Provider value={api}>
            {children}
            {current && (
                <CelestialDialog
                    key={queue.length}
                    kind={current.kind}
                    title={current.title}
                    message={current.message}
                    confirmLabel={current.confirmLabel}
                    cancelLabel={current.cancelLabel}
                    variant={current.variant}
                    onResolve={resolveCurrent}
                />
            )}
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
