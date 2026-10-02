"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RegisterSchema } from "@/lib/schema";
import { api, clientHeaders } from "@/lib/apiBase";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialSignUp.styles";
import * as MapleS from "./maple/MapleSignUp.styles";
import LocaleSelect from "@/components/LocaleSelect";

import SingleInput from "@/components/input/single/SingleInput";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import TertiaryButton from "@/components/button/tertiary/TeritaryButton";
import PasswordInput from "@/components/input/password/PasswordInput";
import GlobalError from "@/components/error/globalError/GlobalError";
import InlineError from "@/components/error/inlineError/InlineError";
import AuthPanel from "@/components/auth/AuthPanel";
import * as OceanS from './ocean/OceanSignUp.styles';

type RegisterFormData = z.infer<typeof RegisterSchema>;

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };


const SignUp = () => {
    const S = usePickTheme(STYLES);
    const router = useRouter();
    const t = useT();
    const [registerError, setRegisterError] = useState<string>(" ");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: { name: "", email: "", password: "" },
        mode: "onChange",
    });

    const handleRegister = async (formData: RegisterFormData) => {
        setRegisterError(" ");
        try {
            const res = await fetch(api("/api/auth/register"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...clientHeaders() },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.push("/signIn");
            } else {
                const errorData = await res.json();
                setRegisterError(errorData.message || t.auth.signUpError);
            }
        } catch {
            setRegisterError(t.auth.networkError);
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
                    <S.FormTitle>{t.auth.signUpTitle}</S.FormTitle>
                    <S.FormSubtitle>{t.auth.signUpSubtitle}</S.FormSubtitle>

                    <form onSubmit={handleSubmit(handleRegister)} style={{ width: "100%" }}>
                        <SingleInput type="text" $width={300} $height={40} label={t.auth.name} {...register("name")} />
                        <InlineError>{errors.name?.message}</InlineError>

                        <SingleInput type="text" $width={300} $height={40} label={t.auth.email} {...register("email")} />
                        <InlineError>{errors.email?.message}</InlineError>

                        <PasswordInput $width={300} $height={40} label={t.auth.password} {...register("password")} />
                        <InlineError>{errors.password?.message}</InlineError>

                        <SecondaryButton type="submit" $width={300} $height={40} disabled={isSubmitting}>
                            {t.auth.emailSignUp}
                        </SecondaryButton>
                    </form>

                    <GlobalError>{registerError}</GlobalError>

                    <S.SwitchLink>
                        {t.auth.haveAccount}{" "}
                        <TertiaryButton onClick={() => router.push("/signIn")}>{t.auth.signInLink}</TertiaryButton>
                    </S.SwitchLink>
                </S.FormInner>
            </S.FormPanel>
        </S.PageWrapper>
    );
};

export default SignUp;
