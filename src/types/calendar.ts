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