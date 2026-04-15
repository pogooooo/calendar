"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as S from "./AnimatedDateText.styles";

const textVariants = {
    enter: (direction: number) => ({
        y: direction > 0 ? 20 : -20,
        opacity: 0,
    }),
    center: {
        y: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        y: direction > 0 ? -20 : 20,
        opacity: 0,
    }),
};

interface AnimatedDateTextProps {
    text: string;
    direction: number;
}

export default function AnimatedDateText({ text, direction }: AnimatedDateTextProps) {
    return (
        <S.DateTextContainer>
            {text.split('').map((char, index) => (
                <S.DateCharWrapper key={index} $char={char}>
                    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                        <motion.span
                            key={char}
                            custom={direction}
                            variants={textVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ whiteSpace: 'pre' }}
                        >
                            {char}
                        </motion.span>
                    </AnimatePresence>
                </S.DateCharWrapper>
            ))}
        </S.DateTextContainer>
    );
}