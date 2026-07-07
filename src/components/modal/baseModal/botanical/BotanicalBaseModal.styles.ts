import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Overlay = styled(motion.div)`
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: rgba(58, 53, 48, 0.35);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
`;

export const Container = styled(motion.div)<{ $maxWidth: string }>`
    background-color: ${(props) => props.theme.colors.surface};
    width: 90%;
    max-width: ${(props) => props.$maxWidth};
    max-height: 85vh;
    border-radius: 12px;
    border: 1px solid ${(props) => props.theme.colors.border};
    box-shadow: 0 8px 32px rgba(217, 207, 199, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;
