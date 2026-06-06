import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────────────

export const passwordSchema = z.string()
    .min(1, "비밀번호를 입력해주세요.")
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .max(72, "비밀번호는 72자를 초과할 수 없습니다.")  // bcrypt 72바이트 한계
    .regex(/[A-Z]/, "대문자를 1자 이상 포함해야 합니다.")
    .regex(/[0-9]/, "숫자를 1자 이상 포함해야 합니다.")
    .regex(/[^A-Za-z0-9]/, "특수문자를 1자 이상 포함해야 합니다.");

export const RegisterSchema = z.object({
    email: z.string()
        .min(1, "이메일을 입력해주세요.")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "이메일 형식이 올바르지 않습니다."),
    password: passwordSchema,
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

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// ── Category ─────────────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
    name: z.string().min(1, "카테고리 이름을 입력해주세요."),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "유효한 색상 코드를 입력해주세요."),
    description: z.string().optional(),
});

export const UpdateCategorySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    description: z.string().optional(),
    addParticipantEmail: z.string().email().optional(),
    removeParticipantId: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// ── Todo ─────────────────────────────────────────────────────────────────────

export const CreateTodoSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요."),
    categoryId: z.string().min(1, "카테고리를 선택해주세요."),
    memo: z.string().nullable().optional(),
    startAt: z.string().nullable().optional(),
    endAt: z.string().nullable().optional(),
    isAllDay: z.boolean().optional().default(false),
    location: z.string().nullable().optional(),
    repeat: z.number().int().min(0).optional().default(0),
    repeatEndDate: z.string().nullable().optional(),
    repeatCount: z.number().int().positive().nullable().optional(),
});

export const ToggleTodoSchema = z.object({
    id: z.string().min(1),
    targetDate: z.string().min(1),
});

export const UpdateTodoSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    categoryId: z.string().optional(),
    memo: z.string().nullable().optional(),
    startAt: z.string().nullable().optional(),
    endAt: z.string().nullable().optional(),
    isAllDay: z.boolean().optional(),
    location: z.string().nullable().optional(),
    repeat: z.number().int().min(0).optional(),
    repeatEndDate: z.string().nullable().optional(),
    repeatCount: z.number().int().positive().nullable().optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;

// ── Challenge ─────────────────────────────────────────────────────────────────

export const CreateChallengeSchema = z.object({
    title: z.string().min(1, "챌린지 이름을 입력해주세요."),
    description: z.string().nullable().optional(),
    startAt: z.string().min(1, "시작일을 입력해주세요."),
    interval: z.number().int().min(1).optional().default(1),
    targetCount: z.number().int().positive().nullable().optional(),
    categoryId: z.string().min(1, "카테고리를 선택해주세요."),
});

export const UpdateChallengeSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    startAt: z.string().optional(),
    interval: z.number().int().min(1).optional(),
    targetCount: z.number().int().positive().nullable().optional(),
});

export const ToggleChallengeSchema = z.object({
    challengeId: z.string().min(1),
    targetDate: z.string().min(1),
});

export type CreateChallengeInput = z.infer<typeof CreateChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof UpdateChallengeSchema>;
export type ToggleChallengeInput = z.infer<typeof ToggleChallengeSchema>;

// ── Project ───────────────────────────────────────────────────────────────────

export const CreateProjectSchema = z.object({
    title: z.string().min(1, "프로젝트 이름을 입력해주세요."),
    description: z.string().nullable().optional(),
    categoryId: z.string().min(1, "카테고리를 선택해주세요."),
    startAt: z.string().nullable().optional(),
    endAt: z.string().nullable().optional(),
    assignees: z.array(z.string()).optional(),
});

export const UpdateProjectSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    startAt: z.string().nullable().optional(),
    endAt: z.string().nullable().optional(),
    assignees: z.array(z.string()).optional(),
});

export const CreateProjectTaskSchema = z.object({
    title: z.string().min(1, "할 일 이름을 입력해주세요."),
    description: z.string().nullable().optional(),
    projectId: z.string().min(1),
    status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
    priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
    startAt: z.string().nullable().optional(),
    endAt: z.string().nullable().optional(),
    assignees: z.array(z.string()).optional(),
});

export const UpdateProjectTaskSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    startAt: z.string().nullable().optional(),
    endAt: z.string().nullable().optional(),
    assignees: z.array(z.string()).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateProjectTaskInput = z.infer<typeof CreateProjectTaskSchema>;
export type UpdateProjectTaskInput = z.infer<typeof UpdateProjectTaskSchema>;
