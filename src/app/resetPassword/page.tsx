"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { passwordSchema } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
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
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

const makeResetFormSchema = (required: string, mismatch: string) =>
    z.object({
        password: passwordSchema,
        passwordConfirm: z.string().min(1, required),
    }).refine((v) => v.password === v.passwordConfirm, {
        message: mismatch,
        path: ["passwordConfirm"],
    });

type ResetFormData = z.infer<ReturnType<typeof makeResetFormSchema>>;

const ResetPasswordForm = () => {
    const S = usePickTheme(STYLES);
    const t = useT();
    const router = useRouter();
    const token = useSearchParams().get("token") ?? "";

    const [globalError, setGlobalError] = useState<string>(" ");
    const [done, setDone] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetFormData>({
        resolver: zodResolver(
            makeResetFormSchema(t.auth.passwordConfirmRequired, t.auth.passwordMismatch),
        ),
        defaultValues: { password: "", passwordConfirm: "" },
    });

    const handleReset = async (formData: ResetFormData) => {
        setGlobalError(" ");
        try {
            const res = await fetch(api("/api/auth/password/reset"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify({ token, password: formData.password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setGlobalError(data.message || t.auth.resetFailed);
                return;
            }
            setDone(true);
            // 비밀번호가 바뀌면 기존 세션이 모두 끊기므로 로그인 화면으로 보낸다.
            setTimeout(() => router.push("/signIn"), 1800);
        } catch (err) {
            setGlobalError(err instanceof Error ? err.message : t.auth.requestError);
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
