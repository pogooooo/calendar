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

export interface TodoType {
    id: string;
    title: string;
    categoryId: string;
    check: "done" | "none";
    memo?: string | null;
    startAt?: string | number | Date | null;
    endAt?: string | number | Date | null;
    isAllDay: boolean;
    location?: string | null;
    repeat: number;
}