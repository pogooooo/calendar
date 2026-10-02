"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ForgotPasswordSchema } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialForgotPassword.styles";
import * as MapleS from "./maple/MapleForgotPassword.styles";
import LocaleSelect from "@/components/LocaleSelect";

import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import SingleInput from "@/components/input/single/SingleInput";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import GlobalError from "@/components/error/globalError/GlobalError";
import AuthPanel from "@/components/auth/AuthPanel";
import * as OceanS from './ocean/OceanForgotPassword.styles';

type ForgotFormData = z.infer<typeof ForgotPasswordSchema>;

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };


const ForgotPassword = () => {
    const S = usePickTheme(STYLES);
    const t = useT();

    const [globalError, setGlobalError] = useState<string>(" ");
    const [sent, setSent] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotFormData>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const handleForgot = async (formData: ForgotFormData) => {
        setGlobalError(" ");
        try {
            const res = await fetch(api("/api/auth/password/forgot"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                setGlobalError(data.message || t.auth.requestFailed);
                return;
            }
            // 계정 존재 여부와 무관하게 같은 화면을 보여준다.
            setSent(true);
        } catch (err) {
            setGlobalError(err instanceof Error ? err.message : t.auth.requestError);
        }
    };

    return (
        <S.PageWrapper>
            <AuthPanel busy={isSubmitting} />

            <S.FormPanel>
                <S.LangToggle>
                    <LocaleSelect size="sm" />
                </S.LangToggle>

                <S.FormInner>
                    <S.FormTitle>{t.auth.forgotTitle}</S.FormTitle>
                    <S.FormSubtitle>{t.auth.forgotSubtitle}</S.FormSubtitle>

                    {sent ? (
                        <S.SentNotice>{t.auth.forgotSent}</S.SentNotice>
                    ) : (
                        <form onSubmit={handleSubmit(handleForgot)} style={{ width: "100%" }}>
                            {/* onChange 를 따로 주면 register 가 붙여둔 onChange 를 덮어써서
                                react-hook-form 이 입력을 못 본다. 값은 폼이 알아서 들고 있는다. */}
                            <SingleInput type="text" $width={300} $height={40} label={t.auth.email}
                                {...register("email")} />
                            <InlineError>{errors.email?.message}</InlineError>

                            <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                                {t.auth.forgotSubmit}
                            </SecondaryButton>
                        </form>
                    )}

                    <GlobalError>{globalError}</GlobalError>

                    <S.SwitchLink>
                        <TertiaryButton asChild><a href="/signIn">{t.auth.backToSignIn}</a></TertiaryButton>
                    </S.SwitchLink>
                </S.FormInner>
            </S.FormPanel>
        </S.PageWrapper>
    );
};

export default ForgotPassword;
