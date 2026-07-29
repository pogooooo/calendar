"use client";

import styled, { css, keyframes } from "styled-components";

const CRESCENT_PATH = "M48.5 36.6402C46.5499 40.7118 43.5434 44.1857 39.7939 46.6999C36.0443 49.2141 31.6891 50.6766 27.182 50.9349C22.675 51.1931 18.1811 50.2378 14.1689 48.1684C10.1567 46.0989 6.77306 42.9912 4.3706 39.1691C1.96814 35.347 0.634851 30.9505 0.509702 26.4378C0.384553 21.925 1.47213 17.4614 3.65907 13.512C5.846 9.56262 9.05224 6.27214 12.9436 3.98353C16.8349 1.69492 21.2689 0.491968 25.7833 0.500059C28.0558 0.495113 30.3181 0.802149 32.5071 1.41257C28.0714 2.81948 24.285 5.76637 21.8321 9.7209C19.3792 13.6754 18.4215 18.3768 19.1319 22.9758C19.8424 27.5747 22.1741 31.7679 25.706 34.798C29.2378 37.828 33.7369 39.495 38.3904 39.4978C41.9603 39.5031 45.4611 38.5136 48.5 36.6402Z";

const frameIn = keyframes`
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
`;

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const bloom = keyframes`
    from { transform: scale(0) rotate(-45deg); }
    to { transform: scale(1) rotate(0deg); }
`;

const twinkle = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
`;

const breathe = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const starShape = css`
    position: absolute;
    background-color: ${(props) => props.theme.colors.primary};
    clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
`;

const Decor = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    transition: filter 0.25s ease;

    .solo {
        ${starShape}
        width: 9px;
        height: 9px;
        bottom: 6px;
        left: 50%;
        margin-left: -4.5px;
        animation: ${bloom} 0.45s ease-out both, ${twinkle} 3.2s ease-in-out 0.5s infinite;
    }

    .frame {
        position: absolute;
        inset: 6px;
        border: 1px solid ${(props) => props.theme.colors.primary};
        animation: ${frameIn} 0.5s ease-out both;
    }

    .moon {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 12px;
        height: 12px;
        color: ${(props) => props.theme.colors.primary};
        animation: ${fadeIn} 0.5s ease-out 0.35s both, ${breathe} 6.5s ease-in-out 0.85s infinite;
    }

    .star-lg {
        ${starShape}
        width: 9px;
        height: 9px;
        top: -4px;
        left: -4px;
        animation: ${fadeIn} 0.4s ease-out 0.45s both, ${spin} 18s linear 0.85s infinite;
    }

    .star-md {
        ${starShape}
        width: 7px;
        height: 7px;
        bottom: -3px;
        right: -3px;
        animation: ${bloom} 0.4s ease-out 0.55s both, ${twinkle} 3.8s ease-in-out 1.2s infinite;
    }

    .star-sm {
        ${starShape}
        width: 5px;
        height: 5px;
        bottom: -2px;
        left: -2px;
        animation: ${bloom} 0.4s ease-out 0.65s both, ${twinkle} 2.9s ease-in-out 2.1s infinite;
    }

    .dot {
        ${starShape}
        width: 3px;
        height: 3px;
        animation: ${twinkle} 3.4s ease-in-out infinite;
    }

    .dot.d1 {
        top: 9px;
        right: 16px;
        animation-duration: 4.2s;
        animation-delay: 1.4s;
    }

    .dot.d2 {
        bottom: 12px;
        left: 15px;
        animation-duration: 3.1s;
        animation-delay: 2.6s;
    }
`;

const Crescent = () => (
    <svg className="moon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d={CRESCENT_PATH}
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeMiterlimit="10"
        />
    </svg>
);

const DayCellDecor = ({ tier }: { tier: number }) => {
    if (tier < 1) return null;

    return (
        <Decor className="cell-decor" aria-hidden="true">
            {tier === 1 && <span className="solo" />}

            {tier === 2 && <span className="frame" />}

            {tier === 3 && (
                <span className="frame">
                    <Crescent />
                    <span className="star-lg" />
                    <span className="star-md" />
                    <span className="star-sm" />
                    <span className="dot d1" />
                    <span className="dot d2" />
                </span>
            )}
        </Decor>
    );
};

export default DayCellDecor;
