"use client";

import { useEffect, useRef } from "react";
import type { FieldErrors, FieldPath, FieldValues, UseFormTrigger } from "react-hook-form";

/**
 * 화면 언어를 바꾸면(검사 규칙 schema 가 새 언어로 다시 만들어지면) 이미 떠 있는 검사 문구도 새 언어로 다시 띄운다.
 * 그대로 두면 로그인 화면에서 언어를 바꿔도 한국어 오류가 남아 있다가, 그 칸을 다시 고쳐야 바뀌었다.
 * 오류가 떠 있는 칸만 다시 본다 — 손대지 않은 칸에 새 오류를 띄우지 않게.
 */
export function useRevalidateOnLocale<T extends FieldValues>(schema: unknown, errors: FieldErrors<T>, trigger: UseFormTrigger<T>) {
    const first = useRef(true);
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const names = Object.keys(errors) as FieldPath<T>[];
        if (names.length) void trigger(names);
    // 언어가 바뀔 때만 — errors 를 넣으면 검사할 때마다 다시 돈다
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schema]);
}
