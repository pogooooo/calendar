"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TodoType } from "@/types/calendar";
import * as S from "./TodoContextMenu.styles";

interface TodoContextMenuProps {
    menuState: { x: number; y: number; todo: TodoType } | null;
    onClose: () => void;
    onToggle: (todo: TodoType) => void;
    onEdit: (todo: TodoType) => void;
    onDelete: (todo: TodoType) => void;
}

export default function TodoContextMenu({ menuState, onClose, onToggle, onEdit, onDelete }: TodoContextMenuProps) {
    React.useEffect(() => {
        const handleClickOutside = () => onClose();
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    return (
        <AnimatePresence>
            {menuState && (
                <S.FloatingContextMenu
                    as={motion.div}
                    initial={{ opacity: 0, scale: 0.8, x: "-50%", y: 0 }}
                    animate={{ opacity: 1, scale: 1, x: "-50%", y: 10 }}
                    exit={{ opacity: 0, scale: 0.8, x: "-50%", y: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ top: menuState.y, left: menuState.x }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()} // 클릭 시 닫히지 않도록
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