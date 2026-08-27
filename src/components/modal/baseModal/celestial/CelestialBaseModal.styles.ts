import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Overlay = styled(motion.div)`
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;

    @media (max-width: 768px) {
        align-items: stretch;
        justify-content: stretch;
    }
`;

export const Container = styled(motion.div)<{ $maxWidth: string }>`
    /* 위젯 창에서도 읽히도록 불투명 배경.
       위젯은 surface를 transparent로 덮어쓰지만, 모달은 baseColors를 복원해 쓰므로 여기선 surface로 충분하다 */
    background-color: ${(props) => props.theme.colors.surface} !important;
    backdrop-filter: blur(14px);
    width: 90%;
    max-width: ${(props) => props.$maxWidth};
    max-height: 85vh;
    border: 1px solid ${(props) => props.theme.colors.primary};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        width: 100%;
        max-width: none;
        max-height: 100%;
        height: 100%;
        border: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        box-shadow: none;
    }
`;