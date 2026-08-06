export type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

export interface User {
    id: string;
    email: string;
    name: string;
    theme: string;
    image: string;
}

export interface ParticipantType {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

export interface CategoryType {
    id: string;
    name: string;
    color: string;
    description?: string | null;
    creatorId?: string;
    creatorName?: string;
    participants?: ParticipantType[];
}

export interface TodoCompletionType {
    id?: string;
    targetDate: string;
}

export interface TodoType {
    id: string;
    title: string;
    categoryId: string;
    completions: TodoCompletionType[];
    memo?: string | null;
    startAt?: string | number | Date | null;
    endAt?: string | number | Date | null;
    isAllDay: boolean;
    location?: string | null;
    repeat: number;
    repeatEndDate?: string | number | Date | null;
    repeatCount?: number | null;
    excludedDates?: string | null;
}

export interface ChallengeCompletionType {
    id: string;
    challengeId: string;
    targetDate: string | Date;
}

export interface ChallengeType {
    id: string;
    title: string;
    description?: string | null;
    startAt: string | Date;
    interval: number;
    targetCount?: number | null;
    categoryId: string;
    completions: ChallengeCompletionType[];
}

export interface UserType {
    id: string;
    name: string;
    email?: string | null;
    image?: string | null;
}

export interface ProjectTaskType {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    projectId: string;
    startAt?: string | null;
    endAt?: string | null;
    assignees?: UserType[] | null;
    blockedBy?: ProjectTaskType[] | null;
    blocking?: ProjectTaskType[] | null;
}

export interface ProjectType {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    categoryId: string;
    startAt?: string | null;
    endAt?: string | null;
    assignees?: UserType[] | null;
    tasks?: ProjectTaskType[] | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
}

export interface DailyTaskType {
    id: string;
    text: string;
    isDone: boolean;
    date: string | Date;
}
