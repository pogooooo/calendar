"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { api, clientHeaders } from "@/lib/apiBase";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
// 비밀번호 재설정 화면과 같은 판 — 메일 링크로 여는 화면끼리 같은 모양
import * as CelestialS from "../resetPassword/celestial/CelestialResetPassword.styles";
import * as MapleS from "../resetPassword/maple/MapleResetPassword.styles";
import * as OceanS from "../resetPassword/ocean/OceanResetPassword.styles";
import LocaleSelect from "@/components/LocaleSelect";

import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import AuthPanel from "@/components/auth/AuthPanel";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

type Phase = "working" | "done" | "invalid";

/**
 * 가입 이메일 인증 — 메일의 링크(/verifyEmail?token=…)가 연다. 토큰을 서버에 보내고 결과만 보인다(src/lib/emailVerification.ts).
 * 한 번만 보낸다(개발 모드의 이중 실행에도) — 토큰은 1회용이라 두 번째는 늘 실패로 보였다.
 */
const VerifyEmailBody = () => {
    const S = usePickTheme(STYLES);
    const t = useT();
    const token = useSearchParams().get("token") ?? "";
    const [phase, setPhase] = useState<Phase>(token ? "working" : "invalid");
    const sent = useRef(false);

    useEffect(() => {
        if (!token || sent.current) return;
        sent.current = true;
        (async () => {
            try {
                const res = await fetch(api("/api/auth/verify"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...clientHeaders() },
                    body: JSON.stringify({ token }),
                });
                setPhase(res.ok ? "done" : "invalid");
            } catch {
                setPhase("invalid");
            }
        })();
    }, [token]);

    return (
        <S.FormInner>
            <S.FormTitle>{t.auth.verifyTitle}</S.FormTitle>
            <S.Notice>
                {phase === "working" ? t.auth.verifyWorking : phase === "done" ? t.auth.verifyDone : t.auth.verifyInvalid}
            </S.Notice>
            <S.SwitchLink>
                <TertiaryButton asChild><a href="/signIn">{t.auth.backToSignIn}</a></TertiaryButton>
            </S.SwitchLink>
        </S.FormInner>
    );
};

const VerifyEmail = () => {
    const S = usePickTheme(STYLES);
    return (
        <S.PageWrapper>
            <AuthPanel busy={false} />
            <S.FormPanel>
                <S.LangToggle>
                    <LocaleSelect size="sm" />
                </S.LangToggle>
                {/* useSearchParams 는 정적 빌드에서 Suspense 경계를 요구한다 (데스크톱 export). */}
                <Suspense fallback={<S.FormInner />}>
                    <VerifyEmailBody />
                </Suspense>
            </S.FormPanel>
        </S.PageWrapper>
    );
};

export default VerifyEmail;
