"use client";

import styled, { keyframes } from "styled-components";

const twinkle = keyframes`
    0%, 100% { opacity: 0.55; }
    50% { opacity: 0.05; }
`;

const AmbienceLayer = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;

    .mote {
        position: absolute;
        width: 3px;
        height: 3px;
        background-color: ${(props) => props.theme.colors.primary};
        clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
        animation: ${twinkle} 4s ease-in-out infinite;
    }

    .m1 { left: 12%; top: 34%; animation-duration: 3.4s; }
    .m2 { left: 29%; top: 72%; animation-duration: 4.6s; animation-delay: 1.1s; }
    .m3 { left: 47%; top: 26%; animation-duration: 3.9s; animation-delay: 2.2s; }
    .m4 { left: 64%; top: 66%; animation-duration: 5.2s; animation-delay: 0.6s; }
    .m5 { left: 81%; top: 38%; animation-duration: 4.1s; animation-delay: 1.7s; }
    .m6 { left: 92%; top: 74%; animation-duration: 3.1s; animation-delay: 2.8s; }
`;

const CalendarAmbience = () => (
    <AmbienceLayer aria-hidden="true">
        <span className="mote m1" />
        <span className="mote m2" />
        <span className="mote m3" />
        <span className="mote m4" />
        <span className="mote m5" />
        <span className="mote m6" />
    </AmbienceLayer>
);

export default CalendarAmbience;
