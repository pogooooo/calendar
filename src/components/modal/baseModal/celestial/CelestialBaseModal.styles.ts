import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Overlay = styled(motion.div)`
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
`;

export const Container = styled(motion.div)<{ $maxWidth: string }>`
    background-color: ${(props) => props.theme.colors.surface};
    padding: 10px;
    width: 90%;
    max-width: ${(props) => props.$maxWidth};
    max-height: 85vh;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
`;