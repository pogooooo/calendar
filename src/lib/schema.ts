import { z } from "zod";

export const RegisterSchema = z.object({
    email: z.string()
        .min(1, "이메일을 입력해주세요.")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "이메일 형식이 올바르지 않습니다."),

    password: z.string()
        .min(1, "비밀번호를 입력해주세요.")
        .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),

    name: z.string()
        .min(1, "이름을 입력해주세요.")
        .min(2, "이름은 2자 이상이어야 합니다."),
});

export const LoginSchema = z.object({
    email: z.string()
        .min(1, "이메일을 입력해주세요.")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "이메일 형식이 올바르지 않습니다."),

    password: z.string().min(1, "비밀번호를 입력해주세요."),
});
