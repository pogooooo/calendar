"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TodoType } from "@/store/useTodoStore";
import * as S from "./TodoContextMenu.styles";

interface TodoContextMenuProps {
    menuState: { x: number; y: number; todo: TodoType } | null;
    onClose: () => void;
    onToggle: (todo: TodoType) => void;
    onEdit: (todo: TodoType) => void;
    onDelete: (todo: TodoType) => void;
}

export default function TodoContextMenu({ menuState, onClose, onToggle, onEdit, onDelete }: TodoContextMenuProps) {
    const menuRef = React.useRef<HTMLDivElement>(null);
    const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);

    React.useEffect(() => {
        const handleClickOutside = () => onClose();
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    React.useLayoutEffect(() => {
        if (!menuState || !menuRef.current) {
            setPos(null);
            return;
        }

        const rect = menuRef.current.getBoundingClientRect();
        const margin = 8;
        const halfWidth = rect.width / 2;

        const minLeft = halfWidth + margin;
        const maxLeft = window.innerWidth - halfWidth - margin;
        const left = maxLeft < minLeft
            ? window.innerWidth / 2
            : Math.min(Math.max(menuState.x, minLeft), maxLeft);

        const wouldOverflowBottom = menuState.y + 10 + rect.height > window.innerHeight - margin;
        const top = wouldOverflowBottom
            ? Math.max(margin, menuState.y - rect.height - 10)
            : menuState.y;

        setPos({ left, top });
    }, [menuState]);

    return (
        <AnimatePresence>
            {menuState && (
                <S.FloatingContextMenu
                    ref={menuRef}
                    as={motion.div}
                    initial={{ opacity: 0, scale: 0.8, x: "-50%", y: 0 }}
                    animate={{ opacity: 1, scale: 1, x: "-50%", y: 10 }}
                    exit={{ opacity: 0, scale: 0.8, x: "-50%", y: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ top: pos ? pos.top : menuState.y, left: pos ? pos.left : menuState.x }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <button onClick={() => onToggle(menuState.todo)}>완료</button>
                    <div className="divider" />
                    <button onClick={() => onEdit(menuState.todo)}>수정</button>
                    <div className="divider" />
                    <button className="danger" onClick={() => onDelete(menuState.todo)}>삭제</button>
                </S.FloatingContextMenu>
            )}
        </AnimatePresence>
    );
}