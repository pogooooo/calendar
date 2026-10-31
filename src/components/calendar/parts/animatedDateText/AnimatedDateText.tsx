"use client";

import * as GemS from "./gem/AnimatedDateText.styles";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useThemeMotion from '@/hooks/useThemeMotion';
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/AnimatedDateText.styles";
import * as MapleS from "./maple/AnimatedDateText.styles";
import * as OceanS from './ocean/AnimatedDateText.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

interface AnimatedDateTextProps {
    text: string;
    direction: number;
}

// 글자별 AnimatePresence 대신 텍스트 전체를 하나의 motion 단위로 처리
export default function AnimatedDateText({ text, direction }: AnimatedDateTextProps) {
    const S = usePickTheme(STYLES);
    const level = useThemeMotion();
    const animateDate = usePickTheme({ celestial: false, maple: true, ocean: true, gem: true });
    if (level === 'off' || !animateDate) return <S.DateTextContainer><span>{text}</span></S.DateTextContainer>;
    const reducedMotion = level !== 'full';
    return (
        <S.DateTextContainer>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.span
                    key={text}
                    custom={direction}
                    initial={{ y: reducedMotion ? 0 : direction > 0 ? 16 : -16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: reducedMotion ? 0 : direction > 0 ? -16 : 16, opacity: 0 }}
                    transition={{ duration: reducedMotion ? .14 : .26, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'inline-block', whiteSpace: 'pre' }}
                >
                    {text}
                </motion.span>
            </AnimatePresence>
        </S.DateTextContainer>
    );
}
