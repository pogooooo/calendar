"use client";

import styled from "styled-components";

const Frame = styled.svg`
    width: 100%;
    height: 62px;
    flex-shrink: 0;
    color: ${(props) => props.theme.colors.primary};
    border: 1px solid ${(props) => props.theme.colors.primary}55;

    .ln { stroke: currentColor; fill: none; stroke-width: 1; vector-effect: non-scaling-stroke; }
    .dim { opacity: 0.4; }
    .fill { fill: currentColor; stroke: none; }
    .fill-dim { fill: currentColor; stroke: none; opacity: 0.35; }
`;

const shapes: Record<string, React.ReactNode> = {
    daily: (
        <>
            <path className="ln dim" d="M8 12 H84" />
            <path className="ln" d="M10 22 H40 M10 32 H46 M10 42 H36" />
            <rect className="ln dim" x="52" y="20" width="30" height="30" />
        </>
    ),
    weekly: (
        <>
            <path className="ln dim" d="M6 18 H86" />
            <path className="ln dim" d="M17 8 V54 M28 8 V54 M39 8 V54 M50 8 V54 M61 8 V54 M72 8 V54" />
            <rect className="fill-dim" x="18" y="24" width="20" height="5" />
            <rect className="fill-dim" x="40" y="34" width="30" height="5" />
        </>
    ),
    monthly: (
        <>
            <path className="ln dim" d="M6 16 H86" />
            {[0, 1, 2, 3].map(r => (
                <g key={r}>
                    {[0, 1, 2, 3, 4, 5, 6].map(c => (
                        <circle key={c} className="fill-dim" cx={11 + c * 11.5} cy={25 + r * 9} r="1.6" />
                    ))}
                </g>
            ))}
        </>
    ),
    today: (
        <>
            <rect className="ln" x="10" y="16" width="7" height="7" />
            <rect className="ln" x="10" y="29" width="7" height="7" />
            <rect className="ln" x="10" y="42" width="7" height="7" />
            <path className="ln" d="M23 19.5 H70 M23 32.5 H58 M23 45.5 H64" />
        </>
    ),
    upcoming: (
        <>
            <rect className="fill" x="10" y="17" width="5" height="5" transform="rotate(45 12.5 19.5)" />
            <rect className="fill" x="10" y="30" width="5" height="5" transform="rotate(45 12.5 32.5)" />
            <rect className="fill" x="10" y="43" width="5" height="5" transform="rotate(45 12.5 45.5)" />
            <path className="ln" d="M22 19.5 H60 M22 32.5 H54 M22 45.5 H58" />
            <path className="ln dim" d="M68 19.5 H82 M68 32.5 H82 M68 45.5 H82" />
        </>
    ),
    stats: (
        <>
            <rect className="fill" x="10" y="12" width="24" height="13" />
            <path className="ln dim" d="M10 32 H82" />
            <path className="ln" d="M10 32 H56" />
            <path className="ln dim" d="M10 42 H82 M10 50 H82" />
            <path className="ln" d="M10 42 H62 M10 50 H38" />
        </>
    ),
    projectboard: (
        <>
            <path className="ln dim" d="M10 12 H82" />
            <path className="ln dim" d="M34 12 V54 M58 12 V54" />
            <rect className="ln" x="13" y="18" width="18" height="9" />
            <rect className="ln" x="13" y="31" width="18" height="9" />
            <rect className="ln" x="37" y="18" width="18" height="9" />
            <rect className="ln" x="61" y="18" width="18" height="9" />
            <rect className="ln" x="61" y="31" width="18" height="9" />
        </>
    ),
    projecttimeline: (
        <>
            <path className="ln dim" d="M10 14 H82" />
            <rect className="ln" x="14" y="20" width="22" height="7" />
            <rect className="ln" x="42" y="33" width="26" height="7" />
            <rect className="ln" x="24" y="46" width="20" height="7" />
            <path className="ln" d="M36 23.5 C40 23.5, 38 36.5, 42 36.5" />
            <path className="ln" d="M68 36.5 C72 36.5, 44 49.5, 44 49.5" />
        </>
    ),
    projectdetail: (
        <>
            <path className="ln" d="M10 14 H52" />
            <path className="ln dim" d="M10 23 H74" />
            <rect className="ln" x="10" y="30" width="72" height="6" />
            <rect className="ln" x="10" y="30" width="42" height="6" fill="currentColor" />
            <path className="ln dim" d="M10 45 H60 M10 52 H46" />
        </>
    ),
    challenge: (
        <>
            <rect className="ln" x="10" y="16" width="7" height="7" />
            <rect className="ln" x="10" y="33" width="7" height="7" />
            <path className="ln" d="M23 19.5 H58 M23 36.5 H50" />
            <path className="fill" d="M74 14C74 20 74 20 80 20C74 20 74 20 74 26C74 20 74 20 68 20C74 20 74 20 74 14Z" />
            <path className="ln dim" d="M66 36.5 H82" />
        </>
    ),
    memo: (
        <>
            <path className="ln" d="M10 16 H80 M10 26 H74 M10 36 H82 M10 46 H52" />
        </>
    ),
    quicktask: (
        <>
            <rect className="ln dim" x="10" y="10" width="72" height="12" />
            <rect className="ln" x="10" y="30" width="7" height="7" />
            <rect className="ln" x="10" y="43" width="7" height="7" />
            <path className="ln" d="M23 33.5 H66 M23 46.5 H56" />
        </>
    ),
    sticker: (
        <>
            <path className="ln dim" d="M6 16 H86" />
            {[0, 1].map(r => (
                <g key={r}>
                    {[0, 1, 2, 3, 4].map(c => (
                        <circle key={c} className="ln" cx={16 + c * 15} cy={30 + r * 16} r="5" />
                    ))}
                </g>
            ))}
        </>
    ),
    category: (
        <>
            {[0, 1, 2, 3].map(i => (
                <g key={i}>
                    <rect className="fill" x="10" y={15 + i * 11} width="5" height="5" transform={`rotate(45 12.5 ${17.5 + i * 11})`} />
                    <path className="ln dim" d={`M22 ${17.5 + i * 11} H82`} />
                    <path className="ln" d={`M22 ${17.5 + i * 11} H${70 - i * 14}`} />
                </g>
            ))}
        </>
    ),
};

export default function WidgetPreview({ kind }: { kind: string }) {
    return (
        <Frame viewBox="0 0 92 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {shapes[kind] ?? shapes.today}
        </Frame>
    );
}
