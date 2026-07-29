import { useEffect, useRef } from "react";
import styled, { css, keyframes } from "styled-components";

const orbit = keyframes`
    from { offset-distance: 0%; }
    to { offset-distance: 100%; }
`;


const moonBreathe = keyframes`
    0%, 100% { filter: drop-shadow(0 0 1.5px rgba(212, 175, 55, 0.3)); }
    50% { filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.85)); }
`;

const breathe = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
`;

const starPulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
`;

const miniTwinkle = keyframes`
    0%, 100% { opacity: 0.9; }
    50% { opacity: 0.15; }
`;

const beadFlow = keyframes`
    0% { offset-distance: 0%; opacity: 0; }
    10% { opacity: 0.9; }
    90% { opacity: 0.9; }
    100% { offset-distance: 100%; opacity: 0; }
`;

const AnimatedSvg = styled.svg<{ $hovered?: boolean }>`
    filter: none;
    transition: filter 0.35s ease;

    ${(props) => props.$hovered && css`
        filter: drop-shadow(0 0 3px rgba(212, 175, 55, 0.75));

        .moon {
            animation: ${moonBreathe} 8s ease-in-out infinite;
        }
    `}

    .satellite {
        offset-path: path("M85.5856 226.264C100.47 219.702 114.627 215.354 125.478 213.621C130.907 212.753 135.479 212.546 138.889 213.028C142.331 213.515 144.426 214.677 145.179 216.385C145.932 218.092 145.376 220.423 143.414 223.292C141.47 226.135 138.232 229.37 133.93 232.793C125.332 239.634 112.572 247.153 97.6875 253.715C82.8035 260.276 68.6456 264.625 57.7954 266.358C52.3665 267.225 47.7943 267.432 44.384 266.95C40.9424 266.464 38.847 265.302 38.0942 263.594C37.3414 261.886 37.897 259.556 39.8592 256.687C41.8036 253.844 45.0408 250.608 49.343 247.185C57.9413 240.344 70.7015 232.826 85.5856 226.264Z");
        animation: ${orbit} 14s linear infinite;
    }

    .spark {
        animation: ${breathe} 4.5s ease-in-out infinite;
    }

    .s-b { animation-duration: 5.4s; animation-delay: 1.2s; }
    .s-c { animation-duration: 6.2s; animation-delay: 2.4s; }
    .s-d { animation-duration: 5.8s; animation-delay: 0.6s; }

    .bigstar {
        transform-box: fill-box;
        transform-origin: center;
        animation: ${starPulse} 6s ease-in-out infinite;
    }

    .b-b { animation-duration: 7.5s; animation-delay: 1.8s; }

    .dotstar {
        animation: ${breathe} 5s ease-in-out infinite;
    }

    .d2 { animation-duration: 6.1s; animation-delay: 0.9s; }
    .d3 { animation-duration: 4.4s; animation-delay: 1.7s; }
    .d4 { animation-duration: 5.7s; animation-delay: 2.5s; }
    .d5 { animation-duration: 4.8s; animation-delay: 0.4s; }
    .d6 { animation-duration: 6.4s; animation-delay: 3.1s; }
    .d7 { animation-duration: 5.2s; animation-delay: 1.4s; }

    .mini {
        animation: ${miniTwinkle} 3.4s ease-in-out infinite;
    }

    .m2 { animation-duration: 4.3s; animation-delay: 0.8s; }
    .m3 { animation-duration: 2.8s; animation-delay: 1.5s; }
    .m4 { animation-duration: 3.9s; animation-delay: 2.1s; }
    .m5 { animation-duration: 4.6s; animation-delay: 0.4s; }
    .m6 { animation-duration: 3.1s; animation-delay: 2.6s; }
    .m7 { animation-duration: 4s; animation-delay: 1.1s; }
    .m8 { animation-duration: 3.5s; animation-delay: 1.8s; }
    .m9 { animation-duration: 4.4s; animation-delay: 0.2s; }

    .bead {
        offset-path: path("M102.384 359V954");
        animation: ${beadFlow} 16s linear infinite;
    }

    .bead-top {
        offset-path: path("M102.384 0V106");
        animation: ${beadFlow} 9s linear infinite;
        animation-delay: 4s;
    }
`;

const CelestialSidebarDesign = ({ isHovered = false }: { isHovered?: boolean }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const rafRef = useRef(0);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const anims = [...svg.querySelectorAll('.orbiter')].flatMap(el =>
            typeof el.getAnimations === 'function' ? el.getAnimations() : []
        );
        if (anims.length === 0) return;

        const target = isHovered ? 3.5 : 1;
        cancelAnimationFrame(rafRef.current);

        const step = () => {
            let settled = true;
            anims.forEach(anim => {
                const next = anim.playbackRate + (target - anim.playbackRate) * 0.05;
                if (Math.abs(next - target) < 0.02) {
                    anim.playbackRate = target;
                } else {
                    anim.playbackRate = next;
                    settled = false;
                }
            });
            if (!settled) rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);

        return () => cancelAnimationFrame(rafRef.current);
    }, [isHovered]);

    return (
        <AnimatedSvg ref={svgRef} $hovered={isHovered} width="160" height="954" viewBox="0 0 160 954" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className="orn spark"
                    d="M102.384 115.625C102.384 118.317 103.727 120.5 105.384 120.5C103.727 120.5 102.384 122.683 102.384 125.375C102.384 122.683 101.041 120.5 99.384 120.5C101.041 120.5 102.384 118.317 102.384 115.625Z"
                    stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="orn spark s-b"
                    d="M112.384 282.375C112.384 286.31 114.063 289.5 116.134 289.5C114.063 289.5 112.384 292.69 112.384 296.625C112.384 292.69 110.705 289.5 108.634 289.5C110.705 289.5 112.384 286.31 112.384 282.375Z"
                    stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="orn bigstar"
                    d="M102.384 136.375C102.384 167.5 102.384 167.5 109.884 167.5C102.384 167.5 102.384 167.5 102.384 198.625C102.384 167.5 102.384 167.5 94.884 167.5C102.384 167.5 102.384 167.5 102.384 136.375Z"
                    stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="moon"
                    d="M124.384 243.14C122.434 247.212 119.427 250.686 115.678 253.2C111.928 255.714 107.573 257.177 103.066 257.435C98.559 257.693 94.0652 256.738 90.053 254.668C86.0408 252.599 82.6571 249.491 80.2546 245.669C77.8522 241.847 76.5189 237.45 76.3937 232.938C76.2686 228.425 77.3562 223.961 79.5431 220.012C81.73 216.063 84.9363 212.772 88.8276 210.484C92.7189 208.195 97.1529 206.992 101.667 207C103.94 206.995 106.202 207.302 108.391 207.913C103.955 209.319 100.169 212.266 97.7162 216.221C95.2633 220.175 94.3055 224.877 95.016 229.476C95.7264 234.075 98.0582 238.268 101.59 241.298C105.122 244.328 109.621 245.995 114.274 245.998C117.844 246.003 121.345 245.014 124.384 243.14Z"
                    stroke="#D4AF37" strokeMiterlimit="10"/>
                <path d="M112.384 234V284.5" stroke="#D4AF37" strokeLinecap="round"/>
                <path className="orn spark s-c"
                    d="M120.134 223C120.134 226.935 120.134 230.125 158.884 230.125C120.134 230.125 120.134 233.315 120.134 237.25C120.134 233.315 115.455 230 113.384 230C115.455 230 120.134 226.935 120.134 223Z"
                    stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="orn spark s-d"
                    d="M67.134 223C67.134 230 39.134 230 0.384033 230C39.134 230 67.134 230 67.134 237.25C67.134 233.315 71.813 230 73.884 230C71.813 230 67.134 226.935 67.134 223Z"
                    stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="orn dotstar"
                    d="M102.384 229C102.384 228.333 102.784 227 104.384 227C105.984 227 106.384 228.333 106.384 229C106.384 229.667 105.984 231 104.384 231C102.784 231 102.384 229.667 102.384 229Z"
                    stroke="#D4AF37"/>
                <path className="orn bigstar b-b"
                    d="M102.384 282.375C102.384 313.5 102.384 313.5 109.884 313.5C102.384 313.5 102.384 313.5 102.384 344.625C102.384 313.5 102.384 313.5 94.884 313.5C102.384 313.5 102.384 313.5 102.384 282.375Z"
                    stroke="#D4AF37" strokeWidth="0.768" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="orn dotstar d2"
                    d="M92.634 280.75C92.634 280.417 92.834 279.75 93.634 279.75C94.434 279.75 94.634 280.417 94.634 280.75C94.634 281.083 94.434 281.75 93.634 281.75C92.834 281.75 92.634 281.083 92.634 280.75Z"
                    stroke="#D4AF37"/>
                <path className="orn dotstar d3"
                    d="M138.384 253.5C138.384 253.167 138.584 252.5 139.384 252.5C140.184 252.5 140.384 253.167 140.384 253.5C140.384 253.833 140.184 254.5 139.384 254.5C138.584 254.5 138.384 253.833 138.384 253.5Z"
                    stroke="#D4AF37"/>
                <path className="orn dotstar d4"
                    d="M132.884 282C132.884 281.667 133.084 281 133.884 281C134.684 281 134.884 281.667 134.884 282C134.884 282.333 134.684 283 133.884 283C133.084 283 132.884 282.333 132.884 282Z"
                    stroke="#D4AF37"/>
                <path className="orn dotstar d5"
                    d="M51.384 208C51.384 207.667 51.584 207 52.384 207C53.184 207 53.384 207.667 53.384 208C53.384 208.333 53.184 209 52.384 209C51.584 209 51.384 208.333 51.384 208Z"
                    stroke="#D4AF37"/>
                <path className="orn dotstar d6"
                    d="M51.384 253C51.384 252.667 51.584 252 52.384 252C53.184 252 53.384 252.667 53.384 253C53.384 253.333 53.184 254 52.384 254C51.584 254 51.384 253.333 51.384 253Z"
                    stroke="#D4AF37"/>
                <path className="orn dotstar d7"
                    d="M59.884 286C59.884 285.667 60.084 285 60.884 285C61.684 285 61.884 285.667 61.884 286C61.884 286.333 61.684 287 60.884 287C60.084 287 59.884 286.333 59.884 286Z"
                    stroke="#D4AF37"/>
                <path d="M62.8964 213C44.396 263 103.896 288 126.896 248" stroke="#D4AF37"/>
                <path d="M75.384 262L62.384 284" stroke="#D4AF37" strokeLinecap="round"/>
                <path d="M117.384 260L132.384 280" stroke="#D4AF37" strokeLinecap="round"/>
                <path
                    d="M85.5856 226.264C100.47 219.702 114.627 215.354 125.478 213.621C130.907 212.753 135.479 212.546 138.889 213.028C142.331 213.515 144.426 214.677 145.179 216.385C145.932 218.092 145.376 220.423 143.414 223.292C141.47 226.135 138.232 229.37 133.93 232.793C125.332 239.634 112.572 247.153 97.6875 253.715C82.8035 260.276 68.6456 264.625 57.7954 266.358C52.3665 267.225 47.7943 267.432 44.384 266.95C40.9424 266.464 38.847 265.302 38.0942 263.594C37.3414 261.886 37.897 259.556 39.8592 256.687C41.8036 253.844 45.0408 250.608 49.343 247.185C57.9413 240.344 70.7015 232.826 85.5856 226.264Z"
                    stroke="#D4AF37"/>
                <circle className="orbiter satellite" r="1.8" fill="#D4AF37"/>
                <path d="M62.884 213.5L54.884 208.881" stroke="#D4AF37" strokeLinecap="round"/>
                <path d="M62.384 247L54.384 251.619" stroke="#D4AF37" strokeLinecap="round"/>
                <path d="M94.384 268L93.884 278.5" stroke="#D4AF37" strokeLinecap="round"/>
                <path d="M126.884 248L136.884 252.5" stroke="#D4AF37" strokeLinecap="round"/>
                <path d="M102.384 0V106" stroke="#D4AF37" strokeLinecap="round"/>
                <path d="M102.384 359V954" stroke="#D4AF37" strokeLinecap="round"/>
                <circle className="mini" cx="96" cy="58" r="0.9" fill="#D4AF37"/>
                <circle className="mini m2" cx="110" cy="84" r="0.7" fill="#D4AF37"/>
                <circle className="mini m3" cx="95" cy="388" r="0.8" fill="#D4AF37"/>
                <circle className="mini m4" cx="108" cy="436" r="1" fill="#D4AF37"/>
                <circle className="mini m5" cx="97" cy="522" r="0.7" fill="#D4AF37"/>
                <circle className="mini m6" cx="109" cy="604" r="0.9" fill="#D4AF37"/>
                <circle className="mini m7" cx="95" cy="694" r="0.8" fill="#D4AF37"/>
                <circle className="mini m8" cx="107" cy="782" r="0.7" fill="#D4AF37"/>
                <circle className="mini m9" cx="98" cy="872" r="0.9" fill="#D4AF37"/>
                <circle className="bead" r="1" fill="#D4AF37"/>
                <circle className="bead-top" r="1" fill="#D4AF37"/>
        </AnimatedSvg>
    )
}

export default CelestialSidebarDesign
