"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import styled from "styled-components";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import { useT } from "@/i18n/useT";
import type { ChallengeType } from "@/types";

const Item = styled.div<{ $vertical: boolean }>`
    display: grid;
    grid-template-columns: ${({ $vertical }) => $vertical ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) auto'};
    align-items: center;
    gap: 6px;
    min-width: 0;

    .challenge-info { min-width: 0; overflow-wrap: anywhere; }
    .challenge-progress { flex-shrink: 1; }
    > .finished-edit { justify-self: end; }
`;

export default function FinishedChallengeItem({ challenge, onEdit, children, vertical = false }: {
    challenge: ChallengeType;
    onEdit: (challenge: ChallengeType) => void;
    children: ReactNode;
    vertical?: boolean;
}) {
    const { edit } = useT().challenge;
    return (
        <Item $vertical={vertical} data-finished-challenge>
            {children}
            <SecondaryButton
                className="finished-edit"
                type="button"
                $width={48}
                $height={48}
                aria-label={`${challenge.title} · ${edit}`}
                title={edit}
                onClick={() => onEdit(challenge)}
            >
                <Pencil aria-hidden="true" size={16} />
            </SecondaryButton>
        </Item>
    );
}
