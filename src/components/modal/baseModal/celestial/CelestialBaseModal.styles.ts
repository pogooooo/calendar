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

    /* 폰에서는 아래에서 올라오는 시트로 띄운다. 손가락이 닿는 자리에 단추가 오고,
       짧은 내용일 때 텅 빈 화면 하나를 통째로 쓰지 않는다. */
    @media (max-width: 768px) {
        align-items: flex-end;
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
        /* 내용만큼만 자라고, 길면 이 선에서 멈춰 안에서 굴린다.
           위를 조금 남겨 뒤 화면이 비쳐야 시트라는 게 읽힌다. */
        max-height: 92%;
        height: auto;
        border: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.45);
        padding-bottom: env(safe-area-inset-bottom, 0px);
    }
`;