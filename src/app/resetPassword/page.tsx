"use client";

import * as GemS from "./gem/GemResetPassword.styles";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { makeAuthSchemas } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { authFailure } from "@/lib/authFailure";
import { useRevalidateOnLocale } from "@/hooks/useRevalidateOnLocale";
import useSettingStore from "@/store/useSettingStore";
import useAuthStore from "@/store/useAuthStore";
import type { Translations } from "@/i18n/types";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialResetPassword.styles";
import * as MapleS from "./maple/MapleResetPassword.styles";
import LocaleSelect from "@/components/LocaleSelect";

import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import GlobalError from "@/components/error/globalError/GlobalError";
import PasswordInput from "@/components/input/password/PasswordInput";
import AuthPanel from "@/components/auth/AuthPanel";
import * as OceanS from './ocean/OceanResetPassword.styles';

// 서버로는 token + password 만 보내고, 확인란은 화면에서만 검증한다.
// 문구가 언어를 따라야 해서 화면 안에서 만든다.
/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

const makeResetFormSchema = (a: Translations["auth"]) =>
    z.object({
        // 규칙은 서버와 같은 src/lib/schema.ts, 문구는 화면 언어로
        password: makeAuthSchemas(a.validation).password,
        passwordConfirm: z.string().min(1, a.passwordConfirmRequired),
    }).refine((v) => v.password === v.passwordConfirm, {
        message: a.passwordMismatch,
        path: ["passwordConfirm"],
    });

type ResetFormData = z.infer<ReturnType<typeof makeResetFormSchema>>;

const ResetPasswordForm = () => {
    const S = usePickTheme(STYLES);
    const t = useT();
    const locale = useSettingStore((s) => s.locale);
    const router = useRouter();
    const token = useSearchParams().get("token") ?? "";

    const [globalError, setGlobalError] = useState<string>(" ");
    const [done, setDone] = useState(false);

    const schema = useMemo(() => makeResetFormSchema(t.auth), [t]);
    const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<ResetFormData>({
        resolver: zodResolver(schema),
        defaultValues: { password: "", passwordConfirm: "" },
    });
    useRevalidateOnLocale(schema, errors, trigger);

    const handleReset = async (formData: ResetFormData) => {
        setGlobalError(" ");
        try {
            const res = await fetch(api("/api/auth/password/reset"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify({ token, password: formData.password }),
            });
            if (!res.ok) {
                // 비밀번호 규칙은 위에서 먼저 보므로 400 은 거의 늘 만료됐거나 이미 쓴 링크다
                setGlobalError(await authFailure(res, { locale, t, byStatus: { 400: t.auth.resetLinkExpired }, fallback: t.auth.resetFailed }));
                return;
            }
            setDone(true);
            // 이 기기가 같은 계정으로 로그인돼 있었다면 여기서 로그아웃한다 — 서버는 세션을 다 끊었는데, 남은 접근 토큰 때문에
            // 로그인 화면 대신 홈으로 돌아갔다가 한 시간 안에 튕겼다
            const { userId } = await res.json().catch(() => ({} as { userId?: string }));
            const auth = useAuthStore.getState();
            if (userId && auth.user?.id === userId) await auth.logout();
            // 비밀번호가 바뀌면 기존 세션이 모두 끊기므로 로그인 화면으로 보낸다.
            setTimeout(() => router.push("/signIn"), 1800);
        } catch {
            // 서버에 닿지 못했다 — 'Failed to fetch' 같은 날것 대신
            setGlobalError(t.auth.networkError);
        }
    };

    return (
        <S.FormInner>
            <S.FormTitle>{t.auth.resetTitle}</S.FormTitle>
            <S.FormSubtitle>{t.auth.resetSubtitle}</S.FormSubtitle>

            {!token ? (
                <S.Notice>{t.auth.resetInvalidLink}</S.Notice>
            ) : done ? (
                <S.Notice>{t.auth.resetDone}</S.Notice>
            ) : (
                <form onSubmit={handleSubmit(handleReset)} style={{ width: "100%" }}>
                    <PasswordInput $width={300} $height={40} label={t.auth.newPassword}
                        {...register("password")} />
                    <InlineError>{errors.password?.message}</InlineError>

                    <PasswordInput $width={300} $height={40} label={t.auth.newPasswordConfirm}
                        {...register("passwordConfirm")} />
                    <InlineError>{errors.passwordConfirm?.message}</InlineError>

                    <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                        {t.auth.resetSubmit}
                    </SecondaryButton>
                </form>
            )}

            <GlobalError>{globalError}</GlobalError>

            <S.SwitchLink>
                <TertiaryButton asChild><a href="/signIn">{t.auth.backToSignIn}</a></TertiaryButton>
            </S.SwitchLink>
        </S.FormInner>
    );
};


const ResetPassword = () => {
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
                <ResetPasswordForm />
            </Suspense>
        </S.FormPanel>
    </S.PageWrapper>
    );
};

export default ResetPassword;
