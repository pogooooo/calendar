import { z } from "zod";
import type { AuthValidation } from "@/i18n/types";

// ── 공용 ─────────────────────────────────────────────────────────────────────

/**
 * new Date() 로 읽히는 날짜 글자. 못 읽는 값이 오면 Prisma 가 Invalid Date 로 터져 500 이 났다.
 * 빈 글자는 라우트가 "날짜 없음"(null)으로 받으므로 그대로 둔다.
 */
const dateText = z.string().refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "날짜 형식이 올바르지 않습니다.");

/** 글자 수 상한 — 끝없이 긴 글이 DB 와 같은 카테고리 사람들의 화면을 무겁게 하지 않게. 사람이 칠 만한 길이보다 훨씬 넉넉하다 */
const TITLE_MAX = 1000;
const TEXT_MAX = 50_000;
const title = (message: string) => z.string().min(1, message).max(TITLE_MAX, "제목이 너무 깁니다.");
const longText = z.string().max(TEXT_MAX, "내용이 너무 깁니다.");
/** 챌린지 목표 횟수의 끝 — 그보다 크면 스티커 판이 수천 장을 그려 화면이 멎었다(하루 한 번이면 2년 남짓) */
export const TARGET_MAX = 1000;

// ── Auth ─────────────────────────────────────────────────────────────────────

/** 이름 — 가입과 설정의 이름 바꾸기가 같은 규칙을 쓴다 */
export const NAME_MAX = 100;

/**
 * 로그인·가입·비밀번호 규칙. 문구만 갈아 끼운다 — 서버와 한국어 화면은 아래 한국어 판,
 * 화면은 i18n 의 auth.validation 으로 만든다 (문구가 한국어로 박혀 있어 영어 화면에도 한국어 오류가 떴다).
 */
export function makeAuthSchemas(m: AuthValidation) {
    /** 이메일 — 폰 자판의 자동 완성이 뒤에 붙이는 빈칸 때문에 형식 오류가 나지 않게 다듬는다 */
    const email = z.string()
        .trim()
        .min(1, m.emailRequired)
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, m.emailInvalid);
    const password = z.string()
        .min(1, m.passwordRequired)
        .min(8, m.passwordMin)
        .max(72, m.passwordMax)
        .regex(/[0-9]/, m.passwordDigit)
        .regex(/[^A-Za-z0-9]/, m.passwordSpecial);
    const name = z.string()
        .min(1, m.nameRequired)
        .min(2, m.nameMin)
        .max(NAME_MAX, m.nameMax(NAME_MAX));
    return {
        password,
        name,
        // 만 14세 확인 — 14세 미만은 법정대리인 동의 없이 받지 않는다 (개인정보보호법 제22조의2)
        register: z.object({ email, password, name, ageConfirmed: z.literal(true, m.ageRequired) }),
        login: z.object({
            email,
            password: z.string().min(1, m.passwordRequired),
            /** 로그인 유지. 서버는 없으면 켜진 것으로 본다 (rememberFrom). */
            remember: z.boolean().optional(),
        }),
        forgot: z.object({ email }),
    };
}

const AUTH_KO = makeAuthSchemas({
    emailRequired: "이메일을 입력해주세요.",
    emailInvalid: "이메일 형식이 올바르지 않습니다.",
    passwordRequired: "비밀번호를 입력해주세요.",
    passwordMin: "비밀번호는 최소 8자 이상이어야 합니다.",
    passwordMax: "비밀번호는 72자를 초과할 수 없습니다.",
    passwordDigit: "숫자를 1자 이상 포함해야 합니다.",
    passwordSpecial: "특수문자를 1자 이상 포함해야 합니다.",
    nameRequired: "이름을 입력해주세요.",
    nameMin: "이름은 2자 이상이어야 합니다.",
    nameMax: (max) => `이름은 ${max}자를 넘을 수 없습니다.`,
    ageRequired: "만 14세 이상만 가입할 수 있습니다.",
});

export const passwordSchema = AUTH_KO.password;
export const RegisterSchema = AUTH_KO.register;
export const LoginSchema = AUTH_KO.login;
export const ForgotPasswordSchema = AUTH_KO.forgot;

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, "재설정 링크가 올바르지 않습니다."),
    password: passwordSchema,
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ── Category ─────────────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
    name: title("카테고리 이름을 입력해주세요."),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "유효한 색상 코드를 입력해주세요."),
    description: longText.optional(),
});

export const UpdateCategorySchema = z.object({
    id: z.string().min(1),
    name: title("카테고리 이름을 입력해주세요.").optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    description: longText.optional(),
    // 초대 창이 이 말을 그대로 보인다 — 기본 말("Invalid email address")은 영어였다
    addParticipantEmail: z.string().email("이메일 형식이 올바르지 않습니다.").optional(),
    removeParticipantId: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// ── Todo ─────────────────────────────────────────────────────────────────────

export const CreateTodoSchema = z.object({
    title: title("제목을 입력해주세요."),
    categoryId: z.string().min(1, "카테고리를 선택해주세요."),
    memo: longText.nullable().optional(),
    startAt: dateText.nullable().optional(),
    endAt: dateText.nullable().optional(),
    isAllDay: z.boolean().optional().default(false),
    location: z.string().max(TITLE_MAX).nullable().optional(),
    repeat: z.number().int().min(0).optional().default(0),
    repeatEndDate: dateText.nullable().optional(),
    repeatCount: z.number().int().positive().nullable().optional(),
});

export const ToggleTodoSchema = z.object({
    id: z.string().min(1),
    targetDate: z.string().min(1),
    /** 바라는 상태. 없으면(옛 앱) 뒤집는다. 있으면 그 상태로 둔다 — 다른 기기에서 이미 바뀐 것을 되돌리지 않게 */
    completed: z.boolean().optional(),
});

export const UpdateTodoSchema = z.object({
    id: z.string().min(1),
    title: title("제목을 입력해주세요.").optional(),
    // 빈 글자는 "옮기지 않음" 이 아니라 없는 카테고리라 FK 오류(500)가 났다
    categoryId: z.string().min(1).optional(),
    memo: longText.nullable().optional(),
    startAt: dateText.nullable().optional(),
    endAt: dateText.nullable().optional(),
    isAllDay: z.boolean().optional(),
    location: z.string().max(TITLE_MAX).nullable().optional(),
    repeat: z.number().int().min(0).optional(),
    repeatEndDate: dateText.nullable().optional(),
    repeatCount: z.number().int().positive().nullable().optional(),
    excludedDates: z.string().refine(raw => {
        try {
            const dates = JSON.parse(raw);
            return Array.isArray(dates) && dates.every(key => typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(Date.parse(`${key}T00:00:00Z`)) && new Date(`${key}T00:00:00Z`).toISOString().slice(0, 10) === key);
        } catch { return false; }
    }, '제외 날짜 형식이 올바르지 않습니다.').nullable().optional(),
    /** 끝냄 기록도 그만큼 옮긴다 — 달력에서 일정(반복이면 시리즈)을 끌어 옮길 때. 예전엔 기록이 옛 날에 남아 끝낸 것이 풀렸다 */
    shiftCompletionsDays: z.number().int().min(-36_500).max(36_500).optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;

// ── Anniversary ───────────────────────────────────────────────────────────────

// 2월 30일처럼 존재하지 않는 날짜를 막는다. 윤년이 아닌 해도 있으므로 2월은 29일까지 허용한다.
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const isRealDate = (v: { month?: number; day?: number }) => {
    if (v.month === undefined || v.day === undefined) return true;
    return v.day <= DAYS_IN_MONTH[v.month - 1];
};
const dateIssue = { message: "존재하지 않는 날짜입니다.", path: ["day"] };

export const CreateAnniversarySchema = z.object({
    title: title("기념일 이름을 입력해주세요."),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
    icon: z.string().max(8).nullable().optional(),
}).refine(isRealDate, dateIssue);

export const UpdateAnniversarySchema = z.object({
    id: z.string().min(1),
    title: title("기념일 이름을 입력해주세요.").optional(),
    month: z.number().int().min(1).max(12).optional(),
    day: z.number().int().min(1).max(31).optional(),
    icon: z.string().max(8).nullable().optional(),
}).refine(isRealDate, dateIssue);

export type CreateAnniversaryInput = z.infer<typeof CreateAnniversarySchema>;
export type UpdateAnniversaryInput = z.infer<typeof UpdateAnniversarySchema>;

// ── Challenge ─────────────────────────────────────────────────────────────────

/** 며칠마다 — 백 년이면 충분하다. 끝없이 크면 화면의 날 셈(연속 기록)이 날짜 범위를 넘어 RangeError 로 죽었다 */
const INTERVAL_MAX = 36_500;

export const CreateChallengeSchema = z.object({
    title: title("챌린지 이름을 입력해주세요."),
    description: longText.nullable().optional(),
    startAt: dateText.refine((v) => v !== "", "시작일을 입력해주세요."),
    interval: z.number().int().min(1).max(INTERVAL_MAX).optional().default(1),
    targetCount: z.number().int().positive().max(TARGET_MAX).nullable().optional(),
    categoryId: z.string().min(1, "카테고리를 선택해주세요."),
});

export const UpdateChallengeSchema = z.object({
    id: z.string().min(1),
    title: title("챌린지 이름을 입력해주세요.").optional(),
    description: longText.nullable().optional(),
    startAt: dateText.optional(),
    interval: z.number().int().min(1).max(INTERVAL_MAX).optional(),
    targetCount: z.number().int().positive().max(TARGET_MAX).nullable().optional(),
    // 고치기 창에서 카테고리를 옮긴다 — 예전엔 이 칸이 없어 조용히 버려졌다 (권한은 라우트가 본다)
    categoryId: z.string().min(1).optional(),
});

export const ToggleChallengeSchema = z.object({
    challengeId: z.string().min(1),
    targetDate: dateText.refine((v) => v !== "", "날짜 형식이 올바르지 않습니다."),
    /** 바라는 상태. 없으면(옛 앱) 뒤집는다 — ToggleTodoSchema.completed 와 같은 뜻 */
    done: z.boolean().optional(),
});

export type CreateChallengeInput = z.infer<typeof CreateChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof UpdateChallengeSchema>;
export type ToggleChallengeInput = z.infer<typeof ToggleChallengeSchema>;

// ── Project ───────────────────────────────────────────────────────────────────

export const CreateProjectSchema = z.object({
    title: title("프로젝트 이름을 입력해주세요."),
    description: longText.nullable().optional(),
    categoryId: z.string().min(1, "카테고리를 선택해주세요."),
    startAt: dateText.nullable().optional(),
    endAt: dateText.nullable().optional(),
    assignees: z.array(z.string()).optional(),
});

export const UpdateProjectSchema = z.object({
    id: z.string().min(1),
    title: title("프로젝트 이름을 입력해주세요.").optional(),
    description: longText.nullable().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    startAt: dateText.nullable().optional(),
    endAt: dateText.nullable().optional(),
    assignees: z.array(z.string()).optional(),
    // 프로젝트 설정 창에서 카테고리를 옮긴다 — 예전엔 이 칸이 없어 조용히 버려졌다 (권한은 라우트가 본다)
    categoryId: z.string().min(1).optional(),
});

export const CreateProjectTaskSchema = z.object({
    title: title("할 일 이름을 입력해주세요."),
    description: longText.nullable().optional(),
    projectId: z.string().min(1),
    status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
    priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
    startAt: dateText.nullable().optional(),
    endAt: dateText.nullable().optional(),
    isAllDay: z.boolean().optional(),
    assignees: z.array(z.string()).optional(),
});

export const UpdateProjectTaskSchema = z.object({
    id: z.string().min(1),
    title: title("할 일 이름을 입력해주세요.").optional(),
    description: longText.nullable().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    startAt: dateText.nullable().optional(),
    endAt: dateText.nullable().optional(),
    isAllDay: z.boolean().optional(),
    assignees: z.array(z.string()).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateProjectTaskInput = z.infer<typeof CreateProjectTaskSchema>;
export type UpdateProjectTaskInput = z.infer<typeof UpdateProjectTaskSchema>;
